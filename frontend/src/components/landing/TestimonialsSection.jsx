import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Aminata K.",
    role: "L3 Informatique",
    avatar: "👩‍🎓",
    text: "Les résumés IA m'ont fait gagner un temps fou. Je génère mes fiches de révision en 30 secondes au lieu de 2 heures. Ma moyenne a augmenté de 3 points !",
    rating: 5,
  },
  {
    name: "Kofi M.",
    role: "L2 Génie Civil",
    avatar: "🧑‍🎓",
    text: "Le tableau blanc collaboratif est incroyable. On révise ensemble même à distance. Les sessions de groupe ont changé ma façon d'étudier.",
    rating: 5,
  },
  {
    name: "Sarah T.",
    role: "M1 Économie",
    avatar: "👩‍💼",
    text: "Les podcasts de révision générés par l'IA sont parfaits pour réviser dans les transports. C'est comme avoir un tuteur personnel 24/7.",
    rating: 5,
  },
  {
    name: "Jean-Pierre D.",
    role: "Chef de Département",
    avatar: "👨‍🏫",
    text: "L'import CSV pour les étudiants et les notes a simplifié notre gestion administrative. L'interface est intuitive et les analytics sont précieux.",
    rating: 5,
  },
  {
    name: "Fatou B.",
    role: "L1 Mathématiques",
    avatar: "👩‍🔬",
    text: "Le professeur IA comprend vraiment le contexte de mes cours. Les exercices générés sont pertinents et les corrigés sont super détaillés.",
    rating: 5,
  },
  {
    name: "Omar S.",
    role: "L2 Électronique",
    avatar: "👨‍🎓",
    text: "L'éditeur de code collaboratif est un game-changer pour les TP. On debug ensemble en temps réel, c'est comme être en salle de TP virtuelle.",
    rating: 5,
  },
];

function TestimonialCard({ t, i }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
      className="group relative p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/30 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-500"
    >
      {/* Quote icon */}
      <Quote className="absolute top-4 right-4 w-8 h-8 text-slate-100 dark:text-slate-800 group-hover:text-emerald-100 dark:group-hover:text-emerald-900 transition-colors" />

      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: t.rating }).map((_, j) => (
          <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
        ))}
      </div>

      {/* Text */}
      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
        "{t.text}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg">
          {t.avatar}
        </div>
        <div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">
            {t.name}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {t.role}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="relative py-28 sm:py-36 bg-white dark:bg-slate-950 overflow-hidden"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-500/3 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm font-semibold mb-6">
            ⭐ Témoignages
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Ce qu'en disent{" "}
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              nos étudiants
            </span>
          </h2>
          <p className="mt-6 text-lg text-slate-600 dark:text-slate-400">
            Des centaines d'étudiants transforment déjà leur façon d'apprendre
            avec AcademiX.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <TestimonialCard key={t.name} t={t} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
