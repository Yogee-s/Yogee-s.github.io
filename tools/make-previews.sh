#!/usr/bin/env bash
# Builds the short muted loops used on the homepage Work chapters.
# Every preview is a 1280x720 "console" composed from existing project media,
# so the source files under public/assets/ stay untouched.
#   usage: bash tools/make-previews.sh
set -euo pipefail
cd "$(dirname "$0")/../public/assets"
OUT=previews
mkdir -p "$OUT"

ENC=(-c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -movflags +faststart -an -r 30)

poster() { # $1 = mp4, writes matching .webp from ~0.6 s in
  ffmpeg -v error -y -ss 0.6 -i "$1" -frames:v 1 -c:v libwebp -quality 78 "${1%.mp4}.webp"
}

# BoxBunny · live inference with the prediction HUD
ffmpeg -v error -y -ss 23 -t 9 -i boxbunny_capstone/inference_person_1.mp4 \
  -vf "scale=1280:720:flags=lanczos" "${ENC[@]}" "$OUT/boxbunny.mp4"

# Teleco · operator console: detection feed + Expo room (left), SLAM map (right)
# The two detection stills (visitor near / far side) cross-fade.
ffmpeg -v error -y \
  -loop 1 -t 4.4 -i frontier/teleco_detect_open.webp \
  -loop 1 -t 4.4 -i frontier/teleco_detect_behind.webp \
  -ss 7 -t 3 -i frontier/expo_project.mp4 \
  -filter_complex "\
[0:v]fps=30,format=yuv420p[a];[1:v]fps=30,format=yuv420p[b];\
[a][b]xfade=transition=fade:duration=0.8:offset=3.6,split=2[s1][s2];\
[s1]crop=667:413:561:52,scale=640:396:flags=lanczos[cam];\
[s2]crop=515:580:20:0,scale=640:720:flags=lanczos[map];\
[2:v]setpts=PTS*2.667,fps=30,crop=1080:547:0:600,scale=640:324:flags=lanczos,trim=duration=8,setpts=PTS-STARTPTS[room];\
[cam][room]vstack[left];[left][map]hstack,trim=duration=8,setsar=1[v]" \
  -map "[v]" "${ENC[@]}" "$OUT/teleco.mp4"

# Companion · live head control (left) beside the finished robot's face (right)
ffmpeg -v error -y \
  -ss 2 -t 8 -i robotic_companion/live_motor_control_with_kinematics.mp4 \
  -loop 1 -t 8 -i robotic_companion/robot_happy_face.jpg \
  -filter_complex "\
[0:v]scale=530:720:flags=lanczos,setsar=1[l];\
[1:v]crop=960:921:0:330,scale=750:720:flags=lanczos,fps=30,format=yuv420p,setsar=1[r];\
[l][r]hstack,trim=duration=8[v]" \
  -map "[v]" "${ENC[@]}" "$OUT/companion.mp4"

# RL hand · policy exploring the grasp (left) + Inspire joint map (right)
ffmpeg -v error -y \
  -ss 0 -t 10 -i artc_internship/reinforcement_learning_model_trying.mp4 \
  -loop 1 -t 10 -i artc_internship/inspire_joints_mapped.webp \
  -filter_complex "\
[0:v]fps=30,scale=800:720:flags=lanczos,setsar=1[l];\
[1:v]scale=-2:720:flags=lanczos,crop=480:720,fps=30,format=yuv420p,setsar=1[r];\
[l][r]hstack,trim=duration=10[v]" \
  -map "[v]" "${ENC[@]}" "$OUT/rl-hand.mp4"

# Legged balance · standing balance close-up (left) + driving the final robot (right)
ffmpeg -v error -y \
  -t 6.3 -i idp_projects/tuning/standing_balancing.mp4 \
  -ss 2 -t 6.3 -i idp_projects/evolution_of_balancing_robot/eg3301r_2_legged_balancing_final.mp4 \
  -filter_complex "\
[0:v]fps=30,scale=642:720:flags=lanczos,setsar=1[l];\
[1:v]fps=30,crop=638:720:290:0,setsar=1[r];\
[l][r]hstack,trim=duration=6.3[v]" \
  -map "[v]" "${ENC[@]}" "$OUT/legged-balance.mp4"

for f in "$OUT"/*.mp4; do poster "$f"; done
ls -la "$OUT"
