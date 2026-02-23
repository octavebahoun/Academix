import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, CheckCircle, Info, Calendar } from "lucide-react";
import { useState } from "react";
import { laravelApiClient } from "../../api/client";
import { cn } from "../../utils/cn";

export default function ImportEmploiModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type === "text/csv" || selectedFile.name.endsWith(".csv"))) {
      setFile(selectedFile);
    } else {
      alert("Veuillez sélectionner un fichier CSV valide.");
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await laravelApiClient.get("/departement/import/template/emploi-temps", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "template_emploi_temps.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erreur téléchargement template:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await laravelApiClient.post("/departement/import/emploi-temps", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setImportResult(response.data);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Erreur import emploi temps:", error);
      alert(error.response?.data?.message || "Erreur lors de l'importation.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetAndClose = () => {
    setFile(null);
    setImportResult(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
            onClick={resetAndClose}
          />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-white/20"
            >
              <div className="p-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Import Emploi du Temps
                  </h3>
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-0.5">
                    Ajout massif via fichier CSV
                  </p>
                </div>
                <button
                  onClick={resetAndClose}
                  className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 space-y-4">
                {!importResult ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-500/5 rounded-xl p-3 flex gap-3 border border-blue-100 dark:border-blue-500/10">
                      <div className="text-blue-500 shrink-0">
                        <Info size={18} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-blue-900 dark:text-blue-100 uppercase tracking-widest">
                          Format Requis
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          Le fichier doit contenir: filiere_code, matiere_code, jour, heure_debut, heure_fin, salle, type_cours, semestre.
                        </p>
                        <button
                          type="button"
                          onClick={downloadTemplate}
                          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block uppercase tracking-widest"
                        >
                          ↓ Télécharger le modèle CSV
                        </button>
                      </div>
                    </div>

                    <div className="relative">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="hidden"
                        id="csv-upload-emploi"
                      />
                      <label
                        htmlFor="csv-upload-emploi"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
                      >
                        <div className="flex flex-col items-center justify-center pt-4 pb-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all mb-2">
                            <Calendar size={20} />
                          </div>
                          <p className="mb-1 text-sm text-slate-700 dark:text-slate-300 font-bold italic">
                            {file ? file.name : "Cliquez pour uploader le fichier CSV"}
                          </p>
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                            .CSV uniquement
                          </p>
                        </div>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !file}
                      className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-[0.98] disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white dark:border-slate-900/30 dark:border-t-slate-900 rounded-full animate-spin" />
                      ) : (
                        <>
                          Importer l'Emploi du Temps <CheckCircle size={16} />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="text-center space-y-4 py-2">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle size={32} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        Traitement terminé !
                      </h4>
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="bg-emerald-50 dark:bg-emerald-500/5 p-3 rounded-xl border border-emerald-100 dark:border-emerald-500/10">
                          <p className="text-sm font-black text-emerald-600">{importResult.valides}</p>
                          <p className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest">Succès</p>
                        </div>
                        <div className={cn("p-3 rounded-xl border", importResult.erreurs > 0 ? "bg-red-50 dark:bg-red-500/5 border-red-100 dark:border-red-500/10" : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800")}>
                          <p className={cn("text-sm font-black", importResult.erreurs > 0 ? "text-red-600" : "text-slate-600 dark:text-slate-400")}>{importResult.erreurs}</p>
                          <p className={cn("text-[10px] font-bold uppercase tracking-widest", importResult.erreurs > 0 ? "text-red-600/60" : "text-slate-500")}>Erreurs</p>
                        </div>
                      </div>
                    </div>
                    {importResult.erreurs > 0 && (
                      <div className="text-left bg-red-50 dark:bg-red-900/20 p-4 rounded-xl max-h-32 overflow-y-auto mt-4 text-xs font-mono space-y-1">
                        {importResult.erreurs_details.map((err, idx) => (
                          <div key={idx} className="text-red-600 dark:text-red-400">Ligne {err.ligne}: {err.raison}</div>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={resetAndClose}
                      className="w-full mt-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors uppercase text-sm tracking-widest"
                    >
                      Terminer
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
