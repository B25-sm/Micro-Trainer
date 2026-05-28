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

/** Normal vs dim room — dim keeps rules but uses longer waits & stricter pose signals */
function getProctorRules(lowLight) {
  if (lowLight) {
    return {
      noFaceStreakMin: 10,
      noFaceHoldMs: 22_000,
      lookingAwayDelayMs: 9000,
      headTurnDelayMs: 7500,
      lookingAwayMulX: 1.38,
      lookingAwayMulY: 1.32,
      headTurnEyeRatioMax: 0.33,
      headTurnNormXMin: 0.26,
      headTurnNormYMin: 0.21,
      multipleFacesConfirmSecs: 5,
      noFaceMessage:
        "The camera lost your face for a long time (dim-light rules — improve lighting or sit centered)",
    };
  }
  return {
    noFaceStreakMin: 5,
    noFaceHoldMs: 12_000,
    lookingAwayDelayMs: 5000,
    headTurnDelayMs: 3500,
    lookingAwayMulX: 1,
    lookingAwayMulY: 1,
    headTurnEyeRatioMax: 0.42,
    headTurnNormXMin: 0.18,
    headTurnNormYMin: 0.14,
    multipleFacesConfirmSecs: 1,
    noFaceMessage:
      "The camera lost your face for an extended time — sit centered, face the lens, and add light",
  };
}

const WebcamProctor = ({ onViolation, isActive }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const faceapiRef = useRef(null);
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
  const lowLightPrevRef = useRef(false);
  const detectionIntervalRef = useRef(null);
  const noFaceTimerRef = useRef(null);
  const lookingAwayTimerRef = useRef(null);
  const headTurnTimerRef = useRef(null);
  /** Only count "empty" frames after real misses — detector often flickers in low light */
  const consecutiveNoFaceRef = useRef(0);
  /** Dim-light: require multiple consecutive seconds with 2+ faces before warning */
  const consecutiveMultipleFacesRef = useRef(0);
  /** Avoid spamming parent (and duplicate warnings) when pose jitters */
  const violationCooldownRef = useRef({});
  const COOLDOWN_MS = {
    head_turned: 14_000,
    looking_away: 14_000,
    multiple_faces: 8_000,
    no_face_detected: 25_000,
  };

  const reportViolation = (type, points, reason) => {
    const poseTypes = ["head_turned", "looking_away"];
    const cooldownKey = poseTypes.includes(type) ? "_pose_group" : type;
    const cooldown = poseTypes.includes(type)
      ? 14_000
      : COOLDOWN_MS[type] ?? 5_000;

    const now = Date.now();
    const last = violationCooldownRef.current[cooldownKey] ?? 0;
    if (now - last < cooldown) return;
    violationCooldownRef.current[cooldownKey] = now;
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
    if (!isActive || !modelsLoaded) return;

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

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
          console.log("✅ Webcam started");
        }
      } catch (error) {
        console.error("❌ Webcam access denied:", error);
        reportViolation("camera_denied", 50, "Camera access required for interview");
      }
    };

    startWebcam();

    return () => {
      const v = videoRef.current;
      if (v && v.srcObject) {
        const tracks = v.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
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
        const lowLight = luma < LOW_LIGHT_LUMA;
        if (lowLight !== lowLightPrevRef.current) {
          lowLightPrevRef.current = lowLight;
          setLowLightActive(lowLight);
        }

        const rules = getProctorRules(lowLight);

        const detectorOpts = new faceapi.TinyFaceDetectorOptions({
          inputSize: lowLight ? 608 : 416,
          scoreThreshold: lowLight ? 0.22 : 0.35,
        });

        const detections = await faceapi
          .detectAllFaces(v, detectorOpts)
          .withFaceLandmarks();

        if (canvasRef.current) {
          const displaySize = {
            width: videoRef.current.videoWidth,
            height: videoRef.current.videoHeight,
          };
          faceapi.matchDimensions(canvasRef.current, displaySize);
          const resizedDetections = faceapi.resizeResults(detections, displaySize);

          const ctx = canvasRef.current.getContext("2d");
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
        }

        const faceCount = detections.length;

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
          if (lowLight) {
            consecutiveMultipleFacesRef.current += 1;
            if (
              consecutiveMultipleFacesRef.current >= rules.multipleFacesConfirmSecs
            ) {
              reportViolation(
                "multiple_faces",
                35,
                "Multiple faces visible for several seconds (dim-light rule)"
              );
              consecutiveMultipleFacesRef.current = 0;
            }
          } else {
            consecutiveMultipleFacesRef.current = 0;
            reportViolation("multiple_faces", 40, "Multiple faces detected");
          }
        } else {
          consecutiveMultipleFacesRef.current = 0;
        }

        if (faceCount === 1) {
          const landmarks = detections[0].landmarks;
          const nose = landmarks.getNose();
          const leftEye = landmarks.getLeftEye();
          const rightEye = landmarks.getRightEye();

          const faceBox = detections[0].detection.box;
          const faceCenterX = faceBox.x + faceBox.width / 2;
          const faceCenterY = faceBox.y + faceBox.height / 2;

          const noseX = nose[3].x;
          const noseY = nose[3].y;

          const offsetX = Math.abs(noseX - faceCenterX);
          const offsetY = Math.abs(noseY - faceCenterY);

          const normX = offsetX / Math.max(faceBox.width, 1);
          const normY = offsetY / Math.max(faceBox.height, 1);

          const lookingAwayThresholdX = faceBox.width * 0.12 * rules.lookingAwayMulX;
          const lookingAwayThresholdY = faceBox.height * 0.16 * rules.lookingAwayMulY;

          if (offsetX > lookingAwayThresholdX || offsetY > lookingAwayThresholdY) {
            if (!lookingAwayTimerRef.current) {
              lookingAwayTimerRef.current = setTimeout(() => {
                reportViolation(
                  "looking_away",
                  lowLight ? 12 : 15,
                  lowLight
                    ? "Face not aligned with the camera for a long time (dim room — use front light if you can)"
                    : "Eyes not aligned with the camera — face the screen"
                );
                lookingAwayTimerRef.current = null;
              }, rules.lookingAwayDelayMs);
            }
          } else {
            if (lookingAwayTimerRef.current) {
              clearTimeout(lookingAwayTimerRef.current);
              lookingAwayTimerRef.current = null;
            }
          }

          const eyeDistance = Math.abs(leftEye[0].x - rightEye[3].x);
          const faceWidth = Math.max(faceBox.width, 1);
          const eyeDistRatio = eyeDistance / faceWidth;

          const headTurnSuspected =
            eyeDistRatio < rules.headTurnEyeRatioMax ||
            normX > rules.headTurnNormXMin ||
            normY > rules.headTurnNormYMin;

          if (headTurnSuspected) {
            if (!headTurnTimerRef.current) {
              headTurnTimerRef.current = setTimeout(() => {
                reportViolation(
                  "head_turned",
                  lowLight ? 22 : 25,
                  lowLight
                    ? "Head away from camera too long (dim-light rule — face forward or add light)"
                    : "Head turned away from the camera — face forward"
                );
                headTurnTimerRef.current = null;
              }, rules.headTurnDelayMs);
            }
          } else if (headTurnTimerRef.current) {
            clearTimeout(headTurnTimerRef.current);
            headTurnTimerRef.current = null;
          }
        }
      } catch (error) {
        console.error("Face detection error:", error);
        // Inference glitch — do not treat as "no face" (prevents unfair streaks)
      }
    };

    detectionIntervalRef.current = setInterval(detectFaces, 1000);

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
      consecutiveNoFaceRef.current = 0;
      consecutiveMultipleFacesRef.current = 0;
    };
  }, [cameraActive, modelsLoaded, isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed top-20 right-6 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-800 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${cameraActive ? "bg-red-500 animate-pulse" : "bg-gray-400"}`}
            ></div>
            <span className="text-xs text-white font-medium">Proctoring Active</span>
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

        {lowLightActive && modelsLoaded && (
          <div className="px-3 py-2 bg-amber-50 border-t border-amber-100">
            <p className="text-xs text-amber-950 leading-snug">
              <span className="font-semibold">Dim lighting.</span> Dim-light preset is active:
              longer grace periods before &quot;no face&quot; warnings, clearer head-turn / look-away
              before pose warnings, and two people must appear for several seconds. Add front light when you can.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebcamProctor;
