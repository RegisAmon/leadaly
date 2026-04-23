import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class WorkspaceBase(BaseModel):
    name: str


class WorkspaceCreate(WorkspaceBase):
    pass


class WorkspaceUpdate(BaseModel):
    name: str | None = None


class WorkspaceOut(WorkspaceBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    slug: str
    plan: str
    credits_remaining: int
    credits_total: int
    stripe_customer_id: str | None
    stripe_subscription_id: str | None
    created_at: datetime


class WorkspaceMemberOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    workspace_id: uuid.UUID
    user_id: str
    role: str
    created_at: datetime


class WorkspaceInitResponse(BaseModel):
    workspace: WorkspaceOut
    is_new: bool
