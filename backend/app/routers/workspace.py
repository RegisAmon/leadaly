import re
import uuid
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.auth import clerk_bearer
from app.models.workspace import Workspace, WorkspaceMember
from app.schemas.workspace import WorkspaceOut, WorkspaceInitResponse, WorkspaceUpdate

router = APIRouter(prefix="/api/workspace", tags=["workspace"])


def slugify(name: str) -> str:
    name = name.lower().strip()
    name = re.sub(r"[^\w\s-]", "", name)
    name = re.sub(r"[-\s]+", "-", name)
    return name


@router.get("", response_model=WorkspaceOut)
async def get_workspace(
    db: AsyncSession = Depends(get_db),
    token: dict = Depends(clerk_bearer),
):
    """Get current workspace info."""
    user_id = token.get("sub")
    if not user_id:
        raise HTTPException(401, "Invalid token: no user id")

    result = await db.execute(
        select(Workspace)
        .join(WorkspaceMember, WorkspaceMember.workspace_id == Workspace.id)
        .where(WorkspaceMember.user_id == user_id)
    )
    workspace = result.scalar_one_or_none()
    if not workspace:
        raise HTTPException(404, "Workspace not found")
    return workspace


@router.post("/init", response_model=WorkspaceInitResponse)
async def init_workspace(
    db: AsyncSession = Depends(get_db),
    token: dict = Depends(clerk_bearer),
):
    """Auto-create workspace on first login. Called by frontend on mount."""
    user_id = token.get("sub")
    email = token.get("email", "")
    first_name = token.get("first_name", "")
    last_name = token.get("last_name", "")
    full_name = f"{first_name} {last_name}".strip() or email.split("@")[0]

    existing = await db.execute(
        select(Workspace)
        .join(WorkspaceMember, WorkspaceMember.workspace_id == Workspace.id)
        .where(WorkspaceMember.user_id == user_id)
    )
    if existing.scalar_one_or_none():
        workspace = existing.scalar_one()
        return WorkspaceInitResponse(workspace=workspace, is_new=False)

    base_slug = slugify(full_name)
    slug = base_slug
    counter = 1
    while True:
        conflict = await db.execute(select(Workspace).where(Workspace.slug == slug))
        if not conflict.scalar_one_or_none():
            break
        slug = f"{base_slug}-{counter}"
        counter += 1

    workspace = Workspace(name=full_name, slug=slug)
    db.add(workspace)
    await db.flush()

    member = WorkspaceMember(
        workspace_id=workspace.id,
        user_id=user_id,
        role="owner",
    )
    db.add(member)
    await db.commit()
    await db.refresh(workspace)

    return WorkspaceInitResponse(workspace=workspace, is_new=True)


@router.put("", response_model=WorkspaceOut)
async def update_workspace(
    body: WorkspaceUpdate,
    db: AsyncSession = Depends(get_db),
    token: dict = Depends(clerk_bearer),
):
    user_id = token.get("sub")
    result = await db.execute(
        select(Workspace)
        .join(WorkspaceMember, WorkspaceMember.workspace_id == Workspace.id)
        .where(WorkspaceMember.user_id == user_id)
    )
    workspace = result.scalar_one_or_none()
    if not workspace:
        raise HTTPException(404, "Workspace not found")
    if body.name:
        workspace.name = body.name
    await db.commit()
    await db.refresh(workspace)
    return workspace
