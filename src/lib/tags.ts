// One colour per area, shared by every tag on the site (About stack, Work tags, project pages):
// violet = languages, amber = robotics, cyan = AI / vision, green = sim & control, pink = hardware.
export type Tone = 'violet' | 'amber' | 'cyan' | 'green' | 'pink';

const rules: [RegExp, Tone][] = [
  [/^(python|c\+\+|c)$/i, 'violet'],
  [/mujoco|\brl\b|dapg|matlab|simulink|lqr|pid|comsol|reinforcement/i, 'green'],
  [/solidworks|stm32|esp32|cswa|embedded/i, 'pink'],
  [/ros|jetson|slam|kabsch|mqtt|turtlebot|urdf|imu|lerobot/i, 'amber'],
  [/pytorch|yolo|tensorrt|transformer|llm|language model|rag|grad-cam|hsemotion|bias|piper|parakeet|vision|pose/i, 'cyan'],
];

export const toneFor = (tag: string): Tone | undefined => rules.find(([re]) => re.test(tag))?.[1];
