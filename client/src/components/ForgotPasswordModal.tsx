import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useToast,
  Box,
  Heading,
} from '@chakra-ui/react';
import axios from 'axios';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleRequestReset = async () => {
    if (!email) {
      toast({
        title: 'Email required',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await axios.post(
        '/api/user/forgot-password',
        { email },
        config
      );

      toast({
        title: 'Reset token generated!',
        description: `Token: ${data.resetToken}`,
        status: 'success',
        duration: 30000,
        isClosable: true,
      });
      setStep(2);
    } catch (error: any) {
      toast({
        title: 'Error occurred!',
        description: error.response?.data?.message || 'Failed to request reset',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!resetToken || !newPassword || !confirmPassword) {
      toast({
        title: 'All fields required',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      await axios.post(
        '/api/user/reset-password',
        { token: resetToken, newPassword },
        config
      );

      toast({
        title: 'Password reset successful!',
        description: 'You can now login with your new password',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      handleClose();
    } catch (error: any) {
      toast({
        title: 'Error occurred!',
        description: error.response?.data?.message || 'Failed to reset password',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    setLoading(false);
  };

  const handleClose = () => {
    setEmail('');
    setResetToken('');
    setNewPassword('');
    setConfirmPassword('');
    setStep(1);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered>
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent
        bg="white"
        borderRadius="2xl"
        boxShadow="2xl"
        mx={4}
      >
        <ModalHeader>
          <Heading size="lg" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
            Reset Password
          </Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {step === 1 ? (
            <VStack spacing={4}>
              <Text fontSize="sm" color="gray.600">
                Enter your email to receive a password reset token
              </Text>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  borderRadius="lg"
                  focusBorderColor="blue.400"
                />
              </FormControl>
              <Button
                colorScheme="blue"
                width="full"
                onClick={handleRequestReset}
                isLoading={loading}
                loadingText="Sending..."
                bgGradient="linear(to-r, blue.400, blue.500)"
                _hover={{
                  bgGradient: 'linear(to-r, blue.500, blue.600)',
                }}
                borderRadius="lg"
              >
                Request Reset Token
              </Button>
            </VStack>
          ) : (
            <VStack spacing={4}>
              <Box
                p={3}
                bg="blue.50"
                borderRadius="lg"
                w="full"
                borderLeft="4px"
                borderColor="blue.400"
              >
                <Text fontSize="xs" color="gray.600" mb={1}>
                  Your Reset Token:
                </Text>
                <Text fontSize="sm" fontWeight="bold" color="blue.600" wordBreak="break-all">
                  Copy the token from the notification
                </Text>
              </Box>
              
              <FormControl isRequired>
                <FormLabel>Reset Token</FormLabel>
                <Input
                  placeholder="Paste your reset token"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  borderRadius="lg"
                  focusBorderColor="purple.400"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>New Password</FormLabel>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  borderRadius="lg"
                  focusBorderColor="purple.400"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  borderRadius="lg"
                  focusBorderColor="purple.400"
                />
              </FormControl>
              
              <Button
                colorScheme="purple"
                width="full"
                onClick={handleResetPassword}
                isLoading={loading}
                loadingText="Resetting..."
                bgGradient="linear(to-r, purple.400, pink.500)"
                _hover={{
                  bgGradient: 'linear(to-r, purple.500, pink.600)',
                }}
                borderRadius="lg"
              >
                Reset Password
              </Button>
              
              <Button
                variant="ghost"
                width="full"
                onClick={() => setStep(1)}
                size="sm"
              >
                Back to Email
              </Button>
            </VStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ForgotPasswordModal;
