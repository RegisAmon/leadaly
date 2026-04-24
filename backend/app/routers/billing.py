"""
Billing endpoints — Stripe checkout and workspace credits.
"""
import os
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from app.core.database import get_db
from app.core.auth import clerk_auth
from app.services.billing_service import (
    build_checkout_session,
    get_customer_portal_url,
    get_workspace_credits,
    deduct_credits,
    PRICES,
)

router = APIRouter(prefix="/api/billing", tags=["billing"])


async def get_current_user_id(user: dict = Depends(clerk_auth)) -> str:
    return user["sub"]


class CheckoutRequest(BaseModel):
    plan: str  # starter | pro | scale


class CreditPurchaseRequest(BaseModel):
    amount: int  # number of credits to buy


@router.get("/credits")
async def get_credits(user_id: str = Depends(get_current_user_id)):
    """Get current credit balance and transaction history."""
    db = get_db()

    workspace_row = await db.execute_one(
        "SELECT w.id, w.credits_remaining FROM workspaces w "
        "JOIN workspace_members wm ON wm.workspace_id = w.id "
        "WHERE wm.user_id = ?",
        [user_id],
    )
    if not workspace_row:
        raise HTTPException(404, "No workspace found")

    workspace_id = workspace_row["id"]
    balance = workspace_row["credits_remaining"]

    # Transaction history
    rows = await db.execute(
        "SELECT * FROM credit_transactions WHERE workspace_id = ? "
        "ORDER BY created_at DESC LIMIT 20",
        [workspace_id],
    )
    transactions = [dict(row) for row in rows]

    return {"credits_remaining": balance, "transactions": transactions}


@router.post("/checkout")
async def create_checkout(
    body: CheckoutRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Create a Stripe Checkout session for subscription upgrade."""
    if body.plan not in PRICES:
        raise HTTPException(400, f"Unknown plan: {body.plan}")

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

    price_id = PRICES[body.plan]["monthly_price_id"]
    success_url = f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/dashboard/settings?billing=success"
    cancel_url = f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/dashboard/settings?billing=cancelled"

    checkout_url = build_checkout_session(workspace_id, price_id, success_url, cancel_url)
    if not checkout_url:
        raise HTTPException(503, "Stripe not configured")

    return {"checkout_url": checkout_url}


@router.get("/portal")
async def open_portal(
    user_id: str = Depends(get_current_user_id),
):
    """Open Stripe customer portal for billing management."""
    db = get_db()
    workspace_row = await db.execute_one(
        "SELECT w.id, w.stripe_customer_id FROM workspaces w "
        "JOIN workspace_members wm ON wm.workspace_id = w.id "
        "WHERE wm.user_id = ?",
        [user_id],
    )
    if not workspace_row:
        raise HTTPException(404, "No workspace found")

    customer_id = workspace_row.get("stripe_customer_id")
    if not customer_id:
        raise HTTPException(400, "No Stripe customer found")

    return_url = f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/dashboard/settings"
    portal_url = get_customer_portal_url(customer_id, return_url)
    if not portal_url:
        raise HTTPException(503, "Stripe not configured")

    return {"portal_url": portal_url}


@router.get("/plans")
async def list_plans():
    """Return available plans with pricing."""
    return PRICES
