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
import GoogleCallbackPage from "./pages/GoogleCallbackPage";

import ChatPage from "./pages/ChatPage";
import SessionsFeedPage from "./pages/SessionsFeedPage";
import LandingPage from "./pages/LandingPage";
import { authService } from "./services/authService";
import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";

// Composant pour protéger les routes
const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const user = authService.getCurrentUser();
  const role = authService.getRole();

  if (!user) return <Navigate to="/landing" />;
  if (allowedRoles.length > 0 && !allowedRoles.includes(role))
    return <Navigate to="/landing" />;

  return children;
};

function AppContent() {
  const location = useLocation();
  const [activeSession, setActiveSession] = useState(
    location.state?.session || null,
  );

  const hideGlobalNavbar =
    location.pathname === "/" ||
    location.pathname.startsWith("/landing") ||
    location.pathname.startsWith("/chef") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/etudiant") ||
    location.pathname.startsWith("/chat");

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
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        {/* Callback OAuth Google — accessible sans auth (token lu depuis localStorage) */}
        <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />

        {/* Création d'un compte Admin — réservé à un Super Admin connecté */}
        <Route
          path="/register"
          element={
            <PrivateRoute allowedRoles={["super_admin"]}>
              <RegisterPage />
            </PrivateRoute>
          }
        />

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

        {/* Landing page publique — redirige vers le dashboard si déjà connecté */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="/landing" element={<LandingPage />} />

        {/* Redirection après login selon le rôle */}
        <Route path="/home" element={<HomeRedirect />} />
      </Routes>
    </>
  );
}

// Redirige vers le dashboard si connecté, sinon vers la landing page
const RootRedirect = () => {
  const user = authService.getCurrentUser();
  const role = authService.getRole();
  if (!user) return <Navigate to="/landing" replace />;
  if (role === "super_admin") return <Navigate to="/admin" replace />;
  if (role === "chef_departement") return <Navigate to="/chef" replace />;
  if (role === "student") return <Navigate to="/etudiant" replace />;
  return <Navigate to="/landing" replace />;
};

const HomeRedirect = () => {
  const role = authService.getRole();
  if (role === "super_admin") return <Navigate to="/admin" />;
  if (role === "chef_departement") return <Navigate to="/chef" />;
  if (role === "student") return <Navigate to="/etudiant" />;
  return <Navigate to="/landing" />;
};

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <AppContent />
    </Router>
  );
}
