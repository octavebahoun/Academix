import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Headphones,
  UploadCloud,
  Loader2,
  CheckCircle2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Sparkles,
  Wand2,
  Download,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { aiService } from "../../services/aiService";
import { pythonApiClient } from "../../api/client";

export default function PodcastTool() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [podcastData, setPodcastData] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showScript, setShowScript] = useState(false);

  const [audioUrl, setAudioUrl] = useState(null);
  const audioRef = useRef(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    if (audioUrl) {
      window.URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setPodcastData(null);
    setShowScript(false);
  };

  const handleGenerate = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const response = await aiService.generatePodcast({ file });

      // La réponse de l'API contient l'URL du fichier audio (ex: /api/v1/podcast/download/...)
      // Nous devons récupérer ce fichier avec l'en-tête d'autorisation pour empêcher l'erreur 401
      const endpoint = response.url.replace(/^\/api\/v1/, "");

      const audioResponse = await pythonApiClient.get(endpoint, {
        responseType: "blob",
      });

      const blobUrl = window.URL.createObjectURL(audioResponse.data);

      setAudioUrl(blobUrl);
      setPodcastData(response);
      setIsGenerated(true);
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la génération du podcast.");
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Mettre à jour la progression du lecteur audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
    };
  }, [audioUrl]);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleDownload = async () => {
    if (!audioUrl) return;
    try {
      const a = document.createElement("a");
      a.href = audioUrl;
      a.download = `podcast_${file?.name?.split(".")[0] || "academix"}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      alert("Erreur lors du téléchargement.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {!isGenerated ? (
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-rose-50 dark:bg-rose-500/10 text-rose-500 px-4 py-2 rounded-full mb-6">
              <Sparkles size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Technologie Text-to-Podcast
              </span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
              Transformez vos cours en Audio
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
              L'IA résume intelligemment votre cours, puis le convertit en
              podcast audio.
            </p>
          </div>

          <div className="relative group">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.txt"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div
              className={`p-16 border-2 border-dashed rounded-[3rem] transition-all flex flex-col items-center gap-6 ${file ? "border-rose-500 bg-rose-50/50 dark:bg-rose-500/10" : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"}`}
            >
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center ${file ? "bg-rose-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}
              >
                {file ? <CheckCircle2 size={40} /> : <Headphones size={40} />}
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                  {file ? file.name : "Prêt pour une écoute immersive ?"}
                </h3>
                <p className="text-xs text-slate-500 mt-2">
                  L'IA va synthétiser votre cours et créer un script audio
                  éducatif avec une voix naturelle.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!file || loading}
            className="w-full bg-rose-600 text-white font-black text-xs uppercase tracking-[0.2em] py-5 rounded-2xl hover:bg-rose-700 transition-all disabled:opacity-50 shadow-xl flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Résumé IA en cours, puis conversion audio...
              </>
            ) : (
              <>
                <Wand2 size={18} />
                Générer mon Podcast IA
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 rounded-[4rem] p-12 shadow-2xl border border-slate-800 overflow-hidden relative"
          >
            {/* Audio Waves Decor */}
            <div className="absolute bottom-0 left-0 w-full h-32 opacity-10 flex items-end gap-1 px-4">
              {[...Array(40)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ height: isPlaying ? [10, 80, 20, 100, 30] : 10 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.05,
                  }}
                  className="flex-1 bg-rose-500 rounded-t-full"
                />
              ))}
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-48 h-48 bg-gradient-to-br from-rose-500 to-orange-600 rounded-[2.5rem] shadow-2xl mb-10 flex items-center justify-center relative group">
                <Headphones size={80} className="text-white" />
                <div className="absolute inset-x-0 bottom-0 py-4 bg-black/20 backdrop-blur-md rounded-b-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">
                    Audio HQ
                  </span>
                </div>
              </div>

              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">
                Podcast : {file?.name.split(".")[0]}
              </h2>
              <p className="text-rose-400 font-bold text-xs uppercase tracking-widest mb-12">
                Généré par AcademiX AI • {formatTime(duration)}
              </p>

              {/* Player Controls */}
              <div className="flex flex-col gap-10 w-full max-w-sm">
                {/* Progress */}
                <div className="space-y-4">
                  <div
                    className="h-2 bg-slate-800 rounded-full overflow-hidden cursor-pointer"
                    onClick={(e) => {
                      if (audioRef.current && duration > 0) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const pos = (e.clientX - rect.left) / rect.width;
                        audioRef.current.currentTime = pos * duration;
                      }
                    }}
                  >
                    <motion.div
                      style={{ width: `${progressPercent}%` }}
                      className="h-full bg-gradient-to-r from-rose-500 to-orange-500 transition-all duration-200"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-8">
                  <button
                    className="text-slate-500 hover:text-white transition-colors"
                    onClick={() => {
                      if (audioRef.current) {
                        audioRef.current.currentTime = Math.max(
                          0,
                          audioRef.current.currentTime - 10,
                        );
                      }
                    }}
                  >
                    <SkipBack size={32} />
                  </button>
                  <button
                    onClick={togglePlay}
                    className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-2xl hover:scale-110 active:scale-95 transition-all"
                  >
                    {isPlaying ? (
                      <Pause size={40} fill="currentColor" />
                    ) : (
                      <Play size={40} fill="currentColor" className="ml-2" />
                    )}
                  </button>
                  <button
                    className="text-slate-500 hover:text-white transition-colors"
                    onClick={() => {
                      if (audioRef.current) {
                        audioRef.current.currentTime = Math.min(
                          duration,
                          audioRef.current.currentTime + 10,
                        );
                      }
                    }}
                  >
                    <SkipForward size={32} />
                  </button>
                </div>

                {audioUrl && (
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    onEnded={() => setIsPlaying(false)}
                    className="hidden"
                  />
                )}

                <div className="flex items-center gap-4 text-slate-500 px-8">
                  <Volume2 size={20} />
                  <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="w-3/4 h-full bg-slate-600" />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-12 flex flex-col items-center gap-4 w-full max-w-sm">
                {/* Download Button */}
                <button
                  onClick={handleDownload}
                  className="w-full bg-gradient-to-r from-rose-500 to-orange-500 text-white font-black text-xs uppercase tracking-[0.15em] py-4 rounded-2xl hover:from-rose-600 hover:to-orange-600 transition-all shadow-lg flex items-center justify-center gap-3"
                >
                  <Download size={18} />
                  Télécharger le podcast MP3
                </button>

                <button
                  onClick={() => {
                    if (audioUrl) {
                      window.URL.revokeObjectURL(audioUrl);
                    }
                    setAudioUrl(null);
                    setIsGenerated(false);
                    setIsPlaying(false);
                    setCurrentTime(0);
                    setDuration(0);
                    setPodcastData(null);
                    setShowScript(false);
                  }}
                  className="mt-4 text-slate-500 hover:text-slate-300 text-[10px] font-black uppercase tracking-widest transition-colors"
                >
                  Générer un autre podcast
                </button>
              </div>
            </div>
          </motion.div>

          {/* Script Section */}
          {podcastData?.script && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-200 dark:border-slate-800"
            >
              <button
                onClick={() => setShowScript(!showScript)}
                className="w-full flex items-center justify-between text-slate-900 dark:text-white group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center group-hover:bg-rose-100 dark:group-hover:bg-rose-500/20 transition-colors">
                    <FileText size={24} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold uppercase tracking-wide">
                      Script du Podcast
                    </h3>
                    <p className="text-xs text-slate-500">
                      Suivez le texte lu par l'IA en temps réel
                    </p>
                  </div>
                </div>
                {showScript ? (
                  <ChevronUp size={24} className="text-slate-400" />
                ) : (
                  <ChevronDown size={24} className="text-slate-400" />
                )}
              </button>

              {showScript && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800"
                >
                  <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {podcastData.script}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
