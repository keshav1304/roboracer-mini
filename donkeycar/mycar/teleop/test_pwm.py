"""
test_pwm.py  –  run this on the Pi FIRST to verify your PWM values
before starting the full teleop server.

Tests each calibration point: centre, full left, full right,
stop, full forward, full reverse. Pauses 1 second between each.

Usage:
  python3 test_pwm.py
"""

import time
import sys

try:
    import board
    import busio
    from adafruit_pca9685 import PCA9685
except ImportError:
    sys.exit("ERROR: Install the PCA9685 library first:\n"
             "  pip install adafruit-circuitpython-pca9685")

STEERING_CHANNEL   = 0
STEERING_LEFT_PWM  = 500
STEERING_MID_PWM   = 400
STEERING_RIGHT_PWM = 300

THROTTLE_CHANNEL   = 1
THROTTLE_FWD_PWM   = 450
THROTTLE_STOP_PWM  = 400
THROTTLE_REV_PWM   = 320


def set_channel(pca, channel, tick):
    tick = max(0, min(4095, tick))
    pca.channels[channel].duty_cycle = tick << 4


def test(pca, desc, steer, throttle, hold=1.0):
    print(f"  {desc:<35}  steer={steer:4d}  throttle={throttle:4d}")
    set_channel(pca, STEERING_CHANNEL, steer)
    set_channel(pca, THROTTLE_CHANNEL, throttle)
    time.sleep(hold)


i2c = busio.I2C(board.SCL, board.SDA)
pca = PCA9685(i2c, address=0x40)
pca.frequency = 60

print("\nPCA9685 PWM test – watch the servo and listen to the ESC\n")

try:
    test(pca, "Centre / stop (safe state)",     STEERING_MID_PWM,   THROTTLE_STOP_PWM, 2.0)
    test(pca, "Full LEFT steer",                STEERING_LEFT_PWM,  THROTTLE_STOP_PWM)
    test(pca, "Full RIGHT steer",               STEERING_RIGHT_PWM, THROTTLE_STOP_PWM)
    test(pca, "Centre steer",                   STEERING_MID_PWM,   THROTTLE_STOP_PWM)
    test(pca, "Slow FORWARD (10% throttle)",    STEERING_MID_PWM,   405)
    test(pca, "Stop",                           STEERING_MID_PWM,   THROTTLE_STOP_PWM, 2.0)
    test(pca, "Slow REVERSE (10% throttle)",    STEERING_MID_PWM,   396)
    test(pca, "Stop",                           STEERING_MID_PWM,   THROTTLE_STOP_PWM, 2.0)
    print("\nAll tests done – returning to neutral")
except KeyboardInterrupt:
    print("\nInterrupted – returning to neutral")
finally:
    set_channel(pca, STEERING_CHANNEL, STEERING_MID_PWM)
    set_channel(pca, THROTTLE_CHANNEL, THROTTLE_STOP_PWM)
    pca.deinit()
