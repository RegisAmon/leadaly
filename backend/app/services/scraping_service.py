"""
Scraping service — runs LinkedIn searches via LinkdAPI or Apify.
"""
import os
import httpx
from app.core.config import settings


async def run_linkedin_search(filters: dict, api: str, webhook_url: str) -> str:
    """
    Run a LinkedIn search via the configured API.
    Returns the run_id from the external API.
    """
    if api == "linkdapi":
        return await run_linkdapi_search(filters, webhook_url)
    elif api == "apify":
        return await run_apify_actor(filters, webhook_url)
    else:
        return await run_linkdapi_search(filters, webhook_url)


async def run_linkdapi_search(filters: dict, webhook_url: str) -> str:
    """
    Call LinkdAPI to run a LinkedIn people search.
    POST https://api.linkdapi.com/v1/linkedin/search/people
    """
    token = os.getenv("LINKDAPI_KEY", "")
    if not token:
        # Return a mock run_id for development
        import uuid
        return f"mock_linkdapi_{uuid.uuid4().hex[:8]}"

    async with httpx.AsyncClient(base_url="https://api.linkdapi.com/v1", timeout=30) as client:
        payload = {
            "keywords": filters.get("keywords", []),
            "location": filters.get("location"),
            "industry": filters.get("industry"),
            "seniority": filters.get("seniority"),
            "page_size": min(filters.get("max_results", 100), 500),
            "webhook_url": webhook_url,
        }
        resp = await client.post(
            "/linkedin/search/people",
            json=payload,
            headers={"Authorization": f"Bearer {token}"},
        )
        if resp.status_code >= 400:
            raise Exception(f"LinkdAPI error: {resp.status_code} {resp.text}")
        data = resp.json()
        return data.get("run_id", "")


async def run_apify_actor(filters: dict, webhook_url: str) -> str:
    """
    Run Apify LinkedIn Sales Navigator actor.
    POST https://api.apify.com/v2/acts/curious_coder~linkedin-sales-navigator-search/runs
    """
    token = os.getenv("APIFY_TOKEN", "")
    if not token:
        # Return a mock run_id for development
        import uuid
        return f"mock_apify_{uuid.uuid4().hex[:8]}"

    async with httpx.AsyncClient(base_url="https://api.apify.com", timeout=30) as client:
        payload = {
            "searchQuery": " ".join(filters.get("keywords", [])) if filters.get("keywords") else "",
            "location": filters.get("location"),
            "maxResults": min(filters.get("max_results", 100), 500),
            "webhooks": [
                {
                    "eventTypes": ["ACTOR_RUN_FINISHED", "ACTOR_RUN_SUCCEEDED"],
                    "requestUrl": webhook_url,
                }
            ],
        }
        resp = await client.post(
            "/v2/acts/curious_coder~linkedin-sales-navigator-search/runs",
            json=payload,
            headers={"Authorization": f"Bearer {token}"},
        )
        if resp.status_code >= 400:
            raise Exception(f"Apify error: {resp.status_code} {resp.text}")
        data = resp.json()
        return data.get("data", {}).get("id", "")


async def fetch_apify_dataset(run_id: str) -> list[dict]:
    """
    Fetch results from an Apify dataset after a run completes.
    GET https://api.apify.com/v2/acts/{actorId}/runs/{runId}/dataset/items
    """
    token = os.getenv("APIFY_TOKEN", "")
    if not token:
        return []

    async with httpx.AsyncClient(base_url="https://api.apify.com", timeout=30) as client:
        resp = await client.get(
            f"/v2/acts/curious_coder~linkedin-sales-navigator-search/runs/{run_id}/dataset/items",
            headers={"Authorization": f"Bearer {token}"},
        )
        if resp.status_code >= 400:
            return []
        return resp.json()


def normalize_linkedin_profile(raw: dict) -> dict:
    """
    Normalize a raw profile from LinkdAPI or Apify into common lead fields.
    Returns a dict matching LeadCreate schema.
    """
    # Try to extract LinkedIn URL
    linkedin_url = raw.get("linkedin_url") or raw.get("url") or raw.get("profile_url", "")

    # Try to get name
    first_name = raw.get("first_name") or raw.get("firstName") or ""
    last_name = raw.get("last_name") or raw.get("lastName") or ""
    full_name = raw.get("full_name") or raw.get("name") or f"{first_name} {last_name}".strip() or None

    return {
        "first_name": first_name or None,
        "last_name": last_name or None,
        "full_name": full_name,
        "title": raw.get("title") or raw.get("headline") or raw.get("current_title"),
        "company_name": raw.get("company_name") or raw.get("company") or raw.get("companyName"),
        "company_size": raw.get("company_size") or raw.get("companySize"),
        "industry": raw.get("industry"),
        "location": raw.get("location"),
        "linkedin_url": linkedin_url if linkedin_url else None,
        "email": raw.get("email"),
        "phone": raw.get("phone") or raw.get("phone_number"),
        "seniority": raw.get("seniority"),
        "raw_data": raw,
    }
