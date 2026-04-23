import uuid
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.core.database import get_db, Database
from app.core.auth import clerk_auth

router = APIRouter(prefix="/api/workspace", tags=["workspace"])


def get_current_user_id(user: dict = Depends(clerk_auth)) -> str:
    return user["sub"]


class InitWorkspaceRequest(BaseModel):
    name: str
    slug: str


class WorkspaceResponse(BaseModel):
    id: str
    name: str
    slug: str
    plan: str
    credits_remaining: int
    credits_total: int
    created_at: str


@router.post("/init", response_model=WorkspaceResponse)
async def init_workspace(body: InitWorkspaceRequest, user_id: str = Depends(get_current_user_id)):
    """Create workspace on first login if none exists for this user."""
    db = get_db()

    # Check if user already has a workspace
    existing = await db.execute(
        "SELECT w.* FROM workspaces w "
        "JOIN workspace_members wm ON wm.workspace_id = w.id "
        "WHERE wm.user_id = ?",
        [user_id],
    )
    if existing:
        return WorkspaceResponse(**existing[0])

    # Create workspace
    workspace_id = str(uuid.uuid4())
    await db.execute_write(
        "INSERT INTO workspaces (id, name, slug) VALUES (?, ?, ?)",
        [workspace_id, body.name, body.slug],
    )

    # Add user as owner
    await db.execute_write(
        "INSERT INTO workspace_members (workspace_id, user_id, role) VALUES (?, ?, 'owner')",
        [workspace_id, user_id],
    )

    ws = await db.execute_one("SELECT * FROM workspaces WHERE id = ?", [workspace_id])
    if not ws:
        raise HTTPException(500, "Workspace creation failed")

    return WorkspaceResponse(**ws)


@router.get("/me", response_model=WorkspaceResponse)
async def get_my_workspace(user_id: str = Depends(get_current_user_id)):
    """Get the current user's workspace."""
    db = get_db()
    row = await db.execute_one(
        "SELECT w.* FROM workspaces w "
        "JOIN workspace_members wm ON wm.workspace_id = w.id "
        "WHERE wm.user_id = ?",
        [user_id],
    )
    if not row:
        raise HTTPException(404, "No workspace found")
    return WorkspaceResponse(**row)
