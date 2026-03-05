import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardCheck,
  UploadCloud,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Trophy,
} from "lucide-react";
import { aiService } from "../../services/aiService";
import { useAIHistory } from "../../hooks/useAIHistory";
import { offlineStorage } from "../../services/offlineStorage";
import AIHistorySidebar from "./AIHistorySidebar";

export default function QuizTool() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [currentStep, setCurrentStep] = useState("upload");
  const [userAnswers, setUserAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);

  const {
    items,
    loading: histLoading,
    addItem,
    removeItem,
  } = useAIHistory("quiz");

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleGenerate = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const res = await aiService.generateQuiz({ file, nbQuestions: 5 });
      setQuiz(res);
      setCurrentStep("playing");
      setSelectedHistoryId(res.quiz_id);
      addItem(
        {
          history_id: res.quiz_id,
          service_type: "quiz",
          filename: file.name,
          result_id: res.quiz_id,
          meta: {
            title: res.title || file.name.replace(/\.[^.]+$/, ""),
            nb_questions: res.questions?.length,
            difficulty: "medium",
          },
          created_at: new Date().toISOString(),
        },
        res, // ← résultat complet persisté dans IndexedDB
      );
    } catch {
      alert("Erreur lors de la génération du quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistory = async (entry) => {
    setSelectedHistoryId(entry.history_id);
    setLoading(true);
    setCurrentStep("upload");
    setQuiz(null);
    setUserAnswers({});
    setScore(null);
    try {
      const res = await aiService.getQuiz(entry.result_id);
      setQuiz(res);
      setCurrentStep("playing");
    } catch {
      // 📴 Fallback offline
      const cached = await offlineStorage.get("quiz", entry.result_id);
      if (cached) {
        setQuiz(cached);
        setCurrentStep("playing");
      } else {
        alert(
          "Impossible de charger ce quiz (pas de version hors-ligne disponible)",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReload = (entry) => {
    setCurrentStep("upload");
    setQuiz(null);
    setUserAnswers({});
    setScore(null);
    setSelectedHistoryId(null);
  };

  const handleAnswer = (questionIndex, optionIndex) => {
    setUserAnswers({ ...userAnswers, [questionIndex]: optionIndex });
  };

  const handleSubmit = () => {
    let s = 0;
    quiz.questions.forEach((q, i) => {
      // Pour la démo, on considère que la première option est la bonne si l'api ne renvoie pas correct_answer
      // Dans un vrai cas, l'API renvoie l'index correct
      if (userAnswers[i] === (q.correct_answer || 0)) s++;
    });
    setScore(s);
    setCurrentStep("result");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Zone principale */}
      <div className="flex-1 lg:flex-[7] min-w-0 order-1 lg:order-1">
        <div className="max-w-3xl">
          <AnimatePresence mode="wait">
            {currentStep === "upload" && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-8"
              >
                <div className="relative group">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.txt"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div
                    className={`p-8 lg:p-16 border-2 border-dashed rounded-3xl lg:rounded-[3rem] transition-all flex flex-col items-center gap-4 lg:gap-6 ${file ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10" : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"}`}
                  >
                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center ${file ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}
                    >
                      {file ? (
                        <CheckCircle2 size={40} />
                      ) : (
                        <UploadCloud size={40} />
                      )}
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                        {file ? file.name : "Prêt à tester vos connaissances ?"}
                      </h3>
                      <p className="text-xs text-slate-500 mt-2">
                        Importez votre PDF pour générer des questions basées sur
                        son contenu.
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={!file || loading}
                  className="w-full bg-emerald-600 text-white font-black text-xs uppercase tracking-[0.2em] py-5 rounded-2xl hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-xl flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <ClipboardCheck size={18} />
                  )}
                  Démarrer le Quiz IA
                </button>
              </motion.div>
            )}

            {currentStep === "playing" && (
              <motion.div
                key="playing"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="space-y-6">
                  {quiz.questions.map((q, i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-slate-950 p-5 lg:p-8 rounded-3xl lg:rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm"
                    >
                      <div className="flex gap-4 mb-6">
                        <span className="flex-shrink-0 w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-xs font-black text-slate-500">
                          {i + 1}
                        </span>
                        <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                          {q.question}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {q.options.map((option, j) => (
                          <button
                            key={j}
                            onClick={() =>
                              setUserAnswers({ ...userAnswers, [i]: j })
                            }
                            className={`p-4 rounded-xl text-left text-sm font-medium transition-all border-2 ${userAnswers[i] === j ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "border-slate-100 dark:border-slate-900 hover:border-slate-200 dark:hover:border-slate-800 text-slate-600 dark:text-slate-400"}`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    let s = 0;
                    quiz.questions.forEach((q, i) => {
                      if (userAnswers[i] === (q.correct_answer || 0)) s++;
                    });
                    setScore(s);
                    setCurrentStep("result");
                  }}
                  disabled={
                    Object.keys(userAnswers).length < quiz.questions.length
                  }
                  className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-[0.2em] py-5 rounded-2xl hover:scale-105 transition-all disabled:opacity-50 shadow-2xl"
                >
                  Valider mes réponses
                </button>
              </motion.div>
            )}

            {currentStep === "result" && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 rounded-3xl lg:rounded-[3rem] p-6 lg:p-12 text-center shadow-2xl border border-slate-100 dark:border-slate-800"
              >
                <div
                  className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 ${score === quiz.questions.length ? "bg-emerald-500" : "bg-amber-500"} text-white shadow-xl`}
                >
                  {score === quiz.questions.length ? (
                    <Trophy size={48} />
                  ) : (
                    <AlertCircle size={48} />
                  )}
                </div>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-2">
                  {score} / {quiz.questions.length}
                </h2>
                <p className="text-slate-500 font-medium mb-10">
                  {score === quiz.questions.length
                    ? "Parfait ! Vous maîtrisez ce cours."
                    : "Pas mal ! Encore un peu d'entraînement."}
                </p>
                <div className="mt-8 text-left max-h-[400px] overflow-y-auto pr-4 space-y-6 scrollbar-hide">
                  {quiz.questions.map((q, i) => {
                    const isCorrect =
                      userAnswers[i] === (q.correct_answer || 0);
                    return (
                      <div
                        key={i}
                        className={`p-4 lg:p-6 rounded-2xl lg:rounded-[2rem] border-2 shadow-sm ${isCorrect ? "border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-500/10" : "border-rose-500/50 bg-rose-50/50 dark:bg-rose-500/10"}`}
                      >
                        <p className="font-bold text-slate-800 dark:text-slate-200 mb-4">
                          {i + 1}. {q.question}
                        </p>
                        <p className="text-sm">
                          <span className="font-semibold uppercase text-[10px] tracking-widest text-slate-500">
                            Votre réponse :
                          </span>
                          <br />
                          {q.options[userAnswers[i]]}
                        </p>
                        {!isCorrect && (
                          <p className="text-sm mt-1 text-emerald-600 dark:text-emerald-400">
                            <span className="font-semibold uppercase text-[10px] tracking-widest">
                              Bonne réponse :
                            </span>
                            <br />
                            {q.options[q.correct_answer || 0]}
                          </p>
                        )}
                        {q.explanation && (
                          <p className="text-sm mt-4 p-3 bg-white/50 dark:bg-black/20 rounded-xl italic">
                            <span className="font-bold">
                              &#128161; Explication :
                            </span>{" "}
                            {q.explanation}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={() => {
                    setCurrentStep("upload");
                    setQuiz(null);
                    setUserAnswers({});
                    setScore(null);
                    setSelectedHistoryId(null);
                  }}
                  className="mt-8 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-black text-xs uppercase tracking-widest px-8 py-4 rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Recommencer avec un autre fichier
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Sidebar */}
      <div className="flex-1 lg:flex-[3] min-w-0 lg:min-w-[200px] order-2 lg:order-2">
        <AIHistorySidebar
          items={items}
          loading={histLoading}
          selectedId={selectedHistoryId}
          accentColor="emerald"
          onSelect={handleSelectHistory}
          onRemove={removeItem}
          onReload={handleReload}
          getTitle={(e) =>
            e.meta?.title || e.filename?.replace(/\.[^.]+$/, "") || "Quiz"
          }
          getSubtitle={(e) =>
            e.meta?.nb_questions ? `${e.meta.nb_questions} questions` : ""
          }
        />
      </div>
    </div>
  );
}
