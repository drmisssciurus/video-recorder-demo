import React, { useState } from 'react';
import VideoRecorder from './components/VideoRecorder';

const App = () => {
  const [videos, setVideos] = useState([]);

  const handleVideoRecorded = (videoBlob) => {
    setVideos([...videos, videoBlob]);
  };

  return (
    <div>
      <h1>Video Recorder Demo</h1>
      <VideoRecorder onVideoRecorded={handleVideoRecorded} />
      <div>
        <h3>Recorded Videos</h3>
        {videos.map((video, index) => (
          <div key={index}>
            <video
              src={URL.createObjectURL(video)}
              controls
              style={{ width: '100%', marginBottom: '10px' }}
            ></video>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
