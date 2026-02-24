import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService";
import {
  LogIn,
  User,
  Shield,
  Briefcase,
  Eye,
  EyeOff,
  Moon,
  Sun,
} from "lucide-react";
import loginIllustration from "../assets/login_illustration.png";

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
      else res = await authService.studentLogin({ login: email, password }); // Modifié pour envoyer 'login' pour étudiant

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
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-8 transition-colors duration-300 relative">
      {/* Bouton Theme Toggle en haut à droite */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-full bg-white dark:bg-slate-900 shadow-md text-slate-400 hover:text-indigo-500 dark:hover:text-emerald-400 transition-all border border-slate-200 dark:border-slate-800 z-50 hover:scale-110 active:scale-95"
        title={
          theme === "light" ? "Passer en mode sombre" : "Passer en mode clair"
        }
      >
        {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      <div className="max-w-6xl w-full bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-transparent dark:border-slate-800 transition-colors duration-300">
        {/* Colonne Gauche - Image et Texte */}
        <div className="w-full md:w-1/2 bg-blue-50/50 dark:bg-slate-950/50 p-8 lg:p-12 flex flex-col items-center justify-center relative transition-colors duration-300">
          <div className="w-full max-w-md aspect-square bg-emerald-50 dark:bg-emerald-900/10 rounded-[3rem] overflow-hidden mb-8 p-4 flex items-center justify-center shadow-inner transition-colors duration-300">
            <div className="w-full h-full bg-white/50 dark:bg-slate-900/50 rounded-[2rem] border-2 border-dashed border-emerald-200 dark:border-emerald-800/30 flex items-center justify-center relative overflow-hidden backdrop-blur-sm transition-colors duration-300">
              <img
                src={loginIllustration}
                alt="Students studying"
                className="absolute inset-0 w-full h-full object-cover dark:opacity-80 transition-opacity"
              />
            </div>
          </div>
          <div className="text-center z-10 w-full max-w-sm">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight transition-colors">
              Learn without limits
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">
              Join a community of students achieving their academic goals
              together.
            </p>
          </div>
        </div>

        {/* Colonne Droite - Formulaire */}
        <div className="w-full md:w-1/2 p-8 lg:p-16 flex flex-col justify-center bg-white dark:bg-slate-900 transition-colors duration-300">
          <div className="max-w-md w-full mx-auto">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-10">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                <span className="text-white font-bold text-xl leading-none">
                  A
                </span>
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors">
                Academi
                <span className="text-indigo-600 dark:text-indigo-400">X</span>
              </span>
            </div>

            <div className="text-center mb-10">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">
                Welcome back !
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">
                Please enter your details to sign in.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100 dark:border-red-500/20 flex items-center gap-2 transition-colors">
                <Shield size={16} /> {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Sélecteur de Rôle */}
              <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl mx-auto mb-8 transition-colors duration-300">
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${role === "admin" ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-600/50" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50"}`}
                >
                  <Shield size={18} /> Admin
                </button>
                <button
                  type="button"
                  onClick={() => setRole("chef")}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${role === "chef" ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-600/50" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50"}`}
                >
                  <Briefcase size={18} /> Chef
                </button>
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${role === "student" ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-600/50" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50"}`}
                >
                  <User size={18} /> Étudiant
                </button>
              </div>

              {/* Champ Identifiant */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 transition-colors">
                  Identifiant{" "}
                  <span className="text-slate-400 dark:text-slate-500 font-normal ml-1">
                    (Email {role === "student" && "ou Matricule"})
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <User size={18} />
                  </div>
                  <input
                    type={role === "student" ? "text" : "email"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-400/10 transition-all font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600 placeholder:font-normal"
                    placeholder="ex: user@univ.edu ou MAT-123"
                    required
                  />
                </div>
              </div>

              {/* Champ Mot de passe */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 transition-colors">
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Shield size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-12 py-3.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-400/10 transition-all font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600 placeholder:font-normal"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Bouton Connexion */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1e88e5] hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-blue-500/25 dark:shadow-blue-500/10 mt-4"
              >
                {loading ? (
                  "Connexion..."
                ) : (
                  <>
                    Se connecter <LogIn size={18} className="ml-1" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center border-t border-slate-100 dark:border-slate-800 pt-8 transition-colors">
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Vous n'avez pas de compte ?{" "}
                <Link
                  to="/register"
                  className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold transition-colors"
                >
                  Contactez l'administration
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
