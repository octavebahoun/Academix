import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from "remotion";

/* ───── Particule animée ───── */
const Particle = ({ delay, x, y, size, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 80 },
  });
  const opacity = interpolate(frame - delay, [0, 20, 80, 100], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(progress, [0, 1], [0, 1]);
  const drift = interpolate(frame, [0, 150], [0, -40]);

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        opacity,
        transform: `scale(${scale}) translateY(${drift}px)`,
        filter: "blur(1px)",
      }}
    />
  );
};

/* ───── Anneau orbital ───── */
const OrbitalRing = ({ delay, radius, duration, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const appear = spring({ frame: frame - delay, fps, config: { damping: 40 } });
  const rotation = interpolate(frame, [0, duration], [0, 360]);

  return (
    <div
      style={{
        position: "absolute",
        width: radius * 2,
        height: radius * 2,
        border: `2px solid ${color}`,
        borderRadius: "50%",
        opacity: appear * 0.4,
        transform: `rotate(${rotation}deg) scale(${appear})`,
      }}
    />
  );
};

/* ───── Texte qui apparaît lettre par lettre ───── */
const AnimatedText = ({ text, startFrame, style, className }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <span style={{ display: "inline-flex", ...style }} className={className}>
      {text.split("").map((char, i) => {
        const charDelay = startFrame + i * 2;
        const prog = spring({
          frame: frame - charDelay,
          fps,
          config: { damping: 30, stiffness: 200 },
        });
        const opacity = interpolate(prog, [0, 1], [0, 1]);
        const y = interpolate(prog, [0, 1], [30, 0]);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity,
              transform: `translateY(${y}px)`,
              minWidth: char === " " ? "0.3em" : undefined,
            }}
          >
            {char}
          </span>
        );
      })}
    </span>
  );
};

/* ───── Feature pill ───── */
const FeaturePill = ({ icon, text, delay, x, y }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const prog = spring({ frame: frame - delay, fps, config: { damping: 20 } });
  const opacity = interpolate(prog, [0, 1], [0, 1]);
  const scale = interpolate(prog, [0, 1], [0.5, 1]);

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: `scale(${scale}) translate(-50%, -50%)`,
        opacity,
        background: "rgba(255,255,255,0.1)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: 16,
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        color: "#fff",
        fontSize: 16,
        fontFamily: "Manrope, sans-serif",
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ fontSize: 22 }}>{icon}</span>
      {text}
    </div>
  );
};

/* ═══════════════════════════════════════════
   COMPOSITION PRINCIPALE - AcademixIntro
   ═══════════════════════════════════════════ */
export const AcademixIntro = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Gradient animé
  const hue = interpolate(frame, [0, durationInFrames], [150, 200]);
  const gradientShift = interpolate(frame, [0, durationInFrames], [0, 60]);

  // Zoom lent du background
  const bgScale = interpolate(frame, [0, durationInFrames], [1, 1.15]);

  // Fade out final
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 30, durationInFrames],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const particles = [
    { delay: 5, x: 15, y: 20, size: 8, color: "#10b981" },
    { delay: 10, x: 80, y: 15, size: 6, color: "#0ea5e9" },
    { delay: 15, x: 25, y: 75, size: 10, color: "#f59e0b" },
    { delay: 8, x: 70, y: 80, size: 7, color: "#10b981" },
    { delay: 20, x: 50, y: 10, size: 5, color: "#8b5cf6" },
    { delay: 12, x: 90, y: 50, size: 9, color: "#0ea5e9" },
    { delay: 18, x: 10, y: 50, size: 6, color: "#f59e0b" },
    { delay: 25, x: 60, y: 30, size: 8, color: "#10b981" },
    { delay: 22, x: 35, y: 90, size: 7, color: "#8b5cf6" },
    { delay: 30, x: 85, y: 35, size: 5, color: "#0ea5e9" },
  ];

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${135 + gradientShift}deg, 
          hsl(${hue}, 70%, 8%) 0%, 
          hsl(${hue + 20}, 60%, 12%) 40%, 
          hsl(${hue + 40}, 50%, 15%) 100%)`,
        transform: `scale(${bgScale})`,
        opacity: fadeOut,
        overflow: "hidden",
      }}
    >
      {/* Grille subtile */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          transform: `translateY(${interpolate(frame, [0, durationInFrames], [0, -30])}px)`,
        }}
      />

      {/* Particules */}
      {particles.map((p, i) => (
        <Particle key={i} {...p} />
      ))}

      {/* Anneaux orbitaux centrés */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <OrbitalRing
          delay={5}
          radius={120}
          duration={300}
          color="rgba(16,185,129,0.3)"
        />
        <OrbitalRing
          delay={15}
          radius={180}
          duration={400}
          color="rgba(14,165,233,0.2)"
        />
        <OrbitalRing
          delay={25}
          radius={240}
          duration={500}
          color="rgba(245,158,11,0.15)"
        />
      </div>

      {/* Contenu principal centré */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Logo "A" animé */}
        <Sequence from={0}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {(() => {
              const logoSpring = spring({
                frame,
                fps,
                config: { damping: 15, stiffness: 80 },
              });
              const logoScale = interpolate(logoSpring, [0, 1], [0, 1]);
              const logoRotate = interpolate(logoSpring, [0, 1], [-180, 0]);
              const glowIntensity = interpolate(
                Math.sin(frame * 0.05),
                [-1, 1],
                [20, 40],
              );
              return (
                <div
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 24,
                    background: "linear-gradient(135deg, #059669, #0ea5e9)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: `scale(${logoScale}) rotate(${logoRotate}deg)`,
                    boxShadow: `0 0 ${glowIntensity}px rgba(5,150,105,0.6)`,
                    marginBottom: 30,
                  }}
                >
                  <span
                    style={{
                      fontSize: 52,
                      fontWeight: 800,
                      color: "#fff",
                      fontFamily: "Outfit, sans-serif",
                    }}
                  >
                    A
                  </span>
                </div>
              );
            })()}
          </div>
        </Sequence>

        {/* Titre */}
        <Sequence from={15}>
          <div style={{ textAlign: "center" }}>
            <AnimatedText
              text="AcademiX"
              startFrame={15}
              style={{
                fontSize: 64,
                fontWeight: 800,
                fontFamily: "Outfit, sans-serif",
                background: "linear-gradient(90deg, #10b981, #0ea5e9, #f59e0b)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: -1,
              }}
            />
          </div>
        </Sequence>

        {/* Sous-titre */}
        <Sequence from={40}>
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <AnimatedText
              text="L'assistant académique propulsé par l'IA"
              startFrame={40}
              style={{
                fontSize: 22,
                color: "rgba(255,255,255,0.7)",
                fontFamily: "Manrope, sans-serif",
                fontWeight: 500,
              }}
            />
          </div>
        </Sequence>
      </AbsoluteFill>

      {/* Feature pills flottants */}
      <Sequence from={70}>
        <FeaturePill icon="🧠" text="IA Générative" delay={70} x={18} y={30} />
        <FeaturePill icon="📅" text="Organisation" delay={78} x={78} y={25} />
        <FeaturePill icon="🤝" text="Collaboration" delay={86} x={20} y={72} />
        <FeaturePill icon="📊" text="Analytics" delay={94} x={76} y={75} />
        <FeaturePill icon="🎙️" text="Podcasts IA" delay={102} x={50} y={88} />
      </Sequence>
    </AbsoluteFill>
  );
};

/* Métadonnées pour Remotion */
export const academixIntroConfig = {
  id: "AcademixIntro",
  component: AcademixIntro,
  durationInFrames: 150,
  fps: 30,
  width: 1280,
  height: 720,
};
