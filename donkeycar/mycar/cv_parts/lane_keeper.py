import cv2
import numpy as np
import logging

logger = logging.getLogger(__name__)


def _find_contours(mask):
    """OpenCV 3: (image, contours, hierarchy); OpenCV 4: (contours, hierarchy)."""
    result = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if len(result) == 2:
        return result[0]
    return result[1]


def _lane_tape_mask(img_hsv):
    """Red / orange / yellow track tape (same range as LineFollower)."""
    mask_lo = cv2.inRange(img_hsv, (0, 80, 80), (35, 255, 255))
    mask_hi = cv2.inRange(img_hsv, (170, 80, 80), (179, 255, 255))
    return cv2.bitwise_or(mask_lo, mask_hi)


def _white_lane_mask(img_hsv, white_low, white_high):
    """White / light-gray lane paint (low saturation, high brightness)."""
    cfg_mask = cv2.inRange(img_hsv, white_low, white_high)
    broad_mask = cv2.inRange(img_hsv, (0, 0, 150), (179, 80, 255))
    return cv2.bitwise_or(cfg_mask, broad_mask)


class LaneKeeper:
    '''
    OpenCV based lane-keeping controller.
    This controller detects both the yellow left lane line and the white right
    lane line, computes the lane center, and uses a PID controller to steer the
    car so it drives centered between both lines.

    Detection approach:
      1. Take a horizontal slice of the image at a configurable Y position.
      2. Convert to HSV and apply two color masks (yellow and white).
      3. Use histograms to find the horizontal pixel position of each line.
      4. Compute the lane center as the midpoint between the two lines.
      5. Feed the lane center into a PID controller that targets IMAGE_W / 2.
      6. If only one line is visible, estimate center using lane width offset.
    '''

    def __init__(self, pid, cfg):
        self.overlay_image = cfg.OVERLAY_IMAGE
        self.image_w = cfg.IMAGE_W

        # lane mode: "yellow_white" or "yellow_yellow"
        self.lane_mode = getattr(cfg, 'LK_LANE_MODE', 'yellow_white')

        # scan region
        self.scan_y = cfg.LK_SCAN_Y
        self.scan_height = cfg.LK_SCAN_HEIGHT

        # HSV thresholds for yellow line(s)
        self.yellow_low = np.asarray(cfg.LK_YELLOW_LOW)
        self.yellow_high = np.asarray(cfg.LK_YELLOW_HIGH)

        # HSV thresholds for white right lane line (only used in yellow_white mode)
        self.white_low = np.asarray(cfg.LK_WHITE_LOW)
        self.white_high = np.asarray(cfg.LK_WHITE_HIGH)

        # detection thresholds
        self.confidence_threshold = cfg.LK_CONFIDENCE_THRESHOLD
        self.target_threshold = cfg.LK_TARGET_THRESHOLD

        # estimated lane width in pixels (used when only one line is detected)
        self.lane_width = cfg.LK_LANE_WIDTH

        # the target is the horizontal center of the image
        self.target_pixel = self.image_w // 2

        # steering and throttle state
        self.steering = 0.0
        self.throttle = cfg.THROTTLE_INITIAL
        self.delta_th = cfg.THROTTLE_STEP
        self.throttle_max = cfg.THROTTLE_MAX
        self.throttle_min = cfg.THROTTLE_MIN

        self.pid_st = pid

    def _steer_full_scale(self):
        """Expected |P-term| when lane center is at the farthest image edge from target."""
        target = self.target_pixel
        max_err = max(target, self.image_w - 1 - target)
        return max(abs(self.pid_st.Kp) * max_err, 1e-6)

    def _normalize_steering(self, raw):
        """Map PID output to [-1, 1] via full-scale tanh (same as LineFollower)."""
        return float(np.tanh(raw / self._steer_full_scale()))

    def detect_lines(self, cam_img):
        '''
        Detect the left and right lane lines in the scan region
        using HSV segmentation followed by contour detection.

        In "yellow_white" mode: left = yellow, right = white.
        In "yellow_yellow" mode: both lines are yellow; the two best
        line-like contours are split into left/right by x position.

        input: cam_img — an RGB numpy array
        output: (left_x, left_area, right_x, right_area,
                 left_mask, right_mask, left_contour, right_contour)
        '''
        # take a horizontal slice of the image
        scan_line = cam_img[self.scan_y: self.scan_y + self.scan_height, :, :]

        # convert to HSV color space
        img_hsv = cv2.cvtColor(scan_line, cv2.COLOR_RGB2HSV)

        mid = self.image_w // 2
        tape_mask = _lane_tape_mask(img_hsv)

        if self.lane_mode == 'yellow_yellow':
            # both boundaries are colored tape — one line per image half
            left_x, left_area, left_contour = self._best_line_in_columns(tape_mask, 0, mid)
            right_x, right_area, right_contour = self._best_line_in_columns(tape_mask, mid, self.image_w)
            left_mask = tape_mask
            right_mask = tape_mask
        else:
            # yellow_white: colored tape on the left, white paint on the right
            white_mask = _white_lane_mask(img_hsv, self.white_low, self.white_high)
            left_mask = tape_mask
            right_mask = white_mask
            left_x, left_area, left_contour = self._best_line_in_columns(tape_mask, 0, mid)
            right_x, right_area, right_contour = self._best_line_in_columns(
                white_mask, mid, self.image_w)

        return (left_x, left_area, right_x, right_area,
                left_mask, right_mask, left_contour, right_contour)

    def _best_line_contour(self, mask):
        '''
        Find the most line-like contour in a binary mask.
        Contours are scored by aspect ratio (height / width) from their
        rotated bounding rectangle, weighted by area. A lane line in the
        scan strip should be tall and narrow, so high aspect ratio wins.

        Returns (centroid_x, area, contour) or (0, 0, None) if none found.
        '''
        contours = _find_contours(mask)
        if not contours:
            return self._line_from_histogram(mask)

        best = None
        best_score = -1

        for cnt in contours:
            area = cv2.contourArea(cnt)
            if area < 5:  # ignore tiny noise specks
                continue

            # use minAreaRect to get the oriented bounding box
            rect = cv2.minAreaRect(cnt)
            w, h = rect[1]  # (width, height) of the rotated rect
            if w == 0 or h == 0:
                continue

            # aspect ratio: longer side / shorter side
            aspect = max(w, h) / min(w, h)

            # score: prefer high aspect ratio (line-like) and reasonable area
            score = aspect * area

            if score > best_score:
                best_score = score
                best = cnt

        if best is None:
            return self._line_from_histogram(mask)

        area = cv2.contourArea(best)
        M = cv2.moments(best)
        if M['m00'] == 0:
            return self._line_from_histogram(mask)
        cx = int(M['m10'] / M['m00'])
        return cx, area, best

    def _line_from_histogram(self, mask, col_start=0, col_end=None):
        """Column histogram peak in mask columns [col_start, col_end)."""
        if col_end is None:
            col_end = mask.shape[1]
        region = mask[:, col_start:col_end]
        hist = np.sum(region, axis=0)
        peak = int(np.max(hist))
        if peak == 0:
            return 0, 0, None
        cx = col_start + int(np.argmax(hist))
        return cx, float(hist[np.argmax(hist)]), None

    def _best_line_in_columns(self, mask, col_start, col_end):
        """Strongest line in a horizontal band — x is in full-image coordinates."""
        if col_end <= col_start:
            return 0, 0, None
        region = mask[:, col_start:col_end]
        cx, area, cnt = self._best_line_contour(region)
        if area > 0:
            return col_start + cx, area, cnt
        return self._line_from_histogram(mask, col_start, col_end)

    def run(self, cam_img):
        '''
        Main run loop of the lane-keeping CV controller.

        input: cam_img — an RGB numpy array
        output: steering, throttle, image
        '''
        if cam_img is None:
            return 0, 0, None

        (left_x, left_area, right_x, right_area,
         left_mask, right_mask, left_contour, right_contour) = self.detect_lines(cam_img)

        # a line is "detected" if its best contour area exceeds the threshold
        min_area = self.confidence_threshold * self.image_w * self.scan_height
        left_detected = left_area >= min_area
        right_detected = right_area >= min_area

        # Reject two detections that are really the same-side pair (e.g. blue + pink)
        min_sep = max(self.lane_width // 2, 15)
        if left_detected and right_detected and (right_x - left_x) < min_sep:
            logger.info(
                "Lines too close (%d px apart) — using stronger side only",
                right_x - left_x,
            )
            if left_area >= right_area:
                right_detected = False
                right_x, right_area = 0, 0
            else:
                left_detected = False
                left_x, left_area = 0, 0

        # Determine lane center
        if left_detected and right_detected:
            lane_center = (left_x + right_x) // 2
            logger.debug(f"Both lines: left={left_x}, right={right_x}, center={lane_center}")
        elif left_detected:
            lane_center = left_x + self.lane_width // 2
            logger.debug(f"Left only: left={left_x}, estimated center={lane_center}")
        elif right_detected:
            lane_center = right_x - self.lane_width // 2
            logger.debug(f"Right only: right={right_x}, estimated center={lane_center}")
        else:
            logger.info("No lane lines detected — holding current steering")
            if self.overlay_image:
                cam_img = self.overlay_display(
                    cam_img, left_mask, right_mask,
                    left_contour, right_contour,
                    0, 0, self.target_pixel,
                    left_detected, right_detected
                )
            return self.steering, self.throttle, cam_img

        # clamp lane_center to image bounds
        lane_center = max(0, min(lane_center, self.image_w - 1))

        # set PID target to image center
        if self.pid_st.setpoint != self.target_pixel:
            self.pid_st.setpoint = self.target_pixel

        raw_steering = self.pid_st(lane_center)
        self.steering = self._normalize_steering(raw_steering)

        # throttle step controller: slow on turns, speed up on straights
        if abs(lane_center - self.target_pixel) > self.target_threshold:
            if self.throttle > self.throttle_min:
                self.throttle -= self.delta_th
            if self.throttle < self.throttle_min:
                self.throttle = self.throttle_min
        else:
            if self.throttle < self.throttle_max:
                self.throttle += self.delta_th
            if self.throttle > self.throttle_max:
                self.throttle = self.throttle_max

        if self.overlay_image:
            cam_img = self.overlay_display(
                cam_img, left_mask, right_mask,
                left_contour, right_contour,
                left_x, right_x, lane_center,
                left_detected, right_detected
            )

        return self.steering, self.throttle, cam_img

    def overlay_display(self, cam_img, left_mask, right_mask,
                        left_contour, right_contour,
                        left_x, right_x, lane_center,
                        left_detected, right_detected):
        '''
        Composite the segmentation masks on top of the original image.
        Color-codes the masks so you can tell left from right:
          yellow_white mode  → left pixels yellow, right pixels white
          yellow_yellow mode → left pixels yellow, right pixels cyan
        '''
        h = self.scan_height
        iSlice = self.scan_y
        img = np.copy(cam_img)

        # Color-coded scan strip: tape=yellow, white lane=bright, overlap=greenish
        color_strip = np.zeros((h, self.image_w, 3), dtype=np.uint8)
        color_strip[left_mask > 0] = (255, 255, 0)
        if self.lane_mode == 'yellow_white':
            color_strip[right_mask > 0] = (255, 255, 255)
        img[iSlice: iSlice + h, :, :] = color_strip

        if left_contour is not None:
            offset_contour = left_contour.copy()
            offset_contour[:, :, 1] += iSlice
            cv2.drawContours(img, [offset_contour], -1, (0, 255, 255), 1)
        if right_contour is not None:
            offset_contour = right_contour.copy()
            offset_contour[:, :, 1] += iSlice
            cv2.drawContours(img, [offset_contour], -1, (255, 0, 255), 1)

        display_str = []
        display_str.append("STEERING:{:.2f}".format(self.steering))
        display_str.append("THROTTLE:{:.2f}".format(self.throttle))
        display_str.append("I LEFT:{:d}".format(left_x))
        display_str.append("I RIGHT:{:d}".format(right_x))
        display_str.append("CENTER:{:d}".format(lane_center))

        y = 10
        x = 10
        for s in display_str:
            cv2.putText(img, s, color=(0, 0, 0), org=(x, y),
                        fontFace=cv2.FONT_HERSHEY_SIMPLEX, fontScale=0.4)
            y += 10

        return img
