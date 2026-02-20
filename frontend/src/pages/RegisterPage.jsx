import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService";
import { UserPlus, ArrowLeft, Shield, GraduationCap } from "lucide-react";

const RegisterPage = () => {
  const [mode, setMode] = useState("admin"); // 'admin' ou 'student'
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    password_confirmation: "",
    matricule: "",
    telephone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "admin") {
        await authService.adminRegister(formData);
        alert("Compte Admin créé ! Connectez-vous.");
        navigate("/login");
      } else {
        await authService.studentRegister(formData);
        alert("Compte Étudiant activé ! Vous êtes maintenant connecté.");
        navigate("/ai-tools");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Erreur lors de l'enregistrement",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <Link
          to="/login"
          className="text-indigo-400 flex items-center gap-1 text-sm mb-6 hover:text-indigo-300"
        >
          <ArrowLeft size={16} /> Retour au login
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {mode === "admin" ? "Inscription Admin" : "Activation Étudiant"}
          </h1>
          <p className="text-slate-400">
            {mode === "admin"
              ? "Créez un compte Super Administrateur"
              : "Activez votre compte avec votre matricule"}
          </p>
        </div>

        <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-xl mb-8 border border-slate-800">
          <button
            onClick={() => setMode("admin")}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${mode === "admin" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"}`}
          >
            <Shield size={14} /> ADMIN
          </button>
          <button
            onClick={() => setMode("student")}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${mode === "student" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"}`}
          >
            <GraduationCap size={14} /> ÉTUDIANT
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {mode === "student" && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Matricule
              </label>
              <input
                type="text"
                name="matricule"
                value={formData.matricule}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                placeholder="Ex: MAT-2024-001"
                required
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Nom
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className={`w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${mode === "student" ? "opacity-50 cursor-not-allowed" : ""}`}
                placeholder={
                  mode === "student" ? "Nom (auto-rempli)" : "Votre nom"
                }
                disabled={mode === "student"}
                required={mode === "admin"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Prénom
              </label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                className={`w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${mode === "student" ? "opacity-50 cursor-not-allowed" : ""}`}
                placeholder={
                  mode === "student" ? "Prénom (auto-rempli)" : "Votre prénom"
                }
                disabled={mode === "student"}
                required={mode === "admin"}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="exemple@univ.edu"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Confirmer
              </label>
              <input
                type="password"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 mt-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            {loading ? (
              "Traitement en cours..."
            ) : (
              <>
                <UserPlus size={20} />{" "}
                {mode === "admin"
                  ? "Créer mon compte Admin"
                  : "Activer mon compte Étudiant"}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
