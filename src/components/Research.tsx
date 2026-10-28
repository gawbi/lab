import { Fragment } from "react";
import { motion } from "motion/react";
import { research, type Source } from "../data";
import { LoopVideo } from "./Media";
import { FadeUp, grow, inViewOnce } from "./Reveal";
import { SOURCE_HELP, SourceBadge, StatusChip } from "./Status";
import { TelemetryChart } from "./TelemetryChart";
import "../styles/research.css";

const SOURCES: Source[] = ["SIM", "ROLLOUT", "BENCH", "DATASET", "REAL"];

export function Research() {
  const { rollout, ablation, curves, videos, hypotheses, failures } = research;
  return (
    <section className="section research" id="research">
      <div className="container">
        <header className="sec-head">
          <span className="sec-n">03</span>
          <h2 className="sec-title">
            Research Log
            <small>실험 기록입니다. 모든 그래프와 수치에 데이터 출처를 붙였습니다. 실물 로봇 측정(REAL)은 아직 없습니다.</small>
          </h2>
          <dl className="src-legend">
            {SOURCES.map((s) => (
              <div key={s}>
                <dt>
                  <SourceBadge src={s} />
                </dt>
                <dd>{SOURCE_HELP[s]}</dd>
              </div>
            ))}
          </dl>
        </header>

        {/* R-01 telemetry */}
        <FadeUp className="rpanel frame marks">
          <div className="frame-head">
            <span>R-01 · {rollout.title}</span>
            <SourceBadge src="ROLLOUT" />
          </div>
          <div className="rpanel-body">
            <TelemetryChart url={rollout.url} />
            <p className="rnote">{rollout.note}</p>
          </div>
        </FadeUp>

        <div className="rgrid">
          {/* R-02 ablation */}
          <FadeUp className="rpanel frame">
            <div className="frame-head">
              <span>R-02 · {ablation.title}</span>
              <SourceBadge src="SIM" />
            </div>
            <div className="rpanel-body">
              <p className="rsetup mono">{ablation.setup}</p>
              <div className="abl-legend mono">
                <span>
                  <i className="dot dot-a" /> 실험 0 · 기본
                </span>
                <span>
                  <i className="dot dot-b" /> 실험 1 · feet_air_time = 0
                </span>
              </div>
              <div className="abl">
                {ablation.rows.map((r, i) => {
                  const max = Math.max(r.a[0] + r.a[1], r.b[0] + r.b[1]) * 1.18;
                  const fmt = (v: number) => (r.unit === "%" ? `${v.toFixed(2)}%` : v < 0.1 ? v.toFixed(4) : v.toFixed(3));
                  return (
                    <motion.div className="abl-row" key={r.key} {...inViewOnce}>
                      <div className="abl-name">
                        <b>{r.label}</b>
                        <code className="mono">{r.key}</code>
                      </div>
                      {(["a", "b"] as const).map((k, j) => {
                        const [v, sd] = r[k];
                        return (
                          <Fragment key={k}>
                            <div className="abl-track" data-k={k} data-flag={(k === "b" && r.flag) || undefined} style={{ gridRow: j + 1 }}>
                              <motion.span className="abl-bar" variants={grow} custom={{ to: v / max, delay: 0.1 + i * 0.06 + j * 0.08 }} />
                              <span
                                className="abl-err"
                                style={{ left: `${((v - sd) / max) * 100}%`, width: `${((2 * sd) / max) * 100}%` }}
                                title={`± ${sd}`}
                              />
                            </div>
                            <span className="abl-v mono tabular" data-flag={(k === "b" && r.flag) || undefined} style={{ gridRow: j + 1 }}>
                              {fmt(v)} <small>± {fmt(sd)}</small>
                            </span>
                          </Fragment>
                        );
                      })}
                      <span className="abl-flag mono" data-on={!!r.flag}>
                        {r.flag ?? "≈"}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
              <p className="rnote">{ablation.caveat}</p>

              <div className="seeds">
                <span className="label">seed 반복</span>
                <div className="seed-grid">
                  {ablation.seeds.map((s) => (
                    <div className="seed" key={s.seed} data-s={s.status}>
                      <span className="mono">seed {s.seed}</span>
                      <span className="seed-cells">
                        <i title="실험 0" />
                        <i title="실험 1" />
                      </span>
                      <StatusChip s={s.status} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeUp>

          {/* R-03 learning curves */}
          <FadeUp className="rpanel frame" delay={0.08}>
            <div className="frame-head">
              <span>R-03 · {curves.title}</span>
              <SourceBadge src="SIM" />
            </div>
            <div className="rpanel-body">
              <figure className="printout">
                <img src={curves.src} alt="G1 평지 보행 실험 0과 실험 1의 학습 곡선 원본 그래프" loading="lazy" />
                <figcaption className="mono">{curves.origin}</figcaption>
              </figure>
              <p className="rnote">{curves.note}</p>
            </div>
          </FadeUp>
        </div>

        {/* R-04 feeds */}
        <FadeUp className="rpanel frame">
          <div className="frame-head">
            <span>R-04 · 실험 영상 피드</span>
            <span className="mono">3 CHANNELS</span>
          </div>
          <div className="rpanel-body feeds">
            {videos.map((v, i) => (
              <figure className="feed" key={v.src} data-vertical={v.vertical || undefined}>
                <div className="feed-screen">
                  <LoopVideo src={v.src} poster={v.poster} label={v.label} />
                  <span className="feed-tag mono">
                    CH{i + 1} · <SourceBadge src={v.source} />
                  </span>
                  {v.credit ? <span className="feed-credit">{v.credit}</span> : null}
                </div>
                <figcaption>{v.label}</figcaption>
              </figure>
            ))}
            <figure className="feed">
              <div className="feed-screen feed-nosignal" aria-label="실물 실험 영상 없음">
                <span className="feed-tag mono">
                  CH3 · <SourceBadge src="REAL" />
                </span>
                <b className="mono">NO SIGNAL</b>
                <small>실물 실험 영상은 아직 없습니다</small>
              </div>
              <figcaption>상상부기 실물 제작 후 추가 (캡스톤 다음 학기)</figcaption>
            </figure>
          </div>
        </FadeUp>

        <div className="rgrid">
          {/* R-05 hypotheses */}
          <FadeUp className="rpanel frame">
            <div className="frame-head">
              <span>R-05 · 다음 실험 가설</span>
              <span className="mono">예측 → 하나만 바꾸기 → 기록</span>
            </div>
            <ol className="hyp rpanel-body">
              {hypotheses.map((h) => (
                <li key={h.id}>
                  <div className="hyp-top">
                    <span className="mono hyp-id">{h.id}</span>
                    <b>{h.change}</b>
                    <StatusChip s="PLANNED" />
                  </div>
                  <p>
                    <span className="mono">예측</span>
                    {h.predict}
                  </p>
                  <p className="dim">
                    <span className="mono">측정</span>
                    {h.measure}
                  </p>
                </li>
              ))}
            </ol>
          </FadeUp>

          {/* R-06 failure log */}
          <FadeUp className="rpanel frame" delay={0.08}>
            <div className="frame-head">
              <span>R-06 · 실패 기록</span>
              <span className="mono">{failures.length} ENTRIES</span>
            </div>
            <ol className="fail rpanel-body">
              {failures.map((f) => (
                <li key={f.id}>
                  <div className="fail-top">
                    <span className="mono fail-id">{f.id}</span>
                    <span className="fail-sys">{f.system}</span>
                    {"source" in f && f.source ? <SourceBadge src={f.source} /> : null}
                    <span className="fail-state mono" data-state={f.state}>
                      {f.state}
                    </span>
                  </div>
                  <p className="fail-what">{f.what}</p>
                  <dl>
                    <dt className="mono">원인</dt>
                    <dd>{f.why}</dd>
                    <dt className="mono">조치</dt>
                    <dd>{f.fix}</dd>
                  </dl>
                </li>
              ))}
            </ol>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
