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
      try {
        console.log('Запрашиваем доступ к камере...');
        await navigator.mediaDevices.getUserMedia({ video: true }); // Разрешение на доступ к камере
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          (device) => device.kind === 'videoinput'
        );
        console.log('Доступные устройства:', videoDevices);
        setDevices(videoDevices);
        if (videoDevices.length > 0)
          setSelectedDevice(videoDevices[0].deviceId);
      } catch (error) {
        console.error('Ошибка доступа к устройствам:', error);
      }
    };
    getDevices();
  }, []);

  const startRecording = async () => {
    if (!selectedDevice) {
      console.error('Камера не выбрана');
      return;
    }
    try {
      console.log('Запрашиваем доступ к выбранной камере:', selectedDevice);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: selectedDevice } },
      });

      console.log('Поток видео получен:', stream);
      videoRef.current.srcObject = stream;
      videoRef.current.play();

      const options = { mimeType: 'video/webm;codecs=vp9' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/mp4';
      }
      console.log('Используемый MIME-тип:', options.mimeType);

      mediaRecorderRef.current = new MediaRecorder(stream, options);

      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        console.log('Новый кусок данных доступен:', event.data);
        chunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        console.log(
          'Запись остановлена. Количество кусков:',
          chunksRef.current.length
        );
        const blob = new Blob(chunksRef.current, { type: options.mimeType });
        console.log('Созданный Blob:', blob);
        setVideoBlob(blob);
        chunksRef.current = [];
      };

      mediaRecorderRef.current.start();
      console.log('Запись начата');
      setIsRecording(true);
    } catch (error) {
      console.error('Ошибка при запуске записи:', error);
    }
  };

  const stopRecording = () => {
    console.log('Останавливаем запись');
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
    setIsRecording(false);
  };

  const handleDeviceChange = (event) => {
    console.log('Выбрано устройство:', event.target.value);
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
        playsInline
        style={{ width: '100%', maxHeight: '400px', backgroundColor: 'black' }}
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
