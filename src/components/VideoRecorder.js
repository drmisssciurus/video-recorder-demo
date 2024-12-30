import React, { useState, useRef, useEffect } from 'react';

const VideoRecorder = ({ onVideoRecorded }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const recordedChunks = useRef([]);

  // Получение списка камер
  const getCameras = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(
      (device) => device.kind === 'videoinput'
    );
    setCameras(videoDevices);
    if (videoDevices.length > 0) setSelectedCamera(videoDevices[0].deviceId);
  };

  // Запуск камеры
  const startCamera = async (deviceId) => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const constraints = {
        video: { deviceId: deviceId ? { exact: deviceId } : undefined },
        audio: true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Stream obtained:', stream);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  useEffect(() => {
    getCameras();
  }, []);

  useEffect(() => {
    if (selectedCamera) startCamera(selectedCamera);
  }, [selectedCamera]);

  // Начало записи
  const startRecording = () => {
    if (streamRef.current) {
      const mediaRecorder = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
        onVideoRecorded(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } else {
      console.error('No media stream available for recording.');
    }
  };

  // Остановка записи
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      console.error('No MediaRecorder to stop.');
    }
  };

  return (
    <div>
      <video ref={videoRef} autoPlay muted style={{ width: '100%' }}></video>
      <div>
        <label>Camera:</label>
        <select
          value={selectedCamera || ''}
          onChange={(e) => setSelectedCamera(e.target.value)}
        >
          {cameras.map((camera) => (
            <option key={camera.deviceId} value={camera.deviceId}>
              {camera.label || 'Camera'}
            </option>
          ))}
        </select>
      </div>
      <div>
        <button onClick={startRecording} disabled={isRecording}>
          Start Recording
        </button>
        <button onClick={stopRecording} disabled={!isRecording}>
          Stop Recording
        </button>
      </div>
    </div>
  );
};

export default VideoRecorder;
