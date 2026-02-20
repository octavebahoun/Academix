import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import AIToolsPage from "./pages/AIToolsPage";
import ChatPage from "./pages/ChatPage";
import SessionsFeedPage from "./pages/SessionsFeedPage";
import { authService } from "./services/authService";
import { useState } from "react";
import Navbar from "./components/Navbar";

// Composant pour protéger les routes
const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const user = authService.getCurrentUser();
  const role = authService.getRole();

  if (!user) return <Navigate to="/login" />;
  if (allowedRoles.length > 0 && !allowedRoles.includes(role))
    return <Navigate to="/" />;

  return children;
};

function App() {
  const [activeSession, setActiveSession] = useState(null);

  const handleJoinSession = (session) => {
    setActiveSession(session);
  };

  const handleLeaveChat = () => {
    setActiveSession(null);
  };

  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Routes publiques */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Routes protégées */}
        <Route
          path="/admin/*"
          element={
            <PrivateRoute allowedRoles={["super_admin"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/ai-tools"
          element={
            <PrivateRoute>
              <AIToolsPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <PrivateRoute>
              {activeSession ? (
                <ChatPage session={activeSession} onLeave={handleLeaveChat} />
              ) : (
                <SessionsFeedPage onJoinSession={handleJoinSession} />
              )}
            </PrivateRoute>
          }
        />

        {/* Redirection par défaut selon le rôle */}
        <Route path="/" element={<HomeLoader />} />
      </Routes>
    </Router>
  );
}

const HomeLoader = () => {
  const role = authService.getRole();
  if (!role) return <Navigate to="/login" />;
  if (role === "super_admin") return <Navigate to="/admin" />;
  return <Navigate to="/ai-tools" />;
};

export default App;
