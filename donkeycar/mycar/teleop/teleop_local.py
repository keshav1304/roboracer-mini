"""
teleop_local.py  –  runs entirely on the Raspberry Pi
Left stick X  → steering   (left = left, right = right)
Right stick Y → throttle   (push up = forward, pull down = reverse)
B button      → e-stop toggle
START         → quit

Confirmed PWM thresholds:
  Forward starts at 418, max 450
  Reverse starts at 365, max 320
"""

import struct, threading, time, argparse, signal

try:
    import board, busio
    from adafruit_pca9685 import PCA9685
    HARDWARE = True
except ImportError:
    print("[WARN] MOCK mode – pip install adafruit-circuitpython-pca9685")
    HARDWARE = False

# ── Calibration (all values confirmed on hardware) ────────────────────────────
STEERING_CHANNEL   = 0
STEERING_LEFT_PWM  = 500
STEERING_MID_PWM   = 400
STEERING_RIGHT_PWM = 300

THROTTLE_CHANNEL   = 1
THROTTLE_STOP_PWM  = 400   # neutral
THROTTLE_MIN_FWD   = 418   # minimum PWM that moves forward
THROTTLE_FWD_PWM   = 450   # max forward
THROTTLE_MIN_REV   = 365   # minimum PWM that moves reverse
THROTTLE_REV_PWM   = 320   # max reverse

# ── Controller mapping ────────────────────────────────────────────────────────
AXIS_STEER    = 3   # right stick X
AXIS_THROTTLE = 1   # left stick Y (up = forward)
BTN_ESTOP     = 1   # B button
BTN_QUIT      = 9   # START

# ── Tuning ────────────────────────────────────────────────────────────────────
DEADZONE       = 0.08
STEERING_SCALE = 1.0
THROTTLE_SCALE = 0.5   # raise toward 1.0 for more speed
SEND_RATE_HZ   = 50

# ── Linux joystick ────────────────────────────────────────────────────────────
JS_FMT  = "IhBB"
JS_SIZE = struct.calcsize(JS_FMT)
JS_AXIS = 0x02
JS_BTN  = 0x01
JS_INIT = 0x80

def deadzone(val, dz):
    if abs(val) < dz:
        return 0.0
    s = 1.0 if val > 0 else -1.0
    return s * (abs(val) - dz) / (1.0 - dz)

def set_channel(pca, ch, tick):
    pca.channels[ch].duty_cycle = max(0, min(4095, tick)) << 4

def steering_to_pwm(v):
    v = max(-1.0, min(1.0, v))
    mid = STEERING_MID_PWM
    if v >= 0:
        return int(mid + v * (STEERING_RIGHT_PWM - mid))
    else:
        return int(mid + v * (mid - STEERING_LEFT_PWM))

def throttle_to_pwm(v):
    """
    Skips the ESC dead bands entirely:
      v =  0.0  →  400  (neutral)
      v = +0.01 →  418  (jumps over forward dead band)
      v = +1.0  →  450  (max forward)
      v = -0.01 →  365  (jumps over reverse dead band)
      v = -1.0  →  320  (max reverse)
    """
    v = max(-1.0, min(1.0, v))
    if v == 0.0:
        return THROTTLE_STOP_PWM
    elif v > 0:
        return int(THROTTLE_MIN_FWD + v * (THROTTLE_FWD_PWM - THROTTLE_MIN_FWD))
    else:
        return int(THROTTLE_MIN_REV - abs(v) * (THROTTLE_MIN_REV - THROTTLE_REV_PWM))

def stop_car(pca):
    if pca:
        set_channel(pca, STEERING_CHANNEL, STEERING_MID_PWM)
        set_channel(pca, THROTTLE_CHANNEL, THROTTLE_STOP_PWM)

# ── Shared state ──────────────────────────────────────────────────────────────
class State:
    def __init__(self):
        self.axes    = {}
        self.buttons = {}
        self.e_stop  = False
        self.quit    = False
        self.lock    = threading.Lock()

def joystick_reader(device_path, state):
    try:
        fd = open(device_path, "rb")
    except (PermissionError, FileNotFoundError) as e:
        print(f"[ERROR] {e}")
        state.quit = True
        return
    print(f"[INFO]  Joystick: {device_path}")
    while not state.quit:
        raw = fd.read(JS_SIZE)
        if not raw or len(raw) < JS_SIZE:
            break
        t, value, etype, number = struct.unpack(JS_FMT, raw)
        etype &= ~JS_INIT
        with state.lock:
            if etype == JS_AXIS:
                state.axes[number] = value / 32767.0
            elif etype == JS_BTN:
                state.buttons[number] = bool(value)
                if number == BTN_ESTOP and value:
                    state.e_stop = not state.e_stop
                    print(f"\n[{'*** E-STOP ***' if state.e_stop else 'RESUMED  '}]")
                if number == BTN_QUIT and value:
                    print("\n[INFO]  Quitting")
                    state.quit = True
    fd.close()

# ── Main loop ─────────────────────────────────────────────────────────────────
def run(device_path):
    pca = None
    if HARDWARE:
        i2c = busio.I2C(board.SCL, board.SDA)
        pca = PCA9685(i2c, address=0x40)
        pca.frequency = 60
        print("[INFO]  PCA9685 ready")
    stop_car(pca)

    state = State()
    threading.Thread(target=joystick_reader, args=(device_path, state), daemon=True).start()
    time.sleep(0.2)

    def _shutdown(sig, frame): state.quit = True
    signal.signal(signal.SIGTERM, _shutdown)

    print(f"[INFO]  {SEND_RATE_HZ} Hz  |  THROTTLE_SCALE={THROTTLE_SCALE}")
    print("        Left stick = steer  |  Right stick = throttle")
    print("        B = e-stop  |  START/Ctrl-C = quit\n")

    interval = 1.0 / SEND_RATE_HZ
    try:
        while not state.quit:
            t0 = time.monotonic()
            with state.lock:
                raw_steer    = state.axes.get(AXIS_STEER,    0.0)
                raw_throttle = state.axes.get(AXIS_THROTTLE, 0.0)
                e_stop       = state.e_stop

            steering = deadzone(raw_steer,     DEADZONE) * STEERING_SCALE
            throttle = deadzone(-raw_throttle, DEADZONE) * THROTTLE_SCALE

            s_pwm = steering_to_pwm(steering)
            t_pwm = throttle_to_pwm(throttle)

            if e_stop:
                stop_car(pca)
            else:
                if pca:
                    set_channel(pca, STEERING_CHANNEL, s_pwm)
                    set_channel(pca, THROTTLE_CHANNEL, t_pwm)

            bar_s = "█" * int(abs(steering) * 10)
            bar_t = "█" * int(abs(throttle / max(THROTTLE_SCALE, 0.01)) * 10)
            est   = "  *** E-STOP ***" if e_stop else ""
            print(f"\r  steer {steering:+.2f} [{bar_s:<10}] {s_pwm:3d}  "
                  f"thr {throttle:+.2f} [{bar_t:<10}] {t_pwm:3d}{est}  ",
                  end="", flush=True)

            elapsed = time.monotonic() - t0
            if elapsed < interval:
                time.sleep(interval - elapsed)

    except KeyboardInterrupt:
        print("\n[INFO]  Ctrl-C")
    finally:
        stop_car(pca)
        if pca: pca.deinit()
        print("[INFO]  Stopped.")

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--device", default="/dev/input/js0")
    run(ap.parse_args().device)
