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
    ],
    limits: [
      "실물 로봇은 아직 없습니다. 모든 결과는 시뮬레이션입니다.",
      "부기 몸에 맞춘 정책 학습은 5단계(다음 학기)입니다.",
      "대사는 학교 확인 전 초안입니다. 캐릭터 권리는 한성대학교에 있습니다.",
    ],
  },
  {
    id: "g1",
    code: "MOD-02",
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
    id: "haegeum",
    code: "MOD-03",
    title: "UAV · UGV 센서 이상탐지",
    subtitle: "DAH 2026 해금팀 · ROS2 방어 모듈",
    status: "COMPLETED",
    featured: true,
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
    id: "so-arm",
    code: "MOD-04",
    title: "SO-ARM101 · 모방학습",
    subtitle: "리더-팔로워 텔레오퍼레이션 · ACT",
    status: "PLANNED",
    tags: ["LeRobot", "ACT", "Teleoperation"],
    problem: "리더암으로 시연한 동작을 팔로워 로봇팔이 배워 스스로 반복하게 만든다.",
    arch: [
      { label: "리더암 시연", planned: true },
      { label: "데이터 수집", sub: "LeRobot", planned: true },
      { label: "ACT 정책", sub: "행동 청킹", planned: true },
      { label: "팔로워암 실행", planned: true },
    ],
    experiments: ["계획 단계: ACT · ALOHA · Diffusion Policy 논문과 LeRobot 코드를 준비해 두었습니다."],
    results: [],
    limits: ["아직 하드웨어 실험과 결과가 없습니다. 수집을 시작하면 이 모듈을 갱신합니다."],
  },
  {
    id: "sac-ext",
    code: "MOD-05",
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
    id: "mobile",
    code: "MOD-06",
    title: "이동로봇 · 센서 융합",
    subtitle: "카메라 · LiDAR 장애물 인식과 자율 주행",
    status: "PLANNED",
    tags: ["Camera", "LiDAR", "Autonomy"],
    problem: "카메라와 LiDAR로 장애물을 인식하고 스스로 주행하는 이동로봇.",
    arch: [
      { label: "카메라 · LiDAR", planned: true },
      { label: "인식 · 융합", planned: true },
      { label: "경로 계획", planned: true },
      { label: "주행 제어", planned: true },
    ],
    experiments: ["준비된 것: 실습 트랙의 디지털 트윈 도면 (MOD-07)."],
    results: [],
    limits: ["아직 이동로봇 실험과 결과가 없습니다."],
  },
  {
    id: "track",
    code: "MOD-07",
    title: "트랙 디지털 트윈",
    subtitle: "라즈베리파이 자율주행 실습 트랙",
    status: "COMPLETED",
    metric: { value: "3", unit: "종", label: "치수 출처 구분 · 측정 · 사진 · 추정" },
    tags: ["Digital Twin", "Texture", "JSON"],
    repo: { name: "track-digital-twin", href: "https://github.com/gawbi/track-digital-twin" },
    media: { src: "", poster: asset("media/work/track.jpg"), label: "트랙 매트 텍스처" },
    problem: "실습용 트랙 매트를 시뮬레이터에서 그대로 쓸 수 있게 텍스처와 좌표 JSON으로 옮긴다.",
    arch: [{ label: "실물 트랙 매트" }, { label: "치수 측정 · 사진" }, { label: "텍스처 + 좌표 JSON" }, { label: "시뮬레이터" }],
    experiments: ["치수마다 측정 · 사진 · 추정 중 어디서 왔는지 구분해 기록"],
    results: [{ text: "시뮬레이터용 텍스처와 좌표 JSON" }],
    limits: ["추정으로 표시된 치수는 실측으로 바꿔야 합니다."],
  },
  {
    id: "hc-roberta",
    code: "MOD-08",
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
    code: "MOD-09",
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
    code: "MOD-10",
    title: "Robotics Roadmap",
    subtitle: "강의 지도 위의 공부 기록 사이트",
    status: "IN PROGRESS",
    metric: { value: "62", unit: "강", label: "커리큘럼 · 132시간 분량" },
    tags: ["TypeScript", "GitHub Pages"],
    repo: { name: "robotics-roadmap", href: "https://github.com/gawbi/robotics-roadmap" },
    live: "https://gawbi.github.io/robotics-roadmap/#/me",
    media: { src: asset("media/work/roadmap-tour.mp4"), poster: asset("media/work/roadmap-tour.jpg"), label: "사이트 둘러보기" },
    problem: "공부한 흔적(퀴즈 · 노트 · 구현)을 커밋하면 강의 지도 위에 칠해지게 한다.",
    arch: [{ label: "강의" }, { label: "퀴즈 · 노트 · 구현" }, { label: "커밋" }, { label: "Pages 재배포 · 지도" }],
    experiments: ["Robot Learning · Manipulation 쪽에 최근 연구와 현업 도구 강의를 추가"],
    results: [{ text: "공개 공부 기록 페이지 운영 중" }],
    limits: ["강의 지도는 woolimi/robotics-roadmap을 바탕으로 합니다."],
  },
  {
    id: "from-scratch",
    code: "MOD-11",
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
    code: "MOD-12",
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
      { t: "", tag: "RUNNING", text: "상상부기 이족보행 로봇", dim: "준비 기간 · 설계와 시뮬레이션 · 캡스톤 수업은 다음 학기" },
      { t: "", tag: "PRIVATE", text: "SAC + EXT critic shaping 인수인계", dim: "원본 결과 재집계 · 교재 작성" },
      { t: "", tag: "RUNNING", text: "robotics-from-scratch", dim: "좌표계 · FK 개념 정리 완료 · 구현 전" },
      { t: "", tag: "QUEUED", text: "G1 보상 실험 seed 3개 반복", dim: "H-01" },
      { t: "", tag: "QUEUED", text: "sim-to-sim 검증 (Isaac Sim → MuJoCo)", dim: "H-05" },
      { t: "", tag: "QUEUED", text: "SO-ARM101 · ACT 모방학습", dim: "MOD-04" },
      { t: "", tag: "QUEUED", text: "이동로봇 · 카메라 + LiDAR 융합", dim: "MOD-06" },
    ],
  },
  {
    cmd: "gawbi stack",
    lines: [
      { t: "sim     ", text: "Isaac Sim · Isaac Lab · MuJoCo" },
      { t: "learn   ", text: "PyTorch · RSL-RL (PPO) · ONNX Runtime" },
      { t: "robot   ", text: "ROS2 · MuJoCo 모델링 (MJCF)" },
      { t: "vision  ", text: "YOLO · DINO · DETR" },
      { t: "data    ", text: "NumPy · scikit-learn · SHAP" },
      { t: "infra   ", text: "Python · Ubuntu · Docker · Git" },
    ],
  },
  {
    cmd: "tail decisions.log",
    lines: [
      { t: "2026-10-25", tag: "OK", text: "D1 원본 Open Duck Mini v2 다리 기구를 그대로 쓴다", dim: "원본 학습 설정 · 서보 식별 · 런타임을 그대로 쓸 수 있다" },
      { t: "2026-10-25", tag: "OK", text: "D4 뼈대는 Onshape(원본 복사), 외피는 Fusion", dim: "관절이 살아 있는 원본에서 시작하고, 곡면은 Fusion이 편하다" },
      { t: "2026-10-25", tag: "OK", text: "D7 학습은 RTX 5070 Ti Ubuntu 노트북에서", dim: "원본 학습 코드가 CUDA를 요구한다" },
      { t: "2026-10-26", tag: "OK", text: "D11 균형안 잠정 확정: 몸통 +2.5 cm, 머리 +4.5 cm, 배터리 배 쪽", dim: "무게중심 여유가 원본보다 낫고, 서보 4개 · 0.3 kg 절감" },
      { t: "2026-10-26", tag: "OK", text: "D12 음성은 오프라인 호출어 + 미리 만든 대사가 기본, LLM 대화는 도전 과제", dim: "시연장은 인터넷 없이 빠르고 엉뚱한 말을 하지 않는 쪽이 안전" },
      { t: "2026-10-15", tag: "OK", text: "G1 “하나만 바꿨다”는 설정 파일 diff로 확인", dim: "params/env.yaml · agent.yaml 비교" },
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
    ],
  },
  {
    cmd: "cat workflow.md",
    lines: [{ t: "", text: "예측 → 하나만 바꾸기 → seed 3개 → 기록 → 해석", dim: "끈 항목은 로그가 0이 되므로, 무엇으로 잴지 먼저 정한다" }],
  },
];
