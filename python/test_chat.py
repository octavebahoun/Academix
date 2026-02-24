import asyncio
from app.services.rag_service import rag_service
from app.models.schemas import Message

async def main():
    try:
        ans = await rag_service.ask_question("Quel est mon prénom ?", [
            Message(role="user", content="Bonjour, je m'appelle Octave."),
            Message(role="ai", content="Bonjour Octave !")
        ])
        print("RESULT:", ans)
    except Exception as e:
        print("ERROR:", str(e))

asyncio.run(main())
