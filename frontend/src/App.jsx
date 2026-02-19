import { useState } from "react";
import "./App.css";
import ChatPage from "./pages/ChatPage";
import SessionsFeedPage from "./pages/SessionsFeedPage";

function App() {
  const [activeSession, setActiveSession] = useState(null);

  if (activeSession) {
    return (
      <ChatPage
        session={activeSession}
        onLeave={() => setActiveSession(null)}
      />
    );
  }

  return <SessionsFeedPage onJoinSession={setActiveSession} />;
}

export default App;
