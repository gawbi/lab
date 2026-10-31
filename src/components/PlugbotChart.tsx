import { useState } from "react";
import { motion } from "motion/react";
import { research } from "../data";
import { grow, inViewOnce } from "./Reveal";

const W = 600;
const H = 280;
const PAD = { l: 8, r: 70, t: 14, b: 8 };
const COLORS: Record<string, string> = {
  static: "rgba(255, 255, 255, 0.5)",
  reactive: "var(--amber)",
  predictive: "var(--lime)",
};

const draw = {
  hidden: { pathLength: 0 },
  shown: (i: number) => ({ pathLength: 1, transition: { duration: 1.2, ease: [0.23, 1, 0.32, 1] as const, delay: 0.1 + i * 0.12 } }),
};

const pop = {
  hidden: { opacity: 0 },
  shown: (i: number) => ({ opacity: 1, transition: { duration: 0.3, delay: 0.9 + i * 0.1 } }),
};

export function PlugbotChart() {
  const pb = research.plugbot;
  const [hover, setHover] = useState<number | null>(null);
  const x = (i: number) => PAD.l + (i / (pb.hs.length - 1)) * (W - PAD.l - PAD.r);
  const y = (v: number) => PAD.t + (1 - v / 100) * (H - PAD.t - PAD.b);
  const maxN = 900;

  // keep end-of-line labels apart when two strategies finish close together
  const endY: Record<string, number> = {};
  [...pb.strategies]
    .sort((a, b) => y(a.rate[a.rate.length - 1]) - y(b.rate[b.rate.length - 1]))
    .reduce((prev, s) => {
      const want = y(s.rate[s.rate.length - 1]) + 4;
      endY[s.key] = Math.max(want, prev + 15);
      return endY[s.key];
    }, -Infinity);

  return (
    <div className="pb">
      <div className="pb-chart">
        <div className="pb-legend mono">
          {pb.strategies.map((s) => (
            <span key={s.key}>
              <i style={{ background: COLORS[s.key] }} />
              {s.label}
            </span>
          ))}
        </div>

        <div className="pb-plot" onPointerLeave={() => setHover(null)}>
          <div className="pb-yaxis mono" aria-hidden>
            {[100, 75, 50, 25, 0].map((v) => (
              <span key={v} style={{ top: `${(y(v) / H) * 100}%` }}>
                {v}%
              </span>
            ))}
          </div>
          <motion.svg viewBox={`0 0 ${W} ${H}`} className="pb-svg" {...inViewOnce} aria-label="파고별 삽입 성공률">
            {[0, 25, 50, 75, 100].map((v) => (
              <line key={v} x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} className="pb-grid" />
            ))}
            {hover !== null ? <line x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={H - PAD.b} className="pb-cursor" /> : null}
            {pb.strategies.map((s, si) => (
              <g key={s.key}>
                <motion.path
                  d={s.rate.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join("")}
                  className="pb-line"
                  style={{ stroke: COLORS[s.key] }}
                  variants={draw}
                  custom={si}
                />
                {s.rate.map((v, i) => (
                  <motion.circle key={i} cx={x(i)} cy={y(v)} r={hover === i ? 5 : 3.5} style={{ fill: COLORS[s.key] }} variants={pop} custom={si} />
                ))}
                <motion.text x={x(pb.hs.length - 1) + 10} y={endY[s.key]} className="pb-end mono" style={{ fill: COLORS[s.key] }} variants={pop} custom={si}>
                  {s.rate[s.rate.length - 1]}%
                </motion.text>
              </g>
            ))}
            {pb.hs.map((_, i) => (
              <rect
                key={i}
                x={x(i) - (W - PAD.l - PAD.r) / (pb.hs.length - 1) / 2}
                y={0}
                width={(W - PAD.l - PAD.r) / (pb.hs.length - 1)}
                height={H}
                fill="transparent"
                onPointerEnter={() => setHover(i)}
              />
            ))}
          </motion.svg>
          {hover !== null ? (
            <div className="pb-readout mono" style={{ left: `${(x(hover) / W) * 100}%` }} data-flip={hover >= 3 || undefined}>
              <b>Hs {pb.hs[hover]} cm</b>
              {pb.strategies.map((s) => (
                <span key={s.key}>
                  <i style={{ background: COLORS[s.key] }} />
                  {s.key} {s.rate[hover]}%
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <div className="pb-x mono" aria-hidden>
          {pb.hs.map((h, i) => (
            <span key={h} style={{ left: `${(x(i) / W) * 100}%` }}>
              {h}
            </span>
          ))}
          <em>{pb.scale}</em>
        </div>
      </div>

      <div className="pb-detail">
        <span className="label">Hs 6 cm · 삽입 접촉력 p95 (N)</span>
        <motion.div className="pb-force" {...inViewOnce}>
          {pb.force6.map((f, i) => (
            <div className="pb-force-row" key={f.key}>
              <span className="mono pb-k" style={{ color: COLORS[f.key] }}>
                {f.key}
              </span>
              <span className="pb-force-track">
                <motion.span
                  className="pb-iqr"
                  style={{ left: `${(f.iqr[0] / maxN) * 100}%`, width: `${((f.iqr[1] - f.iqr[0]) / maxN) * 100}%`, background: COLORS[f.key] }}
                  variants={pop}
                  custom={i}
                />
                <motion.span className="pb-med" style={{ left: `${(f.median / maxN) * 100}%` }} variants={pop} custom={i} />
              </span>
              <span className="mono pb-v tabular">{f.median}</span>
            </div>
          ))}
          <div className="pb-force-axis mono">
            <span>0</span>
            <span>450</span>
            <span>900 N</span>
          </div>
        </motion.div>
        <p className="pb-cap">막대 = 사분위 범위, 세로선 = 중앙값</p>

        <span className="label pb-gap">Hs 6 cm · 30회 결과</span>
        <motion.div className="pb-outcomes" {...inViewOnce}>
          {pb.force6.map((f, i) => {
            const failed = f.fails.hull + f.fails.rim + f.fails.timeout;
            const parts = [
              { k: "ok", n: 30 - failed },
              { k: "hull", n: f.fails.hull },
              { k: "rim", n: f.fails.rim },
              { k: "timeout", n: f.fails.timeout },
            ];
            let acc = 0;
            return (
              <div className="pb-out-row" key={f.key}>
                <span className="mono pb-k" style={{ color: COLORS[f.key] }}>
                  {f.key}
                </span>
                <span className="pb-out-track">
                  {parts.map((p) => {
                    const left = acc;
                    acc += p.n;
                    return p.n ? (
                      <motion.span
                        key={p.k}
                        className="pb-out"
                        data-k={p.k}
                        style={{ left: `${(left / 30) * 100}%`, width: `${(p.n / 30) * 100}%` }}
                        variants={grow}
                        custom={{ to: 1, delay: 0.2 + i * 0.1 }}
                      />
                    ) : null;
                  })}
                </span>
                <span className="mono pb-v tabular">{30 - failed}/30</span>
              </div>
            );
          })}
        </motion.div>
        <div className="pb-out-legend mono">
          <span data-k="ok">성공</span>
          <span data-k="hull">선체를 찌름</span>
          <span data-k="rim">그리퍼가 테두리에 닿음</span>
          <span data-k="timeout">시간 초과</span>
        </div>
      </div>
    </div>
  );
}
