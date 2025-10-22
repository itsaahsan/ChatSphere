import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Text,
  Button,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { PhoneIcon, ViewIcon } from '@chakra-ui/icons';

interface IncomingCallModalProps {
  isOpen: boolean;
  callerName: string;
  callType: 'voice' | 'video';
  onAccept: () => void;
  onReject: () => void;
}

const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  isOpen,
  callerName,
  callType,
  onAccept,
  onReject,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onReject} isCentered>
      <ModalOverlay backdropFilter="blur(6px)" />
      <ModalContent>
        <ModalHeader textAlign="center">Incoming {callType} call</ModalHeader>
        <ModalBody textAlign="center">
          <Icon
            as={callType === 'video' ? ViewIcon : PhoneIcon}
            boxSize={12}
            color={callType === 'video' ? 'blue.500' : 'green.500'}
            mb={4}
          />
          <Text fontSize="xl" fontWeight="semibold">
            {callerName}
          </Text>
        </ModalBody>
        <ModalFooter justifyContent="center">
          <HStack spacing={6}>
            <Button colorScheme="green" onClick={onAccept} leftIcon={<PhoneIcon />}>Accept</Button>
            <Button colorScheme="red" onClick={onReject}>Decline</Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default IncomingCallModal;
