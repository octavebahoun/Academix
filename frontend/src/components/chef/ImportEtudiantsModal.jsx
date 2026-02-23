import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, FileText, Download, CheckCircle, Info } from "lucide-react";
import { useState } from "react";
import { laravelApiClient } from "../../api/client";
import { toast } from "react-hot-toast";

export default function ImportEtudiantsModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await laravelApiClient.get(
        "/departement/import/template/etudiants",
        {
          responseType: "blob",
        },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "template_etudiants.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error("Erreur lors du téléchargement du modèle");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Veuillez sélectionner un fichier CSV");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsLoading(true);
    try {
      const response = await laravelApiClient.post(
        "/departement/import/etudiants",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      setImportResult(response.data);
      toast.success("Import terminé !");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      const message =
        error.response?.data?.message || "Erreur lors de l'import";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-white/20"
          >
            {/* Header */}
            <div className="p-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Import Étudiants
                </h3>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-0.5">
                  Ajout massif via fichier CSV
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {!importResult ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Instructions */}
                  <div className="bg-blue-50 dark:bg-blue-500/5 rounded-xl p-3 flex gap-3 border border-blue-100 dark:border-blue-500/10">
                    <div className="text-blue-500 shrink-0">
                      <Info size={20} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-blue-900 dark:text-blue-100 uppercase tracking-widest">
                        Format Requis
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                        Le fichier doit contenir les colonnes :{" "}
                        <b>
                          matricule, nom, prenom, filiere_code, annee_admission
                        </b>
                      </p>
                      <button
                        type="button"
                        onClick={handleDownloadTemplate}
                        className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase flex items-center gap-1 hover:underline underline-offset-4"
                      >
                        <Download size={12} /> Télécharger le modèle CSV
                      </button>
                    </div>
                  </div>

                  {/* Dropzone */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Fichier CSV
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="hidden"
                        id="csv-upload"
                      />
                      <label
                        htmlFor="csv-upload"
                        className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all mb-3">
                            <Upload size={24} />
                          </div>
                          <p className="mb-2 text-sm text-slate-700 dark:text-slate-300 font-bold italic">
                            {file
                              ? file.name
                              : "Cliquez pour uploader le fichier"}
                          </p>
                          <p className="text-xs text-slate-500 font-medium">
                            {file
                              ? `${(file.size / 1024).toFixed(2)} KB`
                              : "CSV uniquement (Max 5MB)"}
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !file}
                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-500 hover:text-white transition-all shadow-xl active:scale-[0.98] disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white dark:border-slate-900/30 dark:border-t-slate-900 rounded-full animate-spin" />
                    ) : (
                      <>
                        Démarrer l'Import <CheckCircle size={18} />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center space-y-6 py-4">
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={40} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      Traitement terminé !
                    </h4>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="bg-emerald-50 dark:bg-emerald-500/5 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-500/10">
                        <p className="text-sm font-black text-emerald-600">
                          {importResult.valides}
                        </p>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase">
                          Succès
                        </p>
                      </div>
                      <div className="bg-rose-50 dark:bg-rose-500/5 p-4 rounded-2xl border border-rose-100 dark:border-rose-500/10">
                        <p className="text-sm font-black text-rose-600">
                          {importResult.erreurs}
                        </p>
                        <p className="text-[10px] font-bold text-rose-500 uppercase">
                          Erreurs
                        </p>
                      </div>
                    </div>
                  </div>

                  {importResult.erreurs_details?.length > 0 && (
                    <div className="text-left bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 max-h-40 overflow-y-auto border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">
                        Détails des erreurs :
                      </p>
                      <ul className="space-y-1">
                        {importResult.erreurs_details.map((err, i) => (
                          <li
                            key={i}
                            className="text-xs font-bold text-slate-600 dark:text-slate-400"
                          >
                            • Ligne {err.ligne}: {err.raison}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setImportResult(null);
                      setFile(null);
                      onClose();
                    }}
                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-xl active:scale-[0.98]"
                  >
                    Fermer
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
