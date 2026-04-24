"""
Webhook endpoints for external services (Apify, LinkdAPI, Stripe).
These are public routes (no auth) authenticated via a secret token or job ownership.
"""
import logging
import json
from fastapi import APIRouter, Request, HTTPException
from app.core.database import get_db
from app.services.scraping_service import fetch_apify_dataset, normalize_linkedin_profile

router = APIRouter(prefix="/api/webhooks", tags=["webhooks"])


@router.post("/scraping/{job_id}")
async def scraping_webhook(job_id: str, request: Request):
    """
    Receives webhook from Apify when a LinkedIn scraping run completes.
    POST body: Apify webhook payload
    """
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(400, "Invalid JSON")

    db = get_db()

    # Find the job
    row = await db.execute_one(
        "SELECT * FROM scraping_jobs WHERE id = ?",
        [job_id],
    )
    if not row:
        raise HTTPException(404, "Job not found")

    if row["status"] not in ("pending", "running"):
        return {"ok": True, "message": f"Job already in state: {row['status']}"}

    status = body.get("status", body.get("eventType", ""))
    logging.info(f"Scraping webhook for job {job_id}: status={status}")

    if status in ("ACTOR_RUN_FINISHED", "ACTOR_RUN_SUCCEEDED", "SUCCEEDED"):
        # Fetch results from Apify dataset
        external_run_id = row["external_run_id"]
        raw_results = await fetch_apify_dataset(external_run_id)

        # Normalize and upsert leads
        new_count = 0
        dup_count = 0

        for raw_profile in raw_results:
            normalized = normalize_linkedin_profile(raw_profile)
            normalized["campaign_id"] = row["campaign_id"]

            # Try to upsert
            if normalized.get("linkedin_url"):
                existing = await db.execute_one(
                    "SELECT id FROM leads WHERE linkedin_url = ? AND workspace_id = ?",
                    [normalized["linkedin_url"], row["workspace_id"]],
                )
                if existing:
                    dup_count += 1
                else:
                    import uuid
                    lead_id = str(uuid.uuid4())
                    raw_json = json.dumps(normalized.get("raw_data", normalized))
                    await db.execute_write(
                        """INSERT INTO leads
                        (id, workspace_id, campaign_id, first_name, last_name, full_name,
                         title, company_name, company_size, industry, location,
                         linkedin_url, email, phone, seniority, raw_data, score)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)""",
                        [
                            lead_id, row["workspace_id"], normalized.get("campaign_id"),
                            normalized.get("first_name"), normalized.get("last_name"),
                            normalized.get("full_name"), normalized.get("title"),
                            normalized.get("company_name"), normalized.get("company_size"),
                            normalized.get("industry"), normalized.get("location"),
                            normalized.get("linkedin_url"), normalized.get("email"),
                            normalized.get("phone"), normalized.get("seniority"),
                            raw_json,
                        ],
                    )
                    new_count += 1

        # Mark job as completed
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc).isoformat()
        await db.execute_write(
            """UPDATE scraping_jobs
            SET status='completed', total_results=?, new_leads=?,
            duplicate_leads=?, completed_at=?
            WHERE id=?""",
            [len(raw_results), new_count, dup_count, now, job_id],
        )

    elif status in ("ACTOR_RUN_FAILED", "FAILED"):
        error = body.get("error", "Unknown error")
        await db.execute_write(
            "UPDATE scraping_jobs SET status='failed', error_message=? WHERE id=?",
            [str(error), job_id],
        )

    return {"ok": True}


@router.post("/stripe")
async def stripe_webhook(request: Request):
    """
    Stripe sends webhook events here.
    We verify the signature using STRIPE_WEBHOOK_SECRET.
    """
    from app.core.config import settings
    import stripe

    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(503, "Stripe not configured")

    stripe.api_key = settings.STRIPE_SECRET_KEY
    sig = request.headers.get("stripe-signature", "")
    payload = await request.body()

    try:
        event = stripe.Webhook.construct_event(
            payload, sig, settings.STRIPE_WEBHOOK_SECRET
        )
    except Exception:
        raise HTTPException(400, "Invalid signature")

    # Handle events
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        logging.info(f"Stripe checkout completed: {session.get('id')}")
        # TODO: activate subscription, update workspace billing
    elif event["type"] == "customer.subscription.deleted":
        sub = event["data"]["object"]
        logging.info(f"Stripe subscription deleted: {sub.get('id')}")
        # TODO: downgrade workspace to free plan

    return {"ok": True}
