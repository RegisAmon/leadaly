"""
Database abstraction for Leadaly.
Uses libsql-client for async operations with Turso (libSQL).
Local dev: file:local.db (SQLite)
Production: TURSO_DATABASE_URL + TURSO_AUTH_TOKEN
"""
import os
from contextlib import asynccontextmanager
from typing import Any

import libsql_client


def _row_to_dict(row: libsql_client.Row) -> dict[str, Any]:
    """Convert libsql Row to dict."""
    return row.asdict()


class Database:
    """
    Thin async wrapper around libsql_client.Client.
    URL format:
      - libsql://database-name.turso.io  (production)
      - file:local.db                   (local dev SQLite)
    """

    def __init__(
        self,
        url: str | None = None,
        auth_token: str | None = None,
    ):
        self.url = url or os.getenv("TURSO_DATABASE_URL", "file:local.db")
        self.auth_token = auth_token or os.getenv("TURSO_AUTH_TOKEN")
        self._client: libsql_client.Client | None = None

    async def connect(self) -> None:
        if self._client is None:
            self._client = libsql_client.create_client(
                self.url,
                auth_token=self.auth_token,
            )

    async def close(self) -> None:
        if self._client:
            await self._client.close()
            self._client = None

    async def execute(self, sql: str, params: list[Any] | None = None) -> list[dict[str, Any]]:
        """Execute a query and return rows as list of dicts."""
        if not self._client:
            await self.connect()
        result = await self._client.execute(sql, params or [])
        return [_row_to_dict(row) for row in result.rows]

    async def execute_one(self, sql: str, params: list[Any] | None = None) -> dict[str, Any] | None:
        """Execute and return first row or None."""
        rows = await self.execute(sql, params)
        return rows[0] if rows else None

    async def execute_write(self, sql: str, params: list[Any] | None = None) -> int:
        """Execute a write (INSERT/UPDATE/DELETE), return rows affected."""
        if not self._client:
            await self.connect()
        result = await self._client.execute(sql, params or [])
        return result.rows_affected if hasattr(result, 'rows_affected') else len(result.rows)

    @asynccontextmanager
    async def transaction(self):
        """Async context manager for transactions."""
        if not self._client:
            await self.connect()
        async with self._client.transaction() as tx:
            yield tx


# Global singleton
_db: Database | None = None


def get_db() -> Database:
    global _db
    if _db is None:
        _db = Database()
    return _db


async def init_db() -> Database:
    """Initialize DB connection. Call once at startup."""
    db = get_db()
    await db.connect()
    return db
