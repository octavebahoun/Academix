import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronRight, Sparkles } from "lucide-react";
import logoSvg from "../../assets/logo.svg";
import logoDarkSvg from "../../assets/logo-dark.svg";

const navLinks = [
  { label: "Fonctionnalités", href: "#features" },
  { label: "IA", href: "#ai-modules" },
  { label: "Collaboration", href: "#collaboration" },
];

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (href) => {
    setMobileOpen(false);
    if (
      window.location.pathname !== "/landing" &&
      window.location.pathname !== "/"
    ) {
      navigate("/landing" + href);
      return;
    }
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/landing" + href);
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 120 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-slate-950/90 backdrop-blur-xl shadow-lg shadow-emerald-500/5 border-b border-slate-800/60"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-18 items-center justify-between">
            {/* Logo */}
            <Link to="/landing" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <span className="text-white font-display font-extrabold text-lg">
                    A
                  </span>
                </div>
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
              <span className="font-display text-xl font-bold text-white">
                Academi<span className="text-emerald-400">X</span>
              </span>
            </Link>

            {/* Nav links desktop */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <motion.button
                  key={link.href}
                  whileHover={{ y: -2 }}
                  onClick={() => scrollTo(link.href)}
                  className="px-4 py-2 text-sm font-medium rounded-xl transition-all text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                >
                  {link.label}
                </motion.button>
              ))}
            </div>

            {/* CTA + mobile toggle */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/login")}
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all text-slate-300 border border-slate-700 hover:border-emerald-500/50 hover:text-emerald-400"
              >
                Connexion
              </motion.button>
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 8px 30px rgba(5,150,105,0.4)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/login")}
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-shadow"
              >
                <Sparkles className="w-4 h-4" />
                Commencer
                <ChevronRight className="w-4 h-4" />
              </motion.button>

              {/* Mobile burger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-xl text-white"
              >
                {mobileOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-18 z-40 bg-slate-950/98 backdrop-blur-xl border-b border-slate-800 md:hidden"
          >
            <div className="p-4 space-y-2">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="w-full text-left px-4 py-3 rounded-xl text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-400 font-medium transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    navigate("/login");
                  }}
                  className="w-full py-3 text-center rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold"
                >
                  Commencer gratuitement
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
