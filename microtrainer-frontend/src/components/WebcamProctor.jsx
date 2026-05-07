import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

const WebcamProctor = ({ onViolation, isActive }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const detectionIntervalRef = useRef(null);
  const noFaceTimerRef = useRef(null);
  const lookingAwayTimerRef = useRef(null);

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models"; // We'll need to add models to public folder
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        
        setModelsLoaded(true);
        console.log("✅ Face detection models loaded");
      } catch (error) {
        console.error("❌ Failed to load face detection models:", error);
        // Continue without face detection if models fail to load
        setModelsLoaded(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadModels();
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
            facingMode: "user"
          },
          audio: false
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
          console.log("✅ Webcam started");
        }
      } catch (error) {
        console.error("❌ Webcam access denied:", error);
        onViolation("camera_denied", 50, "Camera access required for interview");
      }
    };

    startWebcam();

    return () => {
      // Stop webcam on cleanup
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [isActive, modelsLoaded]);

  // Face detection loop
  useEffect(() => {
    if (!cameraActive || !modelsLoaded || !isActive) return;

    const detectFaces = async () => {
      if (!videoRef.current || videoRef.current.paused) return;

      try {
        const detections = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks();

        // Draw detections on canvas (optional - for debugging)
        if (canvasRef.current) {
          const displaySize = {
            width: videoRef.current.videoWidth,
            height: videoRef.current.videoHeight
          };
          faceapi.matchDimensions(canvasRef.current, displaySize);
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          
          const ctx = canvasRef.current.getContext("2d");
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
        }

        // DETECTION LOGIC
        const faceCount = detections.length;

        // 1. NO FACE DETECTED
        if (faceCount === 0) {
          if (!noFaceTimerRef.current) {
            noFaceTimerRef.current = setTimeout(() => {
              onViolation("no_face_detected", 25, "No face detected for 5 seconds");
              noFaceTimerRef.current = null;
            }, 5000); // 5 seconds threshold
          }
        } else {
          // Clear no-face timer if face is detected
          if (noFaceTimerRef.current) {
            clearTimeout(noFaceTimerRef.current);
            noFaceTimerRef.current = null;
          }
        }

        // 2. MULTIPLE FACES DETECTED
        if (faceCount > 1) {
          onViolation("multiple_faces", 40, "Multiple faces detected");
        }

        // 3. GAZE TRACKING (Looking Away Detection)
        if (faceCount === 1) {
          const landmarks = detections[0].landmarks;
          const nose = landmarks.getNose();
          const leftEye = landmarks.getLeftEye();
          const rightEye = landmarks.getRightEye();

          // Calculate face center
          const faceBox = detections[0].detection.box;
          const faceCenterX = faceBox.x + faceBox.width / 2;
          const faceCenterY = faceBox.y + faceBox.height / 2;

          // Calculate nose position relative to face center
          const noseX = nose[3].x;
          const noseY = nose[3].y;

          const offsetX = Math.abs(noseX - faceCenterX);
          const offsetY = Math.abs(noseY - faceCenterY);

          // If nose is significantly offset from center, person is looking away
          const lookingAwayThreshold = faceBox.width * 0.15; // 15% of face width

          if (offsetX > lookingAwayThreshold || offsetY > lookingAwayThreshold) {
            if (!lookingAwayTimerRef.current) {
              lookingAwayTimerRef.current = setTimeout(() => {
                onViolation("looking_away", 15, "Looking away from screen");
                lookingAwayTimerRef.current = null;
              }, 8000); // 8 seconds threshold
            }
          } else {
            // Clear looking-away timer if looking at screen
            if (lookingAwayTimerRef.current) {
              clearTimeout(lookingAwayTimerRef.current);
              lookingAwayTimerRef.current = null;
            }
          }

          // 4. HEAD TURN DETECTION (Severe rotation)
          const eyeDistance = Math.abs(leftEye[0].x - rightEye[3].x);
          const faceWidth = faceBox.width;
          const rotationRatio = eyeDistance / faceWidth;

          // If eyes are too close together, head is turned significantly
          if (rotationRatio < 0.3) {
            onViolation("head_turned", 20, "Head turned away from camera");
          }
        }

      } catch (error) {
        console.error("Face detection error:", error);
      }
    };

    // Run detection every 1 second
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
    };
  }, [cameraActive, modelsLoaded, isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed top-20 right-6 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-800 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${cameraActive ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
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
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-48 h-36"
          />
          
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
      </div>
    </div>
  );
};

export default WebcamProctor;
