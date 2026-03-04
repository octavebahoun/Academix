import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import Lottie from "lottie-react";
import { MessageSquare, Pencil, Code2, Wifi, Users, Zap } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Chat Temps Réel",
    description:
      "Discutez instantanément avec vos camarades dans des salles d'étude virtuelles connectées via WebSocket.",
    color: "emerald",
  },
  {
    icon: Pencil,
    title: "Tableau Blanc Partagé",
    description:
      "Dessinez des schémas, tracez des graphes et expliquez visuellement des concepts — synchronisation bidirectionnelle ultra-rapide.",
    color: "cyan",
  },
  {
    icon: Code2,
    title: "Éditeur de Code Collaboratif",
    description:
      "Un véritable IDE dans le navigateur. Codez simultanément comme sur Google Docs, idéal pour les TP d'informatique.",
    color: "amber",
  },
];

const colorClasses = {
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    border: "border-emerald-500/20",
    gradient: "from-emerald-500 to-teal-500",
  },
  cyan: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-500",
    border: "border-cyan-500/20",
    gradient: "from-cyan-500 to-blue-500",
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    border: "border-amber-500/20",
    gradient: "from-amber-500 to-orange-500",
  },
};

/* ── Illustration mockup de chat ── */
function ChatMockup() {
  const messages = [
    {
      user: "Aminata",
      text: "Quelqu'un peut expliquer les matrices ?",
      time: "14:02",
      side: "left",
    },
    {
      user: "Toi",
      text: "Oui ! Regarde le schéma sur le tableau blanc 👆",
      time: "14:03",
      side: "right",
    },
    {
      user: "Kofi",
      text: "Merci ! J'ai ajouté un exercice dans l'éditeur",
      time: "14:04",
      side: "left",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 bg-slate-800/80 border-b border-slate-700">
        <div className="flex -space-x-2">
          {["🧑‍🎓", "👩‍🎓", "👨‍🎓"].map((e, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm border-2 border-slate-900"
            >
              {e}
            </div>
          ))}
        </div>
        <div className="flex-1">
          <span className="text-sm font-bold text-white">
            Session Algèbre L2
          </span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-slate-500">3 en ligne</span>
          </div>
        </div>
        <Wifi className="w-4 h-4 text-emerald-500" />
      </div>

      {/* Messages */}
      <div className="p-4 space-y-3 min-h-[200px]">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10, x: msg.side === "right" ? 20 : -20 }}
            whileInView={{ opacity: 1, y: 0, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2, duration: 0.5 }}
            className={`flex ${msg.side === "right" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                msg.side === "right"
                  ? "bg-emerald-500 text-white rounded-br-md"
                  : "bg-slate-800 text-slate-200 rounded-bl-md"
              }`}
            >
              {msg.side === "left" && (
                <span className="block text-xs font-bold text-emerald-500 mb-0.5">
                  {msg.user}
                </span>
              )}
              {msg.text}
              <span
                className={`block text-[10px] mt-1 ${msg.side === "right" ? "text-white/60" : "text-slate-400"}`}
              >
                {msg.time}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700">
          <span className="text-sm text-slate-400 flex-1">
            Écrire un message...
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CollaborationSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="collaboration"
      className="relative py-28 sm:py-36 bg-slate-900 overflow-hidden"
    >
      {/* Glow bg */}
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl" />

      <div
        ref={ref}
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-semibold mb-6">
            <Users className="w-4 h-4" />
            Collaboration en Temps Réel
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Apprends{" "}
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              ensemble
            </span>
            , réussis mieux
          </h2>
          <p className="mt-6 text-lg text-slate-400">
            Fini l'apprentissage solitaire. Rejoins des sessions de révision
            collaboratives connectées en direct par WebSocket.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Feature list */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            {features.map((feat, i) => {
              const cc = colorClasses[feat.color];
              return (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  whileHover={{ x: 8 }}
                  className="flex items-start gap-5 p-5 rounded-2xl hover:bg-slate-800/60 transition-colors group"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cc.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}
                  >
                    <feat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-400 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}

            {/* Tech badge */}
            <div className="flex flex-wrap gap-2 pl-5">
              {["WebSocket", "Socket.io", "MongoDB", "Real-time"].map(
                (tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 rounded-full bg-slate-800 text-xs font-mono text-slate-400 border border-slate-700"
                  >
                    {tech}
                  </span>
                ),
              )}
            </div>
          </motion.div>

          {/* Chat mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-cyan-500/10 rounded-3xl blur-2xl" />
            <div className="relative">
              <ChatMockup />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
