import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService";
import { Shield, ArrowRight, Eye, EyeOff, Moon, Sun } from "lucide-react";
import loginIllustration from "../assets/login_illustration.png";

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

      <div className="max-w-6xl w-full bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px] flex-row-reverse border border-transparent dark:border-slate-800 transition-colors duration-300">
        {/* Colonne Droite - Image et Texte (Inversé pour le registre) */}
        <div className="w-full md:w-1/2 bg-blue-50/50 dark:bg-slate-950/50 p-8 lg:p-12 flex flex-col items-center justify-center relative border-l border-slate-100 dark:border-slate-800 transition-colors duration-300">
          <div className="w-full max-w-md aspect-square bg-emerald-50 dark:bg-emerald-900/10 rounded-[3rem] overflow-hidden mb-8 p-4 flex items-center justify-center shadow-inner transition-colors duration-300">
            <div className="w-full h-full bg-white/50 dark:bg-slate-900/50 rounded-[2rem] border-2 border-dashed border-emerald-200 dark:border-emerald-800/30 flex items-center justify-center relative overflow-hidden backdrop-blur-sm transition-colors duration-300">
              <img
                src={loginIllustration}
                alt="Welcome abstract illustration"
                className="absolute inset-0 w-full h-full object-cover dark:opacity-80 transition-opacity"
              />
            </div>
          </div>
          <div className="text-center z-10 w-full max-w-sm">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight transition-colors">
              Manage AcademiX
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">
              Create your administrative account to orchestrate the limits of
              learning.
            </p>
          </div>
        </div>

        {/* Colonne Gauche - Formulaire */}
        <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-center bg-white dark:bg-slate-900 relative transition-colors duration-300">
          <div className="max-w-md w-full mx-auto relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
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

            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">
                Create an account
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">
                Fill in your information to set up a Super Admin profile.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100 dark:border-red-500/20 flex items-center gap-2 transition-colors">
                <Shield size={16} /> {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 transition-colors">
                    Nom
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-400/10 transition-all font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600 placeholder:font-normal"
                    placeholder="Votre nom"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 transition-colors">
                    Prénom
                  </label>
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-400/10 transition-all font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600 placeholder:font-normal"
                    placeholder="Votre prénom"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 transition-colors">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-400/10 transition-all font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600 placeholder:font-normal"
                  placeholder="exemple@univ.edu"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 transition-colors">
                    Mot de passe
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-4 pr-10 py-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-400/10 transition-all font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600 placeholder:font-normal"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute bottom-3 right-3 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 transition-colors">
                    Confirmer
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-400/10 transition-all font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600 placeholder:font-normal"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1e88e5] hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-8 shadow-lg shadow-blue-500/25 dark:shadow-blue-500/10 active:scale-[0.98]"
              >
                {loading ? (
                  "Création en cours..."
                ) : (
                  <>
                    S'inscrire <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center border-t border-slate-100 dark:border-slate-800 pt-6 transition-colors">
              <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">
                Déjà administrateur ?{" "}
                <Link
                  to="/login"
                  className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold transition-colors"
                >
                  Connectez-vous ici
                </Link>
              </p>
            </div>

            {/* Note pour étudiants */}
            <div className="mt-8 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-xl p-4 text-center transition-colors">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Vous êtes étudiant ?
                </span>
                <br />
                Votre compte est créé automatiquement par votre département.
                <br /> Connectez-vous directement sur la page de login avec
                votre{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Matricule
                </span>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
