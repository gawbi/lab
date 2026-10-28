import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { identity, systemLog, type LogLine } from "../data";
import { ArrowUpRight, GitHub } from "./Icons";
import { FadeUp } from "./Reveal";
import "../styles/log.css";

const CHAR_MS = 22;
const LINE_MS = 45;
const GAP_MS = 220;

type Cursor = { block: number; chars: number; lines: number };
const DONE: Cursor = { block: systemLog.length, chars: 0, lines: 0 };

export function SystemLog() {
  const termRef = useRef<HTMLDivElement>(null);
  const inView = useInView(termRef, { once: true, margin: "-20% 0px" });
  const reduce = useReducedMotion();
  const [cur, setCur] = useState<Cursor>({ block: 0, chars: 0, lines: 0 });

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setCur(DONE);
      return;
    }
    let timer = 0;
    const tick = (c: Cursor) => {
      if (c.block >= systemLog.length) return;
      const b = systemLog[c.block];
      let next: Cursor;
      let wait: number;
      if (c.chars < b.cmd.length) {
        next = { ...c, chars: c.chars + 1 };
        wait = CHAR_MS;
      } else if (c.lines < b.lines.length) {
        next = { ...c, lines: c.lines + 1 };
        wait = c.lines === 0 ? 160 : LINE_MS;
      } else {
        next = { block: c.block + 1, chars: 0, lines: 0 };
        wait = GAP_MS;
      }
      timer = window.setTimeout(() => {
        setCur(next);
        tick(next);
      }, wait);
    };
    tick({ block: 0, chars: 0, lines: 0 });
    return () => clearTimeout(timer);
  }, [inView, reduce]);

  const finished = cur.block >= systemLog.length;

  return (
    <section className="section log" id="log">
      <div className="container">
        <header className="sec-head">
          <span className="sec-n">04</span>
          <h2 className="sec-title">
            System Log
            <small>사용하는 기술, 진행 중인 연구, 기술적 의사결정과 배운 점. 결정 기록은 상상부기 팀 문서와 G1 실험 노트에서 가져왔습니다.</small>
          </h2>
          <div className="sec-meta">
            SESSION gawbi@lab
            <br />
            {systemLog.length} COMMANDS
          </div>
        </header>

        <div className="term frame marks" ref={termRef} onClick={() => setCur(DONE)} title={finished ? undefined : "클릭하면 바로 모두 표시"}>
          <div className="term-bar">
            <span className="term-dots" aria-hidden>
              <i />
              <i />
              <i />
            </span>
            <span className="mono">gawbi@lab: ~/log — zsh</span>
            <span className="mono term-state" data-done={finished}>
              {finished ? "IDLE" : "STREAMING"}
            </span>
          </div>
          <div className="term-body mono" role="log" aria-live="off">
            {systemLog.map((b, bi) => {
              if (bi > cur.block) return null;
              const typing = bi === cur.block;
              const cmd = typing ? b.cmd.slice(0, cur.chars) : b.cmd;
              const lines = typing ? b.lines.slice(0, cur.lines) : b.lines;
              return (
                <div className="term-block" key={b.cmd}>
                  <div className="term-cmd">
                    <span className="term-prompt">gawbi@lab:~$</span> {cmd}
                    {typing && cur.chars <= b.cmd.length && cur.lines === 0 ? <span className="term-caret" /> : null}
                  </div>
                  {lines.map((l, i) => (
                    <Line key={i} l={l} />
                  ))}
                </div>
              );
            })}
            {finished ? (
              <div className="term-cmd">
                <span className="term-prompt">gawbi@lab:~$</span> <span className="term-caret" />
              </div>
            ) : null}
          </div>
        </div>

        <FadeUp className="contact">
          <div>
            <span className="label">Contact</span>
            <h3>코드와 실험 기록은 GitHub에 있습니다.</h3>
            <p>Robot Learning · Manipulation 직무를 준비하고 있습니다. 연락은 GitHub 프로필로 부탁드립니다.</p>
          </div>
          <div className="contact-links">
            <a className="btn btn--lime" href={identity.github} target="_blank" rel="noreferrer">
              <GitHub /> github.com/gawbi <ArrowUpRight />
            </a>
            <a className="btn btn--line" href={identity.mainSite} target="_blank" rel="noreferrer">
              메인 포트폴리오 <ArrowUpRight />
            </a>
          </div>
        </FadeUp>
      </div>

      <footer className="foot container mono">
        <span>
          {identity.handle} // LAB — {identity.tagline.join(" ")}
        </span>
        <span>© 2026 {identity.name} · 상상부기 캐릭터 · 로고 · 캠퍼스 사진 © 한성대학교 · 로봇 모델 Open Duck Mini v2 (Apache-2.0)</span>
      </footer>
    </section>
  );
}

function Line({ l }: { l: LogLine }) {
  return (
    <div className="term-line">
      {l.t ? <span className="term-t">{l.t}</span> : null}
      {l.tag ? (
        <span className="term-tag" data-tag={l.tag}>
          [{l.tag}]
        </span>
      ) : null}
      <span className="term-text">
        {l.text}
        {l.dim ? <span className="term-dim"> — {l.dim}</span> : null}
      </span>
    </div>
  );
}
