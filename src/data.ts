// Every number here comes from a repo README, notes file, or recorded data.
// Status and source labels are part of the content, not decoration:
//   status  — COMPLETED / IN PROGRESS / PLANNED / PRIVATE
//   source  — SIM (simulation), ROLLOUT (recorded sim rollout), BENCH (measured on real compute),
//             DATASET (offline evaluation), REAL (measured on a physical robot; none yet)

const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`;

export type Status = "COMPLETED" | "IN PROGRESS" | "PLANNED" | "PRIVATE";
export type Source = "SIM" | "ROLLOUT" | "BENCH" | "DATASET" | "REAL";

export const identity = {
  handle: "GAWBI",
  name: "김광빈",
  tagline: ["FROM SIGNAL", "TO AUTONOMY."],
  intro: "신호 처리와 이상탐지에서 시작해, 지금은 로봇이 걷는 법을 강화학습으로 가르칩니다.",
  focus: ["Robotics · Manipulation", "Perception", "Reinforcement Learning", "Simulation · Autonomy"],
  github: "https://github.com/gawbi",
  mainSite: "https://gawbi.github.io/",
};

export const sections = [
  { id: "hero", n: "01", label: "Hero" },
  { id: "systems", n: "02", label: "Systems" },
  { id: "research", n: "03", label: "Research" },
  { id: "log", n: "04", label: "System Log" },
];

/* ───────────────────────── 02 · systems ───────────────────────── */

export type ArchNode = { label: string; sub?: string; planned?: boolean };

export type Module = {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  status: Status;
  statusNote?: string;
  featured?: boolean;
  metric?: { value: string; unit?: string; label: string; source?: Source };
  tags: string[];
  repo?: { name: string; href: string } | { private: true };
  live?: string;
  media?: { src: string; poster: string; label: string; credit?: string };
  problem: string;
  arch: ArchNode[];
  experiments: string[];
  results: { text: string; source?: Source }[];
  limits: string[];
};

export const modules: Module[] = [
  {
    id: "bugi",
    code: "MOD-01",
    title: "말하고 걷는 상상부기",
    subtitle: "마스코트 이족보행 로봇 · 캡스톤 디자인",
    status: "IN PROGRESS",
    statusNote: "설계 · 시뮬레이션 단계",
    featured: true,
    metric: { value: "49", unit: "cm", label: "개념 모델 키 · 약 2 kg · 다리 서보 10개", source: "SIM" },
    tags: ["Open Duck Mini v2", "MuJoCo", "ONNX", "PPO"],
    repo: { private: true },
    media: {
      src: asset("media/bugi/reel.mp4"),
      poster: asset("media/bugi/reel-poster.jpg"),
      label: "상상부기 로봇 만들기 Day 1 — 설계와 시뮬레이션 (시뮬레이션 합성 영상)",
      credit: "상상부기 캐릭터 · 로고 · 캠퍼스 사진 © 한성대학교",
    },
    problem:
      "짧은 다리와 큰 머리를 가진 마스코트 비율로, 한 학기 안에 실물 로봇이 스스로 서고 몇 걸음 걷게 만든다. 입시박람회에서 “부기야!” 하고 부르면 대답하는 시연이 목표다.",
    arch: [
      { label: "다리 기구", sub: "Open Duck Mini v2 원본" },
      { label: "외피 설계", sub: "Onshape · Fusion" },
      { label: "개념 모델", sub: "MuJoCo" },
      { label: "보행 정책", sub: "PPO → ONNX · 50 Hz" },
      { label: "온보드 실행", sub: "Raspberry Pi 5 4GB", planned: true },
      { label: "음성", sub: "오프라인 호출어 + 대사", planned: true },
    ],
    experiments: [
      "동상 비율 그대로 만든 모델로 서보만으로 서기 시험",
      "몸통 · 머리 위치와 배터리 배치를 바꾼 균형안 비교",
      "후드티 실루엣 A · B · C 비교",
      "원본 공개 보행 정책(ONNX)을 부기 무게 모델로 롤아웃",
    ],
    results: [
      { text: "동상 비율 그대로는 무게중심이 발 뒤로 넘어가 뒤로 넘어짐", source: "SIM" },
      { text: "몸통 +2.5 cm · 머리 +4.5 cm 앞으로, 배터리 배 쪽 아래 → 4단계 설계 잠정 확정", source: "SIM" },
      { text: "원본 보행 정책이 부기 무게 모델도 걷게 함 (부기 전용 학습 전)", source: "ROLLOUT" },
      { text: "목 서보 4개를 빼서 약 11만 원, 0.3 kg 절감" },
      { text: "두뇌는 Raspberry Pi 5 4GB, 필수 부품 견적 848,736원 (예비비 10% 포함)" },
    ],
    limits: [
      "실물 로봇은 아직 없습니다. 모든 결과는 시뮬레이션입니다.",
      "부기 몸에 맞춘 정책 학습은 5단계(다음 학기)입니다.",
      "대사는 학교 확인 전 초안입니다. 캐릭터 권리는 한성대학교에 있습니다.",
    ],
  },
  {
    id: "sim2real",
    code: "MOD-02",
    title: "카메라 자율주행 Sim-to-Real",
    subtitle: "Isaac Sim 5.1 디지털 트윈 → Raspberry Pi 5 실차",
    status: "IN PROGRESS",
    statusNote: "디지털 트윈 완료 · 학습 전",
    featured: true,
    metric: { value: "228", unit: "cm", label: "트랙 인쇄 영역 · 줄자 실측 · 도면 1 px = 1 mm", source: "REAL" },
    tags: ["Isaac Sim 5.1", "Raspberry Pi 5", "Digital Twin"],
    repo: { name: "track-digital-twin", href: "https://github.com/gawbi/track-digital-twin" },
    media: { src: "", poster: asset("media/work/track.jpg"), label: "위에서 본 트랙 도면 (2.4 m × 2.4 m)" },
    problem:
      "실습용 ‘田’자형 도시 맵 트랙을 시뮬레이터로 옮겨 카메라 자율주행을 학습하고, Raspberry Pi 5 실차로 옮기며 시뮬레이션과 실물의 간극을 재고 메운다.",
    arch: [
      { label: "실물 트랙 매트", sub: "줄자 · 원근 보정 사진" },
      { label: "디지털 트윈", sub: "텍스처 2.4 m · 좌표 JSON" },
      { label: "Isaac Sim 5.1 학습", sub: "카메라 자율주행", planned: true },
      { label: "Raspberry Pi 5 실차", sub: "AI CAR v14 · 스키드 스티어", planned: true },
      { label: "간극 측정 · 보정", planned: true },
    ],
    experiments: [
      "치수마다 [측정] · [사진] · [추정] 출처를 붙여 기록",
      "트랙 사진을 블록 4개 중심 기준으로 원근 보정(2 mm/px)해 사진 치수 측정",
      "노란선 픽셀에 원을 맞춰 모서리 반경 추정",
      "생성한 도면을 보정 사진과 겹쳐 블록 · 도로 · 횡단보도 위치 확인",
    ],
    results: [
      { text: "도로 중심선, 교차로 5곳, 횡단보도 8개, 노면 표시 9개, 소품 자리 20곳 좌표", source: "REAL" },
      { text: "모서리 반경: 블록 104–107 mm, 순환로 바깥 322–333 mm (원 맞춤)", source: "REAL" },
      { text: "차 폭 기준 좌우 여유: 바깥 순환로 5 cm, 가운데 도로 1.25–2.5 cm" },
    ],
    limits: [
      "사진 치수 오차는 매트 안쪽 ±1–2 cm, 가장자리 ±2–4 cm입니다.",
      "세로 전체 길이가 한 번 211 cm로 나와 정사각형 가정과 어긋납니다. 재측정이 필요합니다.",
      "시뮬레이터 학습과 실차 주행은 아직 하지 않았습니다.",
    ],
  },
  {
    id: "g1",
    code: "MOD-03",
    title: "휴머노이드 보행 강화학습",
    subtitle: "Isaac Lab · Unitree G1 · 보상 어블레이션",
    status: "COMPLETED",
    statusNote: "seed 1개 · 반복 예정",
    featured: true,
    metric: { value: "99.6", unit: "%", label: "20초 생존 비율 · 마지막 100 iteration", source: "SIM" },
    tags: ["Isaac Lab", "RSL-RL", "PPO", "4096 env"],
    repo: { name: "robotics-rl-study", href: "https://github.com/gawbi/robotics-rl-study" },
    media: {
      src: asset("media/work/g1-vs.mp4"),
      poster: asset("media/work/g1-vs.jpg"),
      label: "왼쪽 실험 0 기본 보상, 오른쪽 실험 1 feet_air_time = 0",
    },
    problem: "보상 항목 하나를 끄면 휴머노이드가 “걸을 수 있느냐”가 바뀌는가, “어떻게 걷느냐”가 바뀌는가.",
    arch: [
      { label: "Unitree G1", sub: "Isaac Lab 평지" },
      { label: "병렬 환경", sub: "4,096 env" },
      { label: "RSL-RL PPO", sub: "1,500 iter · 27분" },
      { label: "지표 수집", sub: "마지막 100 iter 평균 ± 표준편차" },
    ],
    experiments: [
      "실험 0: 기본 보상",
      "실험 1: feet_air_time 가중치 0.75 → 0, 그 외 동일 (seed 42)",
      "두 run의 params/env.yaml을 diff 해서 바뀐 줄이 하나뿐인지 확인",
    ],
    results: [
      { text: "넘어짐 비율 0.41% → 0.39% (거의 같음)", source: "SIM" },
      { text: "명령 추종 0.936 → 0.934 (거의 같음)", source: "SIM" },
      { text: "발 미끄러짐 벌점 크기 −0.0123 → −0.0162, +32%", source: "SIM" },
    ],
    limits: [
      "seed 1개 결과라 관찰이지 결론이 아닙니다. seed 3개 반복이 다음 할 일입니다.",
      "끈 보상은 로그가 0이 되어, 발을 얼마나 들었는지는 직접 잴 수 없었습니다.",
      "보상 함수가 달라 총 보상끼리는 비교하지 않았습니다.",
    ],
  },
  {
    id: "plugbot",
    code: "MOD-04",
    title: "PlugBot · 선박 충전 로봇팔",
    subtitle: "SO-101로 흔들리는 소켓에 플러그 꽂기 · 해커톤",
    status: "IN PROGRESS",
    statusNote: "시뮬레이션 실험 완료 · 실물 키트 측정 전",
    metric: { value: "80", unit: "%", label: "모형 파고 8 cm 삽입 성공률 · 예측 제어 (반응 6.7%) · 30회", source: "SIM" },
    tags: ["SO-101", "MuJoCo", "Isaac Sim 5.1", "CadQuery"],
    repo: { private: true },
    media: {
      src: asset("media/work/plugbot-hs6.mp4"),
      poster: asset("media/work/plugbot-hs6.jpg"),
      label: "왼쪽 최신 위치 추종(반응), 오른쪽 AR 예측 + 정온 구간 삽입(예측)",
    },
    problem:
      "전기차 충전구에서 배운 ‘꽂기’를 흔들리는 전기 선박의 충전 소켓으로 옮긴다. 파도로 움직이는 소켓에, 카메라 지연을 안고 플러그를 꽂아야 한다.",
    arch: [
      { label: "선박 운동", sub: "JONSWAP 불규칙파 · 상하 · 좌우 · 앞뒤 · 롤 · 피치" },
      { label: "소켓 추정", sub: "카메라 30 Hz · 지연 0.1 s · 잡음 0.5 mm" },
      { label: "예측", sub: "최근 3 s로 AR(6) · 0.3 s 앞 · 정온 구간 대기" },
      { label: "IK + 삽입 상태기계", sub: "SO-101 · 제어 50 Hz · 물리 500 Hz" },
      { label: "래치가 잡으면 놓기" },
      { label: "ACT 정책", sub: "예측 제어기를 시범 생성기로", planned: true },
    ],
    experiments: [
      "모형 유의파고 0 · 2 · 4 · 6 · 8 cm × 전략 3개 × 30회",
      "전략: static(처음 본 위치) · reactive(지연된 최신 위치 추종) · predictive(AR 예측 + 정온 구간 삽입)",
      "배치 두 가지: 현측에 세운 소켓에 L자 플러그로 옆에서(side, 본선) · 갑판 소켓에 위에서(top, 예선)",
      "부품은 CadQuery로 설계하고 3D 프린트 키트와 흔들림 갑판(아두이노)을 준비",
    ],
    results: [
      { text: "파고 8 cm 성공률: 예측 80% · 반응 6.7% · 정적 10% (side)", source: "SIM" },
      { text: "파고 6 cm 삽입 접촉력 p95 중앙값: 정적 38 N · 반응 452 N · 예측 38 N", source: "SIM" },
      { text: "top 배치에서도 예측 제어 100 · 100 · 100 · 93.3 · 83.3%", source: "SIM" },
      { text: "자동차 충전구(정지)는 두 배치 모두 15/15 성공", source: "SIM" },
    ],
    limits: [
      "시뮬레이션 결과입니다. 실물 SO-101과의 일치는 본선 전 키트로 측정해야 합니다.",
      "선박 운동은 실제 RAO가 아닌 근사이고, 1:10 축척(Froude 상사)은 가정입니다.",
      "접촉력은 강체 접촉 모델 값이라 절대값보다 전략 간 비교로 읽습니다.",
      "소켓 위치는 시뮬레이터 값에 지연 · 잡음을 섞은 것입니다. 실물에서는 마커나 비전으로 추정해야 합니다.",
      "학습 정책(ACT 등)은 아직 없습니다.",
    ],
  },
  {
    id: "haegeum",
    code: "MOD-05",
    title: "UAV · UGV 센서 이상탐지",
    subtitle: "DAH 2026 해금팀 · ROS2 방어 모듈",
    status: "COMPLETED",
    metric: { value: "0.041", unit: "ms", label: "p99 추론 · UGV (UAV 0.119 ms) · M5 CPU 1스레드", source: "BENCH" },
    tags: ["ROS2", "VAE", "SHAP", "Red Agent"],
    repo: { name: "haegeum-addon", href: "https://github.com/gawbi/haegeum-addon" },
    problem: "UAV · UGV의 센서 값이 조작됐는지 제어 주기 안에서 판별한다.",
    arch: [
      { label: "센서 스트림", sub: "합성 데이터" },
      { label: "ROS2 노드" },
      { label: "VAE 재구성" },
      { label: "오차 vs 임계값" },
      { label: "경보 + SHAP" },
    ],
    experiments: [
      "공격 에이전트(Red Agent)를 따로 만들어 공격 캠페인 생성",
      "같은 공격을 오프라인으로 주입해 방어 모듈 검증",
      "단일 윈도우 추론 지연 벤치마크",
    ],
    results: [
      { text: "p99 추론 0.041 ms (UGV) · 0.119 ms (UAV), 10 Hz 예산의 0.12% 이하", source: "BENCH" },
      { text: "SHAP을 붙이는 과정에서 이전 분석의 오류를 찾아 바로잡음" },
    ],
    limits: ["합성 센서 데이터 기준의 결과입니다."],
  },
  {
    id: "sac-ext",
    code: "MOD-06",
    title: "SAC + EXT critic shaping",
    subtitle: "보상 기반 critic shaping 연구 인수인계",
    status: "PRIVATE",
    statusNote: "진행 중 · 미발표 연구",
    tags: ["SAC", "Critic shaping"],
    repo: { private: true },
    problem: "지도교수의 연구(과거 보상 기반 critic shaping)를 인수인계 받아 이어받을 수 있는 상태로 만든다.",
    arch: [
      { label: "원본 결과 archive" },
      { label: "재집계 도구", sub: "details.csv" },
      { label: "검증" },
      { label: "학습 교재" },
    ],
    experiments: ["원본 실험 결과를 재집계해 검증했습니다. 학습 실험은 재실행하지 않았습니다."],
    results: [],
    limits: ["미발표 연구라 결과와 수치는 공개하지 않습니다. 주제와 역할만 남깁니다."],
  },
  {
    id: "hc-roberta",
    code: "MOD-07",
    title: "이종 신호 융합 · 누수 감사",
    subtitle: "정형 피처 + 텍스트 임베딩 Cross-Attention",
    status: "COMPLETED",
    metric: { value: "0.9832", unit: "F1", label: "± 0.0007 · 5-Run · TF-IDF 기준선 0.9744", source: "DATASET" },
    tags: ["Cross-Attention", "RoBERTa"],
    repo: { name: "hc-roberta-cross-attention", href: "https://github.com/gawbi/hc-roberta-cross-attention" },
    problem: "성격이 다른 두 신호(수치 피처, 텍스트)를 융합할 때 높은 F1이 어디서 오는가.",
    arch: [{ label: "정형 피처" }, { label: "텍스트 임베딩" }, { label: "Concat / Cross / Co-Attention" }, { label: "분류" }],
    experiments: ["비교 모델(Simple Concat, Cross-Attention)을 직접 구현해 팀 제안 모델과 대조", "단일 피처 · TF-IDF 기준선으로 누수 감사"],
    results: [{ text: "TF-IDF만으로 F1 0.9744 — F1의 대부분이 데이터셋의 표층 단서에서 옴", source: "DATASET" }],
    limits: ["모델 간 차이(약 0.009)가 작아, 구조의 우위를 주장하지 않습니다."],
  },
  {
    id: "voice",
    code: "MOD-08",
    title: "음성 딥페이크 탐지",
    subtitle: "멜 + 웨이블릿 2채널 ResNet-18 · 해커톤",
    status: "COMPLETED",
    metric: { value: "5.50→3.80", unit: "%", label: "dev EER 관찰값 · ASVspoof 2019 LA 서브셋 · seed 1", source: "DATASET" },
    tags: ["Wavelet", "ResNet-18"],
    repo: { name: "voice-deepfake-detection", href: "https://github.com/gawbi/voice-deepfake-detection" },
    problem: "멜 스펙트로그램에 웨이블릿 스칼로그램을 더하면 합성 음성을 더 잘 잡는가.",
    arch: [{ label: "음성" }, { label: "멜 + 웨이블릿" }, { label: "2채널 ResNet-18" }, { label: "EER" }],
    experiments: ["5,000 utterance 서브셋, 단일 시드"],
    results: [{ text: "dev EER 5.50% → 3.80% 관찰", source: "DATASET" }],
    limits: ["두 실험의 입력 길이와 배치가 달라 웨이블릿 효과로 단정할 수 없습니다 (교란 변수 표)."],
  },
  {
    id: "roadmap",
    code: "MOD-09",
    title: "Robotics Roadmap",
    subtitle: "강의 지도 위의 공부 기록 사이트",
    status: "IN PROGRESS",
    metric: { value: "71", unit: "강", label: "커리큘럼 · 153시간 · 강의별 요약 영상 71개" },
    tags: ["TypeScript", "Remotion", "MeloTTS"],
    repo: { name: "robotics-roadmap", href: "https://github.com/gawbi/robotics-roadmap" },
    live: "https://gawbi.github.io/robotics-roadmap/#/me",
    media: { src: asset("media/work/roadmap-tour.mp4"), poster: asset("media/work/roadmap-tour.jpg"), label: "사이트 둘러보기" },
    problem: "공부한 흔적(퀴즈 · 노트 · 구현)을 커밋하면 강의 지도 위에 칠해지게 한다.",
    arch: [{ label: "강의" }, { label: "퀴즈 · 노트 · 구현" }, { label: "커밋" }, { label: "Pages 재배포 · 지도" }],
    experiments: [
      "Robot Learning · Manipulation 쪽에 최근 연구와 현업 도구 강의를 추가",
      "강의 핵심 절을 애니메이션과 한국어 음성으로 줄인 요약 영상 (Remotion + MeloTTS), 절마다 ‘멈추고 적어 보기’ 화면",
    ],
    results: [{ text: "요약 영상 71개 공개, 공부 기록 페이지 운영 중" }],
    limits: ["강의 지도는 woolimi/robotics-roadmap을 바탕으로 합니다."],
  },
  {
    id: "from-scratch",
    code: "MOD-10",
    title: "Robotics from Scratch",
    subtitle: "2링크 팔 · FK · IK · 야코비안",
    status: "IN PROGRESS",
    statusNote: "1–2단계 개념 정리 완료 · 구현 전",
    tags: ["Kinematics", "Test-first"],
    repo: { name: "robotics-from-scratch", href: "https://github.com/gawbi/robotics-from-scratch" },
    problem: "좌표계부터 야코비안까지 직접 구현하고, 단계마다 검증 숫자로 끝을 확인한다.",
    arch: [{ label: "좌표계" }, { label: "FK" }, { label: "IK", planned: true }, { label: "야코비안", planned: true }],
    experiments: ["단계마다 완료 조건을 테스트로 먼저 정함", "IK는 FK에 다시 넣은 오차로, 해석적 야코비안은 수치 미분과 비교해 검증할 계획"],
    results: [],
    limits: ["구현은 아직 시작하지 않았습니다."],
  },
  {
    id: "mendai",
    code: "MOD-11",
    title: "운동화 손상 탐지 실험",
    subtitle: "분류기 DINO · 탐지기 DETR / YOLO · 팀",
    status: "COMPLETED",
    tags: ["DINO", "DETR", "YOLO"],
    repo: { name: "MENDAI", href: "https://github.com/gawbi/MENDAI" },
    media: { src: "", poster: asset("media/work/mendai.jpg"), label: "손상 탐지 샘플" },
    problem: "운동화 손상 부위를 분류기와 탐지기로 찾는다.",
    arch: [{ label: "이미지" }, { label: "DINO 분류" }, { label: "DETR · YOLO 탐지" }, { label: "평가" }],
    experiments: ["분류기와 탐지기 실험 비교"],
    results: [{ text: "DETR 쪽 신뢰구간과 conf 선택 기준 기록", source: "DATASET" }],
    limits: ["팀 프로젝트입니다."],
  },
];

/* ───────────────────────── 03 · research ───────────────────────── */

export const research = {
  rollout: {
    url: asset("data/rollout.json"),
    title: "보행 정책 롤아웃 · 관절 텔레메트리",
    note: "원본 Open Duck Mini v2 모델 + 공개 보행 정책. MuJoCo 500 Hz 물리, 50 Hz 제어, 30 fps 기록. 부기 전용 정책이 아닙니다.",
  },
  plugbot: {
    title: "PlugBot · 파고별 삽입 성공률",
    setup: "SO-101 · 현측 세운 소켓(side) · 조건당 30회 · 카메라 30 Hz, 지연 0.1 s, 잡음 0.5 mm · 제어 50 Hz / 물리 500 Hz",
    hs: [0, 2, 4, 6, 8],
    strategies: [
      { key: "static", label: "정적 · 처음 본 위치", rate: [100, 96.7, 66.7, 20, 10] },
      { key: "reactive", label: "반응 · 지연된 최신 위치 추종", rate: [100, 100, 93.3, 50, 6.7] },
      { key: "predictive", label: "예측 · AR(6) + 정온 구간 삽입", rate: [100, 100, 100, 86.7, 80] },
    ],
    // Hs 6 cm: contact force p95 median and interquartile range (N), failure causes out of 30
    force6: [
      { key: "static", median: 38, iqr: [27, 73], fails: { hull: 19, rim: 4, timeout: 1 } },
      { key: "reactive", median: 452, iqr: [215, 817], fails: { hull: 15, rim: 0, timeout: 0 } },
      { key: "predictive", median: 38, iqr: [28, 65], fails: { hull: 4, rim: 0, timeout: 0 } },
    ],
    note: "남은 실패는 대부분 소켓을 놓쳐 선체를 찌른 경우입니다. 지연을 보상하지 않으면 깔때기를 빗나갑니다. 접촉력은 강체 접촉 모델 값이라 전략 간 비교로만 읽습니다.",
    scale: "모형 유의파고 Hs · 1:10 축척 가정 (Hs 8 cm ≈ 실선 0.8 m)",
  },
  ablation: {
    title: "보상 어블레이션 · feet_air_time 끄기",
    setup: "Unitree G1 · Isaac Lab · 4096 env × 1500 iter · 마지막 100 iteration 평균 ± 표준편차",
    caveat: "± 는 한 학습 안의 흔들림이지 seed 사이의 차이가 아닙니다.",
    rows: [
      { key: "base_contact", label: "넘어짐 비율", unit: "%", a: [0.411, 0.0622], b: [0.387, 0.0917] },
      { key: "track_lin_vel_xy_exp", label: "명령 추종", a: [0.9359, 0.00982], b: [0.9341, 0.00562] },
      { key: "|feet_slide|", label: "발 미끄러짐 벌점", a: [0.0123, 0.000212], b: [0.0162, 0.000289], flag: "+32%" },
      { key: "|dof_torques_l2|", label: "관절 토크 벌점", a: [0.0065, 0.000116], b: [0.00782, 0.000119], flag: "+20%" },
      { key: "|flat_orientation_l2|", label: "몸통 기울기 벌점", a: [0.00769, 0.000591], b: [0.00983, 0.000702], flag: "+28%" },
    ] as { key: string; label: string; unit?: string; a: [number, number]; b: [number, number]; flag?: string }[],
    seeds: [
      { seed: "42", status: "COMPLETED" as Status },
      { seed: "43", status: "PLANNED" as Status },
      { seed: "44", status: "PLANNED" as Status },
    ],
  },
  curves: {
    src: asset("plots/g1-learning-curves.jpg"),
    title: "학습 곡선 · 실험 0 vs 실험 1",
    note: "131번째 iteration에 에피소드 길이가 최대에 닿은 뒤, 명령 추종(0.42 → 0.94)과 행동 변화량 벌점(−0.43 → −0.17)이 좋아졌습니다. 넘어지지 않기 → 명령 따라가기 → 부드럽게 움직이기 순서입니다.",
    origin: "robotics-rl-study · day5 원본 그래프",
  },
  videos: [
    { src: asset("media/work/g1-baseline.mp4"), poster: asset("media/work/g1-baseline.jpg"), label: "G1 평지 보행 · 실험 0", source: "SIM" as Source },
    {
      src: asset("media/work/plugbot-hs6.mp4"),
      poster: asset("media/work/plugbot-hs6.jpg"),
      label: "PlugBot · 반응 vs 예측 제어",
      source: "SIM" as Source,
    },
    {
      src: asset("media/bugi/reel.mp4"),
      poster: asset("media/bugi/reel-poster.jpg"),
      label: "상상부기 Day 1 · 시뮬레이션 합성",
      source: "SIM" as Source,
      credit: "© 한성대학교",
      vertical: true,
    },
  ],
  hypotheses: [
    {
      id: "H-01",
      change: "실험 0 · 1을 seed 43, 44로 반복",
      predict: "실험 1의 발 미끄러짐 벌점이 세 seed 모두에서 더 크고, 차이가 seed 사이 흔들림보다 크다",
      measure: "seed별 feet_slide 평균과 seed 간 분산",
    },
    {
      id: "H-02",
      change: "action_rate_l2 끄기",
      predict: "행동이 급하게 바뀌어 관절 떨림이 커진다",
      measure: "play 중 ‖aₜ − aₜ₋₁‖ 직접 기록 (끈 항목은 로그가 0), dof_acc_l2 · dof_torques_l2",
    },
    {
      id: "H-03",
      change: "flat_orientation_l2 끄기",
      predict: "몸통이 더 기울어진 채 걷는다",
      measure: "play 중 projected_gravity, ang_vel_xy_l2, 넘어짐 비율",
    },
    {
      id: "H-04",
      change: "PPO clip_param 0.1 / 0.2 / 0.4",
      predict: "0.1은 느리게, 0.4는 빠르지만 흔들리며 학습",
      measure: "에피소드 길이가 최대에 닿는 iteration, 최종 지표, 학습률 변화",
    },
    {
      id: "H-05",
      change: "관측 노이즈 끄기 → MuJoCo로 sim-to-sim",
      predict: "시뮬레이터 안 지표는 비슷하거나 좋아지지만, 다른 시뮬레이터로 옮기면 더 약해진다",
      measure: "같은 관측 · 50 Hz · PD 게인으로 MuJoCo에서 정책 재생",
    },
    {
      id: "H-06",
      change: "PlugBot 세 전략을 실물 SO-101 + 흔들림 갑판 키트에서 반복",
      predict: "측정 전 — 시뮬레이션의 전략 순서가 실물에서도 유지되는지 자체를 확인한다",
      measure: "삽입 성공률과 실패 원인 분포, 소켓 위치는 마커로 추정",
    },
  ],
  failures: [
    {
      id: "F-01",
      system: "상상부기",
      what: "동상 비율 그대로 만든 모델이 서기 시험에서 뒤로 넘어짐",
      why: "무게중심이 발 뒤에 있었음",
      fix: "몸통 +2.5 cm · 머리 +4.5 cm 앞으로, 배터리 배 쪽 아래",
      state: "RESOLVED",
      source: "SIM" as Source,
    },
    {
      id: "F-02",
      system: "G1 보행",
      what: "feet_air_time을 끄자 발이 더 미끄러짐 (벌점 +32%)",
      why: "원인 미확정 — 끈 보상은 로그가 0이 되어 발 들기를 직접 잴 수 없었음",
      fix: "seed 3개 반복으로 차이가 잡음인지 확인 예정",
      state: "OPEN",
      source: "SIM" as Source,
    },
    {
      id: "F-03",
      system: "이종 신호 융합",
      what: "F1 0.9832가 나왔지만 모델 덕분이 아니었음",
      why: "TF-IDF만으로 0.9744 — 데이터셋의 표층 단서",
      fix: "누수 감사 결과를 README에 명시하고 우위 주장을 하지 않음",
      state: "DOCUMENTED",
      source: "DATASET" as Source,
    },
    {
      id: "F-04",
      system: "음성 딥페이크",
      what: "EER 개선을 웨이블릿 효과로 볼 수 없었음",
      why: "두 실험의 입력 길이와 배치가 달랐음",
      fix: "교란 변수 표로 명시",
      state: "DOCUMENTED",
      source: "DATASET" as Source,
    },
    {
      id: "F-05",
      system: "센서 이상탐지",
      what: "이전 분석에 오류가 있었음",
      why: "SHAP을 붙이는 과정에서 발견",
      fix: "분석을 바로잡고 README 갱신",
      state: "RESOLVED",
    },
    {
      id: "F-06",
      system: "개발 환경",
      what: "Isaac Lab 설치가 “끝났다”고 나왔지만 의존성 하나가 조용히 실패",
      why: "설치 완료 메시지만으로는 성공을 알 수 없었음",
      fix: "트러블슈팅 문서로 기록",
      state: "RESOLVED",
    },
    {
      id: "F-07",
      system: "PlugBot",
      what: "L자 플러그 핀 49 mm에서 파고 6 cm 성공률 43%",
      why: "깊이 꽂히는 순간 그리퍼 턱이 깔때기 테두리에 닿음",
      fix: "핀 65 mm로 늘리고 소켓을 로봇 앞 30 cm로 옮겨 86.7% (75 mm 이상은 대기 자세에서 카메라 거치대가 어깨에 걸림)",
      state: "RESOLVED",
      source: "SIM" as Source,
    },
    {
      id: "F-08",
      system: "PlugBot",
      what: "꽂은 뒤 4초 동안 계속 쥐고 있으면 세 전략 모두 실패",
      why: "흔들리는 소켓과 로봇 사이에 과부하 · 이탈",
      fix: "‘래치가 잡으면 놓는’ 구조를 기본으로",
      state: "RESOLVED",
      source: "SIM" as Source,
    },
    {
      id: "F-09",
      system: "자율주행 트랙",
      what: "세로 전체 길이가 한 번 211 cm로 측정됨",
      why: "가로 228 cm로 정한 정사각형 가정과 어긋남",
      fix: "재측정 전까지 도면에 미확인 항목으로 표시",
      state: "OPEN",
      source: "REAL" as Source,
    },
  ],
};

/* ───────────────────────── 04 · system log ───────────────────────── */

export type LogLine = { t: string; tag?: "RUNNING" | "QUEUED" | "OK" | "PRIVATE" | "INFO" | "WARN"; text: string; dim?: string };

export const systemLog: { cmd: string; lines: LogLine[] }[] = [
  {
    cmd: "whoami",
    lines: [
      { t: "", text: "김광빈 (gawbi) — robotics & AI engineering student" },
      { t: "", text: "신호 처리 → 이상탐지 → 로보틱스. Robot Learning · Manipulation 직무를 준비하고 있습니다." },
    ],
  },
  {
    cmd: "gawbi status",
    lines: [
      { t: "", tag: "RUNNING", text: "상상부기 이족보행 로봇", dim: "부품 견적 확정 · 시뮬레이션 학습 계획이 다음 · MOD-01" },
      { t: "", tag: "RUNNING", text: "PlugBot 선박 충전 로봇팔", dim: "시뮬레이션 실험 완료 · 실물 SO-101 키트 측정 전 · MOD-04" },
      { t: "", tag: "RUNNING", text: "카메라 자율주행 Sim-to-Real", dim: "디지털 트윈 완료 · Isaac Sim 학습이 다음 · MOD-02" },
      { t: "", tag: "PRIVATE", text: "SAC + EXT critic shaping 인수인계", dim: "원본 결과 재집계 · 교재 작성" },
      { t: "", tag: "RUNNING", text: "robotics-roadmap", dim: "강의 71개 요약 영상 공개" },
      { t: "", tag: "RUNNING", text: "robotics-from-scratch", dim: "좌표계 · FK 개념 정리 완료 · 구현 전" },
      { t: "", tag: "QUEUED", text: "G1 보상 실험 seed 3개 반복", dim: "H-01" },
      { t: "", tag: "QUEUED", text: "sim-to-sim 검증 (Isaac Sim → MuJoCo)", dim: "H-05" },
      { t: "", tag: "QUEUED", text: "ACT 모방학습", dim: "PlugBot 예측 제어기를 시범 생성기로" },
    ],
  },
  {
    cmd: "gawbi stack",
    lines: [
      { t: "sim     ", text: "Isaac Sim 5.1 · Isaac Lab · MuJoCo (Menagerie)" },
      { t: "learn   ", text: "PyTorch · RSL-RL (PPO) · ONNX Runtime" },
      { t: "robot   ", text: "SO-101 · ROS2 · Raspberry Pi 5 · Arduino" },
      { t: "cad     ", text: "CadQuery · MJCF · URDF · USD" },
      { t: "vision  ", text: "OpenCV · YOLO · DINO · DETR" },
      { t: "data    ", text: "NumPy · scikit-learn · SHAP" },
      { t: "media   ", text: "Remotion · MeloTTS · FFmpeg" },
      { t: "infra   ", text: "Python · Ubuntu · Docker · Git" },
    ],
  },
  {
    cmd: "tail decisions.log",
    lines: [
      { t: "bugi    ", tag: "OK", text: "D1 원본 Open Duck Mini v2 다리 기구를 그대로 쓴다", dim: "원본 학습 설정 · 서보 식별 · 런타임을 그대로 쓸 수 있다" },
      { t: "bugi    ", tag: "OK", text: "D7 학습은 RTX 5070 Ti Ubuntu 노트북에서", dim: "원본 학습 코드가 CUDA를 요구한다" },
      { t: "bugi    ", tag: "OK", text: "D11 균형안: 몸통 +2.5 cm, 머리 +4.5 cm, 배터리 배 쪽", dim: "무게중심 여유가 원본보다 낫고, 서보 4개 · 0.3 kg 절감" },
      { t: "bugi    ", tag: "OK", text: "D12 음성은 오프라인 호출어 + 미리 만든 대사가 기본", dim: "시연장은 인터넷 없이 빠르고 엉뚱한 말을 하지 않는 쪽이 안전" },
      { t: "bugi    ", tag: "OK", text: "D16 두뇌 보드를 Raspberry Pi 5로 (Zero 2W에서 변경)", dim: "5V 5A 전원과 방열판을 함께 쓴다" },
      { t: "bugi    ", tag: "OK", text: "D17 Pi 5는 4GB, 필수 구매 848,736원 (예비비 10%)", dim: "4 · 8 · 16GB는 CPU가 같아 보행 정책과 오프라인 음성에는 차이가 없다" },
      { t: "plugbot ", tag: "OK", text: "L자 플러그 핀 49 → 65 mm", dim: "49 mm는 그리퍼 턱이 깔때기 테두리에 닿았다. 75 mm 이상은 카메라 거치대가 어깨에 걸린다" },
      { t: "plugbot ", tag: "OK", text: "꽂은 뒤 래치가 잡으면 놓는다", dim: "4초 계속 쥐면 세 전략 모두 과부하 · 이탈" },
      { t: "plugbot ", tag: "OK", text: "성공률 실험은 렌더링 없이(headless)", dim: "렌더링은 물리 결과에 영향이 없고 느리기만 하다" },
      { t: "g1      ", tag: "OK", text: "“하나만 바꿨다”는 설정 파일 diff로 확인", dim: "params/env.yaml · agent.yaml 비교" },
    ],
  },
  {
    cmd: "cat lessons.md",
    lines: [
      { t: "01", text: "검증 숫자가 없는 단계는 끝난 것으로 치지 않는다." },
      { t: "02", text: "높은 숫자를 받으면 그 숫자부터 의심한다. 기준선이 얼마인지 먼저 본다." },
      { t: "03", text: "seed 1개 결과는 관찰이지 결론이 아니다." },
      { t: "04", text: "마지막 값 하나보다 마지막 N회 평균 ± 표준편차를 본다." },
      { t: "05", text: "보상을 끄면 그 항목의 로그도 0이 된다. 무엇으로 잴지 먼저 정한다." },
      { t: "06", text: "보상 함수가 다르면 총 보상을 비교하지 않는다." },
      { t: "07", text: "설치가 “끝났다”고 성공한 게 아니다." },
      { t: "08", text: "지연을 보상하지 않으면 움직이는 목표를 놓친다." },
      { t: "09", text: "치수마다 측정인지 사진인지 추정인지 적는다. 어긋난 측정은 지우지 않고 남긴다." },
    ],
  },
  {
    cmd: "cat workflow.md",
    lines: [{ t: "", text: "예측 → 하나만 바꾸기 → seed 3개 → 기록 → 해석", dim: "끈 항목은 로그가 0이 되므로, 무엇으로 잴지 먼저 정한다" }],
  },
];
