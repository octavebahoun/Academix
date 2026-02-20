import { useState } from "react";
import { aiService } from "../services/aiService";
import { authService } from "../services/authService";
import {
  FileText,
  ClipboardCheck,
  Dumbbell,
  Image as ImageIcon,
  Send,
  Download,
  Loader2,
  LogOut,
} from "lucide-react";

const AIToolsPage = () => {
  const [activeTool, setActiveTool] = useState("summary");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [prompt, setPrompt] = useState("");
  const user = authService.getCurrentUser();

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleAction = async () => {
    if (!file && activeTool !== "image")
      return alert("Veuillez sélectionner un fichier");
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      if (file) formData.append("file", file);

      let res;
      if (activeTool === "summary")
        res = await aiService.generateSummary(formData);
      else if (activeTool === "quiz")
        res = await aiService.generateQuiz(formData);
      else if (activeTool === "exercises")
        res = await aiService.generateExercises(formData);
      else if (activeTool === "image")
        res = await aiService.generateImage(prompt);

      setResult(res);
    } catch (e) {
      alert(
        "Erreur: " + (e.response?.data?.detail || "Une erreur est survenue"),
      );
    } finally {
      setLoading(false);
    }
  };

  const renderResult = () => {
    if (!result) return null;

    if (activeTool === "image" && result.image_url) {
      // Dans un vrai cas, on devrait fetch l'image avec le Bearer Token car elle est protégée
      // Pour simplifier ici, on montre l'ID et propose un lien
      return (
        <div className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
          <h3 className="text-xl font-bold text-white mb-4">Image Générée</h3>
          <p className="text-slate-400 mb-6 italic">"{result.prompt}"</p>
          <div className="bg-indigo-600/10 border border-indigo-500/20 p-4 rounded-xl inline-block mb-4">
            <ImageIcon size={64} className="text-indigo-400 mx-auto" />
          </div>
          <p className="text-sm text-slate-500 mb-4">ID: {result.image_id}</p>
          <a
            href={`http://127.0.0.1:5000${result.image_url}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold transition-all"
          >
            <Download size={18} /> Voir / Télécharger (authentifié)
          </a>
        </div>
      );
    }

    return (
      <div className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white">
              {result.title || "Résultat IA"}
            </h3>
            <p className="text-slate-500 text-sm">
              Généré le {new Date().toLocaleDateString()}
            </p>
          </div>
          {result.download_url && (
            <button className="flex items-center gap-2 text-indigo-400 hover:text-white transition-colors text-sm font-bold">
              <Download size={18} /> Télécharger
            </button>
          )}
        </div>

        <div className="prose prose-invert max-w-none">
          {activeTool === "quiz" ? (
            <div className="space-y-6">
              {result.questions.map((q, i) => (
                <div
                  key={i}
                  className="bg-slate-950 p-6 rounded-xl border border-slate-800"
                >
                  <p className="text-white font-bold mb-4">
                    {i + 1}. {q.question}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {q.options.map((opt, j) => (
                      <div
                        key={j}
                        className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-400"
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="whitespace-pre-wrap text-slate-300 leading-relaxed font-serif">
              {result.content ||
                (result.exercises
                  ? JSON.stringify(result.exercises, null, 2)
                  : "Traitement réussi.")}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Topbar */}
      <header className="bg-slate-900 border-b border-slate-800 px-10 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-black text-indigo-500 tracking-tighter uppercase">
            AcademiX AI
          </h1>
          <nav className="flex gap-1">
            {[
              { id: "summary", icon: FileText, label: "Fiche" },
              { id: "quiz", icon: ClipboardCheck, label: "Quiz" },
              { id: "exercises", icon: Dumbbell, label: "Exercices" },
              { id: "image", icon: ImageIcon, label: "Image" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTool(t.id);
                  setResult(null);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTool === t.id ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"}`}
              >
                <t.icon size={16} /> {t.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white">
              {user?.nom} {user?.prenom}
            </p>
            <p className="text-[10px] text-indigo-400 uppercase tracking-widest">
              {authService.getRole()}
            </p>
          </div>
          <button
            onClick={() => authService.logout()}
            className="p-2 text-slate-500 hover:text-red-500 transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-white mb-4">
            {activeTool === "summary" && "Compressez vos cours avec l'IA"}
            {activeTool === "quiz" && "Validez vos connaissances (QCM)"}
            {activeTool === "exercises" && "Entraînez-vous avec des exercices"}
            {activeTool === "image" && "Donnez vie à vos concepts"}
          </h2>
          <p className="text-slate-500 text-lg">
            L'intelligence artificielle AcademiX vous aide à mieux réviser et à
            créer du contenu pédagogique unique.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[80px] rounded-full -mr-20 -mt-20"></div>

          {activeTool === "image" ? (
            <div className="relative z-10 flex flex-col gap-4">
              <label className="text-sm font-bold text-slate-400 flex items-center gap-2">
                <ImageIcon size={16} /> Description de l'image
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: Un astronaute qui étudie la philosophie médiévale..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <button
                  onClick={handleAction}
                  disabled={loading || !prompt}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-8 rounded-xl font-bold transition-all flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <Send size={20} /> Générer
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="relative z-10 flex flex-col items-center gap-8 py-10 border-2 border-dashed border-slate-800 rounded-2xl hover:border-indigo-500/50 transition-all group">
              <div className="p-6 bg-slate-950 rounded-full text-slate-500 group-hover:text-indigo-400 transition-colors">
                <FileText size={48} />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-white mb-2">
                  {file ? file.name : "Glissez votre cours (PDF ou TXT)"}
                </p>
                <p className="text-slate-500 text-sm mb-6">
                  Taille max: 10 Mo. Format supportés: PDF, TXT, MD
                </p>
                <input
                  type="file"
                  id="python-file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.txt,.md"
                />
                <div className="flex gap-4 justify-center">
                  <label
                    htmlFor="python-file"
                    className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold transition-all"
                  >
                    Parcourir...
                  </label>
                  <button
                    onClick={handleAction}
                    disabled={loading || !file}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      "Lancer l'IA"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {renderResult()}
      </main>
    </div>
  );
};

export default AIToolsPage;
