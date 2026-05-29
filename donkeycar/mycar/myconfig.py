"""
Active car overrides — merged on top of config.py by manage.py.
"""

# ---------------------------------------------------------------------------
# Camera preprocessing
# ---------------------------------------------------------------------------
# Camera is mounted upside-down on the vehicle.
CAMERA_ROTATE_180 = True

# Fisheye undistortion: set True after filling FISHEYE_K / FISHEYE_D below.
ENABLE_FISHEYE_UNDISTORT = False

# --- PLACEHOLDER calibration values (replace after checkerboard calibration) ---
# 3x3 camera matrix: [[fx, 0, cx], [0, fy, cy], [0, 0, 1]]
FISHEYE_K = [
    [115.0, 0.0, 80.0],
    [0.0, 115.0, 60.0],
    [0.0, 0.0, 1.0],
]
# Fisheye distortion coefficients [k1, k2, k3, k4]
FISHEYE_D = [-0.05, 0.01, 0.0, 0.0]

# ---------------------------------------------------------------------------
# Computer vision autopilot
# ---------------------------------------------------------------------------
USE_CV_AUTOPILOT = True

CV_CONTROLLER_MODULE = "cv_parts.lane_keeper"
CV_CONTROLLER_CLASS = "LaneKeeper"
CV_CONTROLLER_INPUTS = ['cam/image_array']
CV_CONTROLLER_OUTPUTS = ['pilot/angle', 'pilot/throttle', 'cv/image_array']
CV_CONTROLLER_CONDITION = "run_pilot"

IMAGE_W = 160
IMAGE_H = 120

# LineFollower — yellow line HSV and scan band
SCAN_Y = 60
SCAN_HEIGHT = 25
COLOR_THRESHOLD_LOW = (20, 100, 100)
COLOR_THRESHOLD_HIGH = (35, 255, 255)

TARGET_PIXEL = 80
TARGET_THRESHOLD = 10
CONFIDENCE_THRESHOLD = (1 / IMAGE_W) / 3

THROTTLE_MAX = 0.45   # 45% max throttle on straights
THROTTLE_MIN = 0.05
THROTTLE_INITIAL = THROTTLE_MIN
THROTTLE_STEP = 0.01

CV_PID_P = -2.6
CV_PID_I = 0.000
CV_PID_D = -0.2
CV_PID_P_DELTA = 0.1
CV_PID_D_DELTA = 0.01

OVERLAY_IMAGE = True

INC_PID_P_BTN = "R2"
DEC_PID_P_BTN = "L2"
TOGGLE_RECORDING_BTN = "option"

# LaneKeeper — yellow/white tape on left, white lane line on right
LK_LANE_MODE = "yellow_white"
LK_SCAN_Y = 60
LK_SCAN_HEIGHT = 25
LK_YELLOW_LOW = (20, 100, 100)
LK_YELLOW_HIGH = (40, 255, 255)
LK_WHITE_LOW = (0, 0, 150)
LK_WHITE_HIGH = (179, 80, 255)
LK_CONFIDENCE_THRESHOLD = (1 / IMAGE_W) / 3
LK_TARGET_THRESHOLD = 10
LK_LANE_WIDTH = 60
