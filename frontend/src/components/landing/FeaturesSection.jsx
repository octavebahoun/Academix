import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Lottie from "lottie-react";
import { Calendar, Brain, Users, ArrowRight, CheckCircle2 } from "lucide-react";

/* ── Animations Lottie inline simplifiées (cercles animés en fallback) ── */
const useLottieUrl = (url) => {
  // On utilise des URLs Lottie publiques
  return url;
};

const featureCards = [
  {
    icon: Calendar,
    title: "Organisation Intelligente",
    description:
      "Calendrier unifié, gestion des tâches et rappels intelligents. Ne rate plus jamais un devoir.",
    color: "emerald",
    gradient: "from-emerald-500 to-teal-500",
    bgGlow: "bg-emerald-500/10",
    borderGlow: "group-hover:border-emerald-500/30",
    items: [
      "Calendrier semaine/mois",
      "Tâches avec priorités",
      "Rappels automatiques",
      "Import emploi du temps",
    ],
    lottieUrl: "https://assets2.lottiefiles.com/packages/lf20_swnrn2oy.json",
  },
  {
    icon: Brain,
    title: "Apprentissage par IA",
    description:
      "6 modules d'IA générative pour résumer, quiz, podcasts, exercices et tutorat personnalisé.",
    color: "cyan",
    gradient: "from-cyan-500 to-blue-500",
    bgGlow: "bg-cyan-500/10",
    borderGlow: "group-hover:border-cyan-500/30",
    items: [
      "Résumés intelligents",
      "Quiz automatiques",
      "Podcasts de révision",
      "Professeur IA",
    ],
    lottieUrl: "https://assets5.lottiefiles.com/packages/lf20_fcfjwiyb.json",
  },
  {
    icon: Users,
    title: "Collaboration Sociale",
    description:
      "Sessions d'étude en temps réel avec chat, tableau blanc partagé et éditeur de code collaboratif.",
    color: "amber",
    gradient: "from-amber-500 to-orange-500",
    bgGlow: "bg-amber-500/10",
    borderGlow: "group-hover:border-amber-500/30",
    items: [
      "Chat temps réel",
      "Tableau blanc partagé",
      "Code collaboratif",
      "Sessions de groupe",
    ],
    lottieUrl: "https://assets3.lottiefiles.com/packages/lf20_gzl797gs.json",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ── Composant Lottie avec fallback ── */
function LottieOrFallback({ url, icon: Icon, color }) {
  // On tente de charger le Lottie via URL
  return (
    <div className="relative w-24 h-24 mx-auto mb-6">
      {/* Glow background */}
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${
          color === "emerald"
            ? "from-emerald-500/20 to-teal-500/20"
            : color === "cyan"
              ? "from-cyan-500/20 to-blue-500/20"
              : "from-amber-500/20 to-orange-500/20"
        } blur-xl`}
      />
      <div
        className={`relative w-24 h-24 rounded-2xl bg-gradient-to-br ${
          color === "emerald"
            ? "from-emerald-500/10 to-teal-500/10 border-emerald-500/20"
            : color === "cyan"
              ? "from-cyan-500/10 to-blue-500/10 border-cyan-500/20"
              : "from-amber-500/10 to-orange-500/10 border-amber-500/20"
        } border flex items-center justify-center`}
      >
        <Lottie
          animationData={null}
          path={url}
          loop
          autoplay
          style={{ width: 56, height: 56 }}
          onError={() => {}}
          rendererSettings={{ preserveAspectRatio: "xMidYMid slice" }}
        />
        {/* Fallback icon visible si Lottie ne charge pas */}
        <Icon
          className={`absolute w-10 h-10 opacity-0 peer-[.lottie-error]:opacity-100 ${
            color === "emerald"
              ? "text-emerald-400"
              : color === "cyan"
                ? "text-cyan-400"
                : "text-amber-400"
          }`}
        />
      </div>
    </div>
  );
}

export default function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="features"
      className="relative py-28 sm:py-36 bg-slate-950 overflow-hidden"
    >
      {/* BG decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-semibold mb-6 border border-emerald-500/20"
          >
            ✨ 3 Piliers Fondamentaux
          </motion.span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Tout ce dont tu as besoin{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              pour réussir
            </span>
          </h2>
          <p className="mt-6 text-lg text-slate-400 leading-relaxed">
            AcademiX combine trois piliers essentiels pour transformer ton
            expérience académique et t'accompagner vers l'excellence.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid md:grid-cols-3 gap-8"
        >
          {featureCards.map((card, i) => (
            <motion.div
              key={card.title}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className={`group relative p-8 rounded-3xl bg-slate-900 border border-slate-800 ${card.borderGlow} shadow-sm hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-500`}
            >
              {/* Glow on hover */}
              <div
                className={`absolute inset-0 rounded-3xl ${card.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              <div className="relative">
                <LottieOrFallback
                  url={card.lottieUrl}
                  icon={card.icon}
                  color={card.color}
                />

                <h3 className="text-xl font-bold text-white text-center mb-3">
                  {card.title}
                </h3>
                <p className="text-slate-400 text-center mb-6 leading-relaxed">
                  {card.description}
                </p>

                <ul className="space-y-3">
                  {card.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 text-sm text-slate-300"
                    >
                      <CheckCircle2
                        className={`w-4 h-4 flex-shrink-0 ${
                          card.color === "emerald"
                            ? "text-emerald-500"
                            : card.color === "cyan"
                              ? "text-cyan-500"
                              : "text-amber-500"
                        }`}
                      />
                      {item}
                    </li>
                  ))}
                </ul>

                <motion.div
                  whileHover={{ x: 4 }}
                  className={`mt-6 flex items-center justify-center gap-2 text-sm font-semibold ${
                    card.color === "emerald"
                      ? "text-emerald-400"
                      : card.color === "cyan"
                        ? "text-cyan-400"
                        : "text-amber-400"
                  } cursor-pointer`}
                >
                  En savoir plus
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
