import type { Source, Status } from "../data";
import { Lock } from "./Icons";

export function StatusChip({ s, note }: { s: Status; note?: string }) {
  return (
    <span className="st" data-s={s} title={note}>
      {s === "PRIVATE" ? <Lock /> : <i />}
      {s}
    </span>
  );
}

export function SourceBadge({ src }: { src: Source }) {
  return (
    <span className="src" data-src={src}>
      {src}
    </span>
  );
}

export const SOURCE_HELP: Record<Source, string> = {
  SIM: "시뮬레이션에서 학습 · 측정",
  ROLLOUT: "시뮬레이션 롤아웃을 기록한 원자료",
  BENCH: "실제 컴퓨터에서 잰 성능",
  DATASET: "공개 · 오프라인 데이터셋 평가",
  REAL: "실물 로봇 측정 — 아직 없음",
};
