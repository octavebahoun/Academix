import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Player } from "@remotion/player";
import { AcademixIntro } from "../remotion/AcademixIntro";
import { ArrowRight, Play, Sparkles, GraduationCap, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const ref = useRef(null);
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950"
    >
      {/* Background gradient animé */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/30 via-slate-950 to-slate-950" />
        <motion.div
          animate={{
            background: [
              "radial-gradient(600px circle at 20% 30%, rgba(16,185,129,0.12), transparent 60%)",
              "radial-gradient(600px circle at 80% 60%, rgba(14,165,233,0.12), transparent 60%)",
              "radial-gradient(600px circle at 40% 80%, rgba(245,158,11,0.08), transparent 60%)",
              "radial-gradient(600px circle at 20% 30%, rgba(16,185,129,0.12), transparent 60%)",
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
        />
        {/* Grille */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <motion.div
        style={{ y, opacity, scale }}
        className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20"
      >
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Colonne gauche - Texte */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8"
            >
              <Sparkles className="w-4 h-4" />
              Propulsé par l'Intelligence Artificielle
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            </motion.div>

            {/* Titre principal */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.05] tracking-tight"
            >
              Réussis tes
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                études
              </span>{" "}
              avec l'
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                IA
              </span>
            </motion.h1>

            {/* Sous-titre */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-lg sm:text-xl text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              AcademiX combine{" "}
              <span className="text-emerald-400 font-semibold">
                organisation intelligente
              </span>
              ,{" "}
              <span className="text-cyan-400 font-semibold">IA générative</span>{" "}
              et{" "}
              <span className="text-amber-400 font-semibold">
                collaboration en temps réel
              </span>{" "}
              pour maximiser ta réussite académique.
            </motion.p>

            {/* Boutons CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 60px rgba(5,150,105,0.4)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/login")}
                className="group flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-lg rounded-2xl shadow-2xl shadow-emerald-500/25 transition-all"
              >
                <GraduationCap className="w-5 h-5" />
                Commencer gratuitement
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "rgba(255,255,255,0.1)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  document
                    .querySelector("#features")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="flex items-center justify-center gap-3 px-8 py-4 border border-white/20 text-white font-semibold text-lg rounded-2xl hover:border-white/40 transition-all"
              >
                <Play className="w-5 h-5" />
                Découvrir
              </motion.button>
            </motion.div>

            {/* Stats inline */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-12 flex items-center gap-8 justify-center lg:justify-start"
            >
              {[
                { value: "6+", label: "Modules IA" },
                { value: "100%", label: "Gratuit" },
                { value: "24/7", label: "Disponible" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-500">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Colonne droite - Remotion Player */}
          <motion.div
            initial={{ opacity: 0, x: 50, rotateY: -10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ delay: 0.6, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Glow derrière le player */}
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-amber-500/10 rounded-3xl blur-2xl" />

            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-emerald-500/10 bg-slate-900/50 backdrop-blur-sm">
              {/* Barre de titre browser mockup */}
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/80 border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs text-slate-500 font-mono">
                    academix.app
                  </span>
                </div>
              </div>

              <Player
                component={AcademixIntro}
                compositionWidth={1280}
                compositionHeight={720}
                durationInFrames={150}
                fps={30}
                autoPlay
                loop
                style={{ width: "100%", height: "auto", aspectRatio: "16/9" }}
                controls={false}
              />
            </div>

            {/* Floating badges */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-4 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white text-sm font-semibold shadow-xl"
            >
              🧠 IA Générative
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute -bottom-4 -left-4 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white text-sm font-semibold shadow-xl"
            >
              ⚡ Temps réel
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center">
          <motion.div
            animate={{ y: [2, 16, 2] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 mt-2 bg-emerald-400 rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
}
