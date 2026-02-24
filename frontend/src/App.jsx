import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import ChefDashboard from "./pages/ChefDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import AIToolsPage from "./pages/AIToolsPage";
import ChatPage from "./pages/ChatPage";
import SessionsFeedPage from "./pages/SessionsFeedPage";
import { authService } from "./services/authService";
import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
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

function AppContent() {
  const location = useLocation();
  const [activeSession, setActiveSession] = useState(
    location.state?.session || null,
  );

  const hideGlobalNavbar =
    location.pathname.startsWith("/chef") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/etudiant") ||
    location.pathname.startsWith("/chat"); // Added condition for /etudiant and /chat

  useEffect(() => {
    if (location.state?.session) {
      setActiveSession(location.state.session);
    }
  }, [location.state?.session]);

  const handleJoinSession = (session) => {
    setActiveSession(session);
  };

  const handleLeaveChat = () => {
    setActiveSession(null);
  };

  return (
    <>
      {!hideGlobalNavbar && <Navbar />}
      <Routes>
        {/* Routes publiques */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Dashboard Super Admin */}
        <Route
          path="/admin/*"
          element={
            <PrivateRoute allowedRoles={["super_admin"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        {/* Dashboard Chef de Département */}
        <Route
          path="/chef/*" // Changed path from /chef/dashboard to /chef/*
          element={
            <PrivateRoute allowedRoles={["chef_departement"]}>
              <ChefDashboard />
            </PrivateRoute>
          }
        />

        {/* Dashboard Étudiant */}
        <Route
          path="/etudiant/*"
          element={
            <PrivateRoute allowedRoles={["student"]}>
              <StudentDashboard />
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
    </>
  );
}

const HomeLoader = () => {
  const role = authService.getRole();
  if (!role) return <Navigate to="/login" />;
  if (role === "super_admin") return <Navigate to="/admin" />;
  if (role === "chef_departement") return <Navigate to="/chef" />;
  if (role === "student") return <Navigate to="/etudiant" />;
  return <Navigate to="/ai-tools" />;
};

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <AppContent />
    </Router>
  );
}
