# Teleop — Manual Control via Gamepad

This guide covers setting up gamepad teleoperation on the RoboRacer Mini
(Donkeycar + Waveshare) without ROS.

---

## Overview

Teleop lets you drive the car manually using a USB gamepad. It reads the
controller directly from the Pi using the Linux joystick API and sends PWM
signals to the PCA9685 board at 50Hz. No network, no ROS, no laptop needed.

```
USB Gamepad (/dev/input/js0)
        |
        v
donkeycar/mycar/teleop/teleop_local.py
        |
        | I2C address 0x40
        v
    PCA9685 Board
       |        |
       v        v
  Steering    ESC
  Servo       (Motor)
  ch 0        ch 1
```

---

## Files

| File | Purpose |
|------|---------|
| `teleop_local.py` | Main script — reads gamepad, drives car |
| `test_pwm.py` | Hardware verification — run this first |
| `axis_test.py` | Maps your controller's axis/button numbers |

---

## Prerequisites

### Hardware
- RoboRacer Mini car powered on
- USB gamepad plugged into the Pi

### Software
```bash
pip install adafruit-circuitpython-pca9685
```

### Verify I2C and controller
```bash
sudo i2cdetect -y 1       # should show 0x40
ls /dev/input/js*         # should show /dev/input/js0
```

---

## Hardware Reference

### I2C Devices
| Address | Device |
|---------|--------|
| 0x3c | OLED display |
| 0x40 | PCA9685 — steering + throttle |
| 0x70 | PCA9685 all-call (normal, ignore) |

### PCA9685 Channel Map
| Channel | Device |
|---------|--------|
| 0 | Steering servo |
| 1 | ESC (throttle) |

### Calibrated PWM Values

#### Steering (channel 0)
| Position | PWM |
|----------|-----|
| Full left | 500 |
| Centre | 400 |
| Full right | 300 |

#### Throttle (channel 1)
| State | PWM | Notes |
|-------|-----|-------|
| Neutral | 400 | ESC idle |
| Forward minimum | 418 | First value that moves car forward |
| Forward maximum | 450 | Full speed forward |
| Reverse minimum | 365 | First value that moves car backward |
| Reverse maximum | 320 | Full speed reverse |

The PWM ranges 401-417 (forward) and 366-399 (reverse) are dead bands where
the ESC does not respond. The script skips over these automatically.

---

## Setup Steps

### Step 1 — Verify hardware (wheels off ground)
```bash
cd ~/roboracer-mini/donkeycar/mycar/teleop
python3 test_pwm.py
```
The steering servo should sweep left and right. The wheels should spin briefly
on the forward/reverse test. If wheels do not spin, see Calibration below.

### Step 2 — Map your controller axes
```bash
python3 axis_test.py
```
Move each stick and press each button. Note which axis number changes for:
- Left stick up/down (throttle)
- Right stick left/right (steering)
- Your chosen e-stop button

### Step 3 — Update constants in teleop_local.py
```python
AXIS_STEER    = 3    # right stick X — update to match your controller
AXIS_THROTTLE = 1    # left stick Y  — update to match your controller
BTN_ESTOP     = 1    # B button
BTN_QUIT      = 9    # START button
```

### Step 4 — Run
```bash
python3 teleop_local.py
```

---

## Controls

| Input | Action |
|-------|--------|
| Left stick Y — up | Forward |
| Left stick Y — down | Reverse (double-tap, see below) |
| Right stick X | Steering |
| B button | Emergency stop toggle |
| START | Quit |
| Ctrl-C | Quit |

### Console readout
```
steer +0.45 [████      ] 445   thr +0.30 [███       ] 428
```
Shows normalised stick value, visual bar, and actual PWM tick sent.

---

## Reverse — ESC Double Tap

Reverse requires two consecutive back inputs. This is a hardware ESC
safety feature and cannot be bypassed in software:

1. Pull left stick down — ESC brakes, arms reverse
2. Pull left stick down again — car reverses
3. Release stick — sequence resets

---

## Calibration

If your car's PWM thresholds differ, find them manually:

### Forward threshold
```bash
python3 - << 'EOF'
import board, busio, time
from adafruit_pca9685 import PCA9685
pca = PCA9685(busio.I2C(board.SCL, board.SDA), address=0x40)
pca.frequency = 60
def go(t): pca.channels[1].duty_cycle = t << 4
go(400); time.sleep(2)
for pwm in range(400, 451, 2):
    print(f"PWM = {pwm}"); go(pwm); time.sleep(1.5)
go(400); pca.deinit()
EOF
```
Note the first PWM where wheels spin. Set this as `THROTTLE_MIN_FWD`.

### Reverse threshold
```bash
python3 - << 'EOF'
import board, busio, time
from adafruit_pca9685 import PCA9685
pca = PCA9685(busio.I2C(board.SCL, board.SDA), address=0x40)
pca.frequency = 60
def go(t): pca.channels[1].duty_cycle = t << 4
go(400); time.sleep(3)
for pwm in range(395, 299, -5):
    print(f"PWM = {pwm}"); go(pwm); time.sleep(2)
go(400); pca.deinit()
EOF
```
Note the first PWM where wheels spin in reverse. Set as `THROTTLE_MIN_REV`.

---

## Tuning

| Constant | Default | Effect |
|----------|---------|--------|
| `THROTTLE_SCALE` | 0.5 | Max speed — raise to 1.0 for full speed |
| `STEERING_SCALE` | 1.0 | Steering sensitivity |
| `DEADZONE` | 0.08 | Raise if stick drifts at rest |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `No module named adafruit_pca9685` | `pip install adafruit-circuitpython-pca9685` |
| `/dev/input/js0 not found` | Replug USB dongle, check `lsusb` |
| `Permission denied: /dev/input/js0` | `sudo chmod a+r /dev/input/js0` |
| Steering reversed | Swap `STEERING_LEFT_PWM` and `STEERING_RIGHT_PWM` |
| Wrong stick does wrong thing | Update `AXIS_STEER` / `AXIS_THROTTLE`, run `axis_test.py` |
| Car doesn't move | Re-run forward threshold test, update `THROTTLE_MIN_FWD` |
| `OSError: Remote I/O error` | Check I2C: `sudo i2cdetect -y 1`, power cycle car |
