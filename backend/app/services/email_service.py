"""
Email generation via Anthropic Claude REST API + sending via Resend.
"""
import os
import json
import httpx
from app.core.config import settings


async def generate_email_with_claude(
    context: dict,
    recipient_name: str,
    recipient_title: str | None,
    company_name: str | None,
    campaign_name: str,
    tone: str = "professionnel",
) -> str:
    """
    Generate a personalized email using Claude via REST API.
    Returns the email body text.
    """
    api_key = settings.ANTHROPIC_API_KEY
    if not api_key:
        return get_placeholder_email(recipient_name, campaign_name)

    system_prompt = (
        "Tu es un assistant B2B qui écrit des emails de prospection froide. "
        "Tu écris de manière concise, persuasive et professionnelle. "
        "L'email doit être court (80-120 mots), avec un objet de mail. "
        "Structure : Objet | Salutation | Corps (2-3 phrases max) | Call-to-action | Signature"
    )

    user_prompt = f"""Génère un email de prospection froide.

Destinataire: {recipient_name}{f" ({recipient_title})" if recipient_title else ""}
Entreprise: {company_name or "Non précisée"}
Campagne: {campaign_name}
Ton: {tone}

Réponds STRICTEMENT au format JSON suivant (sans markdown, sans texte additionnel):
{{"subject": "objet du mail", "body": "contenu du mail"}}
"""

    async with httpx.AsyncClient(base_url="https://api.anthropic.com", timeout=30) as client:
        resp = await client.post(
            "/v1/messages",
            headers={
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": "claude-3-5-haiku-20241107",
                "max_tokens": 400,
                "system": system_prompt,
                "messages": [{"role": "user", "content": user_prompt}],
            },
        )
        if resp.status_code >= 400:
            return get_placeholder_email(recipient_name, campaign_name)

        data = resp.json()
        text = data.get("content", [{}])[0].get("text", "")
        # Try to parse as JSON
        try:
            parsed = json.loads(text)
            return f"Subject: {parsed.get('subject', '')}\n\n{parsed.get('body', '')}"
        except json.JSONDecodeError:
            return text


def get_placeholder_email(recipient_name: str, campaign_name: str) -> str:
    return f"""Subject: Discutons de {campaign_name}

Bonjour {recipient_name},

J'ai récemment découvert votre entreprise et je crois que nous pourrions avoir une conversation intéressante.

Seriez-vous disponible pour un appel de 15 minutes cette semaine ?

Cordialement"""


async def send_email_via_resend(
    to_email: str,
    subject: str,
    body: str,
    from_email: str = "noreply@leadaly.com",
) -> str | None:
    """
    Send an email via Resend API.
    Returns the Resend message ID or None on failure.
    """
    api_key = settings.RESEND_API_KEY
    if not api_key:
        return None

    async with httpx.AsyncClient(base_url="https://api.resend.com", timeout=15) as client:
        resp = await client.post(
            "/emails",
            headers={
                "Authorization": f"Bearer {api_key}",
                "content-type": "application/json",
            },
            json={
                "from": from_email,
                "to": [to_email],
                "subject": subject,
                "text": body,
            },
        )
        if resp.status_code >= 400:
            return None
        data = resp.json()
        return data.get("id")
