import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Image,
  Box,
  IconButton,
} from '@chakra-ui/react';
import { DownloadIcon } from '@chakra-ui/icons';

interface MediaPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaUrl: string;
  mediaType: 'image' | 'video' | 'audio' | 'document';
  fileName?: string;
}

const MediaPreviewModal: React.FC<MediaPreviewModalProps> = ({
  isOpen,
  onClose,
  mediaUrl,
  mediaType,
  fileName,
}) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = mediaUrl;
    link.download = fileName || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{fileName || 'Media Preview'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box display="flex" justifyContent="center" alignItems="center">
            {mediaType === 'image' && (
              <Image src={mediaUrl} alt={fileName} maxH="500px" objectFit="contain" />
            )}
            {mediaType === 'video' && (
              <video src={mediaUrl} controls style={{ maxHeight: '500px', width: '100%' }} />
            )}
            {mediaType === 'audio' && (
              <audio src={mediaUrl} controls style={{ width: '100%' }} />
            )}
            {mediaType === 'document' && (
              <Box>
                <p>Document: {fileName}</p>
                <Button onClick={handleDownload} leftIcon={<DownloadIcon />}>
                  Download
                </Button>
              </Box>
            )}
          </Box>
        </ModalBody>
        <ModalFooter>
          <IconButton
            aria-label="Download"
            icon={<DownloadIcon />}
            onClick={handleDownload}
            mr={3}
          />
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MediaPreviewModal;
