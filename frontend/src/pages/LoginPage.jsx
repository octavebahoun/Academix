import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService";
import { LogIn, User, Shield, Briefcase } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("octave@gmail.com");
  const [password, setPassword] = useState("Test1234!");
  const [role, setRole] = useState("admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
      else res = await authService.studentLogin({ email, password });

      if (res.token) {
        navigate(role === "admin" ? "/admin" : "/ai-tools");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">AcademiX</h1>
          <p className="text-slate-400">Connectez-vous à votre espace</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`flex flex-col items-center gap-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${role === "admin" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"}`}
            >
              <Shield size={16} /> Admin
            </button>
            <button
              type="button"
              onClick={() => setRole("chef")}
              className={`flex flex-col items-center gap-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${role === "chef" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"}`}
            >
              <Briefcase size={16} /> Chef
            </button>
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`flex flex-col items-center gap-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${role === "student" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"}`}
            >
              <User size={16} /> Étudiant
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              "Connexion..."
            ) : (
              <>
                <LogIn size={20} /> Se connecter
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            Nouveau sur AcademiX ?{" "}
            <Link
              to="/register"
              className="text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
