import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  UploadCloud,
  Loader2,
  Download,
  CheckCircle2,
} from "lucide-react";
import { aiService } from "../../services/aiService";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function SummaryTool() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [options, setOptions] = useState({
    level: "medium",
    style: "bullets",
  });

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleGenerate = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await aiService.generateSummary({
        file,
        level: options.level,
        style: options.style,
      });
      setResult(res);
    } catch (error) {
      alert("Erreur lors de la génération du résumé");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {!result ? (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* File Upload */}
          <div className="relative group">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.txt,.md"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div
              className={`p-12 border-2 border-dashed rounded-[2rem] transition-all flex flex-col items-center gap-4 ${file ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10" : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"}`}
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${file ? "bg-indigo-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}
              >
                {file ? <CheckCircle2 size={32} /> : <UploadCloud size={32} />}
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">
                  {file ? file.name : "Glissez votre cours (PDF, TXT)"}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {file
                    ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                    : "Supporté : PDF, TXT, MD - Max 20MB"}
                </p>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                Niveau de détail
              </label>
              <select
                value={options.level}
                onChange={(e) =>
                  setOptions({ ...options, level: e.target.value })
                }
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="short">Concis</option>
                <option value="medium">Standard</option>
                <option value="detailed">Détaillé</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                Format
              </label>
              <select
                value={options.style}
                onChange={(e) =>
                  setOptions({ ...options, style: e.target.value })
                }
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="bullets">Liste à puces</option>
                <option value="narrative">Paragraphes</option>
                <option value="qa">Questions / Réponses</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!file || loading}
            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-[0.2em] py-5 rounded-2xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100 shadow-xl flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Analyse en cours...
              </>
            ) : (
              <>
                <FileText size={18} />
                Générer la fiche
              </>
            )}
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-50 dark:bg-slate-950 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800"
        >
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">
              {result.title || "Fiche de révision"}
            </h3>
            <button className="flex items-center gap-2 text-indigo-500 font-bold text-xs uppercase tracking-widest hover:text-indigo-600 transition-colors">
              <Download size={16} />
              Exporter PDF
            </button>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none text-left">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg"
            >
              {result.content}
            </ReactMarkdown>
          </div>

          <button
            onClick={() => setResult(null)}
            className="mt-10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold uppercase tracking-widest transition-colors"
          >
            Générer un autre résumé
          </button>
        </motion.div>
      )}
    </div>
  );
}
