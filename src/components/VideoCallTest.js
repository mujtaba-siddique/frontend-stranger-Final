// Test file to verify video call integration
// This file can be used to test individual components

import React from 'react';
import VideoCallComponent from '../components/VideoCallComponent';
import useCallManager from '../hooks/useCallManager';

const VideoCallTest = () => {
  const callManager = useCallManager('test-user-1', 'test-user-2');

  return (
    <div>
      <h2>Video Call Integration Test</h2>
      
      {/* Test Buttons */}
      <div style={{ margin: '20px', display: 'flex', gap: '10px' }}>
        <button onClick={() => callManager.startCall('video')}>
          Test Video Call
        </button>
        <button onClick={() => callManager.startCall('audio')}>
          Test Audio Call
        </button>
        <button onClick={callManager.endCall}>
          End Call
        </button>
      </div>

      {/* Call Status */}
      <div style={{ margin: '20px' }}>
        <p>Call Active: {callManager.isCallActive ? 'Yes' : 'No'}</p>
        <p>Call Type: {callManager.callType || 'None'}</p>
        <p>Incoming Call: {callManager.isIncoming ? 'Yes' : 'No'}</p>
        <p>Video Enabled: {callManager.isVideoEnabled ? 'Yes' : 'No'}</p>
        <p>Audio Enabled: {callManager.isAudioEnabled ? 'Yes' : 'No'}</p>
      </div>

      {/* Video Call Component */}
      <VideoCallComponent
        isCallActive={callManager.isCallActive}
        callType={callManager.callType}
        isIncoming={callManager.isIncoming}
        callerName="Test Caller"
        onAcceptCall={callManager.acceptCall}
        onRejectCall={callManager.rejectCall}
        onEndCall={callManager.endCall}
        onToggleVideo={callManager.toggleVideo}
        onToggleAudio={callManager.toggleAudio}
        isVideoEnabled={callManager.isVideoEnabled}
        isAudioEnabled={callManager.isAudioEnabled}
        localVideoRef={callManager.localVideoRef}
        remoteVideoRef={callManager.remoteVideoRef}
        darkMode={false}
      />
    </div>
  );
};

export default VideoCallTest;