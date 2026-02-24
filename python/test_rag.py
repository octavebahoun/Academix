import asyncio
from app.services.rag_service import rag_service

async def main():
    try:
        ans = await rag_service.ask_question("test")
        print("RESULT:", ans)
    except Exception as e:
        print("ERROR:", str(e))

asyncio.run(main())
