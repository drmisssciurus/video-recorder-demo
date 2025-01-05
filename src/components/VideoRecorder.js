import React, { useState, useEffect, useRef } from 'react';

const VideoRecorder = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState(null);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    // Получаем список медиа-устройств
    const getDevices = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === 'videoinput'
      );
      setDevices(videoDevices);
      if (videoDevices.length > 0) setSelectedDevice(videoDevices[0].deviceId);
    };
    getDevices();
  }, []);

  const startRecording = async () => {
    if (!selectedDevice) return;
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: selectedDevice } },
    });

    videoRef.current.srcObject = stream;
    videoRef.current.play();

    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.ondataavailable = (event) => {
      chunksRef.current.push(event.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setVideoBlob(blob);
      chunksRef.current = [];
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    setIsRecording(false);
  };

  const handleDeviceChange = (event) => {
    setSelectedDevice(event.target.value);
  };

  return (
    <div>
      <h1>Video Recorder</h1>

      {devices.length > 0 && (
        <div>
          <label htmlFor="device">Выбор камеры:</label>
          <select
            id="device"
            onChange={handleDeviceChange}
            value={selectedDevice}
          >
            {devices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Камера ${device.deviceId}`}
              </option>
            ))}
          </select>
        </div>
      )}

      <video
        ref={videoRef}
        autoPlay
        muted
        style={{ width: '100%', maxHeight: '400px' }}
      />

      <div>
        {!isRecording ? (
          <button onClick={startRecording}>Старт</button>
        ) : (
          <button onClick={stopRecording}>Стоп</button>
        )}
      </div>

      {videoBlob && (
        <div>
          <h2>Записанное видео:</h2>
          <video controls style={{ width: '100%', maxHeight: '400px' }}>
            <source src={URL.createObjectURL(videoBlob)} type="video/webm" />
          </video>
          <a href={URL.createObjectURL(videoBlob)} download="video.webm">
            Скачать видео
          </a>
        </div>
      )}
    </div>
  );
};

export default VideoRecorder;
