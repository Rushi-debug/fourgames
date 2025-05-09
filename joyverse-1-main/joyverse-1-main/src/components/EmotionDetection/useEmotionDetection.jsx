import { useEffect, useRef, useState, useCallback } from 'react';
import * as faceMesh from '@mediapipe/face_mesh';
import * as cameraUtils from '@mediapipe/camera_utils';

const useEmotionDetection = (options = {}) => {
  const {
    videoRef,
    canvasRef,
    emotionDisplayRef,
    startCamera = false,
    onEmotionsCollected = () => {},
    onError = () => {}
  } = options;

  const [emotionQueue, setEmotionQueue] = useState([]);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const isProcessing = useRef(false);
  const cameraRef = useRef(null);
  const faceMeshRef = useRef(null);

  // Validate refs and camera access
  const validateRefs = useCallback(() => {
    if (!videoRef?.current) {
      throw new Error('Video ref is not initialized');
    }
    if (!canvasRef?.current) {
      throw new Error('Canvas ref is not initialized');
    }
  }, [videoRef, canvasRef]);

  // Initialize FaceMesh
  const initializeFaceMesh = useCallback(() => {
    faceMeshRef.current = new faceMesh.FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMeshRef.current.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    return faceMeshRef.current;
  }, []);

  // Process FaceMesh results
  const processResults = useCallback((results) => {
    if (results.multiFaceLandmarks?.length > 0) {
      const detectedLandmarks = results.multiFaceLandmarks[0].slice(0, 468).map((lm) => ({
        x: lm.x,
        y: lm.y,
        z: lm.z,
      }));

      if (!isProcessing.current) {
        isProcessing.current = true;
        
        sendLandmarksToServer(detectedLandmarks)
          .then((detectedEmotion) => {
            setEmotionQueue((prev) => {
              const newQueue = [...prev, detectedEmotion].slice(-4);
              onEmotionsCollected(newQueue);
              return newQueue;
            });
          })
          .catch((err) => {
            console.error('Emotion detection error:', err);
            onError(err.message);
          })
          .finally(() => {
            isProcessing.current = false;
          });
      }
    }
  }, [onEmotionsCollected, onError]);

  // Send landmarks to server
  const sendLandmarksToServer = useCallback(async (landmarks) => {
    try {
      const response = await fetch('http://localhost:5000/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ landmarks }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      return data.emotion;
    } catch (err) {
      console.error('Failed to send landmarks:', err);
      throw err;
    }
  }, []);

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    try {
      validateRefs();
      const faceMeshInstance = initializeFaceMesh();
      
      faceMeshInstance.onResults((results) => {
        if (canvasRef.current) {
          // Draw results to canvas if needed
          // canvasCtx.current.save();
          // canvasCtx.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          // canvasCtx.current.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);
          // canvasCtx.current.restore();
        }
        processResults(results);
      });

      const camera = new cameraUtils.Camera(videoRef.current, {
        onFrame: async () => {
          await faceMeshInstance.send({ image: videoRef.current });
        },
        width: 640,
        height: 480,
      });

      cameraRef.current = camera;
      await camera.start();
      setIsCameraReady(true);
      
    } catch (err) {
      console.error('Camera initialization failed:', err);
      onError(err.message);
      setIsCameraReady(false);
    }
  }, [validateRefs, initializeFaceMesh, processResults, videoRef, canvasRef, onError]);

  // Main effect
  useEffect(() => {
    if (!startCamera) return;

    initializeCamera();

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (faceMeshRef.current) {
        faceMeshRef.current.close();
      }
      setIsCameraReady(false);
    };
  }, [startCamera, initializeCamera]);

  return {
    emotionQueue,
    isCameraReady,
    restartCamera: initializeCamera,
  };
};

export default useEmotionDetection;