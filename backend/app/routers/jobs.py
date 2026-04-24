"""
Scraping jobs management — create, list, get status, cancel.
"""
import uuid
from typing import Annotated
from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel
from app.core.database import get_db
from app.core.auth import clerk_auth
from app.services.scraping_service import (
    run_linkedin_search,
    normalize_linkedin_profile,
)

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


class JobStatus(BaseModel):
    id: str
    workspace_id: str
    campaign_id: str | None
    status: str  # pending | running | completed | failed | cancelled
    api_source: str  # linkdapi | apify
    external_run_id: str | None
    total_results: int
    new_leads: int
    duplicate_leads: int
    error_message: str | None
    started_at: str | None
    completed_at: str | None
    created_at: str


class JobCreate(BaseModel):
    campaign_id: str | None = None
    api_source: str = "apify"  # linkdapi | apify
    filters: dict = {}


class WebhookPayload(BaseModel):
    """Payload received from Apify/LinkdAPI webhook when a job finishes."""
    run_id: str
async def get_current_user_id(user: dict = Depends(clerk_auth)) -> str:
    return user["sub"]


@router.get("", response_model=list[JobStatus])
async def list_jobs(
    limit: int = Query(20, le=100),
    offset: int = Query(0, ge=0),
    user_id: str = Depends(get_current_user_id),
):
    """List scraping jobs for the current workspace."""
    db = get_db()

    workspace_row = await db.execute_one(
        "SELECT w.id FROM workspaces w "
        "JOIN workspace_members wm ON wm.workspace_id = w.id "
        "WHERE wm.user_id = ?",
        [user_id],
    )
    if not workspace_row:
        raise HTTPException(404, "No workspace found")
    workspace_id = workspace_row["id"]

    rows = await db.execute(
        "SELECT * FROM scraping_jobs WHERE workspace_id = ? "
        "ORDER BY created_at DESC LIMIT ? OFFSET ?",
        [workspace_id, limit, offset],
    )

    jobs = []
    for row in rows:
        r = dict(row)
        jobs.append(JobStatus(
            id=r["id"],
            workspace_id=r["workspace_id"],
            campaign_id=r["campaign_id"],
            status=r["status"],
            api_source=r["api_source"],
            external_run_id=r["external_run_id"],
            total_results=r.get("total_results", 0),
            new_leads=r.get("new_leads", 0),
            duplicate_leads=r.get("duplicate_leads", 0),
            error_message=r.get("error_message"),
            started_at=r.get("started_at"),
            completed_at=r.get("completed_at"),
            created_at=r["created_at"],
        ))
    return jobs


@router.get("/{job_id}", response_model=JobStatus)
async def get_job(
    job_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Get a single job by ID."""
    db = get_db()

    workspace_row = await db.execute_one(
        "SELECT w.id FROM workspaces w "
        "JOIN workspace_members wm ON wm.workspace_id = w.id "
        "WHERE wm.user_id = ?",
        [user_id],
    )
    if not workspace_row:
        raise HTTPException(404, "No workspace found")
    workspace_id = workspace_row["id"]

    row = await db.execute_one(
        "SELECT * FROM scraping_jobs WHERE id = ? AND workspace_id = ?",
        [job_id, workspace_id],
    )
    if not row:
        raise HTTPException(404, "Job not found")

    r = dict(row)
    return JobStatus(
        id=r["id"],
        workspace_id=r["workspace_id"],
        campaign_id=r["campaign_id"],
        status=r["status"],
        api_source=r["api_source"],
        external_run_id=r["external_run_id"],
        total_results=r.get("total_results", 0),
        new_leads=r.get("new_leads", 0),
        duplicate_leads=r.get("duplicate_leads", 0),
        error_message=r.get("error_message"),
        started_at=r.get("started_at"),
        completed_at=r.get("completed_at"),
        created_at=r["created_at"],
    )


@router.post("", response_model=JobStatus)
async def create_job(
    body: JobCreate,
    user_id: str = Depends(get_current_user_id),
):
    """Create and launch a new scraping job."""
    db = get_db()

    workspace_row = await db.execute_one(
        "SELECT w.id FROM workspaces w "
        "JOIN workspace_members wm ON wm.workspace_id = w.id "
        "WHERE wm.user_id = ?",
        [user_id],
    )
    if not workspace_row:
        raise HTTPException(404, "No workspace found")
    workspace_id = workspace_row["id"]

    job_id = str(uuid.uuid4())
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc).isoformat()

    # Create job record with pending status
    await db.execute_write(
        """INSERT INTO scraping_jobs
        (id, workspace_id, campaign_id, status, api_source, created_at)
        VALUES (?, ?, ?, 'pending', ?, ?)""",
        [job_id, workspace_id, body.campaign_id, body.api_source, now],
    )

    # Build webhook URL pointing to our API
    # In dev: use localhost; in prod: actual domain
    webhook_url = f"{settings.API_BASE_URL}/api/webhooks/scraping/{job_id}"

    try:
        # Launch the scraping job
        external_run_id = await run_linkedin_search(
            filters=body.filters,
            api=body.api_source,
            webhook_url=webhook_url,
        )

        # Update job with external run ID and running status
        await db.execute_write(
            "UPDATE scraping_jobs SET status='running', external_run_id=?, started_at=? WHERE id=?",
            [external_run_id, now, job_id],
        )
    except Exception as exc:
        # Mark as failed
        await db.execute_write(
            "UPDATE scraping_jobs SET status='failed', error_message=? WHERE id=?",
            [str(exc), job_id],
        )

    row = await db.execute_one("SELECT * FROM scraping_jobs WHERE id = ?", [job_id])
    r = dict(row)
    return JobStatus(
        id=r["id"],
        workspace_id=r["workspace_id"],
        campaign_id=r["campaign_id"],
        status=r["status"],
        api_source=r["api_source"],
        external_run_id=r["external_run_id"],
        total_results=r.get("total_results", 0),
        new_leads=r.get("new_leads", 0),
        duplicate_leads=r.get("duplicate_leads", 0),
        error_message=r.get("error_message"),
        started_at=r.get("started_at"),
        completed_at=r.get("completed_at"),
        created_at=r["created_at"],
    )


@router.post("/{job_id}/cancel")
async def cancel_job(
    job_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Cancel a running job."""
    db = get_db()

    workspace_row = await db.execute_one(
        "SELECT w.id FROM workspaces w "
        "JOIN workspace_members wm ON wm.workspace_id = w.id "
        "WHERE wm.user_id = ?",
        [user_id],
    )
    if not workspace_row:
        raise HTTPException(404, "No workspace found")
    workspace_id = workspace_row["id"]

    row = await db.execute_one(
        "SELECT * FROM scraping_jobs WHERE id = ? AND workspace_id = ?",
        [job_id, workspace_id],
    )
    if not row:
        raise HTTPException(404, "Job not found")

    if row["status"] not in ("pending", "running"):
        raise HTTPException(400, f"Cannot cancel job with status: {row['status']}")

    await db.execute_write(
        "UPDATE scraping_jobs SET status='cancelled' WHERE id=?",
        [job_id],
    )
    return {"ok": True}
