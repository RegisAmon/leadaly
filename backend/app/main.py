from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db, get_db
from app.routers import workspace, leads, campaigns, jobs, webhooks, billing


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    yield
    # Shutdown
    db = get_db()
    await db.close()


app = FastAPI(title="Leadaly API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(workspace.router)
app.include_router(leads.router)
app.include_router(campaigns.router)
app.include_router(jobs.router)
app.include_router(webhooks.router)
app.include_router(billing.router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
