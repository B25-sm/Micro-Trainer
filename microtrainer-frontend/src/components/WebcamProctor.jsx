import { useEffect, useRef, useState } from "react";

/** Rough scene brightness 0–255; typical dull webcam scenes fall below ~58 */
function estimateVideoLuminance(video) {
  try {
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) return 130;
    const w = Math.min(56, vw);
    const h = Math.min(42, vh);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return 130;
    ctx.drawImage(video, 0, 0, w, h);
    const { data } = ctx.getImageData(0, 0, w, h);
    let sum = 0;
    let n = 0;
    for (let i = 0; i < data.length; i += 20) {
      sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      n++;
    }
    return n ? sum / n : 130;
  } catch {
    return 130;
  }
}

const LOW_LIGHT_LUMA = 58;
/** Near-black frames (lens covered / camera feeding black) sit far below even a dim room */
const BLACK_FRAME_LUMA = 12;

/** Merge overlapping boxes — tiny-face often double-counts one person */
function boxIoU(a, b) {
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.width, b.x + b.width);
  const y2 = Math.min(a.y + a.height, b.y + b.height);
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const union = a.width * a.height + b.width * b.height - inter;
  return union > 0 ? inter / union : 0;
}

function boxCenter(box) {
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

function centerInsideBox(center, box, paddingRatio = 0.15) {
  const padX = box.width * paddingRatio;
  const padY = box.height * paddingRatio;
  return (
    center.x >= box.x - padX &&
    center.x <= box.x + box.width + padX &&
    center.y >= box.y - padY &&
    center.y <= box.y + box.height + padY
  );
}

function dedupeFaceDetections(detections, iouThreshold = 0.5) {
  if (!detections?.length) return [];
  const sorted = [...detections].sort(
    (a, b) => (b.detection?.score ?? 0) - (a.detection?.score ?? 0)
  );
  const kept = [];
  for (const det of sorted) {
    const box = det.detection?.box;
    if (!box) continue;
    const overlaps = kept.some(
      (k) => boxIoU(box, k.detection.box) >= iouThreshold
    );
    if (!overlaps) kept.push(det);
  }
  return kept;
}

/** Drop phantom boxes whose center sits inside a larger face box */
function mergeContainedDetections(detections) {
  if (detections.length <= 1) return detections;
  const sorted = [...detections].sort(
    (a, b) =>
      b.detection.box.width * b.detection.box.height -
      a.detection.box.width * a.detection.box.height
  );
  const kept = [];
  for (const det of sorted) {
    const center = boxCenter(det.detection.box);
    const nested = kept.some((k) =>
      centerInsideBox(center, k.detection.box, 0.2)
    );
    if (!nested) kept.push(det);
  }
  return kept;
}

/** Count distinct faces — ignore tiny phantom boxes beside the main face */
function countDistinctFaces(detections, frameW, frameH) {
  let deduped = dedupeFaceDetections(detections);
  deduped = mergeContainedDetections(deduped);
  if (deduped.length === 0) return 0;
  if (deduped.length === 1) return 1;

  const frameArea = Math.max(frameW * frameH, 1);
  const minArea = frameArea * 0.01;

  const valid = deduped.filter((d) => {
    const box = d.detection?.box;
    const score = d.detection?.score ?? 0;
    if (!box) return false;
    return box.width * box.height >= minArea && score >= 0.24;
  });

  if (valid.length <= 1) return valid.length;

  const bySize = [...valid].sort(
    (a, b) =>
      b.detection.box.width * b.detection.box.height -
      a.detection.box.width * a.detection.box.height
  );
  const primary = bySize[0];
  const pBox = primary.detection.box;
  const pArea = pBox.width * pBox.height;
  const pCenter = boxCenter(pBox);
  const pDiag = Math.hypot(pBox.width, pBox.height);

  let extra = 0;
  for (let i = 1; i < bySize.length; i += 1) {
    const d = bySize[i];
    const box = d.detection.box;
    const score = d.detection.score ?? 0;
    const area = box.width * box.height;
    const center = boxCenter(box);
    const dist = Math.hypot(center.x - pCenter.x, center.y - pCenter.y);
    const hSep = Math.abs(center.x - pCenter.x);
    const minSeparation = Math.max(pDiag * 0.28, Math.min(frameW, frameH) * 0.06);
    const clearlyTwoPeople =
      hSep >= frameW * 0.24 && score >= 0.22 && area >= minArea;
    const separateAndSized =
      dist >= minSeparation &&
      score >= 0.28 &&
      area >= Math.max(minArea, pArea * 0.1);

    if (clearlyTwoPeople || separateAndSized) {
      extra += 1;
    }
  }

  return 1 + extra;
}

/**
 * Normal vs dim room.
 * Pose checks only flag a clear side turn — looking at the screen or keyboard is expected.
 * While typing, pose checks are off; only sustained "left the frame" triggers a warning.
 */
function getProctorRules(lowLight, typing) {
  const base = lowLight
    ? {
        noFaceStreakMin: 8,
        noFaceHoldMs: 12_000,
        poseStreakMin: 9,
        lookingAwayDelayMs: 6000,
        headTurnDelayMs: 7000,
        yawAbsMin: 0.34,
        profileAspectMax: 0.62,
        profileEyeRatioMax: 0.36,
        multipleFacesConfirmSecs: 5,
        multipleFacesConfirmTicks: 10,
        noFaceMessage:
          "Face left the frame — stay visible (dim lighting — add front light if needed)",
      }
    : {
        noFaceStreakMin: 6,
        noFaceHoldMs: 10_000,
        poseStreakMin: 8,
        lookingAwayDelayMs: 5500,
        headTurnDelayMs: 6500,
        yawAbsMin: 0.32,
        profileAspectMax: 0.64,
        profileEyeRatioMax: 0.38,
        multipleFacesConfirmSecs: 3,
        multipleFacesConfirmTicks: 4,
        noFaceMessage: "Face left the frame — stay visible while answering",
      };

  if (typing) {
    return {
      ...base,
      noFaceStreakMin: base.noFaceStreakMin + 6,
      noFaceHoldMs: base.noFaceHoldMs + 8000,
      skipPoseChecks: true,
      noFaceMessage:
        "Face left the frame — stay in view while typing (looking at your answer is fine)",
    };
  }

  return { ...base, skipPoseChecks: false };
}

const WebcamProctor = ({ onViolation, isActive, relaxForTyping = false }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const faceapiRef = useRef(null);
  /** Holds the live MediaStream so we can stop tracks even after the <video> unmounts */
  const streamRef = useRef(null);
  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;
  /** Stable callback reference — parent handlers often change each render (typing updates state).
   *  Including `onViolation` in effect deps was restarting getUserMedia on every keystroke → blink.
   */
  const onViolationRef = useRef(onViolation);
  useEffect(() => {
    onViolationRef.current = onViolation;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  /** When true, dim-room presets apply (still enforced — softer thresholds / longer waits) */
  const [lowLightActive, setLowLightActive] = useState(false);
  const [liveAlert, setLiveAlert] = useState(null);
  /** True when the camera track has ended/muted or the feed is black (covered/off) */
  const [cameraOff, setCameraOff] = useState(false);
  const lowLightPrevRef = useRef(false);
  const detectionIntervalRef = useRef(null);
  const noFaceTimerRef = useRef(null);
  const cameraOffTimerRef = useRef(null);
  /** Counts consecutive near-black frames before flagging a covered/off camera */
  const consecutiveBlackRef = useRef(0);
  const lookingAwayTimerRef = useRef(null);
  const headTurnTimerRef = useRef(null);
  /** Only count "empty" frames after real misses — detector often flickers in low light */
  const consecutiveNoFaceRef = useRef(0);
  /** Dim-light: require multiple consecutive seconds with 2+ faces before warning */
  const consecutiveMultipleFacesRef = useRef(0);
  /** Require sustained pose drift — single jittery frames should not start timers */
  const consecutiveLookingAwayRef = useRef(0);
  const consecutiveHeadTurnRef = useRef(0);
  /** Avoid spamming parent (and duplicate warnings) when pose jitters */
  const violationCooldownRef = useRef({});
  const COOLDOWN_MS = {
    head_turned: 15_000,
    looking_away: 15_000,
    multiple_faces: 8_000,
    no_face_detected: 15_000,
    camera_off: 12_000,
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (cameraOffTimerRef.current) {
      clearTimeout(cameraOffTimerRef.current);
      cameraOffTimerRef.current = null;
    }
    consecutiveBlackRef.current = 0;
    setCameraActive(false);
    setCameraOff(false);
  };

  /** Camera stopped/covered/disabled — flag immediately and surface a sticky alert */
  const flagCameraOff = (reason) => {
    if (!isActiveRef.current) return;
    setCameraOff(true);
    reportViolation("camera_off", 40, reason);
  };

  const reportViolation = (type, points, reason) => {
    const poseTypes = ["head_turned", "looking_away"];
    const cooldownKey = poseTypes.includes(type) ? "_pose_group" : type;
    const cooldown = poseTypes.includes(type)
      ? 15_000
      : COOLDOWN_MS[type] ?? 8_000;

    const now = Date.now();
    const last = violationCooldownRef.current[cooldownKey] ?? 0;
    if (now - last < cooldown) return;
    violationCooldownRef.current[cooldownKey] = now;
    setLiveAlert(reason);
    window.setTimeout(() => setLiveAlert((prev) => (prev === reason ? null : prev)), 6000);
    onViolationRef.current?.(type, points, reason);
  };

  // Load face-api.js (dynamic import — smaller initial bundle)
  useEffect(() => {
    let cancelled = false;

    const loadModels = async () => {
      try {
        const mod = await import("face-api.js");
        const faceapi = mod.default ?? mod;
        if (cancelled) return;

        faceapiRef.current = faceapi;
        const MODEL_URL = "/models";

        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);

        if (!cancelled) {
          setModelsLoaded(true);
          console.log("✅ Face detection models loaded");
        }
      } catch (error) {
        console.error("❌ Failed to load face detection models:", error);
        if (!cancelled) {
          setModelsLoaded(false);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadModels();
    return () => {
      cancelled = true;
    };
  }, []);

  // Start webcam
  useEffect(() => {
    if (!isActive || !modelsLoaded) {
      stopCamera();
      return undefined;
    }

    let cancelled = false;

    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 640,
            height: 480,
            facingMode: "user",
          },
          audio: false,
        });

        if (cancelled || !isActiveRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        // Detect the camera being switched off / disconnected mid-interview.
        // Browsers fire "ended" (track stopped/unplugged) or "mute" (OS/privacy
        // shutter, another app grabbed the device) on the video track.
        stream.getVideoTracks().forEach((track) => {
          track.addEventListener("ended", () => {
            flagCameraOff("Camera turned off — turn it back on to continue the interview");
          });
          track.addEventListener("mute", () => {
            flagCameraOff("Camera feed stopped — make sure your camera is on and not blocked");
          });
          track.addEventListener("unmute", () => {
            setCameraOff(false);
          });
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
          setCameraOff(false);
          console.log("✅ Webcam started");
        }
      } catch (error) {
        console.error("❌ Webcam access denied:", error);
        setCameraOff(true);
        reportViolation("camera_denied", 50, "Camera access required for interview");
      }
    };

    startWebcam();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [isActive, modelsLoaded]);

  // Face detection loop
  useEffect(() => {
    if (!cameraActive || !modelsLoaded || !isActive) return;

    const detectFaces = async () => {
      const faceapi = faceapiRef.current;
      if (!faceapi || !videoRef.current || videoRef.current.paused) return;

      try {
        const v = videoRef.current;
        // Avoid false "no face" while the stream is still warming up / has no dimensions
        if (!v || v.readyState < 2 || !v.videoWidth) {
          return;
        }

        const luma = estimateVideoLuminance(v);

        // Near-black feed for a few seconds → lens covered or camera off (not just dim).
        if (luma < BLACK_FRAME_LUMA) {
          consecutiveBlackRef.current += 1;
          if (consecutiveBlackRef.current >= 6 && !cameraOffTimerRef.current) {
            cameraOffTimerRef.current = setTimeout(() => {
              flagCameraOff(
                "Camera appears off or covered — uncover it and stay visible"
              );
              cameraOffTimerRef.current = null;
            }, 3000);
          }
          return; // black frame yields no usable detections — skip the rest
        }
        consecutiveBlackRef.current = 0;
        if (cameraOffTimerRef.current) {
          clearTimeout(cameraOffTimerRef.current);
          cameraOffTimerRef.current = null;
        }
        if (cameraOff) setCameraOff(false);

        const lowLight = luma < LOW_LIGHT_LUMA;
        if (lowLight !== lowLightPrevRef.current) {
          lowLightPrevRef.current = lowLight;
          setLowLightActive(lowLight);
        }

        const rules = getProctorRules(lowLight, relaxForTyping);

        const detectorOpts = new faceapi.TinyFaceDetectorOptions({
          inputSize: lowLight ? 608 : 512,
          scoreThreshold: lowLight ? 0.18 : 0.26,
        });

        const detections = await faceapi
          .detectAllFaces(v, detectorOpts)
          .withFaceLandmarks();

        const frameW = v.videoWidth;
        const frameH = v.videoHeight;
        let distinctFaces = dedupeFaceDetections(detections);
        distinctFaces = mergeContainedDetections(distinctFaces);
        const faceCount = countDistinctFaces(detections, frameW, frameH);

        if (canvasRef.current) {
          const displaySize = {
            width: frameW,
            height: frameH,
          };
          faceapi.matchDimensions(canvasRef.current, displaySize);
          const resizedDetections = faceapi.resizeResults(distinctFaces, displaySize);

          const ctx = canvasRef.current.getContext("2d");
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
        }

        if (faceCount === 0 || faceCount > 1) {
          if (lookingAwayTimerRef.current) {
            clearTimeout(lookingAwayTimerRef.current);
            lookingAwayTimerRef.current = null;
          }
          if (headTurnTimerRef.current) {
            clearTimeout(headTurnTimerRef.current);
            headTurnTimerRef.current = null;
          }
        }

        if (faceCount === 0) {
          consecutiveNoFaceRef.current += 1;
          if (
            consecutiveNoFaceRef.current >= rules.noFaceStreakMin &&
            !noFaceTimerRef.current
          ) {
            noFaceTimerRef.current = setTimeout(() => {
              reportViolation(
                "no_face_detected",
                lowLight ? 18 : 25,
                rules.noFaceMessage
              );
              noFaceTimerRef.current = null;
            }, rules.noFaceHoldMs);
          }
        } else {
          consecutiveNoFaceRef.current = 0;
          if (noFaceTimerRef.current) {
            clearTimeout(noFaceTimerRef.current);
            noFaceTimerRef.current = null;
          }
        }

        if (faceCount > 1) {
          consecutiveMultipleFacesRef.current += 1;
          const needTicks = rules.multipleFacesConfirmTicks ?? 4;
          if (
            consecutiveMultipleFacesRef.current >= 2 &&
            consecutiveMultipleFacesRef.current < needTicks
          ) {
            setLiveAlert("Multiple faces detected — verifying…");
          }
          if (consecutiveMultipleFacesRef.current >= needTicks) {
            reportViolation(
              "multiple_faces",
              lowLight ? 35 : 40,
              lowLight
                ? "Multiple faces visible for several seconds (dim-light rule)"
                : "Multiple faces detected — only you should be on camera"
            );
            consecutiveMultipleFacesRef.current = 0;
          }
        } else {
          consecutiveMultipleFacesRef.current = 0;
          setLiveAlert((prev) =>
            prev === "Multiple faces detected — verifying…" ? null : prev
          );
        }

        if (faceCount === 1 && !rules.skipPoseChecks) {
          const landmarks = distinctFaces[0].landmarks;
          const nose = landmarks.getNose();
          const leftEye = landmarks.getLeftEye();
          const rightEye = landmarks.getRightEye();

          const faceBox = distinctFaces[0].detection.box;
          const faceWidth = Math.max(faceBox.width, 1);
          const faceHeight = Math.max(faceBox.height, 1);
          const eyeDistance = Math.abs(leftEye[0].x - rightEye[3].x);
          const eyeDistRatio = eyeDistance / faceWidth;
          const eyeMidX = (leftEye[0].x + rightEye[3].x) / 2;
          const noseX = nose[3].x;
          const yawNorm = (noseX - eyeMidX) / faceWidth;

          const extremeYaw = Math.abs(yawNorm) > rules.yawAbsMin;

          const profileAspect = faceWidth / faceHeight;
          const profileLike =
            profileAspect < rules.profileAspectMax &&
            eyeDistRatio < rules.profileEyeRatioMax;

          // Only a sustained clear side turn — not looking down at the answer box or keyboard.
          const lookingAwaySuspected = extremeYaw;
          const headTurnSuspected = extremeYaw || profileLike;

          if (lookingAwaySuspected) {
            consecutiveLookingAwayRef.current += 1;
            if (
              consecutiveLookingAwayRef.current >= rules.poseStreakMin &&
              !lookingAwayTimerRef.current
            ) {
              lookingAwayTimerRef.current = setTimeout(() => {
                reportViolation(
                  "looking_away",
                  lowLight ? 12 : 15,
                  "Turned away from the screen for several seconds"
                );
                lookingAwayTimerRef.current = null;
              }, rules.lookingAwayDelayMs);
            }
          } else {
            consecutiveLookingAwayRef.current = 0;
            if (lookingAwayTimerRef.current) {
              clearTimeout(lookingAwayTimerRef.current);
              lookingAwayTimerRef.current = null;
            }
          }

          if (headTurnSuspected) {
            consecutiveHeadTurnRef.current += 1;
            if (
              consecutiveHeadTurnRef.current >= rules.poseStreakMin &&
              !headTurnTimerRef.current
            ) {
              headTurnTimerRef.current = setTimeout(() => {
                reportViolation(
                  "head_turned",
                  lowLight ? 22 : 25,
                  "Head turned to the side for several seconds — stay facing the screen"
                );
                headTurnTimerRef.current = null;
              }, rules.headTurnDelayMs);
            }
          } else {
            consecutiveHeadTurnRef.current = 0;
            if (headTurnTimerRef.current) {
              clearTimeout(headTurnTimerRef.current);
              headTurnTimerRef.current = null;
            }
          }
        } else if (faceCount === 1 && rules.skipPoseChecks) {
          consecutiveLookingAwayRef.current = 0;
          consecutiveHeadTurnRef.current = 0;
          if (lookingAwayTimerRef.current) {
            clearTimeout(lookingAwayTimerRef.current);
            lookingAwayTimerRef.current = null;
          }
          if (headTurnTimerRef.current) {
            clearTimeout(headTurnTimerRef.current);
            headTurnTimerRef.current = null;
          }
        }
      } catch (error) {
        console.error("Face detection error:", error);
        // Inference glitch — do not treat as "no face" (prevents unfair streaks)
      }
    };

    detectionIntervalRef.current = setInterval(detectFaces, 500);

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      if (noFaceTimerRef.current) {
        clearTimeout(noFaceTimerRef.current);
      }
      if (lookingAwayTimerRef.current) {
        clearTimeout(lookingAwayTimerRef.current);
      }
      if (headTurnTimerRef.current) {
        clearTimeout(headTurnTimerRef.current);
      }
      if (cameraOffTimerRef.current) {
        clearTimeout(cameraOffTimerRef.current);
        cameraOffTimerRef.current = null;
      }
      consecutiveBlackRef.current = 0;
      consecutiveNoFaceRef.current = 0;
      consecutiveMultipleFacesRef.current = 0;
      consecutiveLookingAwayRef.current = 0;
      consecutiveHeadTurnRef.current = 0;
    };
  }, [cameraActive, modelsLoaded, isActive, relaxForTyping]);

  if (!isActive) return null;

  return (
    <div className="fixed top-20 right-6 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-800 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                cameraOff
                  ? "bg-amber-400 animate-pulse"
                  : cameraActive
                    ? "bg-red-500 animate-pulse"
                    : "bg-gray-400"
              }`}
            ></div>
            <span className="text-xs text-white font-medium">
              {cameraOff ? "Camera Off" : "Proctoring Active"}
            </span>
          </div>
        </div>

        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-48 h-36 object-cover bg-gray-900"
            onLoadedMetadata={() => {
              if (videoRef.current) {
                videoRef.current.play();
              }
            }}
          />
          <canvas ref={canvasRef} className="absolute top-0 left-0 w-48 h-36" />

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
              <div className="text-white text-xs">Loading...</div>
            </div>
          )}
        </div>

        {!modelsLoaded && !isLoading && (
          <div className="px-3 py-2 bg-yellow-50 border-t border-yellow-200">
            <p className="text-xs text-yellow-700">Face detection unavailable</p>
          </div>
        )}

        {cameraOff && (
          <div className="px-3 py-2 bg-red-600 border-t border-red-700">
            <p className="text-xs text-white font-semibold leading-snug">
              Camera is off. Turn your camera back on to continue — this is being recorded as a
              proctoring violation.
            </p>
          </div>
        )}

        {liveAlert && !cameraOff && (
          <div className="px-3 py-2 bg-red-600 border-t border-red-700">
            <p className="text-xs text-white font-medium leading-snug">{liveAlert}</p>
          </div>
        )}

        {relaxForTyping && modelsLoaded && !liveAlert && (
          <div className="px-3 py-2 bg-emerald-50 border-t border-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-900">
            <p className="text-xs text-emerald-950 dark:text-emerald-100 leading-snug">
              <span className="font-semibold">Typing mode.</span> Look at your answer freely —
              only leaving the frame for a long time triggers a warning.
            </p>
          </div>
        )}

        {lowLightActive && modelsLoaded && !liveAlert && !relaxForTyping && (
          <div className="px-3 py-2 bg-amber-50 border-t border-amber-100 dark:bg-amber-950/40 dark:border-amber-900">
            <p className="text-xs text-amber-950 dark:text-amber-100 leading-snug">
              <span className="font-semibold">Dim lighting.</span> Looking at the screen or
              keyboard is fine. Add front light if the camera briefly loses your face.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebcamProctor;
