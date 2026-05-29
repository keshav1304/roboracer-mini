# Documenting our journey with E116 by Lehigh University


## Table of Contents

1. [Week 1 — Hardware Familiarization &amp; Linux Basics](#week-1)
2. [Week 2 — Teleop, PWM Tuning &amp; ROS 2 Introduction](#week-2)
3. [Week 3 — Stereo Camera &amp; AprilTag Detection](#week-3)
4. [Week 4 — Gap Follow Algorithm &amp; Race Preparation](#week-4)
5. [References](#references)

---

## Week 1 — Hardware Familiarization & Linux Basics

Covered the E116 car hardware, batteries, motor/ESC, and basic Ubuntu on the Jetson Orin Nano.

### Key Concepts

#### 1.1 Battery Chemistry

| Battery        | Chemistry | Nominal | Use              |
| -------------- | --------- | ------- | ---------------- |
| LiPo (OVONIC)  | 3S LiPo   | 11.1 V  | Jetson / compute |
| NiMH (Traxxas) | 6-cell    | 7.2 V   | ESC / drivetrain |

LiPo max discharge current: $I_{max} = C \times \text{Capacity (Ah)}$ (e.g. 50C × 1.4 Ah ≈ 70 A).

The onboard checker beeps is LiPo hits near 3.5 V. For desk work the LiPo can be swapped for a barrel jack so the battery doesn't drain and the Jetson keeps getting power.

[![Charging Traxxas NiMH]()](NiMH.mp4)

[![Charging Ovonic LiPo]()](LiPo.mp4)

#### 1.2 Motor & ESC

The E116 uses a Velineon® 380 brushless motor paired with an Electronic Speed Controller (ESC). The ESC drives the motor by switching the phase currents electronically using PWM.

---

#### 1.3 GPU vs. CPU — NVIDIA Jetson Orin Nano

|            | CPU                    | GPU                           |
| ---------- | ---------------------- | ----------------------------- |
| Core count | Few (high clock speed) | Thousands (lower clock speed) |
| Best for   | Serial, branchy logic  | Parallel numerical workloads  |
| On Jetson  | ARM Cortex-A78AE       | Ampere GPU (1024 CUDA cores)  |

The **NVIDIA Jetson Orin Nano** is designed for edge AI inference combining CPU, GPU, and memory in a low-power package suitable for an autonomous vehicle.

---

#### 1.4 Ubuntu Linux Basics

Key commands learned in the terminal:

```bash
ls -al               # list files with permissions
cd folder / cd ..    # navigate directories
mkdir new_folder     # create directory
cp file1 file2       # copy file
mv src dst           # move/rename
rm -r folder         # remove recursively
chmod a+x file.py    # make executable
grep pattern file    # search text
python3 script.py    # run Python script
```

### Demo Video

[![Video walkthrough of hardware]()](Hardware_Overview.mp4)

### Week 1 — Problems Encountered

LiPo charge settings (voltage/current) were unclear at first. The Traxxas pack had no simple way to see state of charge, and multimeter readings were unreliable. A Traxxas charger with a built-in display was used instead.

## Week 2 — Teleop, PWM Tuning & ROS 2 Introduction

Implementing keyboard teleop, PWM tuning for servo and ESC, and an intro to ROS 2 Humble.

### Key Concepts

#### 2.1 PWM tuning

E116 PWM runs at 200 Hz. Duty cycle is set as a percentage; each step is about 0.39% ($100\%/256$).

Tuned values were saved in `e116.yaml`:

| Parameter              | Typical range   |
| ---------------------- | --------------- |
| `motor_forward_start`  | 30.00 – 31.50 % |
| `motor_backward_start` | 27.50 – 29.00 % |
| `servo_center`         | ~29.70 %        |

![PWM for Servo](servo-pwm.png)
![PWM for Motor](motor-pwm.png)

#### 2.2 SSH

```bash
ssh -X username@ipaddress
```

`-X` forwards X11 so GUI apps can open on the laptop. Commands run on the Jetson.

[![Video of SSH]()](Week1_SSH.mp4)

#### 2.3 ROS 2 basics

Distribution: Humble.

```
[Publisher] --> /topic --> [Subscriber]
```

```bash
ros2 node list
ros2 topic list
ros2 topic echo /turtle1/cmd_vel
ros2 topic pub /turtle1/cmd_vel geometry_msgs/msg/Twist \
  "{linear: {x: 2.0, y: 0.0, z: 0.0}, angular: {x: 0.0, y: 0.0, z: 1.8}}"
ros2 run rqt_graph rqt_graph
```

[![Video of turtlesim]()](turtlesim.mov)

### Demo Video

[Telop Video](Teleop.mp4)
[PWM Tuning](PWM_Tuning.mp4)

### Week 2 — Problems Encountered

The drive battery died quickly during PWM tuning. Full charge (12.6 V on the 3S LiPo) was needed. At 12.3 V runtime was already too short to finish a session.

---

## Week 3 — RealSense & AprilTags

### Overview

Set up the Intel RealSense D435i on ROS 2, built a workspace with `apriltag_ros`, and moved teleop into launch files.

### Key Concepts

#### 3.1 ROS 2 Workspace and Package Structure

```
team_ws/
├── src/
│   ├── e116/
│   │   ├── e116/
│   │   ├── launch/
│   │   └── config/
│   ├── apriltag/
│   ├── apriltag_ros/
│   └── apriltag_msgs/
├── build/
├── install/
└── log/
```

```bash
cd ~/team_ws
colcon build
source install/setup.bash
```

#### 3.2 AprilTags

Tag family used was tag36h11. Each tag has an ID; `apriltag_ros` publishes pose in the camera frame.

![Example AprilTag (tag36h11 family, ID=1)](Apriltag.png)

#### 3.3 RViz

Tag detections show up as TF frames in RViz (X forward, Y left, Z up).

![Video of April Tag tracking in RViz](April Tag Detection.MOV)

#### 3.4 Ackermann topic

Teleop and planners publish `ackermann_msgs/AckermannDriveStamped` on `/e116_ackermann`:

```
ackermann_msgs/AckermannDriveStamped
  drive:
    steering_angle: <radians>
    speed: <m/s>
```

`e116_racecar` subscribes and converts to servo/ESC PWM.

### Week 3 — Problems Encountered

X11 forwarding did not show the pygame teleop window. A terminal teleop node (WASD over ROS) was written instead to make teleop work.

---

## Week 4 — Gap Follow & Race Prep

### Overview

Ran autonomous gap follow with AprilTags on the left wall (IDs 100–199) and right wall (200+) definining a corridor and the car steering toward the midpoint.

### Key Concepts

#### 4.1 Gap follow (`gap_follow.py`)

1. Read tag poses from `/tf`
2. Pick one left tag (ID ≤ 199) and one right tag (ID ≥ 200)
3. Steer toward the midpoint in the camera frame
4. Publish `AckermannDriveStamped` on `/e116_ackermann`

Main tunables were `SPEED1`, `SPEED2`, `angle_scale`, `SINGLE_TAG_OFFSET`, `t_keep1`, `t_keep2`.

![Gap Follow Pipeline](e116_gap_follow_pipeline.svg)

#### 4.2 Headless track workflow

1. SSH to Jetson
2. Launch camera, apriltag, gap_follow, racecar nodes
3. Unplug from wall socket and connect LiPo + NiMH
4. Set car on track

#### 4.3 Track layout

```
100-series (left)          200-series (right)
|                                |
|              ↑ path            |
|                                |
```

### Demo Video

[Video of FTG](FTG(1).mp4)

### Week 4 — Problems Encountered

With one tag visible, the stock controller used a fixed `turningAngle` and the car jerked sideways. That was replaced with steering toward an offset goal (`SINGLE_TAG_OFFSET`) when only one wall tag is seen.

Parameter tuning over SSH was awkward. Foxglove helped view the camera and tag frames, but tags sometimes stayed on screen after they left the field of view, which made it harder to match tuning to what the camera still saw.

Battery life was still short (same as Week 2). Both packs were charged before track time; LiPo was swapped on AC power to avoid rebooting the Jetson.

---

## References

1. [ROS 2 Humble](https://docs.ros.org/en/humble/)
2. [Intel RealSense D435](https://store.realsenseai.com)
3. [AprilTag library](https://github.com/AprilRobotics/apriltag)
4. [apriltag_ros](https://github.com/christianrauch/apriltag_ros)
5. [Traxxas 1/16 E-Revo VXL](https://traxxas.com/71076-8-116-e-revo-vxl-wbattery)
6. [Jetson Orin Nano](https://www.nvidia.com/en-us/autonomous-machines/embedded-systems/jetson-orin/)
7. [Ubuntu command line](https://ubuntu.com/tutorials/command-line-for-beginners)
8. [F1TENTH gap follow lab](https://f1tenth-coursekit.readthedocs.io/en/stable/assignments/labs/lab4.html)

---

### Acknowledgements

Thanks to Professor Rosa Zheng (Lehigh ECE) for the E116 platform, carrier board, and lab materials this journal is based on.

---

*Compiled from ECE lab weeks 1–4. Hardware and parameters match the Lehigh E116 car.*

---

### Evaluation for RoboRacer-mini

Notes below come from running the E116 stack and thinking about what to keep or change.

- ROS 2: The split between `gap_follow` (planner) and `e116_racecar` (PWM driver) on `/e116_ackermann` is a good teaching pattern. The overhead is real—`colcon build`, sourcing `setup.bash`, launch files, `tf`, multiple terminals, SSH-only operation. Early RoboRacer-mini labs should probably ship a pre-built workspace; full from-source builds can come later.

- Traxxas 1/16 E-Revo VXL: About $300 RTR with ESC, motor, radio, and NiMH. Traxxas quotes ~1.09 kg for the roller alone. With Jetson, carrier, RealSense, extra LiPo, and brackets, the suspension arms and plastic parts flex noticeably. Workable for a first autonomous lap, not ideal if the goal is consistent lap-to-lap steering. A stiffer 1/10 pan car or F1TENTH-style frame would be easier to tune.

- Jetson Orin Nano: Dev kit around $249. Weeks 1–4 did not need the GPU; AprilTag gap follow ran on CPU via `apriltag_ros`. Students still manage JetPack Linux, two power sources, WiFi + SSH, GPIO/PWM on the custom carrier, and slow rebuilds on the board. Jetson makes sense for later vision/ML modules; smaller classes might share a few boards or use lighter compute for the first half of the course.

- BOM: Roughly $1,200–1,600 per car if you price Jetson (~$249), Traxxas (~$300), D435i (~$350–450), LiPo/charger, E116-style carrier, and track/tags/spares. That is several times a basic Donkeycar bill of materials. Cost goes down with shared Jetsons, one standard chassis design, and printed tags instead of a fully built-out wall.

- E116 gap follow: This is AprilTag corridor following (midpoint between 100-series and 200-series tags), not the [F1TENTH follow-the-gap lab](https://f1tenth-coursekit.readthedocs.io/en/stable/assignments/labs/lab4.html) on lidar or a depth scan. It is a reasonable first closed-loop autonomy assignment on a marked course. The RealSense depth stream is barely used. Single-tag cases needed code changes; autonomous speeds in practice were much lower than the template defaults (on the order of 0.1–0.15 m/s vs 0.75–1.2 m/s). Worth keeping as an early module; follow with real depth-based gap follow so the name matches what students read elsewhere.

- RealSense D435i modules worth adding: (1) RGB streams and ROS image topics; (2) depth threshold / emergency stop; (3) project depth to a 2D scan and run classic follow-the-gap; (4) intrinsics + ground plane for cone distance; (5) AprilTag corridor (E116 weeks 3–4); (6) onboard IMU and simple fusion; (7) rosbag logging and a small deploy lab (record on car, train offboard, run policy).
