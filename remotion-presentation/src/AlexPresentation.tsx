import React, { useLayoutEffect, useState } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
  continueRender,
  delayRender,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Outfit";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

const outfit = loadFont("normal", {
  weights: ["700", "800", "900"],
  subsets: ["latin"],
});
const inter = loadInter("normal", {
  weights: ["400", "600", "700"],
  subsets: ["latin"],
});

/** Alineado con style.css del portafolio (--bg-primary, --text-*, neón) */
const COLORS = {
  bg: "#ffffff",
  bgSecondary: "#f8f8f8",
  text: "#0a0a0a",
  muted: "#444444",
  faint: "#888888",
  cyan: "#00ffff",
  green: "#39ff14",
  rail: "rgba(0, 0, 0, 0.06)",
};

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const Grain: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      opacity: 0.035,
      pointerEvents: "none",
      backgroundImage: GRAIN,
      backgroundSize: "200px",
      zIndex: 4,
    }}
  />
);

const AmbientBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const a = Math.sin(t * 0.55) * 0.5 + 0.5;
  const b = Math.cos(t * 0.4) * 0.5 + 0.5;
  return (
    <AbsoluteFill style={{ zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 120% 80% at ${20 + b * 15}% ${15 + a * 10}%, rgba(0,255,255,0.06) 0%, transparent 52%),
            radial-gradient(ellipse 100% 70% at ${85 - a * 10}% ${75 + b * 8}%, rgba(57,255,20,0.05) 0%, transparent 48%),
            linear-gradient(180deg, ${COLORS.bg} 0%, ${COLORS.bgSecondary} 42%, ${COLORS.bg} 100%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "55vw",
          height: "55vw",
          left: `${-10 + Math.sin(t * 0.3) * 6}%`,
          top: `${-15 + Math.cos(t * 0.25) * 5}%`,
          background: "radial-gradient(circle, rgba(0,255,255,0.055) 0%, transparent 62%)",
          filter: "blur(80px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "45vw",
          height: "45vw",
          right: `${-8 + Math.cos(t * 0.35) * 5}%`,
          bottom: `${-10 + Math.sin(t * 0.28) * 6}%`,
          background: "radial-gradient(circle, rgba(57,255,20,0.045) 0%, transparent 60%)",
          filter: "blur(72px)",
        }}
      />
    </AbsoluteFill>
  );
};

const GridOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = interpolate(Math.sin(frame / 20), [-1, 1], [0.02, 0.055]);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
        opacity: pulse,
        backgroundImage: `
          linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)
        `,
        backgroundSize: "64px 64px",
        maskImage: "radial-gradient(ellipse 88% 78% at 50% 45%, black 18%, transparent 75%)",
      }}
    />
  );
};

const PARTICLE_SEEDS = [0.12, 0.34, 0.56, 0.78, 0.23, 0.67, 0.45, 0.89, 0.05, 0.91, 0.38, 0.62, 0.17, 0.84, 0.29, 0.73, 0.51, 0.96, 0.08, 0.44];

const ParticleField: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ zIndex: 2, pointerEvents: "none", overflow: "hidden" }}>
      {PARTICLE_SEEDS.map((seed, i) => {
        const x = (Math.sin(seed * 999 + t * 0.7 + i) * 0.5 + 0.5) * 92 + 4;
        const y = (Math.cos(seed * 777 + t * 0.55 + i * 0.3) * 0.5 + 0.5) * 88 + 6;
        const s = 1 + Math.sin(t * 2 + i) * 0.35;
        const op = 0.06 + Math.sin(t * 1.5 + seed * 10) * 0.05;
        const hue = i % 2 === 0 ? COLORS.cyan : COLORS.green;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: 3 * s,
              height: 3 * s,
              borderRadius: "50%",
              background: hue,
              opacity: op,
              boxShadow: `0 0 ${6 + i * 0.3}px ${hue}`,
              transform: `translate(-50%, -50%) scale(${s})`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Scanlines: React.FC = () => {
  const frame = useCurrentFrame();
  const y = (frame * 7) % 1080;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 3,
        pointerEvents: "none",
        opacity: 0.018,
        background: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(0,0,0,0.12) 2px,
          rgba(0,0,0,0.12) 4px
        )`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: 2,
          top: y,
          background: "linear-gradient(90deg, transparent, rgba(0,255,255,0.2), transparent)",
          opacity: 0.45,
        }}
      />
    </div>
  );
};

const HudCorners: React.FC = () => {
  const frame = useCurrentFrame();
  const glow = 0.38 + Math.sin(frame / 8) * 0.12;
  const glowG = 0.32 + Math.sin(frame / 11 + 1) * 0.1;
  const s = 52;
  const common: React.CSSProperties = {
    position: "absolute",
    width: s,
    height: s,
    zIndex: 6,
    pointerEvents: "none",
  };
  return (
    <>
      <div
        style={{
          ...common,
          top: 40,
          left: 48,
          borderLeft: `2px solid rgba(0,255,255,${glow})`,
          borderTop: `2px solid rgba(0,255,255,${glow})`,
          boxShadow: `-1px -1px 12px rgba(0,255,255,${glow * 0.25})`,
        }}
      />
      <div
        style={{
          ...common,
          top: 40,
          right: 48,
          borderRight: `2px solid rgba(0,255,255,${glow})`,
          borderTop: `2px solid rgba(0,255,255,${glow})`,
          boxShadow: `1px -1px 12px rgba(0,255,255,${glow * 0.25})`,
        }}
      />
      <div
        style={{
          ...common,
          bottom: 48,
          left: 48,
          borderLeft: `2px solid rgba(57,255,20,${glowG})`,
          borderBottom: `2px solid rgba(57,255,20,${glowG})`,
          boxShadow: `-1px 1px 10px rgba(57,255,20,${glowG * 0.28})`,
        }}
      />
      <div
        style={{
          ...common,
          bottom: 48,
          right: 48,
          borderRight: `2px solid rgba(57,255,20,${glowG})`,
          borderBottom: `2px solid rgba(57,255,20,${glowG})`,
          boxShadow: `1px 1px 10px rgba(57,255,20,${glowG * 0.28})`,
        }}
      />
    </>
  );
};

const ProgressRail: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = durationInFrames > 1 ? frame / (durationInFrames - 1) : 0;
  const shimmer = Math.sin(frame / 6) * 4 + 8;
  return (
    <div
      style={{
        position: "absolute",
        left: 32,
        top: "16%",
        width: 3,
        height: "68%",
        background: COLORS.rail,
        borderRadius: 2,
        zIndex: 7,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: -0.5,
          width: 4,
          height: `${Math.min(1, t) * 100}%`,
          background: COLORS.cyan,
          borderRadius: 2,
          boxShadow: `0 0 ${shimmer}px rgba(0,255,255,0.45), 0 0 ${shimmer * 0.45}px rgba(57,255,20,0.25)`,
        }}
      />
    </div>
  );
};

type SlideProps = {
  fontHeading: string;
  fontBody: string;
};

const INTRO_CHARS = "ALEX ANDRADE".split("");

const SlideIntro: React.FC<SlideProps> = ({ fontHeading, fontBody }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const glitchPhase = frame >= 10 && frame <= 18;
  const glitchX = glitchPhase ? Math.round(Math.sin(frame * 2.1) * 5) : 0;
  const glitchOp = glitchPhase ? 0.85 + Math.sin(frame * 3) * 0.15 : 1;

  const lineW = interpolate(
    spring({ frame: Math.max(0, frame - 6), fps, config: { damping: 16, stiffness: 140 } }),
    [0, 1],
    [0, 1],
  );
  const subOp = interpolate(frame, [18, 38], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const tagsOp = interpolate(frame, [34, 54], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const titleShadow = `${glitchX}px 0 0 rgba(0,255,255,0.35), ${-glitchX}px 0 0 rgba(255,0,170,0.18), 0 0 48px rgba(0,255,255,0.12), 0 1px 0 rgba(0,0,0,0.04)`;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: "0 10%",
        zIndex: 10,
      }}
    >
      <div
        style={{
          textAlign: "center",
          opacity: glitchOp,
          transform: `translateX(${glitchX * 0.4}px)`,
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 10,
            marginBottom: 8,
          }}
        >
          {INTRO_CHARS.map((char, i) => {
            if (char === " ") {
              return <span key={`sp-${i}`} style={{ width: 20 }} />;
            }
            const delay = i * 2;
            const sf = spring({
              frame: Math.max(0, frame - delay),
              fps,
              config: { damping: 14, stiffness: 160 },
            });
            const y = interpolate(sf, [0, 1], [72, 0]);
            const rot = interpolate(sf, [0, 1], [14, 0]);
            const op = interpolate(sf, [0, 0.4], [0, 1], { extrapolateRight: "clamp" });
            return (
              <span
                key={`${char}-${i}`}
                style={{
                  display: "inline-block",
                  fontFamily: fontHeading,
                  fontWeight: 900,
                  fontSize: 112,
                  letterSpacing: "-0.04em",
                  color: COLORS.text,
                  textShadow: titleShadow,
                  transform: `translateY(${y}px) rotateZ(${rot}deg)`,
                  opacity: op,
                }}
              >
                {char}
              </span>
            );
          })}
        </div>

        <div
          style={{
            margin: "24px auto 0",
            height: 5,
            width: `${lineW * 48}%`,
            maxWidth: 560,
            borderRadius: 4,
            background: "linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #8B00FF)",
            boxShadow: "0 0 18px rgba(0,255,255,0.28)",
            opacity: interpolate(frame, [6, 22], [0, 1], { extrapolateRight: "clamp" }),
          }}
        />
        <p
          style={{
            fontFamily: fontBody,
            fontWeight: 700,
            fontSize: 38,
            background: `linear-gradient(90deg, ${COLORS.cyan}, ${COLORS.text})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginTop: 36,
            opacity: subOp,
          }}
        >
          Diseñador multimedia
        </p>
        <p
          style={{
            fontFamily: fontBody,
            fontSize: 24,
            color: COLORS.faint,
            marginTop: 18,
            letterSpacing: "0.06em",
            opacity: tagsOp,
          }}
        >
          Web · Motion · Gráfico · Experiencia socioambiental
        </p>
      </div>
    </AbsoluteFill>
  );
};

const SlideServices: React.FC<SlideProps> = ({ fontHeading, fontBody }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = [
    "Diseño y desarrollo web",
    "Motion graphics & animación",
    "Diseño gráfico editorial",
    "Narrativa visual y experiencia de usuario",
  ];
  const titleS = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 130 },
  });
  const titleSkew = interpolate(titleS, [0, 1], [8, 0]);
  const titleX = interpolate(titleS, [0, 1], [-80, 0]);
  const titleOp = interpolate(titleS, [0, 0.5], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ padding: "9% 12% 9% 16%", zIndex: 10 }}>
      <h2
        style={{
          fontFamily: fontHeading,
          fontWeight: 900,
          fontSize: 72,
          background: `linear-gradient(135deg, ${COLORS.text}, ${COLORS.cyan})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          margin: 0,
          opacity: titleOp,
          transform: `skewX(${-titleSkew}deg) translateX(${titleX}px)`,
          filter: "drop-shadow(0 2px 20px rgba(0,255,255,0.12))",
        }}
      >
        Lo que hago
      </h2>
      <div
        style={{
          marginTop: 40,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {items.map((text, i) => {
          const stagger = i * 9;
          const local = Math.max(0, frame - 14 - stagger);
          const spr = spring({
            frame: local,
            fps,
            config: { damping: 15, stiffness: 155 },
          });
          const op = interpolate(spr, [0, 0.45], [0, 1], { extrapolateRight: "clamp" });
          const x = interpolate(spr, [0, 1], [120, 0]);
          const rot = interpolate(spr, [0, 1], [4, 0]);
          const borderGlow = 0.25 + Math.sin((frame + i * 8) / 10) * 0.15;
          return (
            <div
              key={text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 22,
                opacity: op,
                transform: `translateX(${x}px) rotateZ(${rot}deg)`,
                padding: "22px 28px",
                borderRadius: 16,
                background: COLORS.bgSecondary,
                border: `1px solid rgba(0, 0, 0, 0.06)`,
                boxShadow: `0 4px 24px rgba(0,0,0,0.06), 0 0 20px rgba(0,255,255,${borderGlow * 0.12}), inset 0 1px 0 rgba(255,255,255,0.9)`,
                backdropFilter: "blur(8px)",
              }}
            >
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 4,
                  background: `linear-gradient(135deg, ${COLORS.cyan}, ${COLORS.green})`,
                  boxShadow: `0 0 12px rgba(0,255,255,0.45), 0 0 6px rgba(57,255,20,0.25)`,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: fontBody,
                  fontWeight: 700,
                  fontSize: 32,
                  color: COLORS.muted,
                }}
              >
                {text}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const SlideFocus: React.FC<SlideProps> = ({ fontHeading, fontBody }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pillars = [
    { t: "Claridad", d: "Mensajes directos, jerarquía visual fuerte." },
    { t: "Movimiento con intención", d: "Animación que guía, no decora." },
    { t: "Sistemas coherentes", d: "Componentes reutilizables y marca consistente." },
  ];
  const head = spring({ frame, fps, config: { damping: 17, stiffness: 125 } });
  const headOp = interpolate(head, [0, 0.5], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ padding: "9% 12% 9% 16%", zIndex: 10 }}>
      <h2
        style={{
          fontFamily: fontHeading,
          fontWeight: 900,
          fontSize: 68,
          color: COLORS.text,
          margin: 0,
          opacity: headOp,
          transform: `perspective(900px) rotateX(${interpolate(head, [0, 1], [18, 0])}deg)`,
          transformOrigin: "50% 0%",
          filter: "drop-shadow(0 2px 16px rgba(0,255,255,0.15))",
        }}
      >
        Enfoque creativo
      </h2>
      <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 24 }}>
        {pillars.map((p, i) => {
          const stagger = i * 11;
          const local = Math.max(0, frame - 12 - stagger);
          const spr = spring({
            frame: local,
            fps,
            config: { damping: 15, stiffness: 140 },
          });
          const op = interpolate(spr, [0, 0.4], [0, 1], { extrapolateRight: "clamp" });
          const y = interpolate(spr, [0, 1], [56, 0]);
          const rx = interpolate(spr, [0, 1], [-14, 0]);
          const num = String(i + 1).padStart(2, "0");
          const accent = i % 2 === 0 ? COLORS.cyan : COLORS.green;
          return (
            <div
              key={p.t}
              style={{
                opacity: op,
                transform: `translateY(${y}px) perspective(800px) rotateX(${rx}deg)`,
                display: "flex",
                gap: 28,
                alignItems: "flex-start",
                padding: "24px 28px",
                borderRadius: 18,
                background: COLORS.bg,
                border: `1px solid rgba(0,0,0,0.06)`,
                boxShadow: `0 8px 32px rgba(0,0,0,0.06), 0 0 0 1px ${accent}22, 0 0 28px ${accent}18`,
              }}
            >
              <span
                style={{
                  fontFamily: fontHeading,
                  fontWeight: 900,
                  fontSize: 52,
                  lineHeight: 1,
                  color: "transparent",
                  WebkitTextStroke: `2px ${accent}`,
                  opacity: 0.95,
                  flexShrink: 0,
                  filter: `drop-shadow(0 0 12px ${accent})`,
                }}
              >
                {num}
              </span>
              <div>
                <div
                  style={{
                    fontFamily: fontHeading,
                    fontWeight: 800,
                    fontSize: 36,
                    color: COLORS.text,
                  }}
                >
                  {p.t}
                </div>
                <div
                  style={{
                    fontFamily: fontBody,
                    fontSize: 24,
                    color: COLORS.muted,
                    marginTop: 8,
                    maxWidth: "88%",
                    lineHeight: 1.45,
                  }}
                >
                  {p.d}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const SlideContact: React.FC<SlideProps> = ({ fontHeading, fontBody }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rows = [
    { label: "GitHub", value: "github.com/Alexandrade-s-o" },
    { label: "LinkedIn", value: "linkedin.com/in/alex-andrade-47b95236b" },
    { label: "Email", value: "alexanher9@gmail.com" },
  ];
  const head = spring({ frame, fps, config: { damping: 18, stiffness: 120 } });
  const deg = frame * 2.2;

  return (
    <AbsoluteFill style={{ padding: "9% 12% 9% 16%", zIndex: 10 }}>
      <h2
        style={{
          fontFamily: fontHeading,
          fontWeight: 900,
          fontSize: 68,
          margin: 0,
          opacity: interpolate(head, [0, 0.55], [0, 1], { extrapolateRight: "clamp" }),
          background: `linear-gradient(${deg}deg, ${COLORS.cyan}, ${COLORS.green}, ${COLORS.text})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Contacto
      </h2>
      <div style={{ marginTop: 44, display: "flex", flexDirection: "column", gap: 22 }}>
        {rows.map((row, i) => {
          const stagger = i * 9;
          const local = Math.max(0, frame - 14 - stagger);
          const spr = spring({ frame: local, fps, config: { damping: 14, stiffness: 150 } });
          const op = interpolate(spr, [0, 0.42], [0, 1], { extrapolateRight: "clamp" });
          const sx = interpolate(spr, [0, 1], [0.92, 1]);
          return (
            <div
              key={row.label}
              style={{
                opacity: op,
                transform: `scale(${sx})`,
                padding: "22px 26px",
                borderRadius: 14,
                position: "relative",
                background: COLORS.bgSecondary,
                border: `1px solid rgba(0,0,0,0.06)`,
                boxShadow: `0 10px 36px rgba(0,0,0,0.07), 0 0 20px rgba(0,255,255,${0.06 + i * 0.03})`,
              }}
            >
              <span
                style={{
                  fontFamily: fontBody,
                  fontSize: 20,
                  color: COLORS.faint,
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                }}
              >
                {row.label}
              </span>
              <span
                style={{
                  fontFamily: fontBody,
                  fontWeight: 700,
                  fontSize: 30,
                  color: COLORS.text,
                  display: "block",
                  marginTop: 10,
                }}
              >
                {row.value}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const SlideOutro: React.FC<SlideProps> = ({ fontHeading, fontBody }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pulse = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 110 },
  });
  const scale = interpolate(pulse, [0, 1], [0.88, 1]);
  const op = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const subOp = interpolate(frame, [18, 36], [0, 1], { extrapolateRight: "clamp" });
  const ringAnim = (delay: number) => {
    const s = spring({
      frame: Math.max(0, frame - delay),
      fps,
      config: { damping: 20, stiffness: 90 },
    });
    const sc = interpolate(s, [0, 1], [0.2, 1]);
    const o = interpolate(s, [0, 0.3], [0, 0.5], { extrapolateRight: "clamp" });
    return { sc, o };
  };

  const rings = [0, 12, 24].map((d, i) => ({ ...ringAnim(d), i }));

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: "0 12%",
        zIndex: 10,
      }}
    >
      {rings.map(({ sc, o, i }) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 420 + i * 180,
            height: 420 + i * 180,
            borderRadius: "50%",
            border: `2px solid rgba(0,255,255,${0.2 + i * 0.05})`,
            transform: `scale(${sc})`,
            opacity: o * (0.35 - i * 0.08),
            boxShadow: `0 0 40px rgba(57,255,20,${0.06 + i * 0.03})`,
          }}
        />
      ))}
      <div style={{ textAlign: "center", transform: `scale(${scale})`, position: "relative" }}>
        <h2
          style={{
            fontFamily: fontHeading,
            fontWeight: 900,
            fontSize: 108,
            margin: 0,
            opacity: op,
            background: `linear-gradient(120deg, ${COLORS.text}, ${COLORS.cyan}, ${COLORS.green})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 2px 24px rgba(0,255,255,0.2))",
          }}
        >
          Gracias
        </h2>
        <p
          style={{
            fontFamily: fontBody,
            fontSize: 34,
            color: COLORS.muted,
            marginTop: 28,
            opacity: subOp,
            letterSpacing: "0.04em",
          }}
        >
          Portafolio — Alex Andrade
        </p>
      </div>
    </AbsoluteFill>
  );
};

export const DURATION_FRAMES = 495;

export const AlexPresentation: React.FC = () => {
  const [handle] = useState(() => delayRender());

  useLayoutEffect(() => {
    void Promise.all([outfit.waitUntilDone(), inter.waitUntilDone()]).then(() => {
      continueRender(handle);
    });
  }, [handle]);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, color: COLORS.text }}>
      <AmbientBackground />
      <GridOverlay />
      <ParticleField />
      <Scanlines />
      <Grain />
      <HudCorners />
      <ProgressRail />

      <AbsoluteFill style={{ zIndex: 10 }}>
        <Sequence durationInFrames={90}>
          <SlideIntro fontHeading={outfit.fontFamily} fontBody={inter.fontFamily} />
        </Sequence>
        <Sequence from={90} durationInFrames={105}>
          <SlideServices fontHeading={outfit.fontFamily} fontBody={inter.fontFamily} />
        </Sequence>
        <Sequence from={195} durationInFrames={105}>
          <SlideFocus fontHeading={outfit.fontFamily} fontBody={inter.fontFamily} />
        </Sequence>
        <Sequence from={300} durationInFrames={105}>
          <SlideContact fontHeading={outfit.fontFamily} fontBody={inter.fontFamily} />
        </Sequence>
        <Sequence from={405} durationInFrames={90}>
          <SlideOutro fontHeading={outfit.fontFamily} fontBody={inter.fontFamily} />
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
