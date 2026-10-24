// Single source of truth for the projects (four featured + the "More projects" drawer).
// Homepage chapters, the case-study overlay, /work/<slug>/ pages and the
// point-cloud scene states all read from here.

export type SceneId = 'boxbunny' | 'teleco' | 'companion' | 'rl-hand' | 'legged-balance' | 'breaking-bias';

export interface ProjectLink {
  label: string;
  href: string;
  kind: 'repo' | 'doc' | 'site';
}

export interface Project {
  slug: SceneId;
  title: string;
  fullTitle: string;
  pill: string;
  role: string;
  org: string;
  dates: string;
  /** Supports **claim** and `tech` markup (see lib/rich.ts) */
  summary: string;
  bullets: string[];
  /** Three short key points; include measured results only where they explain the work. */
  points: string[];
  tags: string[];
  live?: boolean;
  /** Featured projects show as cards up front; the rest sit in the "More projects" drawer */
  featured?: boolean;
  /** One short line above the point-cloud scene: **technique**: what it shows (rich markup) */
  sceneCaption: string;
  preview: {
    video?: string;
    poster: string;
    alt: string;
    fit?: 'cover' | 'contain';
    /** HUD labels over each pane of the composite preview (percent positions) */
    labels?: { text: string; left: string; top: string }[];
  };
  links: ProjectLink[];
  seoDescription: string;
}

export const projects: Project[] = [
  {
    slug: 'boxbunny',
    featured: true,
    title: 'BoxBunny',
    fullTitle: 'BoxBunny · AI boxing sparring robot',
    pill: 'Final-year capstone',
    role: 'Robot Intelligence Lead',
    org: 'NUS CDE4301 Capstone',
    dates: 'Aug 2025 – Apr 2026',
    summary: 'A boxing robot that **recognises each punch as it lands** and coaches you, all running offline on a single Jetson Orin NX.',
    bullets: [
      'Built the punch-recognition model: a voxel + pose transformer, nine iterations in the making',
      'Architected the 10-node ROS 2 runtime on a Jetson Orin NX, using TensorRT to hit 30 fps',
      'Shipped a phone dashboard and an on-device LLM coach · presented at ISPC 2026, Bangkok',
    ],
    points: [
      '**Voxel + pose transformer**: 96.8% accuracy on unseen boxers',
      '**30 fps perception** on Jetson Orin NX with ROS 2 + TensorRT',
      '**On-device LLM coach** and a phone dashboard',
    ],
    tags: ['ROS 2', 'Jetson Orin NX', 'PyTorch', 'TensorRT', 'Transformer', 'YOLO pose', 'LLM + RAG'],
    sceneCaption: '**Feature extraction**: depth voxels + pose keypoints',
    preview: {
      video: '/assets/previews/boxbunny.mp4',
      poster: '/assets/previews/boxbunny.webp',
      labels: [{ text: 'Live inference · Jetson', left: '1.5%', top: '93%' }],
      alt: 'BoxBunny labelling each punch of a boxer in real time',
    },
    links: [
      { label: 'Full deep-dive', href: 'https://cheer-up-dimbo.github.io/IS431/pages/robot-intelligence.html', kind: 'site' },
      // ML repo (github.com/Yogee-s/boxing_action_recognition) is private: re-add once public
      { label: 'ROS 2 repo', href: 'https://github.com/Yogee-s/boxing_robot_ws', kind: 'repo' },
    ],
    seoDescription:
      'BoxBunny: real-time punch recognition (96.8% on unseen boxers at 30 fps) with a voxel-pose transformer, a 10-node ROS 2 runtime on Jetson Orin NX and an on-device LLM coach.',
  },
  {
    slug: 'teleco',
    featured: true,
    title: 'Teleco',
    fullTitle: 'Human localization for the Teleco robot',
    pill: 'Deployed · Osaka Expo 2025',
    role: 'Research Intern',
    org: 'University of Osaka',
    dates: 'May – Aug 2025',
    summary: 'A single room camera that helps a social robot **locate visitors** by mapping their positions onto its SLAM map.',
    bullets: [
      'Trained a YOLOv12 keypoint model to find where each visitor stands',
      'Mapped camera pixels onto the robot’s SLAM map with Kabsch alignment',
      'Ran live at the Yoshikawa Lab pavilion, Osaka Expo 2025, streaming over MQTT',
    ],
    points: [
      '**YOLOv12 keypoints** find where each visitor stands',
      '**Camera → SLAM map** with Kabsch alignment (2–6 cm position error)',
      '**Ran live at Osaka Expo 2025**, streamed to the robots over MQTT',
    ],
    tags: ['YOLOv12', 'SLAM', 'Kabsch', 'MQTT', 'Python'],
    live: true,
    sceneCaption: '**Localization**: camera keypoints onto the SLAM map',
    preview: {
      video: '/assets/previews/teleco.mp4',
      poster: '/assets/previews/teleco.webp',
      labels: [
        { text: 'Detection', left: '1.5%', top: '3%' },
        { text: 'Test lab', left: '1.5%', top: '58%' },
        { text: 'SLAM map', left: '51.5%', top: '3%' },
      ],
      alt: 'Teleco localization: detection, the test lab and the SLAM map',
    },
    links: [
      { label: 'Frontier report', href: '/assets/frontier/frontier_report.pdf', kind: 'doc' },
      { label: 'Code', href: 'https://github.com/Yogee-s/human_detector_ws', kind: 'repo' },
    ],
    seoDescription:
      'Human localization for the Teleco social robot: YOLOv12 keypoints mapped onto a SLAM map with Kabsch alignment (2–6 cm error), deployed at Osaka Expo 2025.',
  },
  {
    slug: 'rl-hand',
    featured: true,
    title: 'RL Dexterous Hand',
    fullTitle: 'Reinforcement learning for the Inspire dexterous hand',
    pill: 'Research internship',
    role: 'Research Intern',
    org: 'A*STAR ARTC',
    dates: 'May – Aug 2024',
    summary: 'Teaching a robot hand with six actuators to **grasp and move objects** with `reinforcement learning` in simulation.',
    bullets: [
      'Ported a DAPG training pipeline from the Adroit research hand to the Inspire hand',
      'Converted URDF → MJCF and tuned collisions and damping in MuJoCo',
      'Remapped the observation space and debugged the reward shaping',
    ],
    points: [
      '**Ported a DAPG pipeline** from the Adroit hand to the Inspire hand',
      '**URDF → MJCF**, with collisions and damping tuned in MuJoCo',
      '**Reward shaping** and observation remapping, debugged end to end',
    ],
    tags: ['MuJoCo', 'RL · DAPG', 'URDF → MJCF', 'Python'],
    sceneCaption: '**Dexterous grasping**: a policy learned in MuJoCo',
    preview: {
      video: '/assets/previews/rl-hand.mp4',
      poster: '/assets/previews/rl-hand.webp',
      labels: [
        { text: 'Policy rollout · MuJoCo', left: '1.5%', top: '3%' },
        { text: 'Inspire joint map', left: '63.5%', top: '3%' },
      ],
      alt: 'Simulated Inspire hand exploring how to grasp an object',
    },
    links: [
      { label: 'Report', href: '/assets/artc_internship/eg3612_final_report.pdf', kind: 'doc' },
      { label: 'Slides', href: '/assets/artc_internship/internship_final_presentation.pdf', kind: 'doc' },
      { label: 'RL repo', href: 'https://github.com/Yogee-s/dexterous_hand-simulation', kind: 'repo' },
      { label: 'Algorithm repo', href: 'https://github.com/Yogee-s/dexterous_hand-learning', kind: 'repo' },
    ],
    seoDescription:
      'Reinforcement learning (DAPG) for the Inspire dexterous hand in MuJoCo at A*STAR ARTC: URDF→MJCF conversion, observation remapping and reward debugging.',
  },
  {
    slug: 'legged-balance',
    featured: true,
    title: 'Legged Balancing Robot',
    fullTitle: 'Two-legged balancing robot · NUS IDP & RoboMaster',
    pill: 'NUS IDP · RoboMaster',
    role: 'Software Member',
    org: 'NUS IDP · RoboMaster',
    dates: '2022 – 2024',
    summary: 'A **two-legged self-balancing robot** for DJI RoboMaster, with `LQR` control tuned in simulation first.',
    bullets: [
      'Modelled the dynamics and tuned LQR/PID in MATLAB/Simulink, then deployed to STM32',
      'Checked the chassis with FEA before fabrication, across three chassis versions',
      'Designed a 3-axis gimbal to keep the pilot’s first-person camera steady',
    ],
    points: [
      '**LQR / PID** tuned in MATLAB/Simulink, then run on an STM32',
      '**FEA-checked chassis**, rebuilt over several prototypes',
      '**3-axis gimbal** that keeps the pilot’s camera steady',
    ],
    tags: ['LQR / PID', 'MATLAB / Simulink', 'STM32', 'SolidWorks', 'COMSOL'],
    sceneCaption: '**LQR balance**: centre of mass held over the wheels',
    preview: {
      video: '/assets/previews/legged-balance.mp4',
      poster: '/assets/previews/legged-balance.webp',
      labels: [
        { text: 'Standing balance', left: '1.5%', top: '3%' },
        { text: 'Final robot', left: '51.5%', top: '3%' },
      ],
      alt: 'The final two-legged robot balancing on its own',
    },
    links: [{ label: 'Code', href: 'https://github.com/BookSWave/EG3301R_BalancingStandard', kind: 'repo' }],
    seoDescription:
      'A two-legged self-balancing robot for DJI RoboMaster: dynamics and LQR/PID tuned in MATLAB/Simulink, FEA-checked chassis, deployed on STM32.',
  },
  {
    slug: 'breaking-bias',
    title: 'Breaking Bias',
    fullTitle: 'Breaking Bias · bias evaluation and mitigation in LLMs',
    pill: 'LLM research · UofT exchange',
    role: 'AI Safety Research',
    org: 'University of Toronto (ECE324)',
    dates: 'Jan – May 2025',
    summary: 'Testing how **biased and easily manipulated** LLMs are when they score written work, and whether committees of judges score more fairly.',
    bullets: [
      'Attacked LLM judges with adversarial essays: prompt injection, embedding noise and scrambled sentences',
      'Built persona and multi-model judging committees (Phi-4-mini, Llama 3.2)',
      'Found that fluent but incoherent text could still receive high scores',
    ],
    points: [
      '**Adversarial essays** built with prompt injection and text noise',
      '**Judging committees** compared against single LLM judges',
      '**Fluent but incoherent text** could still receive high scores',
    ],
    tags: ['LLMs', 'Python', 'PyTorch', 'Prompt injection'],
    sceneCaption: '**Adversarial testing**: manipulating text to mislead LLM judges',
    preview: {
      poster: '/assets/breaking_bias/bias_evaluation.svg',
      alt: 'Research approach: attack LLM judges with adversarial essays, score them with judge committees and compare fairness',
      fit: 'contain',
    },
    links: [{ label: 'Code', href: 'https://github.com/gin-guo/breaking-bias', kind: 'repo' }],
    seoDescription:
      'Breaking Bias: testing how biased and easily manipulated LLM judges are, using adversarial essays with prompt injection and text noise, and comparing persona and multi-model judging committees.',
  },
  {
    slug: 'companion',
    title: 'Robotic Companion',
    fullTitle: 'Robotic Companion · offline AI for eldercare',
    pill: 'Solo research · UREx',
    role: 'Solo Researcher',
    org: 'NUS Immersive Reality Lab × NUS Nursing',
    dates: 'Aug 2025 – May 2026',
    summary: 'An eldercare companion that **reads your mood** and answers with a matching face, fully offline.',
    bullets: [
      'Designed and built the whole robot alone: head, electronics, vision, voice and AI',
      'Speech → on-device LLM → speech in under 0.8 s, with nothing leaving the robot',
      'A differential bevel-gear head that nods and turns, refined over six hardware versions',
    ],
    points: [
      '**Designed and built solo**: head, electronics, vision, voice and AI',
      '**Fully offline** speech → on-device LLM → speech',
      '**Expressive 2-DOF head**, refined over six versions',
    ],
    tags: ['Jetson Orin Nano', 'On-device LLM', 'YOLO pose', 'HSEmotion', 'ESP32', 'SolidWorks'],
    sceneCaption: '**Emotion recognition**: valence and arousal from the face',
    preview: {
      video: '/assets/previews/companion.mp4',
      poster: '/assets/previews/companion.webp',
      labels: [
        { text: 'Live head control', left: '1.5%', top: '3%' },
        { text: 'Finished robot', left: '42.9%', top: '3%' },
      ],
      alt: 'The companion robot head following a 3D model moved on screen',
    },
    links: [
      { label: 'Full docs', href: 'https://yogee-s.github.io/robotic-companion/', kind: 'site' },
      { label: 'Code', href: 'https://github.com/Yogee-s/robotic-companion', kind: 'repo' },
    ],
    seoDescription:
      'A fully offline eldercare companion robot on one Jetson Orin Nano: speech, on-device LLM, emotion recognition and an expressive 2-DOF head, designed and built solo.',
  },
];

/** One colour per featured project (rgb), shared by its Work tab and its title */
export const projectTone: Partial<Record<SceneId, string>> = {
  boxbunny: '244, 114, 182',
  teleco: '255, 181, 71',
  'rl-hand': '255, 127, 102',
  'legged-balance': '74, 222, 128',
};

export const projectBySlug = Object.fromEntries(projects.map((p) => [p.slug, p])) as Record<SceneId, Project>;
