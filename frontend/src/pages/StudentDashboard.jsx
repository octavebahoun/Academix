import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import StudentSidebar from "../components/student/StudentSidebar";
import StudentHeader from "../components/student/StudentHeader";
import StudentDashboardOverview from "../components/student/StudentDashboardOverview";
import StudentSessions from "../components/student/StudentSessions";
import StudentNotes from "../components/student/StudentNotes";
import StudentEmploiTemps from "../components/student/StudentEmploiTemps";
import StudentAIRevision from "../components/student/StudentAIRevision";
import StudentProfil from "../components/student/StudentProfil";
import { authService } from "../services/authService";

export default function StudentDashboard() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || "dashboard",
  );
  const [theme, setTheme] = useState("light");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initialisation du thème
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const handleThemeToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleLogout = () => {
    authService.logout();
    window.location.href = "/login";
  };

  const user = authService.getCurrentUser();

  const getPageTitles = () => {
    switch (activeTab) {
      case "dashboard":
        return {
          title: `Bon retour, ${user?.prenom || "Sophie"} !`,
          subtitle: `${user?.niveau || "S2"} • ${user?.filiere?.nom || "Génie Électrique et Informatique"}`,
        };
      case "sessions":
        return {
          title: "Sessions Collaboratives",
          subtitle: "Rejoignez et maîtrisez vos cours ensemble",
        };
      case "notes":
        return {
          title: "Mes Notes",
          subtitle: "Relevé de notes en temps réel",
        };
      case "emploi-temps":
        return { title: "Emploi du temps", subtitle: "" };
      case "ai-revision":
        return { title: "AI Revision Portal", subtitle: "" };
      case "profil":
        return { title: "Mon Profil", subtitle: "" };
      default:
        return {
          title: `Bon retour, ${user?.prenom || "Sophie"} !`,
          subtitle: `${user?.niveau || "S2"} • ${user?.filiere?.nom || "Génie Électrique et Informatique"}`,
        };
    }
  };

  const { title, subtitle } = getPageTitles();

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors font-sans">
      {/* Sidebar - fixed on the left (responsive) */}
      <StudentSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 px-4 py-4 md:px-8 md:py-6 overflow-hidden h-screen flex flex-col min-w-0">
        <StudentHeader
          title={title}
          subtitle={subtitle}
          theme={theme}
          onThemeToggle={handleThemeToggle}
          onMenuToggle={() => setIsMobileMenuOpen(true)}
        />

        <main className="relative flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                <StudentDashboardOverview />
              </motion.div>
            )}

            {activeTab === "sessions" && (
              <motion.div
                key="sessions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                <StudentSessions />
              </motion.div>
            )}

            {activeTab === "notes" && (
              <motion.div
                key="notes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                <StudentNotes />
              </motion.div>
            )}

            {activeTab === "emploi-temps" && (
              <motion.div
                key="emploi-temps"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                <StudentEmploiTemps />
              </motion.div>
            )}

            {activeTab === "ai-revision" && (
              <motion.div
                key="ai-revision"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                <StudentAIRevision />
              </motion.div>
            )}

            {activeTab === "profil" && (
              <motion.div
                key="profil"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                <StudentProfil />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
