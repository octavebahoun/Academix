import { useState } from "react";
import { motion } from "framer-motion";
import {
  Dumbbell,
  UploadCloud,
  Loader2,
  CheckCircle2,
  FileJson,
  Download,
} from "lucide-react";
import { aiService } from "../../services/aiService";

export default function ExerciseTool() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exercises, setExercises] = useState(null);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleGenerate = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const res = await aiService.generateExercises({ file, nbExercises: 3 });
      setExercises(res.exercises || res);
    } catch (error) {
      alert("Erreur lors de la génération des exercices");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {!exercises ? (
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="relative group">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.txt"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div
              className={`p-16 border-2 border-dashed rounded-[3rem] transition-all flex flex-col items-center gap-6 ${file ? "border-purple-500 bg-purple-50/50 dark:bg-purple-500/10" : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"}`}
            >
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center ${file ? "bg-purple-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}
              >
                {file ? <CheckCircle2 size={40} /> : <UploadCloud size={40} />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                  Optimisez votre pratique
                </h3>
                <p className="text-xs text-slate-500 mt-2">
                  Importez un cours pour générer des exercices d'application
                  directe.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!file || loading}
            className="w-full bg-purple-600 text-white font-black text-xs uppercase tracking-[0.2em] py-5 rounded-2xl hover:bg-purple-700 transition-all disabled:opacity-50 shadow-xl flex items-center justify-center gap-3"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Dumbbell size={18} />
            )}
            Générer ma série d'exercices
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-500/10 text-purple-600 rounded-xl">
                <FileJson size={24} />
              </div>
              <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">
                VOTRE SÉRIE D'ENTRAÎNEMENT
              </h3>
            </div>
            <button className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform">
              <Download size={16} /> Exporter
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {(Array.isArray(exercises) ? exercises : [exercises]).map(
              (ex, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white dark:bg-slate-950 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <span className="bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0">
                      EX{i + 1}
                    </span>
                    <div className="w-full">
                      <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                        {ex.title || `Exercice ${i + 1}`}
                      </h4>
                      {typeof ex === "string" ? (
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                          {ex}
                        </p>
                      ) : ex.enonce ? (
                        <div className="space-y-4 w-full">
                          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-sm font-medium whitespace-pre-wrap">
                            {ex.enonce}
                          </div>
                          {ex.indice && (
                            <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 p-3 rounded-xl border border-amber-200 dark:border-amber-500/20">
                              <span className="font-bold">Indice:</span>{" "}
                              {ex.indice}
                            </div>
                          )}
                          <details className="group">
                            <summary className="cursor-pointer text-sm font-black text-purple-600 uppercase tracking-widest hover:text-purple-700 transition-colors list-none flex items-center gap-2 mt-4">
                              <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                                +
                              </span>
                              Voir la correction
                            </summary>
                            <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-500/10 text-slate-800 dark:text-slate-200 text-sm rounded-2xl border border-purple-100 dark:border-purple-500/20 whitespace-pre-wrap leading-relaxed">
                              {ex.correction}
                            </div>
                          </details>
                        </div>
                      ) : (
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                          {ex.instruction ||
                            ex.content ||
                            ex.statement ||
                            JSON.stringify(ex)}
                        </p>
                      )}
                    </div>
                  </div>

                  {ex.questions && (
                    <div className="space-y-4 ml-12">
                      {ex.questions.map((q, j) => (
                        <div
                          key={j}
                          className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800"
                        >
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 italic">
                            Q{j + 1}: {q}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ),
            )}
          </div>

          <center>
            <button
              onClick={() => setExercises(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold uppercase tracking-widest transition-colors py-10"
            >
              Générer une nouvelle série
            </button>
          </center>
        </div>
      )}
    </div>
  );
}
