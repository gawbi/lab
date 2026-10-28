import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { identity } from "../data";
import { scrollToId } from "../lib/smooth";
import type { LabScene } from "../robot/scene";
import { ArrowDown, GitHub } from "./Icons";
import { EASE_OUT, RevealLines } from "./Reveal";
import "../styles/hero.css";

const enter = (delay: number) => ({
  initial: { opacity: 0, transform: "translateY(10px)" },
  animate: { opacity: 1, transform: "translateY(0px)" },
  transition: { duration: 0.8, ease: EASE_OUT, delay },
});

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const glRef = useRef<HTMLCanvasElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);
  const beamTextRef = useRef<HTMLSpanElement>(null);
  const hitRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLSpanElement>(null);
  const modeRef = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");

  const { scrollYProgress: p } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const copyOpacity = useTransform(p, [0, 0.3, 0.55], [1, 1, 0]);
  const copyY = useTransform(p, [0, 0.55], ["0px", "-72px"]);
  const copyEvents = useTransform(p, (v) => (v < 0.45 ? "auto" : "none"));
  const beamOpacity = useTransform(p, [0, 0.6, 0.8], [1, 1, 0]);
  const veil = useTransform(p, [0.72, 1], [0, 0.94]);

  useEffect(() => {
    const canvas = glRef.current;
    if (!canvas) return;
    let scene: LabScene | null = null;
    let cancelled = false;
    let lastMode = "";

    import("../robot/scene")
      .then(({ createLabScene }) =>
        createLabScene(canvas, {
          getProgress: () => p.get(),
          reduceMotion: !!reduce,
          onFrame: ({ frame, frames, scanX, hit, auto }) => {
            if (beamRef.current) beamRef.current.style.transform = `translate3d(${scanX.toFixed(1)}px,0,0)`;
            if (beamTextRef.current) {
              beamTextRef.current.textContent = hit
                ? `${hit.joint} ${hit.deg >= 0 ? "+" : "−"}${Math.abs(hit.deg).toFixed(1)}°`
                : "NO CONTACT";
            }
            const el = hitRef.current;
            if (el) {
              el.style.opacity = hit ? "1" : "0";
              if (hit) el.style.transform = `translate3d(${hit.x.toFixed(1)}px, ${hit.y.toFixed(1)}px, 0)`;
            }
            if (frameRef.current) frameRef.current.textContent = `${String(frame).padStart(3, "0")}/${frames}`;
            const mode = auto ? "AUTO SWEEP" : "CURSOR";
            if (mode !== lastMode && modeRef.current) {
              lastMode = mode;
              modeRef.current.textContent = mode;
            }
          },
        }),
      )
      .then((s) => {
        if (cancelled) return s.dispose();
        scene = s;
        setStatus("ready");
      })
      .catch(() => !cancelled && setStatus("failed"));

    return () => {
      cancelled = true;
      scene?.dispose();
    };
  }, [p, reduce]);

  return (
    <section className="hx" id="hero" ref={sectionRef}>
      <div className="hx-sticky" data-status={status}>
        <canvas className="hx-gl" ref={glRef} aria-label="MuJoCo에서 기록한 Open Duck Mini v2 보행 롤아웃을 센서 빔이 훑는 3D 장면" />

        <motion.div className="hx-beam" ref={beamRef} style={{ opacity: beamOpacity }} aria-hidden>
          <span className="hx-beam-tag mono">
            SCAN · <span ref={beamTextRef}>—</span>
          </span>
        </motion.div>
        <div className="hx-hit" ref={hitRef} aria-hidden>
          <i />
        </div>

        <motion.div className="hx-copy container" style={{ opacity: copyOpacity, y: copyY, pointerEvents: copyEvents }}>
          <motion.div className="hx-id" {...enter(0.05)}>
            <i className="led" />
            <span className="mono">{identity.handle}</span>
            <span className="hx-id-sep" />
            <span>{identity.name}</span>
            <span className="label">Robotics · AI engineering</span>
          </motion.div>

          <h1 className="hx-title">
            <span className="sr-only">
              {identity.handle} {identity.name} —{" "}
            </span>
            <RevealLines immediate delay={0.15} stagger={0.1} lines={[identity.tagline[0], <em>{identity.tagline[1]}</em>]} />
          </h1>

          <motion.p className="hx-intro" {...enter(0.45)}>
            {identity.intro}
          </motion.p>

          <motion.ul className="hx-focus" {...enter(0.55)} aria-label="관심 분야">
            {identity.focus.map((f, i) => (
              <li key={f}>
                <span className="mono">0{i + 1}</span>
                {f}
              </li>
            ))}
          </motion.ul>

          <motion.div className="hx-cta" {...enter(0.65)}>
            <button className="btn btn--lime" onClick={() => scrollToId("systems")}>
              시스템 보기 <ArrowDown />
            </button>
            <a className="btn btn--line" href={identity.github} target="_blank" rel="noreferrer">
              <GitHub /> gawbi
            </a>
          </motion.div>
        </motion.div>

        <div className="hx-hud mono" aria-hidden>
          <span>OPEN DUCK MINI V2 · ROLLOUT REPLAY · APACHE-2.0</span>
          <span>
            SENSOR <span ref={modeRef}>AUTO SWEEP</span>
          </span>
          <span>
            FRAME <span ref={frameRef} className="tabular">000/146</span> · 30 FPS · 0.096 M/S
          </span>
        </div>

        <span className="hx-corner tl" />
        <span className="hx-corner tr" />
        <span className="hx-corner bl" />
        <span className="hx-corner br" />
        {status === "loading" ? <div className="hx-loading mono">LOADING ROBOT · MUJOCO ROLLOUT</div> : null}
        <motion.div className="hx-veil" style={{ opacity: veil }} />
      </div>
    </section>
  );
}
