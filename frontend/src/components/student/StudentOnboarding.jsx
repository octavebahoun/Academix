import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, ChevronLeft, X, Sparkles, BrainCircuit,
  LayoutDashboard, FileText, Calendar, Users, User,
  Rocket, Trophy, Zap,
} from "lucide-react";
import { cn } from "../../utils/cn";

// ─── Tour steps ───────────────────────────────────────────────────────────────
const STEPS = [
  { target: "#tour-stats",             title: "Tableau de bord",       content: "Moyenne, absences et rang — tout votre suivi académique en temps réel.",                                         icon: LayoutDashboard, tab: "dashboard",    color: "emerald" },
  { target: "#tour-nav-sessions",      title: "Sessions collaboratives",content: "Créez ou rejoignez des sessions d'étude en live avec chat et éditeur de code.",                           icon: Users,           tab: "sessions",     color: "blue"    },
  { target: "#tour-nav-notes",         title: "Vos évaluations",        content: "Consultez l'historique de toutes vos notes par matière et par semestre.",                                      icon: FileText,        tab: "notes",        color: "violet"  },
  { target: "#tour-nav-emploi-temps",  title: "Emploi du temps",        content: "Votre planning complet : CM, TD, TP avec les horaires et les salles.",                                         icon: Calendar,        tab: "emploi-temps", color: "sky"     },
  { target: "#tour-nav-ai-revision",   title: "Révision avec l'IA",     content: "L'atout majeur : transformez vos cours en résumés, quiz, podcasts et exercices.",                           icon: BrainCircuit,    tab: "ai-revision",  color: "emerald" },
  { target: "#tour-nav-profil",        title: "Votre profil",           content: "Gérez vos informations, objectifs et préférences d'apprentissage.",                                          icon: User,            tab: "profil",       color: "amber"   },
];

// ─── Color tokens ─────────────────────────────────────────────────────────────
const COLORS = {
  emerald: { ring: "#10b981", iconBg: "bg-emerald-500/15", iconText: "text-emerald-400", bar: "bg-emerald-500", dot: "bg-emerald-500", btn: "bg-emerald-500 hover:bg-emerald-400", stepLabel: "text-emerald-400" },
  blue:    { ring: "#3b82f6", iconBg: "bg-blue-500/15",    iconText: "text-blue-400",    bar: "bg-blue-500",    dot: "bg-blue-500",    btn: "bg-blue-500 hover:bg-blue-400",    stepLabel: "text-blue-400"    },
  violet:  { ring: "#8b5cf6", iconBg: "bg-violet-500/15",  iconText: "text-violet-400",  bar: "bg-violet-500",  dot: "bg-violet-500",  btn: "bg-violet-500 hover:bg-violet-400",  stepLabel: "text-violet-400"  },
  sky:     { ring: "#0ea5e9", iconBg: "bg-sky-500/15",     iconText: "text-sky-400",     bar: "bg-sky-500",     dot: "bg-sky-500",     btn: "bg-sky-500 hover:bg-sky-400",     stepLabel: "text-sky-400"     },
  amber:   { ring: "#f59e0b", iconBg: "bg-amber-500/15",   iconText: "text-amber-400",   bar: "bg-amber-500",   dot: "bg-amber-500",   btn: "bg-amber-500 hover:bg-amber-400",   stepLabel: "text-amber-400"   },
};

const WELCOME_FEATURES = [
  { icon: LayoutDashboard, label: "Suivi académique", cls: "text-emerald-400 bg-emerald-500/10" },
  { icon: BrainCircuit,    label: "IA pédagogique",  cls: "text-violet-400 bg-violet-500/10"   },
  { icon: Users,           label: "Collaboratif",    cls: "text-blue-400 bg-blue-500/10"       },
];

const CONFETTI = ["bg-emerald-400","bg-yellow-400","bg-blue-400","bg-violet-400","bg-rose-400","bg-amber-400"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function useWinSize() {
  const [sz, setSz] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const handler = () => setSz({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return sz;
}

function calcCardPos(rect, { w, h }) {
  if (!rect) return null;
  const CW = Math.min(290, w - 32);
  const CH = 230;
  const GAP = 14;
  const PAD = 10;
  const cands = [
    { top: rect.top + rect.height / 2 - CH / 2, left: rect.right + GAP },
    { top: rect.bottom + GAP,                    left: rect.left + rect.width / 2 - CW / 2 },
    { top: rect.top - CH - GAP,                  left: rect.left + rect.width / 2 - CW / 2 },
    { top: rect.top + rect.height / 2 - CH / 2,  left: rect.left - CW - GAP },
  ];
  for (const c of cands) {
    const t = Math.max(PAD, Math.min(c.top, h - CH - PAD));
    const l = Math.max(PAD, Math.min(c.left, w - CW - PAD));
    const oh = l < rect.right + 4 && l + CW > rect.left - 4;
    const ov = t < rect.bottom + 4 && t + CH > rect.top - 4;
    if (!(oh && ov)) return { top: t, left: l, width: CW };
  }
  return { top: (h - CH) / 2, left: (w - CW) / 2, width: CW };
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function DotPattern({ id }) {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      <svg width="100%" height="100%">
        <defs>
          <pattern id={id} width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="white" opacity="0.05" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
    </div>
  );
}

function Spotlight({ rect, ringColor }) {
  if (!rect) return null;
  const P = 8;
  const r = { top: rect.top - P, left: rect.left - P, w: rect.width + P * 2, h: rect.height + P * 2 };
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0"
        style={{
          background: "rgba(2,6,23,0.80)",
          backdropFilter: "blur(2px)",
          clipPath: `polygon(0 0,100% 0,100% 100%,0 100%,0 0,${r.left}px ${r.top}px,${r.left}px ${r.top + r.h}px,${r.left + r.w}px ${r.top + r.h}px,${r.left + r.w}px ${r.top}px,${r.left}px ${r.top}px)`,
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
        className="absolute rounded-xl pointer-events-none"
        style={{ top: r.top, left: r.left, width: r.w, height: r.h, border: `2px solid ${ringColor}`, boxShadow: `0 0 0 4px ${ringColor}20, 0 0 30px ${ringColor}40` }}
      />
    </>
  );
}

function DotBar({ current, total, dotCls }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ width: i === current ? 18 : 6, opacity: i <= current ? 1 : 0.28 }}
          transition={{ duration: 0.25 }}
          className={cn("h-1.5 rounded-full", i === current ? dotCls : "bg-slate-700")}
        />
      ))}
    </div>
  );
}

function TourCard({ step, colors, onBack, onNext, onSkip, pos, mobile }) {
  const cur = STEPS[step];
  const Icon = cur.icon;
  const inner = (
    <div className="bg-slate-900 border border-white/8 rounded-2xl shadow-2xl overflow-hidden">
      <div className="h-1 bg-slate-800">
        <motion.div
          animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          transition={{ duration: 0.35 }}
          className={cn("h-full", colors.bar)}
        />
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", colors.iconBg)}>
              <Icon size={16} className={colors.iconText} />
            </div>
            <div>
              <p className={cn("text-[9px] font-black uppercase tracking-widest mb-0.5", colors.stepLabel)}>
                Étape {step + 1} / {STEPS.length}
              </p>
              <p className="text-sm font-black text-white leading-tight">{cur.title}</p>
            </div>
          </div>
          <button
            onClick={onSkip}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/15 border border-white/8 flex items-center justify-center text-slate-500 hover:text-red-400 transition-colors"
          >
            <X size={12} />
          </button>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed mb-5">{cur.content}</p>
        <div className="flex items-center gap-2">
          <DotBar current={step} total={STEPS.length} dotCls={colors.dot} />
          <div className="flex-1" />
          <button
            onClick={onBack}
            disabled={step === 0}
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-slate-400 disabled:opacity-20 hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={onNext}
            className={cn("h-8 px-4 rounded-lg text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-colors", colors.btn)}
          >
            {step === STEPS.length - 1 ? "Terminer" : "Suivant"} <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );

  if (mobile) {
    return (
      <motion.div
        key={`mc-${step}`}
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
        className="absolute bottom-4 left-3 right-3 pointer-events-auto"
      >
        {inner}
      </motion.div>
    );
  }
  if (!pos) return null;
  return (
    <motion.div
      key={`pc-${step}`}
      initial={{ opacity: 0, scale: 0.94, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
      className="absolute pointer-events-auto"
      style={{ top: pos.top, left: pos.left, width: pos.width }}
    >
      {inner}
    </motion.div>
  );
}




/* ─── main component ─── */
const CONFETTI_SEEDS = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  delay: Math.random() * 0.6,
  dur: 1.8 + Math.random() * 1.2,
  size: 6 + Math.floor(Math.random() * 7),
  cls: CONFETTI[i % CONFETTI.length],
}));

export default function StudentOnboarding({ activeTab, onTabChange, onComplete }) {
  const [step, setStep] = useState(-1); // -1 welcome, 0..n-1 tour, n success
  const [rect, setRect] = useState(null);
  const [visible, setVisible] = useState(false);
  const { w, h } = useWinSize();

  useEffect(() => {
    if (!localStorage.getItem("academix_onboarding_v4")) setVisible(true);
  }, []);

  const measureStep = useCallback((s) => {
    if (s < 0 || s >= STEPS.length) { setRect(null); return; }
    const el = document.querySelector(STEPS[s].target);
    if (el) {
      setRect(el.getBoundingClientRect());
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else {
      setRect(null);
    }
  }, []);

  useEffect(() => {
    if (step >= 0 && step < STEPS.length) {
      if (onTabChange) onTabChange(STEPS[step].tab);
      const t = setTimeout(() => measureStep(step), 400);
      return () => clearTimeout(t);
    } else {
      setRect(null);
    }
  }, [step, measureStep, onTabChange]);

  useEffect(() => {
    const handler = () => measureStep(step);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [step, measureStep]);

  const finish = () => {
    localStorage.setItem("academix_onboarding_v4", "done");
    setVisible(false);
    onComplete?.();
  };

  if (!visible) return null;

  const pos = calcCardPos(rect, { w, h });
  const isMobile = w < 640;
  const cur = step >= 0 && step < STEPS.length ? STEPS[step] : null;
  const colors = cur ? COLORS[cur.color] : COLORS.emerald;

  return (
    <div className="fixed inset-0 z-999 pointer-events-none" aria-modal role="dialog">
      <AnimatePresence mode="wait">

        {/* ── WELCOME ── */}
        {step === -1 && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center p-4 pointer-events-auto"
            style={{ background: "rgba(2,6,23,0.80)", backdropFilter: "blur(20px)" }}
          >
            {/* ── card ── */}
            <motion.div
              initial={{ y: 28, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-sm bg-slate-900 border border-white/8 rounded-3xl shadow-2xl overflow-hidden text-center"
            >
              <DotPattern id="wp" />
              {/* emerald glow top-right */}
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

              {/* header */}
              <div className="pt-10 pb-0 px-8">
                <motion.div
                  animate={{ y: [0, -7, 0] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-18 h-18 rounded-2xl mx-auto mb-6 bg-linear-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-[0_16px_40px_rgba(16,185,129,0.35)]"
                >
                  <Rocket size={isMobile ? 26 : 32} className="text-white" />
                </motion.div>

                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-2">Bienvenue sur AcademiX</p>
                <h2 className={cn("font-black text-white leading-tight tracking-tight mb-3", isMobile ? "text-2xl" : "text-3xl")}>
                  Découvrez tout<br />en 2 minutes
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-xs mx-auto">
                  Un guide interactif pour maîtriser chaque fonctionnalité et démarrer sur les chapeaux de roues.
                </p>
              </div>

              {/* features chips */}
              <div className="flex items-center justify-center gap-2 flex-wrap px-6 mb-8">
                {WELCOME_FEATURES.map(({ icon: Icon, label, cls }) => (
                  <div key={label} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border border-white/8", cls)}>
                    <Icon size={12} />
                    {label}
                  </div>
                ))}
              </div>

              {/* divider */}
              <div className="h-px bg-white/6 mx-6 mb-6" />

              {/* actions */}
              <div className="flex flex-col gap-2.5 px-8 pb-8">
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setStep(0)}
                  className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(16,185,129,0.35)] transition-colors"
                >
                  <Zap size={14} /> Lancer le guide
                </motion.button>
                <button
                  onClick={finish}
                  className="text-[11px] font-bold uppercase tracking-widest text-slate-600 hover:text-slate-400 transition-colors py-2"
                >
                  Passer pour l'instant
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ── TOUR ── */}
        {step >= 0 && step < STEPS.length && (
          <motion.div
            key="tour"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            <Spotlight rect={rect} ringColor={colors.ring} />
            <AnimatePresence mode="wait">
              <TourCard
                key={step}
                step={step}
                colors={colors}
                onBack={() => setStep(s => Math.max(s - 1, 0))}
                onNext={() => setStep(s => s + 1)}
                onSkip={finish}
                pos={pos}
                mobile={isMobile}
              />
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── SUCCESS ── */}
        {step === STEPS.length && (
          <motion.div
            key="success"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center p-4 pointer-events-auto"
            style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(16,185,129,0.12) 0%, rgba(2,6,23,0.92) 70%)", backdropFilter: "blur(24px)" }}
          >
            {/* confetti */}
            {CONFETTI_SEEDS.map(({ id, x, delay, dur, size, cls }) => (
              <motion.div
                key={id}
                className={cn("absolute top-0 rounded-full pointer-events-none", cls)}
                style={{ left: `${x}%`, width: size, height: size }}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: ["0vh", "110vh"], opacity: [0, 1, 1, 0] }}
                transition={{ duration: dur, delay, ease: "linear", repeat: Infinity, repeatDelay: Math.random() * 2 }}
              />
            ))}

            <motion.div
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-sm bg-slate-900 border border-white/8 rounded-3xl shadow-2xl overflow-hidden text-center"
            >
              <DotPattern id="sp" />
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full bg-emerald-500/12 blur-3xl pointer-events-none" />

              <div className="pt-10 px-8 pb-8">
                <motion.div
                  initial={{ scale: 0, rotate: -25 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 270, damping: 18 }}
                  className={cn(
                    "rounded-full mx-auto mb-5 bg-linear-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-[0_16px_48px_rgba(16,185,129,0.4)]",
                    isMobile ? "w-16 h-16" : "w-20 h-20"
                  )}
                >
                  <Trophy size={isMobile ? 28 : 36} className="text-white" />
                </motion.div>

                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-2">Tour terminé</p>
                <h2 className={cn("font-black text-white tracking-tight leading-tight mb-3", isMobile ? "text-2xl" : "text-[28px]")}>
                  Vous êtes prêt !
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed mb-8">
                  Toutes les clés pour exceller sur AcademiX sont entre vos mains.{" "}
                  <span className="text-emerald-400 font-bold">Bonne réussite !</span>
                </p>

                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={finish}
                  className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(16,185,129,0.35)] transition-colors"
                >
                  <Sparkles size={14} /> Commencer l'aventure
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
