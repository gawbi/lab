import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { identity, sections } from "../data";
import { scrollToId } from "../lib/smooth";
import { ArrowUpRight, GitHub } from "./Icons";
import "../styles/bar.css";

const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit", second: "2-digit" });

export function StatusBar() {
  const [now, setNow] = useState(() => fmt.format(new Date()));
  const [active, setActive] = useState("hero");

  useEffect(() => {
    const id = setInterval(() => setNow(fmt.format(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <header className="bar">
      <div className="bar-inner">
        <button className="bar-id" onClick={() => scrollToId("hero")} aria-label="맨 위로">
          <i className="led" />
          <b>{identity.handle}</b>
          <span>// LAB</span>
        </button>

        <nav className="bar-nav" aria-label="섹션">
          {sections.map((s) => (
            <button key={s.id} data-on={active === s.id} onClick={() => scrollToId(s.id)}>
              {active === s.id ? (
                <motion.span className="bar-pill" layoutId="bar-pill" transition={{ type: "spring", duration: 0.4, bounce: 0.12 }} />
              ) : null}
              <span className="bar-n">{s.n}</span>
              <span className="bar-l">{s.label}</span>
            </button>
          ))}
        </nav>

        <div className="bar-right">
          <span className="bar-clock mono tabular" aria-label="서울 시각">
            KST {now}
          </span>
          <span className="bar-sys">
            <i /> SYS NOMINAL
          </span>
          <a className="bar-link" href={identity.mainSite} target="_blank" rel="noreferrer">
            MAIN <ArrowUpRight />
          </a>
          <a className="bar-gh" href={identity.github} target="_blank" rel="noreferrer" aria-label="GitHub">
            <GitHub />
          </a>
        </div>
      </div>
    </header>
  );
}
