import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { motion } from "motion/react";
import { inViewOnce } from "./Reveal";

type Rollout = {
  t: number[];
  joints: Record<string, number[]>;
  baseZ: number[];
  tilt: number[];
  phases: { until: number; label: string; cmd: string }[];
  movedCm: number;
  maxTilt: number;
};

const CHANNELS = [
  { key: "right_knee", label: "R_KNEE", color: "var(--lime)" },
  { key: "left_knee", label: "L_KNEE", color: "rgba(184, 227, 92, 0.42)" },
  { key: "right_hip_pitch", label: "R_HIP_PITCH", color: "#8fb0e8" },
  { key: "right_ankle", label: "R_ANKLE", color: "var(--amber)" },
];

const VW = 1000;
const VH = 260;

const draw = {
  hidden: { pathLength: 0 },
  shown: (i: number) => ({ pathLength: 1, transition: { duration: 1.6, ease: [0.23, 1, 0.32, 1] as const, delay: 0.1 + i * 0.12 } }),
};

export function TelemetryChart({ url }: { url: string }) {
  const [data, setData] = useState<Rollout | null>(null);
  const [on, setOn] = useState<Record<string, boolean>>({ right_knee: true, left_knee: true, right_hip_pitch: true, right_ankle: false });
  const [hover, setHover] = useState<number | null>(null);
  const plotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    fetch(url)
      .then((r) => r.json())
      .then((d: Rollout) => alive && setData(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [url]);

  const geo = useMemo(() => {
    if (!data) return null;
    const all = CHANNELS.flatMap((c) => data.joints[c.key]);
    const lo = Math.floor(Math.min(...all) / 10) * 10;
    const hi = Math.ceil(Math.max(...all) / 10) * 10;
    const T = data.t[data.t.length - 1];
    const x = (t: number) => (t / T) * VW;
    const y = (v: number) => VH - ((v - lo) / (hi - lo)) * VH;
    const paths = Object.fromEntries(
      CHANNELS.map((c) => [c.key, data.joints[c.key].map((v, i) => `${i ? "L" : "M"}${x(data.t[i]).toFixed(1)},${y(v).toFixed(1)}`).join("")]),
    );
    const ticks = [];
    for (let v = lo; v <= hi; v += (hi - lo) / 4) ticks.push(Math.round(v));
    return { lo, hi, T, x, y, paths, ticks };
  }, [data]);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!data || !plotRef.current) return;
    const r = plotRef.current.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    setHover(Math.round(f * (data.t.length - 1)));
  };

  if (!data || !geo) return <div className="tele tele--loading mono">LOADING ROLLOUT…</div>;

  let prev = 0;
  const bands = data.phases.map((ph) => {
    const b = { from: prev, to: ph.until, ...ph };
    prev = ph.until;
    return b;
  });

  return (
    <div className="tele">
      <div className="tele-legend" role="group" aria-label="채널">
        {CHANNELS.map((c) => (
          <button key={c.key} aria-pressed={on[c.key]} onClick={() => setOn((o) => ({ ...o, [c.key]: !o[c.key] }))}>
            <i style={{ background: c.color }} />
            {c.label}
          </button>
        ))}
        <span className="tele-unit mono">deg</span>
      </div>

      <div className="tele-plot" ref={plotRef} onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
        <div className="tele-bands" aria-hidden>
          {bands.map((b, i) => (
            <span
              key={i}
              data-move={b.cmd !== "0" || undefined}
              style={{ left: `${(b.from / geo.T) * 100}%`, width: `${((b.to - b.from) / geo.T) * 100}%` }}
            >
              <em className="mono">
                {b.label}
                <small>{b.cmd === "0" ? "cmd 0" : b.cmd}</small>
              </em>
            </span>
          ))}
        </div>

        <div className="tele-yaxis mono" aria-hidden>
          {geo.ticks.map((v) => (
            <span key={v} style={{ top: `${(geo.y(v) / VH) * 100}%` }}>
              {v}°
            </span>
          ))}
        </div>

        <motion.svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none" className="tele-svg" {...inViewOnce} aria-label="관절 각도 시계열">
          {geo.ticks.map((v) => (
            <line key={v} x1="0" x2={VW} y1={geo.y(v)} y2={geo.y(v)} className="tele-grid" />
          ))}
          {CHANNELS.map((c, i) =>
            on[c.key] ? (
              <motion.path key={c.key} d={geo.paths[c.key]} className="tele-line" style={{ stroke: c.color }} variants={draw} custom={i} />
            ) : null,
          )}
          {hover !== null ? <line x1={geo.x(data.t[hover])} x2={geo.x(data.t[hover])} y1="0" y2={VH} className="tele-cursor" /> : null}
        </motion.svg>

        {hover !== null ? (
          <div
            className="tele-readout mono"
            style={{ left: `${(data.t[hover] / geo.T) * 100}%` }}
            data-flip={data.t[hover] / geo.T > 0.7 || undefined}
          >
            <b>t {data.t[hover].toFixed(2)} s</b>
            {CHANNELS.filter((c) => on[c.key]).map((c) => (
              <span key={c.key}>
                <i style={{ background: c.color }} />
                {c.label} {data.joints[c.key][hover].toFixed(1)}°
              </span>
            ))}
            <span className="dim">base z {data.baseZ[hover].toFixed(1)} cm · tilt {data.tilt[hover].toFixed(1)}°</span>
          </div>
        ) : null}
      </div>

      <div className="tele-x mono" aria-hidden>
        {[0, 2, 4, 6, 8, 10, 12].map((s) => (
          <span key={s} style={{ left: `${(s / geo.T) * 100}%` }}>
            {s}s
          </span>
        ))}
      </div>

      <dl className="tele-stats">
        <div>
          <dt className="label">길이</dt>
          <dd className="tabular">
            {data.t[data.t.length - 1].toFixed(1)} s · {data.t.length} frames
          </dd>
        </div>
        <div>
          <dt className="label">이동 거리</dt>
          <dd className="tabular">{data.movedCm} cm</dd>
        </div>
        <div>
          <dt className="label">최대 기울기</dt>
          <dd className="tabular">{data.maxTilt.toFixed(1)}°</dd>
        </div>
        <div>
          <dt className="label">몸통 높이</dt>
          <dd className="tabular">
            {Math.min(...data.baseZ).toFixed(1)}–{Math.max(...data.baseZ).toFixed(1)} cm
          </dd>
        </div>
      </dl>
    </div>
  );
}
