import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { studentService } from "../services/studentService";
import { authService } from "../services/authService";
import toast from "react-hot-toast";

export default function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const processedRef = useRef(false); // Empêche le double traitement (StrictMode / rechargement)

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const state = searchParams.get("state");

    // Vérifier que l'utilisateur est bien connecté
    const user = authService.getCurrentUser();
    if (!user) {
      setStatus("error");
      setErrorMsg("Session expirée. Veuillez vous reconnecter.");
      setTimeout(() => navigate("/login"), 3000);
      return;
    }

    if (error) {
      setStatus("error");
      setErrorMsg("Autorisation Google refusée.");
      setTimeout(
        () => navigate("/etudiant", { state: { activeTab: "profil" } }),
        3000,
      );
      return;
    }

    if (!code) {
      setStatus("error");
      setErrorMsg("Code d'autorisation manquant.");
      setTimeout(
        () => navigate("/etudiant", { state: { activeTab: "profil" } }),
        3000,
      );
      return;
    }

    const processCallback = async () => {
      try {
        await studentService.handleGoogleCallback(code, state);
        setStatus("success");
        toast.success("Google Calendar connecté avec succès !");
        setTimeout(
          () => navigate("/etudiant", { state: { activeTab: "profil" } }),
          2000,
        );
      } catch (err) {
        const msg =
          err?.response?.data?.error ||
          "Erreur lors de la connexion au compte Google.";
        setStatus("error");
        setErrorMsg(msg);
        toast.error(msg);
        setTimeout(
          () => navigate("/etudiant", { state: { activeTab: "profil" } }),
          3500,
        );
      }
    };

    processCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 rounded-3xl p-10 shadow-xl text-center max-w-sm w-full border border-slate-100 dark:border-slate-800"
      >
        {status === "loading" && (
          <>
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white mb-2">
              Connexion en cours…
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Liaison de votre compte Google Calendar
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
              ✅
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white mb-2">
              Compte connecté !
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Votre emploi du temps est synchronisé. Redirection…
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
              ❌
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white mb-2">
              Erreur de connexion
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              {errorMsg}
            </p>
            <button
              onClick={() =>
                navigate("/etudiant", { state: { activeTab: "profil" } })
              }
              className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-wider py-3 rounded-2xl transition hover:opacity-90 active:scale-95"
            >
              Retour au profil
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
