"""
Lead management endpoints.
"""
import uuid
from typing import Annotated
from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel
from app.core.database import get_db, Database
from app.core.auth import clerk_auth

router = APIRouter(prefix="/api/leads", tags=["leads"])


def get_current_user_id(user: dict = Depends(clerk_auth)) -> str:
    return user["sub"]


class LeadResponse(BaseModel):
    id: str
    workspace_id: str
    campaign_id: str | None
    first_name: str | None
    last_name: str | None
    full_name: str | None
    title: str | None
    company_name: str | None
    company_size: str | None
    industry: str | None
    location: str | None
    linkedin_url: str | None
    email: str | None
    email_status: str | None
    phone: str | None
    seniority: str | None
    raw_data: str | None
    score: int
    tags: str | None
    crm_pushed_at: str | None
    crm_external_id: str | None
    created_at: str


class LeadCreate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    full_name: str | None = None
    title: str | None = None
    company_name: str | None = None
    company_size: str | None = None
    industry: str | None = None
    location: str | None = None
    linkedin_url: str | None = None
    email: str | None = None
    email_status: str | None = None
    phone: str | None = None
    seniority: str | None = None
    raw_data: dict | None = None
    tags: list[str] = []
    campaign_id: str | None = None


@router.get("", response_model=list[LeadResponse])
async def list_leads(
    user_id: str = Depends(get_current_user_id),
    campaign_id: str | None = Query(None),
    limit: int = Query(100, le=500),
    offset: int = Query(0, ge=0),
):
    """List all leads for the current user's workspace."""
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

    if campaign_id:
        rows = await db.execute(
            "SELECT * FROM leads WHERE workspace_id = ? AND campaign_id = ? "
            "ORDER BY created_at DESC LIMIT ? OFFSET ?",
            [workspace_id, campaign_id, limit, offset],
        )
    else:
        rows = await db.execute(
            "SELECT * FROM leads WHERE workspace_id = ? "
            "ORDER BY created_at DESC LIMIT ? OFFSET ?",
            [workspace_id, limit, offset],
        )

    leads = []
    for row in rows:
        lead = dict(row)
        lead["raw_data"] = lead.get("raw_data", "{}")
        lead["tags"] = lead.get("tags", "[]")
        leads.append(LeadResponse(**lead))

    return leads


@router.get("/{lead_id}", response_model=LeadResponse)
async def get_lead(lead_id: str, user_id: str = Depends(get_current_user_id)):
    """Get a single lead by ID."""
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
        "SELECT * FROM leads WHERE id = ? AND workspace_id = ?",
        [lead_id, workspace_id],
    )
    if not row:
        raise HTTPException(404, "Lead not found")

    lead = dict(row)
    lead["raw_data"] = lead.get("raw_data", "{}")
    lead["tags"] = lead.get("tags", "[]")
    return LeadResponse(**lead)


@router.post("", response_model=LeadResponse)
async def create_lead(
    body: LeadCreate,
    user_id: str = Depends(get_current_user_id),
):
    """Create a new lead (usually from scraping result)."""
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

    # Deduplicate by linkedin_url if provided
    if body.linkedin_url:
        existing = await db.execute_one(
            "SELECT id FROM leads WHERE linkedin_url = ? AND workspace_id = ?",
            [body.linkedin_url, workspace_id],
        )
        if existing:
            raise HTTPException(409, "Lead with this LinkedIn URL already exists")

    lead_id = str(uuid.uuid4())
    import json
    raw_data_json = json.dumps(body.raw_data) if body.raw_data else "{}"
    tags_json = json.dumps(body.tags) if body.tags else "[]"

    await db.execute_write(
        """INSERT INTO leads
        (id, workspace_id, campaign_id, first_name, last_name, full_name,
         title, company_name, company_size, industry, location,
         linkedin_url, email, email_status, phone, seniority,
         raw_data, score, tags)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)""",
        [
            lead_id, workspace_id, body.campaign_id,
            body.first_name, body.last_name, body.full_name,
            body.title, body.company_name, body.company_size,
            body.industry, body.location, body.linkedin_url,
            body.email, body.email_status, body.phone, body.seniority,
            raw_data_json, tags_json,
        ],
    )

    row = await db.execute_one("SELECT * FROM leads WHERE id = ?", [lead_id])
    if not row:
        raise HTTPException(500, "Failed to create lead")

    lead = dict(row)
    lead["raw_data"] = lead.get("raw_data", "{}")
    lead["tags"] = lead.get("tags", "[]")
    return LeadResponse(**lead)


@router.post("/bulk", response_model=list[LeadResponse])
async def create_leads_bulk(
    body: list[LeadCreate],
    user_id: str = Depends(get_current_user_id),
):
    """Bulk create leads (used by scraping webhooks)."""
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

    import json
    created = []
    for body_lead in body:
        lead_id = str(uuid.uuid4())
        raw_data_json = json.dumps(body_lead.raw_data) if body_lead.raw_data else "{}"
        tags_json = json.dumps(body_lead.tags) if body_lead.tags else "[]"

        await db.execute_write(
            """INSERT INTO leads
            (id, workspace_id, campaign_id, first_name, last_name, full_name,
             title, company_name, company_size, industry, location,
             linkedin_url, email, email_status, phone, seniority,
             raw_data, score, tags)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
            ON CONFLICT(linkedin_url) DO UPDATE SET
              first_name=excluded.first_name,
              last_name=excluded.last_name,
              full_name=excluded.full_name,
              title=excluded.title,
              company_name=excluded.company_name,
              company_size=excluded.company_size,
              industry=excluded.industry,
              location=excluded.location,
              raw_data=excluded.raw_data""",
            [
                lead_id, workspace_id, body_lead.campaign_id,
                body_lead.first_name, body_lead.last_name, body_lead.full_name,
                body_lead.title, body_lead.company_name, body_lead.company_size,
                body_lead.industry, body_lead.location, body_lead.linkedin_url,
                body_lead.email, body_lead.email_status, body_lead.phone, body_lead.seniority,
                raw_data_json, tags_json,
            ],
        )
        created.append(lead_id)

    # Fetch created leads
    leads = []
    for lid in created:
        row = await db.execute_one("SELECT * FROM leads WHERE id = ?", [lid])
        if row:
            lead = dict(row)
            lead["raw_data"] = lead.get("raw_data", "{}")
            lead["tags"] = lead.get("tags", "[]")
            leads.append(LeadResponse(**lead))

    return leads


@router.patch("/{lead_id}", response_model=LeadResponse)
async def update_lead(
    lead_id: str,
    body: LeadCreate,
    user_id: str = Depends(get_current_user_id),
):
    """Update a lead."""
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

    existing = await db.execute_one(
        "SELECT * FROM leads WHERE id = ? AND workspace_id = ?",
        [lead_id, workspace_id],
    )
    if not existing:
        raise HTTPException(404, "Lead not found")

    import json
    raw_data_json = json.dumps(body.raw_data) if body.raw_data else existing.get("raw_data", "{}")
    tags_json = json.dumps(body.tags) if body.tags else existing.get("tags", "[]")

    await db.execute_write(
        """UPDATE leads SET
        first_name=?, last_name=?, full_name=?, title=?,
        company_name=?, company_size=?, industry=?, location=?,
        linkedin_url=?, email=?, email_status=?, phone=?, seniority=?,
        raw_data=?, tags=?
        WHERE id = ?""",
        [
            body.first_name, body.last_name, body.full_name, body.title,
            body.company_name, body.company_size, body.industry, body.location,
            body.linkedin_url, body.email, body.email_status, body.phone, body.seniority,
            raw_data_json, tags_json, lead_id,
        ],
    )

    row = await db.execute_one("SELECT * FROM leads WHERE id = ?", [lead_id])
    lead = dict(row)
    lead["raw_data"] = lead.get("raw_data", "{}")
    lead["tags"] = lead.get("tags", "[]")
    return LeadResponse(**lead)


@router.delete("/{lead_id}")
async def delete_lead(lead_id: str, user_id: str = Depends(get_current_user_id)):
    """Delete a single lead."""
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

    existing = await db.execute_one(
        "SELECT id FROM leads WHERE id = ? AND workspace_id = ?",
        [lead_id, workspace_id],
    )
    if not existing:
        raise HTTPException(404, "Lead not found")

    await db.execute_write("DELETE FROM leads WHERE id = ?", [lead_id])
    return {"ok": True}


@router.delete("")
async def delete_leads_bulk(
    ids: list[str] = Query(...),
    user_id: str = Depends(get_current_user_id),
):
    """Bulk delete leads."""
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

    placeholders = ",".join("?" * len(ids))
    await db.execute_write(
        f"DELETE FROM leads WHERE id IN ({placeholders}) AND workspace_id = ?",
        [*ids, workspace_id],
    )
    return {"ok": True, "deleted": len(ids)}
