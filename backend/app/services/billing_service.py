"""
Stripe billing — checkout sessions and webhook handler.
"""
import os
import stripe as stripe_lib
from app.core.config import settings


def get_stripe_client():
    if not settings.STRIPE_SECRET_KEY:
        return None
    stripe_lib.api_key = settings.STRIPE_SECRET_KEY
    return stripe_lib


def build_checkout_session(
    workspace_id: str,
    price_id: str,
    success_url: str,
    cancel_url: str,
) -> str | None:
    """
    Create a Stripe Checkout session for subscription upgrade.
    Returns the checkout URL.
    """
    client = get_stripe_client()
    if not client:
        return None

    session = client.checkout.Session.create(
        mode="subscription",
        payment_method_types=["card"],
        line_items=[{"price": price_id, "quantity": 1}],
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={"workspace_id": workspace_id},
        allow_promotion_codes=True,
    )
    return session.url


def get_customer_portal_url(customer_id: str, return_url: str) -> str | None:
    """Open Stripe customer portal for billing management."""
    client = get_stripe_client()
    if not client:
        return None

    session = client.billing_portal.Session.create(
        customer=customer_id,
        return_url=return_url,
    )
    return session.url


def get_workspace_credits(db, workspace_id: str) -> int:
    """Get current credit balance for a workspace."""
    row = db.execute_one("SELECT credits_remaining FROM workspaces WHERE id = ?", [workspace_id])
    if not row:
        return 0
    return row["credits_remaining"]


def deduct_credits(db, workspace_id: str, amount: int, description: str, campaign_id: str | None = None) -> bool:
    """
    Deduct credits from workspace if sufficient balance.
    Returns True if successful, False if insufficient credits.
    """
    current = get_workspace_credits(db, workspace_id)
    if current < amount:
        return False

    from datetime import datetime, timezone
    import uuid

    db.execute_write(
        "UPDATE workspaces SET credits_remaining = credits_remaining - ? WHERE id = ?",
        [amount, workspace_id],
    )
    db.execute_write(
        """INSERT INTO credit_transactions
        (workspace_id, type, amount, description, campaign_id)
        VALUES (?, 'usage', ?, ?, ?)""",
        [workspace_id, -amount, description, campaign_id],
    )
    return True


PRICES = {
    "starter": {
        "name": "Starter",
        "monthly_price_id": os.getenv("STRIPE_STARTER_PRICE_ID", "price_starter_placeholder"),
        "monthly_amount": 4900,  # $49.00 in cents
        "credits": 500,
    },
    "pro": {
        "name": "Pro",
        "monthly_price_id": os.getenv("STRIPE_PRO_PRICE_ID", "price_pro_placeholder"),
        "monthly_amount": 14900,  # $149.00
        "credits": 2000,
    },
    "scale": {
        "name": "Scale",
        "monthly_price_id": os.getenv("STRIPE_SCALE_PRICE_ID", "price_scale_placeholder"),
        "monthly_amount": 49900,  # $499.00
        "credits": 10000,
    },
}
