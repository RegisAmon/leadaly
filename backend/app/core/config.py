from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str = "postgresql+asyncpg://user:pass@localhost/leadaly"
    REDIS_URL: str = "redis://localhost:6379"
    CLERK_SECRET_KEY: str = ""
    FRONTEND_URL: str = "http://localhost:3000"
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    HUNTER_API_KEY: str = ""
    LINKDAPI_KEY: str = ""
    APAFY_TOKEN: str = ""
    RESEND_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_S3_BUCKET: str = "leadaly-exports"


settings = Settings()
