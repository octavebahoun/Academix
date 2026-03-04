import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  GraduationCap,
  Rocket,
  Shield,
  Clock,
} from "lucide-react";

export default function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="relative py-28 sm:py-36 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900" />
      <motion.div
        animate={{
          background: [
            "radial-gradient(600px circle at 30% 40%, rgba(16,185,129,0.15), transparent 60%)",
            "radial-gradient(600px circle at 70% 60%, rgba(14,165,233,0.15), transparent 60%)",
            "radial-gradient(600px circle at 30% 40%, rgba(16,185,129,0.15), transparent 60%)",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0"
      />
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold mb-8"
        >
          <Rocket className="w-4 h-4" />
          Prêt à transformer ta réussite ?
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight"
        >
          Commence dès{" "}
          <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            maintenant
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-xl text-slate-400 max-w-2xl mx-auto"
        >
          Rejoins AcademiX gratuitement et découvre comment l'IA peut
          révolutionner ta façon d'étudier.
        </motion.p>

        {/* Avantages */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-300"
        >
          {[
            { icon: Shield, text: "100% Gratuit" },
            { icon: Clock, text: "Setup en 2 min" },
            { icon: Sparkles, text: "IA illimitée" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-emerald-400" />
              {text}
            </div>
          ))}
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 25px 60px rgba(5,150,105,0.5)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/login")}
            className="group flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-lg rounded-2xl shadow-2xl shadow-emerald-500/30 transition-all"
          >
            <GraduationCap className="w-6 h-6" />
            Créer mon compte gratuit
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>

        {/* Floating elements */}
        <div className="absolute top-10 left-10 hidden lg:block">
          <motion.div
            animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl text-white/60 text-sm"
          >
            📄 Résumé généré !
          </motion.div>
        </div>
        <div className="absolute bottom-10 right-10 hidden lg:block">
          <motion.div
            animate={{ y: [0, 12, 0], rotate: [0, -3, 0] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl text-white/60 text-sm"
          >
            🎙️ Podcast prêt !
          </motion.div>
        </div>
        <div className="absolute top-1/2 right-5 hidden lg:block">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl text-white/60 text-sm"
          >
            ✅ Quiz : 18/20 !
          </motion.div>
        </div>
      </div>
    </section>
  );
}
