import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogIn,
  User,
  Shield,
  Briefcase,
  Eye,
  EyeOff,
  Moon,
  Sun,
  AlertCircle,
  ArrowRight,
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

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
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4 },
  },
};

const LoginPage = () => {
  const [email, setEmail] = useState("octave@gmail.com");
  const [password, setPassword] = useState("Test1234!");
  const [role, setRole] = useState("admin");
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let res;
      if (role === "admin")
        res = await authService.adminLogin({ email, password });
      else if (role === "chef")
        res = await authService.chefLogin({ email, password });
      else res = await authService.studentLogin({ login: email, password });

      if (res.token) {
        if (role === "admin") navigate("/admin");
        else if (role === "chef") navigate("/chef");
        else if (role === "student") navigate("/etudiant");
        else navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 font-body transition-colors duration-300">
      {/* Background blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-primary/10 dark:bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-[120px]" />
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
          
          {/* Left Column: Illustration */}
          <div className="hidden md:flex flex-col items-center justify-center p-12 bg-slate-50/50 dark:bg-slate-950/20 border-r border-slate-100 dark:border-slate-800/50 transition-colors duration-300">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full max-w-sm aspect-square"
            >
              <div className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-[3rem] rotate-3 blur-sm" />
              <div className="relative z-10 w-full h-full bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-6 overflow-hidden border border-white dark:border-slate-800 transition-colors">
                <img
                  src={loginIllustration}
                  alt="Education"
                  className="w-full h-full object-cover rounded-2xl opacity-90 transition-opacity hover:opacity-100"
                />
              </div>
              {/* Floating badges */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700"
              >
                <Shield className="text-primary h-6 w-6" />
              </motion.div>
              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700"
              >
                <User className="text-emerald-500 h-6 w-6" />
              </motion.div>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="mt-12 text-center"
            >
              <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-4 transition-colors">
                L'excellence à portée de main
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xs mx-auto transition-colors">
                Accédez à vos ressources pédagogiques et gérez votre parcours académique en toute simplicité.
              </p>
            </motion.div>
          </div>

          {/* Right Column: Form */}
          <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
            <div className="max-w-md w-full mx-auto">
              <CardHeader className="p-0 mb-8 text-center md:text-left">
                <motion.div variants={itemVariants} className="flex justify-center md:justify-start mb-6">
                  <img
                    src={theme === "light" ? logoSvg : logoDarkSvg}
                    alt="AcademiX"
                    className="h-12 w-auto"
                  />
                </motion.div>
                <motion.div variants={itemVariants} className="space-y-2">
                  <CardTitle className="text-3xl font-display font-bold tracking-tight text-slate-900 dark:text-white transition-colors">
                    Bon retour !
                  </CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400 text-base transition-colors">
                    Veuillez entrer vos identifiants pour vous connecter.
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

                <form onSubmit={handleLogin} className="flex flex-col gap-6">
                  <motion.div variants={itemVariants}>
                    <Tabs defaultValue={role} onValueChange={setRole} className="w-full">
                      <TabsList className="grid grid-cols-3 h-12 bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-2xl">
                        <TabsTrigger value="admin" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">Admin</TabsTrigger>
                        <TabsTrigger value="chef" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">Chef</TabsTrigger>
                        <TabsTrigger value="student" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">Élève</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </motion.div>

                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label htmlFor="email" className="font-semibold text-slate-700 dark:text-slate-300 ml-1 transition-colors">
                      Identifiant
                    </Label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <Input
                        id="email"
                        type={role === "student" ? "text" : "email"}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={role === "student" ? "MAT-123456" : "votre@email.com"}
                        className="pl-11 h-12 rounded-2xl bg-white/50 dark:bg-slate-950/50 dark:border-slate-800 focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                        required
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="space-y-2">
                    <div className="flex items-center justify-between ml-1 transition-colors">
                      <Label htmlFor="password" title="Password" className="font-semibold text-slate-700 dark:text-slate-300">
                        Mot de passe
                      </Label>
                      <Link to="/forgot-password" title="Password" className="text-xs text-primary hover:underline font-medium transition-colors">Oublié ?</Link>
                    </div>
                    <div className="relative group">
                      <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pl-11 pr-11 h-12 rounded-2xl bg-white/50 dark:bg-slate-950/50 dark:border-slate-800 focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="flex items-center space-x-2 ml-1 transition-colors">
                    <Checkbox id="remember" className="rounded-md" />
                    <label htmlFor="remember" className="text-sm font-medium text-slate-500 dark:text-slate-400 cursor-pointer transition-colors">
                      Se souvenir de moi
                    </label>
                  </motion.div>

                  <motion.div variants={itemVariants} className="pt-2">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold text-base transition-all shadow-lg shadow-primary/20 active:scale-[0.98] group"
                    >
                      {loading ? "Connexion..." : (
                        <>
                          Se connecter
                          <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>

              <CardFooter className="p-0 mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4 transition-colors">
                <motion.p variants={itemVariants} className="text-center md:text-left text-sm text-slate-500 dark:text-slate-400 transition-colors">
                  Vous n'avez pas de compte ?{" "}
                  <Link to="/register" className="text-primary font-bold hover:underline transition-all">S'inscrire</Link>
                </motion.p>
              </CardFooter>
            </div>
          </div>
        </div>
        
        {/* Brand Footer */}
        <motion.p
          variants={itemVariants}
          className="text-center mt-8 text-xs text-slate-400 dark:text-slate-600 font-medium tracking-wide uppercase transition-colors"
        >
          &copy; 2026 AcademiX Platform • Excellence en Éducation
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
