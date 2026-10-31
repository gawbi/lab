import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { modules, type Module, type Status } from "../data";
import { lockScroll } from "../lib/smooth";
import { ArrowUpRight, Close, Lock } from "./Icons";
import { LoopVideo } from "./Media";
import { EASE_OUT } from "./Reveal";
import { SourceBadge, StatusChip } from "./Status";
import { ThresholdViz } from "./visuals/Threshold";
import "../styles/systems.css";

type Filter = "ALL" | Status;
const FILTERS: Filter[] = ["ALL", "COMPLETED", "IN PROGRESS", "PLANNED", "PRIVATE"];
const TABS = ["문제", "아키텍처", "실험", "결과", "한계"] as const;
type Tab = (typeof TABS)[number];
const DRAWER = [0.32, 0.72, 0, 1] as const;

function useNarrow() {
  const [narrow, setNarrow] = useState(() => matchMedia("(max-width: 760px)").matches);
  useEffect(() => {
    const mq = matchMedia("(max-width: 760px)");
    const on = () => setNarrow(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return narrow;
}

export function Systems() {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [openId, setOpenId] = useState<string | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const shown = modules.filter((m) => filter === "ALL" || m.status === filter);
  const count = (s: Status) => modules.filter((m) => m.status === s).length;

  const close = useCallback(() => {
    setOpenId(null);
    opener.current?.focus();
  }, []);

  return (
    <section className="section systems" id="systems">
      <div className="container">
        <header className="sec-head">
          <span className="sec-n">02</span>
          <h2 className="sec-title">
            Systems
            <small>프로젝트를 시스템 모듈로 배치했습니다. 모듈을 열면 문제 정의 · 아키텍처 · 실험 · 결과 · 한계와 저장소가 나옵니다.</small>
          </h2>
          <div className="sec-meta">
            {modules.length} MODULES
            <br />
            {count("COMPLETED")} COMPLETED · {count("IN PROGRESS")} IN PROGRESS
            <br />
            {count("PLANNED")} PLANNED · {count("PRIVATE")} PRIVATE
          </div>
        </header>

        <div className="sys-filter" role="group" aria-label="상태로 거르기">
          {FILTERS.map((f) => (
            <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {filter === f ? (
                <motion.span className="sys-filter-pill" layoutId="sys-filter" transition={{ type: "spring", duration: 0.35, bounce: 0.1 }} />
              ) : null}
              <span>{f}</span>
              <span className="sys-filter-n">{f === "ALL" ? modules.length : count(f)}</span>
            </button>
          ))}
        </div>

        <motion.div className="sys-grid" layout>
          <AnimatePresence mode="popLayout" initial={false}>
            {shown.map((m) => (
              <ModuleCard
                key={m.id}
                m={m}
                active={openId === m.id}
                onOpen={(el) => {
                  opener.current = el;
                  setOpenId(m.id);
                }}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <Inspector m={modules.find((x) => x.id === openId) ?? null} onClose={close} />
    </section>
  );
}

function ModuleCard({ m, active, onOpen }: { m: Module; active: boolean; onOpen: (el: HTMLElement) => void }) {
  return (
    <motion.button
      layout
      className="mod frame"
      data-featured={m.featured}
      data-active={active}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
      transition={{ duration: 0.28, ease: EASE_OUT, layout: { duration: 0.35, ease: EASE_OUT } }}
      onClick={(e) => onOpen(e.currentTarget)}
      aria-label={`${m.code} ${m.title} 열기`}
    >
      <span className="mod-top">
        <span className="mod-code mono">{m.code}</span>
        <StatusChip s={m.status} />
      </span>

      {m.featured ? (
        <span className="mod-screen">
          <Screen m={m} />
          <span className="mod-scan" />
        </span>
      ) : null}

      <span className="mod-body">
        <span className="mod-title">{m.title}</span>
        <span className="mod-sub">{m.subtitle}</span>
      </span>

      {m.metric ? (
        <span className="mod-metric">
          <span className="mod-metric-v tabular">
            {m.metric.value}
            {m.metric.unit ? <small>{m.metric.unit}</small> : null}
          </span>
          <span className="mod-metric-l">
            {m.metric.label}
            {m.metric.source ? <SourceBadge src={m.metric.source} /> : null}
          </span>
        </span>
      ) : (
        <span className="mod-metric mod-metric--none mono">
          {m.status === "PRIVATE" ? "— RESULTS WITHHELD · 미발표 연구" : "— NO DATA YET"}
          {m.statusNote ? <small>{m.statusNote}</small> : null}
        </span>
      )}

      <span className="mod-foot">
        <span className="mod-tags">
          {m.tags.slice(0, 3).map((t) => (
            <span className="chip" key={t}>
              {t}
            </span>
          ))}
        </span>
        <span className="mod-open mono">OPEN ▸</span>
      </span>
    </motion.button>
  );
}

function Screen({ m }: { m: Module }) {
  if (m.id === "haegeum") return <ThresholdViz />;
  if (m.media?.src) return <LoopVideo src={m.media.src} poster={m.media.poster} label={m.media.label} />;
  if (m.media?.poster) return <img src={m.media.poster} alt={m.media.label} loading="lazy" />;
  return null;
}

function Inspector({ m, onClose }: { m: Module | null; onClose: () => void }) {
  const narrow = useNarrow();
  const [tab, setTab] = useState<Tab>("문제");
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!m) return;
    setTab("문제");
    lockScroll(true);
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      lockScroll(false);
      window.removeEventListener("keydown", onKey);
    };
  }, [m, onClose]);

  const hidden = narrow ? "translateY(100%)" : "translateX(100%)";
  const shown = narrow ? "translateY(0%)" : "translateX(0%)";

  return (
    <AnimatePresence>
      {m ? (
        <>
          <motion.div
            key="bd"
            className="insp-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />
          <motion.aside
            key="insp"
            className="insp"
            role="dialog"
            aria-modal="true"
            aria-labelledby="insp-title"
            initial={{ transform: hidden }}
            animate={{ transform: shown }}
            exit={{ transform: hidden, transition: { duration: 0.24, ease: DRAWER } }}
            transition={{ duration: 0.46, ease: DRAWER }}
            data-lenis-prevent
          >
            <div className="insp-head">
              <span className="mono insp-code">{m.code}</span>
              <StatusChip s={m.status} />
              {m.statusNote ? <span className="insp-note mono">{m.statusNote}</span> : null}
              <button ref={closeRef} className="insp-close" onClick={onClose} aria-label="닫기">
                <Close />
              </button>
            </div>

            <div className="insp-scroll">
              <h3 id="insp-title" className="insp-title">
                {m.title}
              </h3>
              <p className="insp-sub">{m.subtitle}</p>

              {m.metric ? (
                <div className="insp-metric">
                  <span className="tabular">
                    {m.metric.value}
                    {m.metric.unit ? <small>{m.metric.unit}</small> : null}
                  </span>
                  <span>
                    {m.metric.label} {m.metric.source ? <SourceBadge src={m.metric.source} /> : null}
                  </span>
                </div>
              ) : null}

              {m.media ? (
                <figure className="insp-media">
                  {m.media.src ? (
                    <LoopVideo src={m.media.src} poster={m.media.poster} label={m.media.label} />
                  ) : (
                    <img src={m.media.poster} alt={m.media.label} />
                  )}
                  <figcaption className="mono">
                    {m.media.label}
                    {m.media.credit ? <b> · {m.media.credit}</b> : null}
                  </figcaption>
                </figure>
              ) : null}

              <div className="insp-tabs" role="tablist" aria-label="모듈 상세">
                {TABS.map((t) => (
                  <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>
                    {tab === t ? <motion.span className="insp-tab-line" layoutId="insp-tab" transition={{ duration: 0.25, ease: EASE_OUT }} /> : null}
                    {t}
                  </button>
                ))}
              </div>

              <motion.div
                key={tab}
                className="insp-panel"
                role="tabpanel"
                initial={{ opacity: 0, transform: "translateY(6px)" }}
                animate={{ opacity: 1, transform: "translateY(0px)" }}
                transition={{ duration: 0.22, ease: EASE_OUT }}
              >
                <TabBody m={m} tab={tab} />
              </motion.div>
            </div>

            <div className="insp-foot">
              {m.repo && "href" in m.repo ? (
                <a className="btn btn--lime" href={m.repo.href} target="_blank" rel="noreferrer">
                  GitHub · {m.repo.name} <ArrowUpRight />
                </a>
              ) : (
                <span className="insp-private mono">
                  <Lock /> {m.status === "PLANNED" ? "저장소 없음 · 계획 단계" : "비공개 저장소"}
                </span>
              )}
              {m.live ? (
                <a className="btn btn--line" href={m.live} target="_blank" rel="noreferrer">
                  Live <ArrowUpRight />
                </a>
              ) : null}
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function TabBody({ m, tab }: { m: Module; tab: Tab }) {
  switch (tab) {
    case "문제":
      return <p className="insp-text">{m.problem}</p>;
    case "아키텍처":
      return <Arch m={m} />;
    case "실험":
      return (
        <ul className="insp-list">
          {m.experiments.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      );
    case "결과":
      return m.results.length ? (
        <ul className="insp-list insp-results">
          {m.results.map((r) => (
            <li key={r.text}>
              <span>{r.text}</span>
              {r.source ? <SourceBadge src={r.source} /> : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="insp-empty mono">
          {m.status === "PRIVATE" ? "결과 비공개 — 미발표 연구" : "아직 결과가 없습니다. 검증된 결과가 생기면 갱신합니다."}
        </p>
      );
    case "한계":
      return (
        <ul className="insp-list insp-limits">
          {m.limits.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      );
  }
}

function Arch({ m }: { m: Module }) {
  return (
    <div>
      <ol className="arch">
        {m.arch.map((n, i) => (
          <motion.li
            key={n.label}
            data-planned={n.planned || undefined}
            initial={{ opacity: 0, transform: "translateX(-6px)" }}
            animate={{ opacity: 1, transform: "translateX(0px)" }}
            transition={{ duration: 0.3, ease: EASE_OUT, delay: i * 0.05 }}
          >
            <span className="arch-i mono">{String(i + 1).padStart(2, "0")}</span>
            <span className="arch-box">
              <b>{n.label}</b>
              {n.sub ? <small className="mono">{n.sub}</small> : null}
            </span>
            {n.planned ? <span className="arch-tag mono">PLANNED</span> : null}
          </motion.li>
        ))}
      </ol>
      {m.arch.some((n) => n.planned) ? <p className="arch-legend mono">점선 = 아직 구현하지 않은 단계</p> : null}
    </div>
  );
}
