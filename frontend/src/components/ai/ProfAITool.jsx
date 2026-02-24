import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, User, Loader2, Sparkles, BrainCircuit } from "lucide-react";
import { aiService } from "../../services/aiService";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ProfAITool() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content:
        "Bonjour ! Je suis votre Professeur IA. Je connais l'intégralité de vos cours importés. Comment puis-je vous aider aujourd'hui ?",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = {
      role: "user",
      content: input.trim(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const historyMsg = messages.map((msg) => ({
        role: msg.role === "user" ? "user" : "ai",
        content: msg.content,
      }));
      const response = await aiService.askChat(userMsg.content, historyMsg);
      const aiMsg = {
        role: "ai",
        content:
          response.answer ||
          response.response ||
          response.content ||
          (typeof response === "string" ? response : JSON.stringify(response)),
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            "Désolé, j'ai rencontré une petite erreur de connexion. Pouvez-vous répéter ?",
          time: "Erreur",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[700px] flex flex-col bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Bot size={24} />
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight italic">
              Professeur AcademiX
            </h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                En ligne • Analyse vos documents
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 pr-2">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500">
            <BrainCircuit size={20} />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex gap-4 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-white shadow-md ${msg.role === "user" ? "bg-slate-800" : "bg-indigo-600"}`}
                >
                  {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div>
                  <div
                    className={`p-5 rounded-2xl shadow-sm ${msg.role === "user" ? "bg-indigo-600 text-white rounded-tr-none" : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none"}`}
                  >
                    <div className="text-sm font-medium leading-relaxed whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                  <p
                    className={`text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest ${msg.role === "user" ? "text-right" : "text-left"}`}
                  >
                    {msg.time}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex gap-4 items-center bg-slate-100 dark:bg-slate-800 px-6 py-4 rounded-2xl">
                <Loader2 size={16} className="animate-spin text-indigo-500" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Réflexion en cours...
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="p-8 bg-slate-50/50 dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-800">
        <div className="relative flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 pl-6 shadow-inner focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
          <input
            type="text"
            placeholder="Posez votre question sur le cours..."
            className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-800 dark:text-white py-3"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="w-12 h-12 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
