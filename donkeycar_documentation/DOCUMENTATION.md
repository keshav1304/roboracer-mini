# Donkeycar Documentation

## TL;DR

[Donkeycar](https://github.com/autorope/donkeycar) is an open-source Python framework for autonomous driving. This repo runs it on the **Waveshare PiRacer Pro**, a 1/10-scale kit built around a Raspberry Pi.

The car uses Donkeycar's modularity to construct many parts and have them communicate with each other. The parts include: a Pi camera that captures frames, a controller (gamepad, web UI, or autopilot) produces steering and throttle, and a PCA9685 board on the PiRacer Pro carrier drives the servo and ESC over I2C.

Autonomy comes from how you control the autopilot control mode based on inputs from the Pi camera or other potentialy sensors.

**Key videos:** [Line following](https://www.youtube.com/watch?v=U_DXo-ofhXc) · [Lane keeping](https://www.youtube.com/watch?v=HCT4SYDuZ0k)

---

## Table of Contents

- [Donkeycar Documentation](#donkeycar-documentation)
  - [TL;DR](#tldr)
  - [Table of Contents](#table-of-contents)
  - [What is Donkeycar?](#what-is-donkeycar)
  - [Waveshare PiRacer Pro](#waveshare-piracer-pro)
  - [Implementation on the Car](#implementation-on-the-car)
    - [Software pipeline](#software-pipeline)
  - [Hardware Setup](#hardware-setup)
    - [Batteries](#batteries)
    - [PiRacer image and first boot](#piracer-image-and-first-boot)
    - [PWM tuning](#pwm-tuning)
  - [Line Following](#line-following)
    - [How it works](#how-it-works)
    - [Enabling line follow](#enabling-line-follow)
    - [Tuning](#tuning)
  - [Lane Keeping](#lane-keeping)
    - [How it works](#how-it-works-1)
    - [Enabling lane keep](#enabling-lane-keep)
    - [Tuning and edge cases](#tuning-and-edge-cases)
  - [Evaluation for RoboRacer-mini](#evaluation-for-roboracer-mini)
    - [Pros](#pros)
    - [Cons](#cons)
    - [Bottom line](#bottom-line)
  - [Further Steps](#further-steps)
    - [Modules and algorithms to explore](#modules-and-algorithms-to-explore)
    - [What to build on next](#what-to-build-on-next)
    - [Sensors for a Donkeycar-inspired RoboRacer-mini](#sensors-for-a-donkeycar-inspired-roboracer-mini)
  - [Related Docs](#related-docs)

---

## What is Donkeycar?

Instead of wiring together ROS nodes and launch files, Donkeycar allows you to assemble a vehicle from small Python **parts** that pass named data through a single loop. It is entirely a software system that runs on any hardware of your choice.

The main entry point is `manage.py`, which reads settings from `config.py` and optional overrides in `myconfig.py`. Donkeycar also ships with a Unity based simulator so students can iterate on software before touching hardware.

Donkeycar is simple to onboard with just one Python process, a web portal for interactivity, and no overheads of setting up Linux and ROS.

---

## Waveshare PiRacer Pro

The [PiRacer Pro](https://www.waveshare.com/piracer-pro.htm) is a 1/10-scale racing chassis sold by Waveshare as a complete Pi car kit. Key hardware on the board:

| Component | Role |
| --- | --- |
| Raspberry Pi (3/4/5) | Onboard compute |
| Pi Camera Module | Front-facing vision (160×120 in our config) |
| PiRacer Pro expansion board (PCA9685 @ I2C `0x40`) | Power, battery management, and 16-channel PWM for servo + ESC |
| SSD1306 OLED @ `0x3c` | Status display (optional) |
| Brushless motor + ESC | Drive |
| Steering servo | Ackermann steering |

<img src="pictures/piracer%20pro%20hardware.jpg" alt="PiRacer Pro assembled car" width="480">

*Assembled PiRacer Pro: Pi 4, expansion board, front camera, and 18650 pack*

The PCA9685 channel map used in this project:

| Channel | Device |
| --- | --- |
| 0 | Steering servo |
| 1 | ESC (throttle) |

PWM values are calibrated per car in `config.py` and the standalone teleop scripts under `donkeycar/mycar/teleop/`.

---

## Implementation on the Car

All vehicle code lives under `donkeycar/mycar/`. The stack is wired together in `manage.py` using Donkeycar's `Vehicle` loop.

### Software pipeline

```
Pi Camera (PICAM)
        |
        v
ImagePreprocessor          ← 180° rotation, optional fisheye undistort
        |
        v
Controller / Autopilot     ← gamepad, web UI, CV, or trained model
        |
        v
       ESC                 ← PWM to steering servo (ch 0) and ESC (ch 1)
```

<img src="pictures/donkeycar%20web%20UI.png" alt="Donkeycar web control portal" width="480">

*Donkeycar web UI: live camera feed, mode selection, and virtual joystick*

**Drivetrain:** `DRIVE_TRAIN_TYPE = "SERVO_ESC"` uses the onboard PCA9685 to output standard RC-style PWM pulses to the steering servo and ESC. Steering and throttle limits are set in `config.py` (`STEERING_LEFT_PWM`, `THROTTLE_FORWARD_PWM`, etc.).

**Camera:** The Pi Camera captures at 160×120 RGB. Because the camera is mounted upside-down on the chassis, `myconfig.py` sets `CAMERA_ROTATE_180 = True`. An optional fisheye undistortion step (`undistort.py`) can be enabled after checkerboard calibration.

**Autopilot modes:** The project supports several control paths:

- **Manual teleop**: USB gamepad via `manage.py --js`, the web portal (`LocalWebController` on port 8887), or the lightweight standalone script `teleop/teleop_local.py` (no full Donkeycar stack required).
- **Classical CV**: `cv_parts/lane_keeper.py` and `cv_parts/line_follower.py` follow colored tape or lane lines using HSV thresholding and a PID controller. Enabled in `myconfig.py` with `USE_CV_AUTOPILOT = True`.
- **Machine learning**: record driving sessions into tubs, then train with `train.py` and drive with `manage.py drive --model=models/mypilot.h5`.

**Configuration.** Base defaults are in `config.py`; car-specific overrides (camera rotation, CV tuning, lane colors) go in `myconfig.py`. PWM calibration can be verified with `teleop/test_pwm.py`.

**Simulator.** `donkeycar/mysim/` mirrors the car config for Donkey Gym, so the same `manage.py drive` workflow can target a virtual track on a laptop.

---

## Hardware Setup

Getting the PiRacer Pro running is straightforward once the batteries and PWM are sorted. In practice, those two steps took much longer than expected.

### Batteries

The PiRacer Pro expansion board holds **four 18650 cells** (not included in the kit). They are wired **two in parallel, two in series (2P2S)**, giving a nominal **8.4 V** pack that feeds the motor and a buck-boost regulator for the Pi.

| Detail | Notes |
| --- | --- |
| Cell format | Flat-top 18650 Li-ion, **length under 67 mm** |
| Charger | Waveshare supplies an **8.4 V** charger; match the jack polarity before first plug-in |
| On-board protection | HY2120 + AOD514 circuit: over-charge, over-discharge, over-current, and short-circuit protection |

Battery setup is more tedious than it looks. You have to source four matching cells, confirm they physically fit, insert them with the correct orientation, and charge through the onboard port without repeatedly pulling the pack apart. There is no simple "state of charge" readout beyond what the OLED shows when Donkeycar is running.

We were struggling with getting the car started due to having purchased **faulty 18650 cells** without realizing it. The car would not power on and the cells would consistently read 0V across the terminals. After realising that there were issues with the cells did we order new ones. Meanwhile, while experimenting with the old cells, including putting them in reverse order, the Pi or the ESC did not get damaged due to the onboard power board absorbing a lot of that abuse. The power electronics are the sturdiest part of the kit.

Cells we ordered: [Svenirven 18650 rechargeable batteries (Amazon)](https://www.amazon.com/Svenirven-Batteries-Rechargeable-Flashlight-Headlamps/dp/B0GX6MKR6B/ref=sr_1_8?crid=1YQGD44X3DQG2&dib=eyJ2IjoiMSJ9.CRQlVxsiMmg8iZdUBAFIK8uKjDPP7gqnPIEAPIt8yqxwsNUtCS8BwuBW07brIZnyqzyYsHT-rW7R8oGtfG4lNoOvThXWHiN2JANt-_dGE_t5Q1tTJFoukSu8RnEpASm67UjT7hPj6hFQY98taVFyxTZSq5CjQyKxNDRtOQYRLEvdQZ2RaNJsC2PwJcvn_hhRlZpSFdYyDzcuyVjW1SsJt_PdezSQqogmcQjPuaR7Coc.4E6F6Y9zbJEcMUiV_9qhe0gdNR93Ye2UoxdWLywGJRg&dib_tag=se&keywords=18650%2Bbattery&qid=1780532864&sprefix=18650%2Caps%2C193&sr=8-8) (order four; confirm flat-top and under 67 mm before buying).

### PiRacer image and first boot

Waveshare ships a **pre-built microSD image** on their [wiki](https://www.waveshare.com/wiki/PiRacer_Pro_AI_Kit) with Raspberry Pi OS, Donkeycar, and PiRacer drivers already installed. That image was initially not installing the Pi 5. We initially tried setting up the Pi 5 with the latest versions of Pi OS and Python, but Donkeycar did not work on that. So, we downgraded to a Pi 4 and started from the provided image rather than building from scratch.

Typical first-boot steps:

1. Flash or use the provided SD card; insert into the Pi on the expansion board.
2. Install four charged 18650 cells; connect the 8.4 V charger until the pack is full.
3. Power on and connect over WiFi or Ethernet; SSH into the Pi.
4. Enable I2C if it is not already on: `sudo raspi-config` → Interface Options → I2C.
5. Verify hardware: `sudo i2cdetect -y 1` should show `0x3c` (OLED) and `0x40` (PCA9685).

The pre-built image gets you moving quickly, but it also locks you into whatever Python and Donkeycar versions Waveshare last bundled, typically an older Raspberry Pi OS and Python 3.7 (see [Evaluation](#evaluation-for-roboracer-mini)).

### PWM tuning

Each car's servo and ESC respond to slightly different pulse widths. PWM must be calibrated before teleop or autopilot, with **wheels off the ground** for the first pass.

**Step 1: Verify I2C and run the sweep test**

```bash
cd ~/roboracer-mini/donkeycar/mycar/teleop
python3 test_pwm.py
```

Our custom script steps through centre, full left, full right, slow forward, and slow reverse. Confirm the servo sweeps smoothly and the wheels spin in the expected directions.

**Step 2: Copy values into config**

Update both `config.py` (for `manage.py`) and the teleop scripts so all paths use the same numbers:

| Parameter | Our calibrated values |
| --- | --- |
| Steering centre | 400 |
| Steering full left | 500 |
| Steering full right | 300 |
| Throttle stop | 400 |
| Throttle forward max | 450 |
| Throttle reverse max | 320 |

**Step 3: confirm with teleop**

```bash
python3 teleop_local.py
```

Reverse on this ESC requires a **double-tap** on the stick (brake, then reverse), a hardware safety feature, not a software bug.

---

## Line Following

Line following is the simpler of the two CV autopilots. It tracks a **single colored line** (yellow, orange, or red tape) and steers to keep that line at a fixed horizontal position in the camera image.

[![Line following demo](https://img.youtube.com/vi/U_DXo-ofhXc/hqdefault.jpg)](https://www.youtube.com/watch?v=U_DXo-ofhXc)

*Autonomous line following on the PiRacer Pro*

### How it works

The controller lives in `cv_parts/line_follower.py`. Each frame:

1. Extract a horizontal **scan band** at `SCAN_Y` with height `SCAN_HEIGHT`.
2. Convert to HSV and threshold for red/orange/yellow (hue wraps at 0 and 170–179).
3. Build a column histogram; the peak column is the line position.
4. A PID controller drives that peak toward `TARGET_PIXEL`.
5. Throttle ramps down on turns and up on straights.

```
Camera frame
┌─────────────────────────────┐
│                             │
│  ─ ─ ─ scan band ─ ─ ─ ─ ─  │  ← SCAN_Y
│         ████                │  ← yellow pixels detected
│                             │
└─────────────────────────────┘
         ↑
    PID steers to keep peak at TARGET_PIXEL
```

<img src="pictures/line%20following%20overlay.png" alt="LineFollower CV overlay showing scan band and detected tape" width="480">

*LineFollower overlay: scan band, yellow mask, and steering/throttle telemetry*

### Enabling line follow

In `myconfig.py`:

```python
USE_CV_AUTOPILOT = True
CV_CONTROLLER_MODULE = "cv_parts.line_follower"
CV_CONTROLLER_CLASS = "LineFollower"
```

Run with the web UI or gamepad for e-stop and PID tuning:

```bash
cd ~/roboracer-mini/donkeycar/mycar
python manage.py drive
```

Toggle into autopilot mode from the web portal (`local` / `local_angle`). The CV overlay (`OVERLAY_IMAGE = True`) draws the scan band and diagnostics on the stream.

### Tuning

| Parameter | Purpose |
| --- | --- |
| `SCAN_Y`, `SCAN_HEIGHT` | Where in the frame to look for the line |
| `COLOR_THRESHOLD_LOW/HIGH` | HSV bounds for tape color |
| `TARGET_PIXEL` | Desired column for the line (`None` = lock on first detection) |
| `CONFIDENCE_THRESHOLD` | Minimum pixel count before steering updates |
| `CV_PID_P`, `CV_PID_D` | Steering response; adjust live with R2/L2 if mapped |
| `THROTTLE_MAX`, `THROTTLE_MIN` | Speed on straights vs turns |

Use `scripts/hsv_picker.py` on a captured frame to find HSV bounds for your tape and lighting. Line follow works well on a single center or edge line; it does not know about lane width or a second boundary.

---

## Lane Keeping

Lane keeping extends line follow to **two boundaries**. The car steers toward the **midpoint** between a left and right lane marker, which keeps it centered in a corridor rather than hugging one tape edge.

[![Lane keeping demo](https://img.youtube.com/vi/HCT4SYDuZ0k/hqdefault.jpg)](https://www.youtube.com/watch?v=HCT4SYDuZ0k)

*Autonomous lane keeping between yellow tape and white lane line*

### How it works

The controller is `cv_parts/lane_keeper.py`. Each frame:

1. Scan the same horizontal band (`LK_SCAN_Y`, `LK_SCAN_HEIGHT`).
2. Detect a **left line** and **right line** with separate HSV masks.
3. In `yellow_white` mode (our default): yellow/orange/red tape on the left, white or light-gray paint on the right.
4. Find the strongest line-like contour in each half of the image.
5. Compute `lane_center = (left_x + right_x) / 2` and PID-steer so the center aligns with the image midpoint.
6. If only one line is visible, estimate center using `LK_LANE_WIDTH` as an offset.

```
        left tape          right line
            |                    |
            |    lane_center     |
            |         ↓          |
            |    ────●────       |  ← steer to center ● on image
            |                    |
```

### Enabling lane keep

This is the active autopilot in our `myconfig.py`:

```python
USE_CV_AUTOPILOT = True
CV_CONTROLLER_MODULE = "cv_parts.lane_keeper"
CV_CONTROLLER_CLASS = "LaneKeeper"

LK_LANE_MODE = "yellow_white"
LK_LANE_WIDTH = 60          # pixels between lines when only one is seen
LK_YELLOW_LOW = (20, 100, 100)
LK_YELLOW_HIGH = (40, 255, 255)
LK_WHITE_LOW = (0, 0, 150)
LK_WHITE_HIGH = (179, 80, 255)
```

Run the same way as line follow: `python manage.py drive`, then switch to autopilot in the web UI.

### Tuning and edge cases

| Parameter | Purpose |
| --- | --- |
| `LK_LANE_WIDTH` | Estimated pixel width when only one boundary is visible |
| `LK_CONFIDENCE_THRESHOLD` | Minimum contour area to count as a line |
| `LK_YELLOW_*`, `LK_WHITE_*` | HSV bounds for each boundary type |
| `CV_PID_P`, `CV_PID_D` | Same PID gains as line follow |

Lane keeper handles more realistic track layouts than single-line follow, but it needs **both markers visible** for best results. On sharp turns or when one line leaves the frame, it falls back to the single-line estimate and can drift if `LK_LANE_WIDTH` is wrong. The overlay color-codes left (yellow) and right (white) in the scan strip, which makes debugging much easier than line follow alone.

---

## Evaluation for RoboRacer-mini

Notes below come from building and running the PiRacer Pro stack in this repo, and from comparing it to the Lehigh E116 platform.

### Pros

- **Simple software model.** One Python process, named parts, and a web UI beat ROS 2 launch files and multi-terminal SSH workflows for early labs. Students can teleop, record, and run CV autopilot without learning colcon or `tf`.
- **Low cost and small form factor.** The PiRacer Pro kit is substantially cheaper than a Jetson + Traxxas + RealSense build, and the 1/10 chassis is easier to store and transport.
- **Sturdy power board.** The expansion board's battery protection, charging, and 5 V regulation handled bad cells and repeated plug/unplug cycles without bricking the Pi. Hardware power management is a real strength.

### Cons

- **Poor and outdated documentation.** Waveshare's wiki, manual, and pre-built image instructions reference **old Raspberry Pi models**, older OS images, and setup steps that no longer match current boards. Donkeycar's own docs assume the classic Donkey build, not the PiRacer Pro carrier. Expect to cross-reference GitHub issues, [DIY Robocars PiRacer tips](https://www.diyrobocars.com/2025/06/28/tips-for-installing-donkeycar-on-the-waveshare-piracer-pro/), and this repo rather than following one official guide end to end.
- **Ancient Python stack.** Donkeycar has not kept pace with modern Python. The Waveshare image and the Donkeycar versions it supports target **Python 3.7–3.8** and older TensorFlow/PyTorch pins. The whole system runs on legacy dependencies because that is what Donkeycar still supports.
- **Poor camera quality.** The kit ships with a basic Pi Camera (OV5647-class, wide fisheye). Donkeycar downscales to 160×120 for inference, which is fine for demos but loses detail for lane edges, distant markers, and ML training. Distortion, rolling shutter, and weak low-light performance show up quickly once you leave a well-lit tape course.
- **Camera-only sensing.** The PiRacer Pro stack, as shipped and as used here, has no lidar, IMU, encoders, or depth camera in the loop. All autonomy is inferred from a single RGB stream. That limits obstacle avoidance, speed estimation, and robust localization compared with platforms like the Lehigh E116 (RealSense + AprilTags).
- **Camera and lighting sensitivity.** HSV lane detection works in controlled indoor lighting but degrades quickly with glare, shadows, or tape color drift. Lane keeper is better than line follow on a two-line course, but both are classical CV, not robust to outdoor conditions without more work.

### Bottom line

The PiRacer Pro + Donkeycar stack is a workable introductory physical-AI platform if you accept manual battery management, legacy Python, a basic camera, and camera-only sensing. It fits RoboRacer-mini's goal of lowering the software barrier versus ROS-first courses. For competition-grade reliability or modern ML tooling, budget time to refresh the OS/Python stack carefully, or treat Donkeycar as a stepping stone and migrate autopilot code to a newer framework once students outgrow the defaults.

---

## Further Steps

Line follow and lane keep are a reasonable first closed-loop module. The Donkeycar parts model makes it straightforward to layer more algorithms and sensors on the same `manage.py` loop without rewriting the drivetrain.

### Modules and algorithms to explore

| Module | What it adds | Starting point in Donkeycar |
| --- | --- | --- |
| **End-to-end ML pilot** | Record human driving in tubs, train a CNN to map image → steering/throttle | `manage.py drive` (record) → `train.py` → `manage.py drive --model=...` |
| **PyTorch / ResNet pilot** | Stronger vision model than the default linear head | `DEFAULT_MODEL_TYPE = 'resnet18'` in `config.py` |
| **Path following** | Drive a saved trajectory with PID instead of vision | `PATH_FILENAME`, `PID_P/I/D` in `config.py`; record path with joystick buttons |
| **Donkey Gym simulator** | Same `manage.py drive` workflow on a virtual track before hardware | `DONKEY_GYM = True` in `config.py`; `donkeycar/mysim/` |
| **Gap follow (lidar)** | F1TENTH-style steering toward the largest opening in a scan | `USE_LIDAR = True`, `LIDAR_TYPE = 'RP'`; add an RPLidar part in `manage.py` |
| **Depth-based gap follow** | Obstacle avoidance from a depth image instead of colored tape | `CAMERA_TYPE = "D435"` and a depth-based CV part (see E116 gap follow for the algorithm idea) |
| **AprilTag / marker localization** | Known pose on a mapped course; corridor or waypoint following | New `cv_parts` or Donkeycar `Localizer` model; Lehigh E116 already uses tag IDs 100–199 / 200+ |
| **IMU-assisted control** | Yaw rate and acceleration for smoother steering or slip detection | `HAVE_IMU = True`, `IMU_SENSOR = 'mpu6050'` |
| **Wheel odometry** | Distance and speed from encoder ticks | `HAVE_ODOM = True`; GPIO or Arduino encoder in `manage.py` |
| **Stop sign / object detector** | Trigger braking when a class is detected in frame | `STOP_SIGN_DETECTOR = True` or a custom detector part |
| **Fisheye correction** | Straighter lane geometry before CV or ML | `ENABLE_FISHEYE_UNDISTORT = True` after calibration (`calibrate.py`, `undistort.py`) |

A sensible curriculum after lane keep: (1) record and train a small ML pilot on the same track, (2) add odometry or IMU so throttle scales with actual speed, (3) replace tape following with lidar or depth gap follow, (4) introduce marker-based localization for multi-turn courses.

### What to build on next

**Keep the parts pipeline.** The main value of this repo is that steering, throttle, camera, and autopilot are already wired through named inputs/outputs. New modules should be new Donkeycar `Part` classes (like `cv_parts/lane_keeper.py`) rather than standalone scripts, so they share the web UI, recording, and e-stop paths.

**Raise image quality before chasing bigger models.** Calibrate fisheye undistort, bump `IMAGE_W` / `IMAGE_H` if the Pi keeps up, and consider a better camera module (Pi Camera Module 3, HQ cam, or a USB camera with a narrower FOV). Better pixels help both classical CV and ML more than a larger network on blurry 160×120 input.

**Modernize the runtime carefully.** Donkeycar is the bottleneck, not the PiRacer hardware. Options: pin a working venv on the Waveshare image for labs, or port the `cv_parts` and teleop layer to a small modern stack (FastAPI web UI + OpenCV + PCA9685) while keeping the same pedagogical progression.

**Borrow from E116 where Donkeycar stops.** The Lehigh stack already implements AprilTag corridor follow and RealSense bring-up. RoboRacer-mini can reuse those *algorithms* inside Donkeycar parts, or run a hybrid: Donkeycar for teleop/record/train, ROS 2 only for advanced modules.

**Add closed-loop metrics.** Log lap time, cross-track error, and detection confidence to CSV or MQTT (`HAVE_MQTT_TELEMETRY`). Students need numbers to compare PID tuning, lane keep vs line follow, and ML vs CV.

### Sensors for a Donkeycar-inspired RoboRacer-mini

Donkeycar already has hooks for several sensors in `config.py` and `manage.py`. None are populated on the stock PiRacer Pro; adding them would be the main hardware upgrade path for a RoboRacer-mini kit inspired by this platform.

| Sensor | Role | How it would plug in | Example use |
| --- | --- | --- | --- |
| **Better RGB camera** | Sharper, less distorted images | Set `CAMERA_TYPE` to `PICAM` with a Module 3/HQ cam, or `WEBCAM` / `CVCAM` for USB; keep `ImagePreprocessor` | Lane keep at higher resolution; cleaner ML training data |
| **RPLidar A1/A2** | 2D range scan around the car | `USE_LIDAR = True`; Donkeycar `RPLidar` part publishes scans into the vehicle loop | Gap follow, wall following, simple obstacle stop |
| **Intel RealSense D435/D435i** | RGB + depth (+ IMU on D435i) | `CAMERA_TYPE = "D435"`; depth array available as `cam/depth_array` | True gap follow on depth slices; obstacle distance without colored walls |
| **MPU6050 / MPU9250 IMU** | Yaw rate, acceleration | I2C IMU; `HAVE_IMU = True` in `config.py` | Damp steering oscillation; detect spin-out; fuse with vision for short occlusions |
| **Wheel encoder** | Distance and speed | Optical or magnetic encoder on a drive wheel; `HAVE_ODOM = True`, `ENCODER_TYPE = 'GPIO'` | Speed-limited throttle; lap counting; path follower that knows how far it has traveled |
| **AprilTag camera (existing Pi cam)** | Absolute lateral position on a tagged course | Software only: `apriltag` library in a new `cv_parts` module | Corridor centering between tag walls (E116-style), pit-stop markers, start/finish |
| **Ultrasonic (HC-SR04)** | Cheap front clearance | Custom GPIO part (not built into Donkeycar by default) | Emergency stop before hitting a barrier; beginner-friendly supplement to lidar |

Typical integration pattern:

```
Sensor Part(s)          Vision / CV / ML Part          Actuators
     |                           |                        |
  lidar scan ──────────► gap_follow.py ──► pilot/angle, pilot/throttle ──► PCA9685
  cam/depth_array ─────►                                    │
  imu/accel/yaw ───────► (optional fusion)                  │
  enc/speed ───────────► throttle filter                    │
```

For RoboRacer-mini specifically, a practical BOM order would be: (1) upgraded camera + fisheye calibration, (2) MPU6050 on the existing I2C bus, (3) wheel encoder for speed control, (4) RPLidar or RealSense for gap follow and obstacle avoidance. That progression keeps the Donkeycar software model but closes the largest gaps versus competition-grade platforms: poor optics, no proprioception, and no range sensing.

---

## Related Docs

- [Teleop guide](./teleop.md): gamepad setup, PWM calibration, and troubleshooting without ROS
- [Donkeycar docs](https://docs.donkeycar.com/)
- [Waveshare PiRacer Pro wiki](https://www.waveshare.com/wiki/PiRacer-Pro)

---

*Hardware and parameters match the RoboRacer-mini PiRacer Pro build in `donkeycar/mycar/`.*
