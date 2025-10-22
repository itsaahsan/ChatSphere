import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Box,
  IconButton,
  HStack,
} from '@chakra-ui/react';
import { PhoneIcon } from '@chakra-ui/icons';

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  peer: any;
  callType: 'voice' | 'video';
  callerName: string;
}

const VideoCallModal: React.FC<VideoCallModalProps> = ({
  isOpen,
  onClose,
  peer,
  callType,
  callerName,
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen && callType === 'video') {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          setLocalStream(stream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch((error) => {
          console.error('Error accessing media devices:', error);
        });
    } else if (isOpen && callType === 'voice') {
      navigator.mediaDevices
        .getUserMedia({ video: false, audio: true })
        .then((stream) => {
          setLocalStream(stream);
        })
        .catch((error) => {
          console.error('Error accessing audio device:', error);
        });
    }

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, callType]);

  useEffect(() => {
    if (peer && remoteVideoRef.current) {
      peer.on('stream', (remoteStream: MediaStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });
    }
  }, [peer]);

  const handleEndCall = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleEndCall} size="full">
      <ModalOverlay />
      <ModalContent bg="black">
        <ModalHeader color="white">{callerName}</ModalHeader>
        <ModalBody>
          <Box position="relative" h="100%">
            {callType === 'video' && (
              <>
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <Box
                  position="absolute"
                  top={4}
                  right={4}
                  w="200px"
                  h="150px"
                  borderRadius="md"
                  overflow="hidden"
                >
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </Box>
              </>
            )}
          </Box>
        </ModalBody>
        <ModalFooter>
          <HStack spacing={4}>
            <IconButton
              aria-label="End call"
              icon={<PhoneIcon />}
              colorScheme="red"
              onClick={handleEndCall}
              size="lg"
              borderRadius="full"
            />
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default VideoCallModal;
