import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from './authContext';
import { toast } from 'react-hot-toast';

export const VideoCallContext = createContext();

export const VideoCallProvider = ({ children }) => {
  const { authUser, socket } = useContext(AuthContext);

  const [inCall, setInCall] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [otherUser, setOtherUser] = useState(null);

  const peerConnection = useRef(null);
  const pendingCandidates = useRef([]);

  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  const cleanup = () => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    pendingCandidates.current = [];
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    setLocalStream(null);
    setRemoteStream(null);
    setInCall(false);
    setIsCalling(false);
    setIncomingCall(null);
    setOtherUser(null);
    setIsMuted(false);
    setIsCameraOff(false);
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('incoming-call', ({ from, offer, callerInfo }) => {
      console.log("Incoming call received from:", from, callerInfo);
      toast(`Incoming call from ${callerInfo?.fullName || 'someone'}`, { icon: '📞' });
      setIncomingCall({ from, offer, callerInfo });
      setOtherUser(callerInfo);
    });

    socket.on('call-accepted', async ({ answer }) => {
      try {
        if (peerConnection.current) {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
          setInCall(true);
          setIsCalling(false);

          // Add any pending ICE candidates
          while (pendingCandidates.current.length > 0) {
            const candidate = pendingCandidates.current.shift();
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
          }
        }
      } catch (err) {
        console.error("Error setting remote description:", err);
      }
    });

    socket.on('ice-candidate', async ({ candidate }) => {
      try {
        if (peerConnection.current && peerConnection.current.remoteDescription) {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          pendingCandidates.current.push(candidate);
        }
      } catch (err) {
        console.error("Error adding ICE candidate:", err);
      }
    });

    socket.on('call-rejected', () => {
      toast.error("Call rejected");
      cleanup();
    });

    socket.on('call-ended', () => {
      toast("Call ended");
      cleanup();
    });

    return () => {
      socket.off('incoming-call');
      socket.off('call-accepted');
      socket.off('ice-candidate');
      socket.off('call-rejected');
      socket.off('call-ended');
    };
  }, [socket]);

  const createPeerConnection = (targetUserId) => {
    const pc = new RTCPeerConnection(iceServers);

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice-candidate', { to: targetUserId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    peerConnection.current = pc;
    return pc;
  };

  const startCall = async (user) => {
    try {
      console.log("startCall called with user:", user);
      if (!window.isSecureContext && window.location.hostname !== 'localhost') {
        toast.error("Video calls require HTTPS for camera/mic access.");
        return;
      }

      setIsCalling(true);
      setOtherUser(user);

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      console.log("Got local stream:", stream);
      setLocalStream(stream);

      const pc = createPeerConnection(user._id);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      console.log("Created offer:", offer);
      await pc.setLocalDescription(offer);

      console.log("Emitting 'call-user' to:", user._id);
      socket.emit('call-user', { 
        to: user._id, 
        offer,
        callerInfo: {
          _id: authUser._id,
          fullName: authUser.fullName,
          profilePic: authUser.profilePic
        }
      });
    } catch (err) {
      console.error("Error starting call:", err);
      if (err.name === 'NotAllowedError') {
        toast.error("Permission denied! Please allow camera and microphone access in your browser settings.");
      } else if (err.name === 'NotFoundError') {
        toast.error("No camera or microphone found. Please connect your devices.");
      } else if (err.name === 'NotReadableError') {
        toast.error("Camera or microphone is already in use by another application.");
      } else {
        toast.error(`Could not access camera/microphone: ${err.message}`);
      }
      cleanup();
    }
  };

  const acceptCall = async () => {
    try {
      if (!incomingCall) return;
      
      if (!window.isSecureContext && window.location.hostname !== 'localhost') {
        toast.error("Video calls require HTTPS for camera/mic access.");
        rejectCall();
        return;
      }

      console.log("Accepting call from:", incomingCall.from);
      const targetUserId = incomingCall.from;
      // otherUser is already set in the incoming-call listener
      
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);

      const pc = createPeerConnection(targetUserId);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      console.log("Setting remote description (offer)...");
      await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
      
      console.log("Creating answer...");
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Add any pending ICE candidates that arrived before remote description
      while (pendingCandidates.current.length > 0) {
        const candidate = pendingCandidates.current.shift();
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }

      socket.emit('answer-call', { to: targetUserId, answer });
      setInCall(true);
      setIncomingCall(null);
    } catch (err) {
      console.error("Error accepting call:", err);
      if (err.name === 'NotAllowedError') {
        toast.error("Permission denied! Please allow camera and microphone access in your browser settings.");
      } else if (err.name === 'NotFoundError') {
        toast.error("No camera or microphone found. Please connect your devices.");
      } else if (err.name === 'NotReadableError') {
        toast.error("Camera or microphone is already in use by another application.");
      } else {
        toast.error(`Error joining call: ${err.message || "Unknown error"}`);
      }
      cleanup();
    }
  };

  const rejectCall = () => {
    if (incomingCall && socket) {
      socket.emit('reject-call', { to: incomingCall.from });
      setIncomingCall(null);
      setOtherUser(null); // Clear other user on reject
    }
  };

  const endCall = () => {
    if (otherUser && socket) {
      const targetId = otherUser._id || otherUser;
      socket.emit('end-call', { to: targetId });
    }
    cleanup();
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
        setIsMuted(!track.enabled);
      });
    }
  };

  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
        setIsCameraOff(!track.enabled);
      });
    }
  };

  return (
    <VideoCallContext.Provider
      value={{
        inCall,
        isCalling,
        incomingCall,
        localStream,
        remoteStream,
        isMuted,
        isCameraOff,
        otherUser,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleCamera,
      }}
    >
      {children}
    </VideoCallContext.Provider>
  );
};

export default VideoCallProvider;
