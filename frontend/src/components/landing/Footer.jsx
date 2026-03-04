import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Github,
  Twitter,
  Linkedin,
  Mail,
  Heart,
  ExternalLink,
} from "lucide-react";

const footerLinks = {
  Produit: [
    { label: "Fonctionnalités", href: "#features" },
    { label: "Modules IA", href: "#ai-modules" },
    { label: "Collaboration", href: "#collaboration" },
  ],
  Ressources: [
    { label: "Documentation", href: "/docs" },
    { label: "API", href: "/docs/api" },
    { label: "Guide d'installation", href: "/docs/install" },
    { label: "Blog", href: "/blog" },
  ],
  Légal: [
    { label: "Politique de confidentialité", href: "/privacy" },
    { label: "Conditions d'utilisation", href: "/terms" },
    { label: "Mentions légales", href: "/legal" },
  ],
};

const socialLinks = [
  { icon: Github, href: "https://github.com/academix", label: "GitHub" },
  { icon: Twitter, href: "https://twitter.com/academix", label: "Twitter" },
  {
    icon: Linkedin,
    href: "https://linkedin.com/company/academix",
    label: "LinkedIn",
  },
  { icon: Mail, href: "mailto:contact@academix.app", label: "Email" },
];

export default function Footer() {
  const scrollTo = (href) => {
    if (href.startsWith("#")) {
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="relative bg-slate-950 border-t border-slate-800 overflow-hidden">
      {/* Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-extrabold text-lg font-display">
                  A
                </span>
              </div>
              <span className="font-display text-xl font-bold text-white">
                Academi<span className="text-emerald-400">X</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              L'assistant académique intelligent propulsé par l'IA.
              Organisation, apprentissage et collaboration.
            </p>
            <div className="flex gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3, scale: 1.1 }}
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-emerald-500/10 border border-slate-700 hover:border-emerald-500/30 flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-bold text-white mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => scrollTo(link.href)}
                      className="text-sm text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1 group"
                    >
                      {link.label}
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-500 flex items-center gap-1">
            © {new Date().getFullYear()} AcademiX. Fait avec{" "}
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />{" "}
            par{" "}
            <span className="text-emerald-400 font-medium">
              Team d'Excellence
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Tous les services opérationnels
            </span>
            <span>React + Laravel + Node.js + Python</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
