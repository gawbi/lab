# GAWBI Lab

김광빈의 로보틱스 연구 포트폴리오 — **From Signal to Autonomy.**
메인 포트폴리오(https://gawbi.github.io/)의 연구소 · 관제실 버전입니다.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## 구성

| 섹션 | 내용 |
| --- | --- |
| 01 Hero | Open Duck Mini v2가 기록된 MuJoCo 보행 롤아웃으로 걷고, 커서를 따라가는 센서 스캔 빔이 부품과 관절 각도를 읽음 |
| 02 Systems | 프로젝트 12개를 시스템 모듈로. 상태 필터, 모듈별 인스펙터(문제 · 아키텍처 · 실험 · 결과 · 한계) |
| 03 Research | 롤아웃 관절 텔레메트리, G1 보상 어블레이션(± 표준편차, seed 매트릭스), 학습 곡선, 영상 피드, 가설, 실패 기록 |
| 04 System Log | 상태 · 스택 · 결정 기록 · 배운 점을 터미널 로그로 |

## 표기 규칙

- 상태: `COMPLETED` / `IN PROGRESS` / `PLANNED` / `PRIVATE`
- 데이터 출처: `SIM` 시뮬레이션 · `ROLLOUT` 기록된 롤아웃 · `BENCH` 실제 컴퓨터 측정 · `DATASET` 데이터셋 평가 · `REAL` 실물 로봇(아직 없음)
- 모든 문구와 수치는 `src/data.ts` 한 곳에 있고, 각 저장소의 README · 노트 · 기록 파일에서 가져왔습니다.
  검증되지 않은 결과는 넣지 않고 `PLANNED` 또는 빈 슬롯으로 둡니다.

## 데이터

- `public/robot/duck.{json,bin}` — `scripts/export_robot.py`로 만든 로봇 메시와 4.87초 보행 반복 (Open Duck Mini, Apache-2.0)
- `public/data/rollout.json` — 같은 롤아웃의 13초 전체 관절 각도 · 몸통 높이 · 기울기
- `public/plots/g1-learning-curves.jpg` — robotics-rl-study day5 원본 그래프

상상부기 캐릭터 · 로고 · 캠퍼스 사진 © 한성대학교.

## 배포

`.github/workflows/deploy.yml`이 `main` 푸시 때 GitHub Pages로 배포합니다. 저장소 이름이 `lab`이면 주소는 `https://gawbi.github.io/lab/`입니다.
