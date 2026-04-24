"""
Hunter.io API client for email finding and verification.
"""
import os
import httpx
from app.core.config import settings


async def find_email(domain: str, first_name: str, last_name: str) -> dict | None:
    """
    Find an email address using Hunter.io domain search.
    GET https://api.hunter.io/v2/email-finder
    """
    token = settings.HUNTER_API_KEY
    if not token:
        return None

    params = {
        "domain": domain,
        "first_name": first_name,
        "last_name": last_name,
    }
    async with httpx.AsyncClient(base_url="https://api.hunter.io", timeout=15) as client:
        resp = await client.get("/v2/email-finder", params={**params, "api_key": token})
        if resp.status_code >= 400:
            return None
        data = resp.json()
        return data.get("data")


async def verify_email(email: str) -> dict | None:
    """
    Verify an email address using Hunter.io.
    GET https://api.hunter.io/v2/email-verifier
    """
    token = settings.HUNTER_API_KEY
    if not token:
        return None

    async with httpx.AsyncClient(base_url="https://api.hunter.io", timeout=15) as client:
        resp = await client.get(
            "/v2/email-verifier",
            params={"email": email, "api_key": token},
        )
        if resp.status_code >= 400:
            return None
        data = resp.json()
        return data.get("data")


def calculate_lead_score(lead: dict) -> int:
    """
    Score a lead from 0-100 based on signals:
    - seniority (C-Level=30, VP=20, Director=15, Manager=10, IC=5)
    - company size (Enterprise=25, Mid=15, Small=10, Startup=5)
    - has email=15, has phone=10, has linkedin=10
    - industry match=10
    """
    score = 0

    # Seniority
    seniority = (lead.get("seniority") or "").lower()
    if "c-level" in seniority or "ceo" in seniority or "cto" in seniority:
        score += 30
    elif "vp" in seniority or "vice president" in seniority:
        score += 20
    elif "director" in seniority:
        score += 15
    elif "manager" in seniority:
        score += 10
    elif "individual" in seniority or "ic" in seniority:
        score += 5

    # Company size
    size = (lead.get("company_size") or "").lower()
    if "1000" in size or "enterprise" in size:
        score += 25
    elif "500" in size or "100-" in size or "201-" in size:
        score += 15
    elif "50" in size or "11-" in size or "51-" in size:
        score += 10
    else:
        score += 5

    # Contact completeness
    if lead.get("email"):
        score += 15
    if lead.get("phone"):
        score += 10
    if lead.get("linkedin_url"):
        score += 10

    return min(score, 100)
