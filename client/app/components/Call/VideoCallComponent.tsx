'use client';

import { useEffect, useRef, useState } from 'react';
import SimplePeer from 'simple-peer';
import { FiPhone, FiPhoneOff, FiMic, FiMicOff, FiVideo, FiVideoOff } from 'react-icons/fi';

interface VideoCallComponentProps {
  onCall: boolean;
  peerId?: string;
  onEndCall: () => void;
}

export default function VideoCallComponent({
  onCall,
  peerId,
  onEndCall,
}: VideoCallComponentProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<SimplePeer.Instance | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    if (!onCall) return;

    let timer: NodeJS.Timeout;
    timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [onCall]);

  useEffect(() => {
    if (!onCall) return;

    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: isVideoOn,
          audio: !isMuted,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Initialize peer connection
        const peer = new SimplePeer({
          initiator: true,
          trickle: false,
          stream: stream,
        });

        peer.on('signal', (data) => {
          // Send signal data to other peer
          console.log('Peer signal:', data);
        });

        peer.on('connect', () => {
          console.log('Peer connected');
        });

        peer.on('stream', (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });

        peer.on('error', (err) => {
          console.error('Peer error:', err);
        });

        peerRef.current = peer;
      } catch (error) {
        console.error('Failed to access media devices:', error);
      }
    };

    initMedia();

    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [onCall, isMuted, isVideoOn]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours > 0 ? `${hours}:` : ''}${minutes.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  if (!onCall) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
      {/* Remote Video */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />

      {/* Local Video (Picture in Picture) */}
      <div className="absolute top-4 right-4 w-32 h-24 rounded-lg overflow-hidden border-2 border-green-500 bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      </div>

      {/* Call Info & Controls */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2">
        <p className="text-white font-bold">Call Duration</p>
        <p className="text-2xl font-mono text-green-500">{formatDuration(callDuration)}</p>
      </div>

      {/* Call Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
        {/* Mute Button */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-4 rounded-full transition ${
            isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          {isMuted ? <FiMicOff size={24} /> : <FiMic size={24} />}
        </button>

        {/* Toggle Video Button */}
        <button
          onClick={() => setIsVideoOn(!isVideoOn)}
          className={`p-4 rounded-full transition ${
            !isVideoOn ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          {isVideoOn ? <FiVideo size={24} /> : <FiVideoOff size={24} />}
        </button>

        {/* End Call Button */}
        <button
          onClick={onEndCall}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition"
        >
          <FiPhoneOff size={24} />
        </button>
      </div>
    </div>
  );
}
