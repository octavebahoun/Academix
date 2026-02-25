import asyncio
from app.api.dependencies import get_db_pool

async def main():
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("SELECT id, token, tokenable_type FROM personal_access_tokens WHERE id = 14")
            rows = await cur.fetchall()
            for row in rows:
                print(f"Token present in DB! ID: {row[0]}")
            if not rows:
                print("Token ID 14 is NOT in the database.")

asyncio.run(main())
