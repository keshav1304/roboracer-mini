import cv2
import numpy as np
from simple_pid import PID
import logging

logger = logging.getLogger(__name__)


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

        if self.lane_mode == 'yellow_yellow':
            # both lines are yellow — find the two best line-like contours
            yellow_mask = cv2.inRange(img_hsv, self.yellow_low, self.yellow_high)
            left_x, left_area, right_x, right_area, left_contour, right_contour = self._two_best_line_contours(yellow_mask)
            # in this mode both masks are the same yellow mask
            left_mask = yellow_mask
            right_mask = yellow_mask
        else:
            # yellow_white mode (default)
            left_mask = cv2.inRange(img_hsv, self.yellow_low, self.yellow_high)
            left_x, left_area, left_contour = self._best_line_contour(left_mask)

            right_mask = cv2.inRange(img_hsv, self.white_low, self.white_high)
            right_x, right_area, right_contour = self._best_line_contour(right_mask)

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
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if not contours:
            return 0, 0, None

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
            return 0, 0, None

        area = cv2.contourArea(best)
        M = cv2.moments(best)
        if M['m00'] == 0:
            return 0, 0, None
        cx = int(M['m10'] / M['m00'])
        return cx, area, best

    def _two_best_line_contours(self, mask):
        '''
        Find the two most line-like contours in a single mask and assign
        them to left and right by x position.

        Returns (left_x, left_area, right_x, right_area, left_contour, right_contour).
        If fewer than 2 contours are found, missing values are 0/None.
        '''
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        # score all contours
        scored = []
        for cnt in contours:
            area = cv2.contourArea(cnt)
            if area < 5:
                continue
            rect = cv2.minAreaRect(cnt)
            w, h = rect[1]
            if w == 0 or h == 0:
                continue
            aspect = max(w, h) / min(w, h)
            score = aspect * area
            M = cv2.moments(cnt)
            if M['m00'] == 0:
                continue
            cx = int(M['m10'] / M['m00'])
            scored.append((score, cx, area, cnt))

        # sort by score descending and take top 2
        scored.sort(key=lambda x: x[0], reverse=True)

        if len(scored) == 0:
            return 0, 0, 0, 0, None, None
        elif len(scored) == 1:
            # only one line found — place it on whichever side it's on
            cx, area, cnt = scored[0][1], scored[0][2], scored[0][3]
            if cx < self.target_pixel:
                return cx, area, 0, 0, cnt, None
            else:
                return 0, 0, cx, area, None, cnt

        # two best contours — assign left/right by x position
        a, b = scored[0], scored[1]
        if a[1] <= b[1]:
            left_cx, left_area, left_cnt = a[1], a[2], a[3]
            right_cx, right_area, right_cnt = b[1], b[2], b[3]
        else:
            left_cx, left_area, left_cnt = b[1], b[2], b[3]
            right_cx, right_area, right_cnt = a[1], a[2], a[3]

        return left_cx, left_area, right_cx, right_area, left_cnt, right_cnt

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

        self.steering = self.pid_st(lane_center)

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
        color_strip = np.zeros((h, self.image_w, 3), dtype=np.uint8)

        if self.lane_mode == 'yellow_yellow':
            # both masks are the same — color left contour area yellow, right cyan
            # Since masks overlap, draw left first, then right on top
            color_strip[left_mask > 0] = (255, 255, 0)
            # overwrite right contour pixels with cyan for distinction
            if right_contour is not None:
                right_fill = np.zeros_like(left_mask)
                cv2.drawContours(right_fill, [right_contour], -1, 255, cv2.FILLED)
                color_strip[right_fill > 0] = (0, 255, 255)
        else:
            # yellow_white mode
            color_strip[left_mask > 0] = (255, 255, 0)
            color_strip[right_mask > 0] = (255, 255, 255)

        iSlice = self.scan_y
        img = np.copy(cam_img)
        img[iSlice: iSlice + h, :, :] = color_strip

        # draw contour outlines (offset into the scan region)
        if left_contour is not None:
            offset_contour = left_contour.copy()
            offset_contour[:, :, 1] += iSlice
            cv2.drawContours(img, [offset_contour], -1, (0, 255, 255), 1)
        if right_contour is not None:
            offset_contour = right_contour.copy()
            offset_contour[:, :, 1] += iSlice
            cv2.drawContours(img, [offset_contour], -1, (255, 0, 255), 1)

        display_str = []
        display_str.append("STEERING:{:.1f}".format(self.steering))
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
