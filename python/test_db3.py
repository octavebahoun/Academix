import asyncio
from app.api.dependencies import get_db_pool

async def main():
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("SELECT id, tokenable_type FROM personal_access_tokens WHERE id = 14")
            rows = await cur.fetchall()
            print("DB Tokens with ID 14:")
            for row in rows:
                print(row)
            
            await cur.execute("SELECT id FROM users LIMIT 1")
            print("Users:", await cur.fetchall())

asyncio.run(main())
