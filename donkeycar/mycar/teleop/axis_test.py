"""
axis_test.py  –  run this FIRST on the Pi to find your controller's axis numbers.
No libraries needed beyond Python stdlib.

Usage:
  python3 axis_test.py
  
Move each stick/trigger and watch which axis number changes.
Note down:
  - Left stick horizontal → AXIS_STEER
  - Right trigger (R2)    → AXIS_THROTTLE_FWD
  - Left trigger  (L2)    → AXIS_THROTTLE_REV
  - B button number       → BTN_ESTOP
"""

import struct, sys, os

JS_FMT  = "IhBB"
JS_SIZE = struct.calcsize(JS_FMT)
JS_BTN  = 0x01
JS_AXIS = 0x02
JS_INIT = 0x80

device = sys.argv[1] if len(sys.argv) > 1 else "/dev/input/js0"

if not os.path.exists(device):
    sys.exit(f"Device {device} not found. Is the controller plugged in?\n"
             f"Try: ls /dev/input/js*")

print(f"Reading from {device} – move sticks and press buttons (Ctrl-C to stop)\n")
print(f"{'TYPE':<8} {'NUMBER':<8} {'VALUE':>8}   NORMALISED")
print("-" * 45)

axes    = {}
buttons = {}

try:
    with open(device, "rb") as f:
        while True:
            raw = f.read(JS_SIZE)
            if not raw:
                break
            t, value, etype, number = struct.unpack(JS_FMT, raw)
            etype &= ~JS_INIT
            if etype == JS_AXIS:
                norm = value / 32767.0
                # only print if changed meaningfully
                prev = axes.get(number, 0.0)
                if abs(norm - prev) > 0.02:
                    axes[number] = norm
                    print(f"{'AXIS':<8} {number:<8} {value:>8}   {norm:+.3f}")
            elif etype == JS_BTN:
                buttons[number] = value
                print(f"{'BUTTON':<8} {number:<8} {value:>8}   {'pressed' if value else 'released'}")
except KeyboardInterrupt:
    print("\n\nFinal axis summary:")
    for k, v in sorted(axes.items()):
        print(f"  axis {k}: last value = {v:+.3f}")
    print("\nFinal button summary:")
    for k, v in sorted(buttons.items()):
        print(f"  button {k}: {v}")
except PermissionError:
    print(f"\nPermission denied. Run: sudo chmod a+r {device}")
    print("Or prefix with sudo")
