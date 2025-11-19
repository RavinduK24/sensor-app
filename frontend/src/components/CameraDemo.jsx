import React, { useState, useRef, useEffect } from 'react';

const CameraDemo = ({ customerType, onCustomerTypeChange }) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);

  const customerProfiles = [
    {
      type: 'Working Adult',
      description: 'Active professional with daytime work schedule',
      icon: '💼'
    },
    {
      type: 'Stay-home Elderly',
      description: 'Senior resident who spends most time at home',
      icon: '🏠'
    }
  ];

  const toggleCamera = async () => {
    if (cameraActive && stream) {
      // Stop camera
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraActive(false);
    } else {
      // Start camera
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: true,
          audio: false 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setCameraActive(true);
      } catch (err) {
        console.error('Error accessing camera:', err);
        alert('Could not access camera. Camera demo will work with profile selection only.');
      }
    }
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="camera-section">
      <h3>👤 Customer Recognition Demo</h3>
      <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1.5rem' }}>
        Simulate customer recognition by selecting a profile. In a production system, 
        this would use facial recognition to automatically identify customer preferences.
      </p>
      
      <div className="camera-demo">
        <div className="camera-preview">
          {cameraActive ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div className="camera-placeholder">
              <span>📷</span>
              <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
                {cameraActive ? 'Starting camera...' : 'Camera off'}
              </p>
            </div>
          )}
        </div>

        <div className="camera-controls">
          <h4>Select Customer Profile:</h4>
          <div className="profile-buttons">
            {customerProfiles.map((profile) => (
              <button
                key={profile.type}
                className={`profile-button ${customerType === profile.type ? 'active' : ''}`}
                onClick={() => onCustomerTypeChange(profile.type)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{profile.icon}</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '600' }}>{profile.type}</div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                      {profile.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          <button className="camera-toggle" onClick={toggleCamera}>
            {cameraActive ? '📷 Stop Camera' : '📷 Start Camera'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraDemo;

