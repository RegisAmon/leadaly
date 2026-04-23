"""
Initialize Leadaly database schema.
Run once: python scripts/init_db.py
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import get_db

SCHEMA = open(os.path.join(os.path.dirname(os.path.dirname(__file__)), "schema.sql")).read()


async def main():
    db = get_db()
    await db.connect()

    # Execute each statement separately (libsql doesn't support multiple statements in one call)
    for statement in SCHEMA.split(";"):
        statement = statement.strip()
        if statement:
            try:
                await db.execute(statement)
                print(f"OK: {statement[:60]}...")
            except Exception as e:
                print(f"ERROR: {statement[:60]}... → {e}")

    await db.close()
    print("\nSchema initialized.")


if __name__ == "__main__":
    asyncio.run(main())
