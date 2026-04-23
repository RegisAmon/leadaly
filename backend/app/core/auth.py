import httpx
from fastapi import HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.core.config import settings

CLERK_JWKS_URL = "https://api.clerk.com/v1/jwks"
CLERK_ISSUER = "https://clerk.com"
CLERK_AUDIENCE = "leadaly"


class ClerkBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super().__init__(auto_error=auto_error)
        self._jwks_client = httpx.AsyncClient(base_url=CLERK_JWKS_URL, timeout=10)

    async def get_jwks(self) -> dict:
        resp = await self._jwks_client.get("")
        resp.raise_for_status()
        return resp.json()

    async def verify_token(self, token: str) -> dict:
        try:
            jwks = await self.get_jwks()
            unverified_header = jwt.get_unverified_header(token)
            kid = unverified_header.get("kid")
            key = None
            for jwk in jwks.get("keys", []):
                if jwk.get("kid") == kid:
                    key = jwk
                    break
            if not key:
                raise HTTPException(401, "Clerk key not found")
            payload = jwt.decode(
                token,
                key,
                algorithms=["RS256"],
                audience=CLERK_AUDIENCE,
                issuer=CLERK_ISSUER,
            )
            return payload
        except JWTError as e:
            raise HTTPException(401, f"Invalid Clerk token: {e}")

    async def __call__(self, request: Request) -> dict | None:
        credentials: HTTPAuthorizationCredentials | None = await super().__call__(request)
        if not credentials:
            return None
        return await self.verify_token(credentials.credentials)


clerk_bearer = ClerkBearer()
