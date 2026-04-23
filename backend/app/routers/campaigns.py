"""
Campaign management endpoints.
"""
import uuid
import json
import os
from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel
from app.core.database import get_db
from app.core.auth import clerk_auth

router = APIRouter(prefix="/api/campaigns", tags=["campaigns"])


def get_current_user_id(user: dict = Depends(clerk_auth)) -> str:
    return user["sub"]


class CampaignCreate(BaseModel):
    name: str
    filters: dict | None = None


class CampaignRunRequest(BaseModel):
    api: str = "linkdapi"  # "linkdapi" or "apify"


class CampaignResponse(BaseModel):
    id: str
    workspace_id: str
    name: str
    status: str
    filters: str
    leads_count: int
    credits_used: int
    apify_run_id: str | None
    created_at: str
    completed_at: str | None


async def get_workspace_id(db, user_id: str) -> str:
    row = await db.execute_one(
        "SELECT w.id FROM workspaces w "
        "JOIN workspace_members wm ON wm.workspace_id = w.id "
        "WHERE wm.user_id = ?",
        [user_id],
    )
    if not row:
        raise HTTPException(404, "No workspace found")
    return row["id"]


@router.get("", response_model=list[CampaignResponse])
async def list_campaigns(user_id: str = Depends(get_current_user_id)):
    """List all campaigns for the current workspace."""
    db = get_db()
    workspace_id = await get_workspace_id(db, user_id)

    rows = await db.execute(
        "SELECT * FROM campaigns WHERE workspace_id = ? ORDER BY created_at DESC",
        [workspace_id],
    )
    return [CampaignResponse(**dict(row)) for row in rows]


@router.post("", response_model=CampaignResponse)
async def create_campaign(
    body: CampaignCreate,
    user_id: str = Depends(get_current_user_id),
):
    """Create a new campaign."""
    db = get_db()
    workspace_id = await get_workspace_id(db, user_id)

    campaign_id = str(uuid.uuid4())
    filters_json = json.dumps(body.filters or {})

    await db.execute_write(
        "INSERT INTO campaigns (id, workspace_id, name, filters) VALUES (?, ?, ?, ?)",
        [campaign_id, workspace_id, body.name, filters_json],
    )

    row = await db.execute_one("SELECT * FROM campaigns WHERE id = ?", [campaign_id])
    return CampaignResponse(**dict(row))


@router.get("/{campaign_id}", response_model=CampaignResponse)
async def get_campaign(campaign_id: str, user_id: str = Depends(get_current_user_id)):
    """Get a campaign by ID."""
    db = get_db()
    workspace_id = await get_workspace_id(db, user_id)

    row = await db.execute_one(
        "SELECT * FROM campaigns WHERE id = ? AND workspace_id = ?",
        [campaign_id, workspace_id],
    )
    if not row:
        raise HTTPException(404, "Campaign not found")
    return CampaignResponse(**dict(row))


@router.post("/{campaign_id}/run")
async def run_campaign(
    campaign_id: str,
    body: CampaignRunRequest,
    user_id: str = Depends(get_current_user_id),
):
    """
    Launch a scraping job for a campaign.
    Checks credits, reserves them, creates a Job, and calls the scraping API.
    """
    db = get_db()
    workspace_id = await get_workspace_id(db, user_id)

    # Get campaign
    campaign = await db.execute_one(
        "SELECT * FROM campaigns WHERE id = ? AND workspace_id = ?",
        [campaign_id, workspace_id],
    )
    if not campaign:
        raise HTTPException(404, "Campaign not found")

    if campaign["status"] == "running":
        raise HTTPException(400, "Campaign is already running")

    # Parse filters
    try:
        filters = json.loads(campaign["filters"]) if campaign["filters"] else {}
    except json.JSONDecodeError:
        filters = {}

    max_results = filters.get("max_results", 100)
    estimated_credits = max_results  # 1 credit per lead

    # Check workspace credits
    workspace = await db.execute_one("SELECT * FROM workspaces WHERE id = ?", [workspace_id])
    if not workspace:
        raise HTTPException(404, "Workspace not found")

    if workspace["credits_remaining"] < estimated_credits:
        raise HTTPException(402, f"Not enough credits. Need {estimated_credits}, have {workspace['credits_remaining']}")

    # Reserve credits
    await db.execute_write(
        "UPDATE workspaces SET credits_remaining = credits_remaining - ? WHERE id = ?",
        [estimated_credits, workspace_id],
    )

    # Record transaction
    await db.execute_write(
        """INSERT INTO credit_transactions
        (workspace_id, type, amount, description, campaign_id)
        VALUES (?, 'usage', ?, ?, ?)""",
        [workspace_id, -estimated_credits, f"Campaign: {campaign['name']}", campaign_id],
    )

    # Create job
    job_id = str(uuid.uuid4())
    await db.execute_write(
        """INSERT INTO jobs
        (id, workspace_id, campaign_id, type, status, input)
        VALUES (?, ?, ?, 'scrape', 'running', ?)""",
        [job_id, workspace_id, campaign_id, campaign["filters"]],
    )

    # Update campaign status
    await db.execute_write(
        "UPDATE campaigns SET status = 'running', credits_used = credits_used + ? WHERE id = ?",
        [estimated_credits, campaign_id],
    )

    # Import scraping service
    from app.services.scraping_service import run_linkedin_search

    # Build webhook URL (placeholder — would be real URL in production)
    webhook_url = f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/api/webhooks/linkdapi"

    try:
        if body.api == "linkdapi":
            run_id = await run_linkedin_search(filters, "linkdapi", webhook_url)
        elif body.api == "apify":
            run_id = await run_linkedin_search(filters, "apify", webhook_url)
        else:
            run_id = await run_linkedin_search(filters, "linkdapi", webhook_url)

        # Store run_id
        await db.execute_write(
            "UPDATE jobs SET apify_run_id = ? WHERE id = ?",
            [run_id, job_id],
        )
        await db.execute_write(
            "UPDATE campaigns SET apify_run_id = ? WHERE id = ?",
            [run_id, campaign_id],
        )
    except Exception as e:
        # Mark job as failed
        await db.execute_write(
            "UPDATE jobs SET status = 'failed', error_message = ? WHERE id = ?",
            [str(e), job_id],
        )
        await db.execute_write(
            "UPDATE campaigns SET status = 'failed' WHERE id = ?",
            [campaign_id],
        )
        # Refund credits
        await db.execute_write(
            "UPDATE workspaces SET credits_remaining = credits_remaining + ? WHERE id = ?",
            [estimated_credits, workspace_id],
        )
        raise HTTPException(500, f"Scraping job failed to start: {e}")

    return {"job_id": job_id, "run_id": run_id, "campaign_id": campaign_id}


@router.get("/{campaign_id}/stream")
async def campaign_stream(campaign_id: str, user_id: str = Depends(get_current_user_id)):
    """
    SSE endpoint for real-time campaign status.
    Returns Server-Sent Events stream.
    """
    from fastapi.responses import StreamingResponse
    import asyncio
    import json

    db = get_db()
    workspace_id = await get_workspace_id(db, user_id)

    campaign = await db.execute_one(
        "SELECT * FROM campaigns WHERE id = ? AND workspace_id = ?",
        [campaign_id, workspace_id],
    )
    if not campaign:
        raise HTTPException(404, "Campaign not found")

    async def event_generator():
        last_status = campaign["status"]
        last_leads = campaign["leads_count"]

        for _ in range(60):  # Poll for up to 60 iterations (5 min)
            await asyncio.sleep(5)

            # Re-fetch campaign
            row = await db.execute_one("SELECT * FROM campaigns WHERE id = ?", [campaign_id])
            if not row:
                yield f"data: {json.dumps({'type': 'error', 'message': 'Campaign not found'})}\n\n"
                break

            status = row["status"]
            leads_count = row["leads_count"]
            completed_at = row["completed_at"]

            # Send update if changed
            if status != last_status or leads_count != last_leads:
                msg = json.dumps({
                    "type": "status",
                    "status": status,
                    "leads_count": leads_count,
                    "completed_at": completed_at,
                })
                yield f"data: {msg}\n\n"
                last_status = status
                last_leads = leads_count

            # Check if done
            if status in ("completed", "failed"):
                msg = json.dumps({"type": "done", "status": status})
                yield f"data: {msg}\n\n"
                break

        yield f"data: {json.dumps({'type': 'close'})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.delete("/{campaign_id}")
async def delete_campaign(campaign_id: str, user_id: str = Depends(get_current_user_id)):
    """Delete a campaign."""
    db = get_db()
    workspace_id = await get_workspace_id(db, user_id)

    existing = await db.execute_one(
        "SELECT id FROM campaigns WHERE id = ? AND workspace_id = ?",
        [campaign_id, workspace_id],
    )
    if not existing:
        raise HTTPException(404, "Campaign not found")

    await db.execute_write("DELETE FROM campaigns WHERE id = ?", [campaign_id])
    return {"ok": True}
