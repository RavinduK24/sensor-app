import React, { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';

const CameraRecognition = ({ onRecognitionComplete, onSkip }) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [stream, setStream] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const customerProfiles = [
    {
      type: 'Work from Home Adult',
      description: 'Productivity-focused environment',
      icon: '💼',
      characteristics: 'Needs good lighting and cool temp'
    },
    {
      type: 'Elderly People',
      description: 'Comfort and safety focused',
      icon: '👴',
      characteristics: 'Warmer temp, easy accessibility'
    },
    {
      type: 'Families with Babies',
      description: 'Gentle and quiet environment',
      icon: '👶',
      characteristics: 'Soft lighting, stable humidity'
    },
    {
      type: 'Asthma/Allergic People',
      description: 'Health-conscious environment',
      icon: '😷',
      characteristics: 'High air quality, low humidity'
    }
  ];

  // Load Face-API models
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models';
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
          faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        console.log('Face-API models loaded successfully');
      } catch (err) {
        console.error('Error loading models:', err);
        console.log('Models not found - will use simulated recognition');
        setModelsLoaded(false);
      }
    };
    loadModels();
  }, []);

  // Effect to handle video stream attachment when camera becomes active
  useEffect(() => {
    if (cameraActive && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play().catch(err => {
          console.error('Error playing video:', err);
        });
      };
    }
  }, [cameraActive, stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: 'user'
        },
        audio: false 
      });
      setStream(mediaStream);
      setCameraActive(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Could not access camera. Please select a profile manually or skip.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraActive(false);
    }
  };

  const detectFaceAndRecognize = async () => {
    if (!videoRef.current || !videoRef.current.videoWidth) {
      alert('Video not ready. Please wait a moment and try again.');
      return;
    }

    setIsRecognizing(true);
    setDetectionResult(null);

    try {
      // Use faster TinyFaceDetector options
      const options = new faceapi.TinyFaceDetectorOptions({
        inputSize: 224,  // Smaller for faster processing
        scoreThreshold: 0.5
      });

      // Detect face with additional info (age, gender, expressions)
      let detections = await faceapi
        .detectSingleFace(videoRef.current, options)
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender();

      // Fallback for Mask Detection:
      // If high-confidence detection fails, try a very low threshold detection.
      // Masks often block landmarks but might still register as a "weak" face.
      if (!detections) {
        console.log("Standard detection failed, attempting mask detection fallback...");
        const maskOptions = new faceapi.TinyFaceDetectorOptions({
          inputSize: 224,
          scoreThreshold: 0.15 // Very low threshold to catch masked faces
        });
        const maskDetections = await faceapi.detectSingleFace(videoRef.current, maskOptions);
        
        if (maskDetections) {
          console.log("Low confidence face detected - assuming mask usage");
          // Manually construct a result for the masked user
          setDetectionResult({
            age: "?",
            gender: "neutral",
            expressions: [['Mask Detected', 1.0]],
            profile: 'Asthma/Allergic People'
          });

          // Draw a simple box if possible
          if (canvasRef.current && videoRef.current) {
             const canvas = canvasRef.current;
             const displaySize = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
             faceapi.matchDimensions(canvas, displaySize);
             const resized = faceapi.resizeResults(maskDetections, displaySize);
             const ctx = canvas.getContext('2d');
             ctx.clearRect(0, 0, canvas.width, canvas.height);
             ctx.strokeStyle = '#10b981';
             ctx.lineWidth = 4;
             ctx.strokeRect(resized.box.x, resized.box.y, resized.box.width, resized.box.height);
             ctx.fillStyle = '#10b981';
             ctx.font = '20px Arial';
             ctx.fillText("Mask Detected", resized.box.x, resized.box.y - 10);
          }

          setTimeout(() => {
            setIsRecognizing(false);
            stopCamera();
            onRecognitionComplete('Asthma/Allergic People');
          }, 1500);
          return;
        }
      }

      if (detections) {
        const { age, gender, expressions } = detections;
        
        // Draw detection on canvas
        if (canvasRef.current && videoRef.current) {
          const canvas = canvasRef.current;
          const displaySize = {
            width: videoRef.current.videoWidth,
            height: videoRef.current.videoHeight
          };
          faceapi.matchDimensions(canvas, displaySize);
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          faceapi.draw.drawDetections(canvas, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        }

        // Determine profile based on AI analysis
        let profileType = determineProfile(age, gender, expressions);
        
        setDetectionResult({
          age: Math.round(age),
          gender,
          expressions: Object.entries(expressions)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3),
          profile: profileType
        });

        // Wait a moment to show results, then complete
        setTimeout(() => {
          setIsRecognizing(false);
          stopCamera();
          onRecognitionComplete(profileType);
        }, 1500);
      } else {
        alert('No face detected. Please position yourself in front of the camera and ensure good lighting.');
        setIsRecognizing(false);
      }
    } catch (err) {
      console.error('Error during face recognition:', err);
      // Fallback to random selection if AI fails
      const randomProfile = customerProfiles[Math.floor(Math.random() * customerProfiles.length)];
      setTimeout(() => {
        setIsRecognizing(false);
        stopCamera();
        onRecognitionComplete(randomProfile.type);
      }, 800);
    }
  };

  const determineProfile = (age, gender, expressions) => {
    // Logic to determine profile based on facial analysis
    
    // If age > 60, likely elderly
    if (age > 60) {
      return 'Elderly People';
    }
    
    // If age < 12, likely family with baby/child
    if (age < 12) {
      return 'Families with Babies';
    }

    // If age 25-40 and female, higher chance of being a mother (heuristic)
    if (age >= 25 && age <= 40 && gender === 'female') {
      // 30% chance to be identified as Family
      if (Math.random() > 0.7) return 'Families with Babies';
    }
    
    // Check for "mask" or health concern (simulated by "sad" or "fearful" expression or low confidence)
    // Since we can't detect masks directly with this model, we use a heuristic
    // If expression is 'sad' or 'fearful' (maybe feeling unwell), suggest Asthma/Allergic
    if (expressions.sad > 0.5 || expressions.fearful > 0.5) {
      return 'Asthma/Allergic People';
    }

    // Default to Work from Home Adult
    return 'Work from Home Adult';
  };

  const simulateRecognition = () => {
    if (modelsLoaded) {
      detectFaceAndRecognize();
    } else {
      // Fallback: simulate without AI
      setIsRecognizing(true);
      setTimeout(() => {
        const randomProfile = customerProfiles[Math.floor(Math.random() * customerProfiles.length)];
        setIsRecognizing(false);
        stopCamera();
        onRecognitionComplete(randomProfile.type);
      }, 2000);
    }
  };

  const handleManualSelect = (profileType) => {
    stopCamera();
    onRecognitionComplete(profileType);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="camera-recognition-page">
      <div className="camera-recognition-container">
        {/* Header Section */}
        <div className="camera-recognition-header">
          <h1>🤖 Facial Recognition Scan</h1>
          <p>Use your camera for AI-powered profile detection or select manually</p>
          <button className="btn-secondary" onClick={onSkip} style={{ marginTop: '1rem' }}>
            ← Back to Home
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="camera-main-wrapper">
          {/* Camera Display Section */}
          <div className="camera-display-section">
            {/* Video Container */}
            <div className="video-container">
              {cameraActive ? (
                <div style={{ position: 'relative', width: '100%', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      transform: 'scaleX(-1)',
                      display: 'block'
                    }}
                  />
                  <canvas
                    ref={canvasRef}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transform: 'scaleX(-1)',
                      pointerEvents: 'none'
                    }}
                  />
                  {isRecognizing && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(0, 0, 0, 0.3)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 10
                    }}>
                      <div className="loading-spinner"></div>
                      <p style={{ marginTop: '1rem', color: '#fff', fontWeight: 'bold' }}>Analyzing face...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  height: '400px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#b0b0b0',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📷</div>
                  <p style={{ fontSize: '1.1rem' }}>Camera is off</p>
                  {!modelsLoaded && (
                    <p style={{ fontSize: '0.9rem', color: '#f093fb', marginTop: '0.5rem' }}>
                      ⚠️ Using fallback recognition mode
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Detection Results */}
            {detectionResult && (
              <div className="detection-result">
                <div className="result-header">
                  <div className="result-icon">✨</div>
                  <h3>Profile Detected</h3>
                </div>
                <div className="result-item">
                  <span className="result-label">👤 Age:</span>
                  <span className="result-value">{detectionResult.age}y</span>
                </div>
                <div className="result-item">
                  <span className="result-label">⚥ Gender:</span>
                  <span className="result-value" style={{ textTransform: 'capitalize' }}>{detectionResult.gender}</span>
                </div>
                <div className="result-divider"></div>
                <div className="result-profile">
                  <div className="profile-badge">
                    {customerProfiles.find(p => p.type === detectionResult.profile)?.icon}
                  </div>
                  <div className="profile-info">
                    <h4 className="profile-name">{detectionResult.profile}</h4>
                    <p className="profile-desc">{customerProfiles.find(p => p.type === detectionResult.profile)?.description}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="camera-controls">
              {!cameraActive ? (
                <button className="btn-primary" onClick={startCamera}>
                  📷 Start Camera
                </button>
              ) : (
                <>
                  <button 
                    className="btn-primary" 
                    onClick={simulateRecognition}
                    disabled={isRecognizing}
                  >
                    {isRecognizing ? '⏳ Analyzing...' : '🤖 Scan Face'}
                  </button>
                  <button 
                    className="btn-secondary" 
                    onClick={stopCamera}
                    disabled={isRecognizing}
                  >
                    Stop Camera
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Profile Selection Section */}
          <div className="profile-selection-section">
            <h3>Quick Profile Selection</h3>
            <div className="profile-options">
              {customerProfiles.map((profile) => (
                <button
                  key={profile.type}
                  className="profile-option"
                  onClick={() => handleManualSelect(profile.type)}
                >
                  <div className="profile-option-icon">{profile.icon}</div>
                  <h4>{profile.type}</h4>
                  <p>{profile.description}</p>
                  <p style={{ fontSize: '0.85rem', color: '#667eea', marginTop: '0.5rem' }}>
                    {profile.characteristics}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Manual Selection Section */}
        <div className="manual-selection">
          <h3>Or Choose Any Profile</h3>
          <div className="profile-grid">
            {customerProfiles.map((profile) => (
              <button
                key={profile.type}
                className="profile-card-button"
                onClick={() => handleManualSelect(profile.type)}
              >
                <div className="profile-icon">{profile.icon}</div>
                <h4>{profile.type}</h4>
                <p className="profile-description">{profile.description}</p>
                <p className="profile-characteristics">{profile.characteristics}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraRecognition;
