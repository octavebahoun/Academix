import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, FileText, Download, CheckCircle, Info } from "lucide-react";
import { useState } from "react";
import { laravelApiClient } from "../../api/client";
import { toast } from "react-hot-toast";

export default function ImportNotesModal({ isOpen, onClose, onSuccess }) {
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
        "/departement/import/template/notes",
        {
          responseType: "blob",
        },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "template_notes.csv");
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
        "/departement/import/notes",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      setImportResult(response.data);
      toast.success("Import des notes terminé !");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      const message =
        error.response?.data?.message || "Erreur lors de l'import des notes";
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
            className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-white/20"
          >
            {/* Header */}
            <div className="p-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Import des Notes
                </h3>
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">
                  Enregistrement massif des évaluations
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {!importResult ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Instructions */}
                  <div className="bg-blue-50 dark:bg-blue-500/5 rounded-xl p-3 flex gap-3 border border-blue-100 dark:border-blue-500/10">
                    <div className="text-blue-500 shrink-0">
                      <Info size={18} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-blue-900 dark:text-blue-100 uppercase tracking-widest">
                        Format Requis
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                        Colonnes :{" "}
                        <b>
                          matricule, matiere_code, note, note_max,
                          type_evaluation, coefficient, date_evaluation,
                          semestre, annee_academique
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
                      Fichier CSV des Notes
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="hidden"
                        id="csv-upload-notes"
                      />
                      <label
                        htmlFor="csv-upload-notes"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
                      >
                        <div className="flex flex-col items-center justify-center pt-4 pb-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all mb-2">
                            <Upload size={20} />
                          </div>
                          <p className="mb-1 text-sm text-slate-700 dark:text-slate-300 font-bold italic">
                            {file
                              ? file.name
                              : "Cliquez pour uploader le fichier de notes"}
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
                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-[0.98] disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white dark:border-slate-900/30 dark:border-t-slate-900 rounded-full animate-spin" />
                    ) : (
                      <>
                        Importer les Notes <CheckCircle size={16} />
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
                        <p className="text-sm font-black text-emerald-600">
                          {importResult.valides}
                        </p>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                          Succès
                        </p>
                      </div>
                      <div className="bg-rose-50 dark:bg-rose-500/5 p-4 rounded-2xl border border-rose-100 dark:border-rose-500/10">
                        <p className="text-sm font-black text-rose-600">
                          {importResult.erreurs}
                        </p>
                        <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">
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
