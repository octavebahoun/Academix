import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";
import AdminOverview from "../components/admin/AdminOverview";
import AdminDepartements from "../components/admin/AdminDepartements";
import AdminChefs from "../components/admin/AdminChefs";
import { authService } from "../services/authService";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
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

  const getPageTitles = () => {
    switch (activeTab) {
      case "overview":
        return { title: "Super Admin", subtitle: "Academix Global Management" };
      case "departements":
        return {
          title: "Gestion des Départements",
          subtitle: "6 Départements Enregistrés",
        };
      case "chefs":
        return {
          title: "Chefs de Département",
          subtitle: "Gestion & Assignment",
        };
      default:
        return { title: "Super Admin", subtitle: "Academix Global Management" };
    }
  };

  const { title, subtitle } = getPageTitles();

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors font-sans">
      {/* Sidebar - fixed on the left (responsive) */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 px-4 pt-4 pb-4 md:px-8 md:pt-0 md:pb-6 overflow-x-hidden min-w-0">
        <AdminHeader
          title={title}
          subtitle={subtitle}
          theme={theme}
          onThemeToggle={handleThemeToggle}
          onMenuToggle={() => setIsMobileMenuOpen(true)}
        />

        <main className="relative">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                <AdminOverview />
              </motion.div>
            )}

            {activeTab === "departements" && (
              <motion.div
                key="departements"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                <AdminDepartements />
              </motion.div>
            )}

            {activeTab === "chefs" && (
              <motion.div
                key="chefs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                <AdminChefs />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
