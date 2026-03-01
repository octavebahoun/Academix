import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  ArrowRight,
  Eye,
  EyeOff,
  Moon,
  Sun,
  AlertCircle,
  User,
  Mail,
  Phone,
  Lock,
} from "lucide-react";

// shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import loginIllustration from "../assets/login_illustration.png";
import logoSvg from "../assets/logo.svg";
import logoDarkSvg from "../assets/logo-dark.svg";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4 },
  },
};

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    password_confirmation: "",
    telephone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [theme, setTheme] = useState("light");
  const navigate = useNavigate();

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await authService.adminRegister(formData);
      alert("Compte Admin créé ! Veuillez vous connecter.");
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message || "Erreur lors de l'enregistrement",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 font-body transition-colors duration-300">
      {/* Background blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-primary/10 dark:bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-[120px]" />
      </div>

      {/* Theme Toggle */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/40 dark:border-slate-800 shadow-xl z-50 text-slate-600 dark:text-slate-400"
      >
        {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
      </motion.button>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-6xl relative z-10"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl shadow-2xl rounded-[2.5rem] overflow-hidden border border-white/20 dark:border-slate-800 transition-colors duration-300">
          {/* Left Column: Form (Swapped visibility order on mobile) */}
          <div className="flex flex-col justify-center p-8 sm:p-12 lg:px-16 lg:py-12 order-2 md:order-1">
            <div className="max-w-lg w-full mx-auto">
              <CardHeader className="p-0 mb-8 text-center md:text-left">
                <motion.div
                  variants={itemVariants}
                  className="flex justify-center md:justify-start mb-6"
                >
                  <img
                    src={theme === "light" ? logoSvg : logoDarkSvg}
                    alt="AcademiX"
                    className="h-12 w-auto"
                  />
                </motion.div>
                <motion.div variants={itemVariants} className="space-y-2">
                  <CardTitle className="text-3xl font-display font-bold tracking-tight text-slate-900 dark:text-white transition-colors">
                    Créer un compte Admin
                  </CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400 text-base transition-colors">
                    Rejoignez l'élite de la gestion académique.
                  </CardDescription>
                </motion.div>
              </CardHeader>

              <CardContent className="p-0 flex flex-col gap-6">
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 rounded-2xl flex items-center gap-3"
                    >
                      <AlertCircle size={18} />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form
                  onSubmit={handleRegister}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5"
                >
                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label
                      htmlFor="nom"
                      className="font-semibold text-slate-700 dark:text-slate-300 ml-1 transition-colors"
                    >
                      Nom
                    </Label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <Input
                        id="nom"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        placeholder="Dupont"
                        className="pl-11 h-12 rounded-2xl bg-white/50 dark:bg-slate-950/50 dark:border-slate-800"
                        required
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label
                      htmlFor="prenom"
                      className="font-semibold text-slate-700 dark:text-slate-300 ml-1 transition-colors"
                    >
                      Prénom
                    </Label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <Input
                        id="prenom"
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleChange}
                        placeholder="Jean"
                        className="pl-11 h-12 rounded-2xl bg-white/50 dark:bg-slate-950/50 dark:border-slate-800"
                        required
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    className="space-y-2 sm:col-span-2"
                  >
                    <Label
                      htmlFor="email"
                      className="font-semibold text-slate-700 dark:text-slate-300 ml-1 transition-colors"
                    >
                      Adresse Email
                    </Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="jean.dupont@univ.edu"
                        className="pl-11 h-12 rounded-2xl bg-white/50 dark:bg-slate-950/50 dark:border-slate-800"
                        required
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label
                      htmlFor="telephone"
                      className="font-semibold text-slate-700 dark:text-slate-300 ml-1 transition-colors"
                    >
                      Téléphone
                    </Label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <Input
                        id="telephone"
                        name="telephone"
                        type="tel"
                        value={formData.telephone}
                        onChange={handleChange}
                        placeholder="+229 00 00 00 00"
                        className="pl-11 h-12 rounded-2xl bg-white/50 dark:bg-slate-950/50 dark:border-slate-800"
                        required
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label
                      htmlFor="password"
                      title="Password"
                      className="font-semibold text-slate-700 dark:text-slate-300 ml-1 transition-colors"
                    >
                      Mot de passe
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        className="pl-11 h-12 rounded-2xl bg-white/50 dark:bg-slate-950/50 dark:border-slate-800"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    className="space-y-2 sm:col-span-2"
                  >
                    <Label
                      htmlFor="password_confirmation"
                      className="font-semibold text-slate-700 dark:text-slate-300 ml-1 transition-colors"
                    >
                      Confirmer le mot de passe
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <Input
                        id="password_confirmation"
                        name="password_confirmation"
                        type={showPassword ? "text" : "password"}
                        value={formData.password_confirmation}
                        onChange={handleChange}
                        className="pl-11 h-12 rounded-2xl bg-white/50 dark:bg-slate-950/50 dark:border-slate-800"
                        required
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    className="sm:col-span-2 pt-4"
                  >
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-13 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold text-base shadow-xl shadow-primary/20 active:scale-[0.98] group"
                    >
                      {loading ? (
                        "Création..."
                      ) : (
                        <>
                          S'inscrire
                          <ArrowRight
                            size={18}
                            className="ml-2 group-hover:translate-x-1 transition-transform"
                          />
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>

              <CardFooter className="p-0 mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-6 transition-colors">
                <motion.p
                  variants={itemVariants}
                  className="text-center md:text-left text-sm text-slate-500 dark:text-slate-400"
                >
                  Déjà administrateur ?{" "}
                  <Link
                    to="/login"
                    className="text-primary font-bold hover:underline transition-all"
                  >
                    Se connecter
                  </Link>
                </motion.p>

                <motion.div
                  variants={itemVariants}
                  className="bg-slate-100/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 text-center transition-colors"
                >
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      Étudiant ?
                    </span>{" "}
                    Votre compte est géré par votre département. Connectez-vous
                    avec votre matricule.
                  </p>
                </motion.div>
              </CardFooter>
            </div>
          </div>

          {/* Right Column: Illustration */}
          <div className="hidden md:flex flex-col items-center justify-center p-12 bg-slate-50/50 dark:bg-slate-950/20 border-l border-slate-100 dark:border-slate-800/50 order-1 md:order-2 transition-colors duration-300">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative w-full max-w-sm aspect-square"
            >
              <div className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-[3rem] -rotate-3 blur-sm" />
              <div className="relative z-10 w-full h-full bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-6 overflow-hidden border border-white dark:border-slate-800 transition-colors">
                <img
                  src={loginIllustration}
                  alt="Management"
                  className="w-full h-full object-cover rounded-2xl opacity-90 transition-opacity hover:opacity-100"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-12 text-center">
              <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-4 transition-colors">
                Gestion Centralisée
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xs mx-auto transition-colors">
                Pilotez l'ensemble de l'écosystème AcademiX avec des outils
                puissants et intuitifs.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
