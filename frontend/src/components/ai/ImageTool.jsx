import { useState } from "react";
import { motion } from "framer-motion";
import {
  Image as ImageIcon,
  Sparkles,
  Loader2,
  Download,
  Send,
} from "lucide-react";
import { aiService } from "../../services/aiService";
import { useAIHistory } from "../../hooks/useAIHistory";
import AIHistorySidebar from "./AIHistorySidebar";
import toast from "react-hot-toast";

export default function ImageTool() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);

  const {
    items,
    loading: histLoading,
    addItem,
    removeItem,
  } = useAIHistory("image");

  const handleGenerate = async () => {
    toast.error("La génération d'images est en cours de développement.");
    return;
    if (!prompt.trim()) return;
    try {
      const res = await aiService.generateImage(prompt);
      setImage(res);
      setSelectedHistoryId(res.image_id || res.filename);
      addItem({
        history_id: res.image_id || res.filename,
        service_type: "image",
        filename: null,
        result_id: res.image_id || res.filename,
        meta: { prompt: prompt.substring(0, 200), image_url: res.image_url },
        created_at: new Date().toISOString(),
      });
    } catch {
      alert("Erreur lors de la génération de l'image");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistory = (entry) => {
    setSelectedHistoryId(entry.history_id);
    setImage({ image_url: entry.meta?.image_url, prompt: entry.meta?.prompt });
    setPrompt(entry.meta?.prompt || "");
  };

  const handleReload = (entry) => {
    setPrompt(entry.meta?.prompt || "");
    setImage(null);
    setSelectedHistoryId(null);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Zone principale */}
      <div className="flex-1 lg:flex-[7] min-w-0 space-y-8 order-1 lg:order-1">
        <div className="bg-white dark:bg-slate-900 p-6 lg:p-10 rounded-3xl lg:rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full -mr-20 -mt-20"></div>
          <div className="relative z-10 flex flex-col gap-6">
            <label className="text-sm font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest pl-2">
              <Sparkles size={16} className="text-amber-500" /> Quel concept
              souhaitez-vous visualiser ?{" "}
              <span className="text-orange-500 font-black italic">
                (Bientôt disponible)
              </span>
            </label>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                disabled
                placeholder="Fonctionnalité en cours de développement..."
                className="flex-1 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-5 text-slate-400 dark:text-slate-600 focus:outline-none cursor-not-allowed font-medium"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <button
                onClick={handleGenerate}
                className="bg-slate-500 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg cursor-not-allowed opacity-70"
              >
                <Send size={20} />
                Générer
              </button>
            </div>
          </div>
        </div>

        {image && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 rounded-3xl lg:rounded-[3rem] p-6 lg:p-10 border border-slate-800 overflow-hidden shadow-2xl text-center"
          >
            <h3 className="text-xl font-black text-white mb-4 uppercase italic tracking-tight underline decoration-amber-500 underline-offset-8">
              Résultat de la génération
            </h3>
            <p className="text-slate-400 mb-10 italic text-sm">
              "{image.prompt}"
            </p>
            <div className="relative group max-w-2xl mx-auto rounded-[2rem] overflow-hidden border-4 border-slate-800 shadow-inner bg-black aspect-video flex items-center justify-center">
              {image.image_url ? (
                <img
                  src={`http://127.0.0.1:5000${image.image_url}`}
                  alt={image.prompt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="flex flex-col items-center gap-4 py-20">
                  <ImageIcon size={64} className="text-slate-700" />
                  <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">
                    Image non chargée
                  </p>
                </div>
              )}
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <a
                href={`http://127.0.0.1:5000${image.image_url}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg"
              >
                <Download size={18} /> Télécharger HD
              </a>
              <button
                onClick={() => {
                  setImage(null);
                  setSelectedHistoryId(null);
                }}
                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
              >
                Nouvelle image
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Sidebar */}
      <div className="flex-1 lg:flex-[3] min-w-0 lg:min-w-[200px] order-2 lg:order-2">
        <AIHistorySidebar
          items={items}
          loading={histLoading}
          selectedId={selectedHistoryId}
          accentColor="amber"
          onSelect={handleSelectHistory}
          onRemove={removeItem}
          onReload={handleReload}
          getTitle={(e) => (e.meta?.prompt || "Image").substring(0, 40)}
          getSubtitle={() => ""}
        />
      </div>
    </div>
  );
}
