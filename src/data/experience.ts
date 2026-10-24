import type { SceneId } from './projects';

export interface Role {
  dates: string;
  /** YYYY-MM, used to draw each role on a shared timeline */
  start: string;
  end: string;
  role: string;
  org: string;
  line: string;
  project?: SceneId;
  tag?: string;
}

export const experience: Role[] = [
  {
    dates: 'Aug 2025 – May 2026',
    start: '2025-08',
    end: '2026-05',
    role: 'Research Student',
    org: 'NUS Immersive Reality Lab',
    line: '**Offline eldercare companion robot** with NUS Nursing: `voice`, `vision` and an **expressive robotic head**.',
    project: 'companion',
  },
  {
    dates: 'Aug 2025 – Apr 2026',
    start: '2025-08',
    end: '2026-04',
    role: 'Robot Intelligence Lead',
    org: 'BoxBunny · Final-year capstone',
    line: '**Real-time punch recognition** on a `Jetson`, the `ROS 2` runtime and an `LLM` coach (**ISPC 2026**).',
    project: 'boxbunny',
  },
  {
    dates: 'Nov 2025 – Jan 2026',
    start: '2025-11',
    end: '2026-01',
    role: 'Robot Operator',
    org: 'Cortex AI',
    line: '**VLA training data**: teleoperated `YAM arms` and egocentric `Quest 3` capture, via `LeRobot`.',
    tag: 'VLA data',
  },
  {
    dates: 'May – Aug 2025',
    start: '2025-05',
    end: '2025-08',
    role: 'Research Intern',
    org: 'The University of Osaka',
    line: '**Human localization** with `YOLOv12` + `SLAM` for a social robot, **deployed live at Osaka Expo 2025**.',
    project: 'teleco',
    tag: 'Deployed',
  },
  {
    dates: 'May – Aug 2024',
    start: '2024-05',
    end: '2024-08',
    role: 'Research Intern',
    org: 'A*STAR ARTC',
    line: '**Dexterous-hand RL** in `MuJoCo`: ported the `DAPG` pipeline to the **Inspire hand**.',
    project: 'rl-hand',
  },
  {
    dates: 'Aug 2023 – Dec 2024',
    start: '2023-08',
    end: '2024-12',
    role: 'Software Member',
    org: 'NUS RoboMaster',
    line: '**Two-legged balancing robot** with `LQR/PID` (`Simulink` → `STM32`), plus a **CV aim-bot** prototype.',
    project: 'legged-balance',
  },
];

export const education = {
  school: 'National University of Singapore',
  degree: 'Bachelor of Engineering · Engineering Science',
  dates: 'Aug 2022 – Jun 2026',
  details: [
    'Specialisation in Computational Engineering Science',
    'Minors in Innovation & Design and Computing',
    'Exchange semester at the University of Toronto (Jan – May 2025)',
  ],
  cert: 'SolidWorks CSWA certified',
};

export const leadership = [
  {
    role: 'President',
    org: 'NUS Engineering Science Student Wing',
    dates: 'Aug 2023 – Aug 2024',
    line: 'Led the student wing\'s team through its events. The year before, on the planning committee for MakerMania23, a national prototyping competition.',
  },
  {
    role: 'Student Ambassador',
    org: 'National University of Singapore',
    dates: 'Jan 2023 – May 2026',
    line: 'Represented NUS at outreach and official university events.',
  },
];
