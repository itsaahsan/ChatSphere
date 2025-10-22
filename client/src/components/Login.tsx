import React, { useState } from 'react';
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  InputGroup,
  InputRightElement,
  useToast,
  Text,
  useDisclosure,
  Box,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../utils/api';
import { useChat } from '../context/ChatContext';
import ForgotPasswordModal from './ForgotPasswordModal';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { setUser } = useChat();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleClick = () => setShow(!show);

  const submitHandler = async () => {
    setLoading(true);
    if (!email || !password) {
      toast({
        title: 'Please Fill all the Fields',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
      setLoading(false);
      return;
    }

    try {
      const data = await loginUser(email, password);
      toast({
        title: 'Login Successful',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
      localStorage.setItem('userInfo', JSON.stringify(data));
      setUser(data);
      setLoading(false);
      navigate('/chats');
    } catch (error: any) {
      toast({
        title: 'Error Occurred!',
        description: error.response?.data?.message || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      submitHandler();
    }
  };

  return (
    <VStack spacing="5px">
      <FormControl id="email" isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          value={email}
          type="email"
          placeholder="Enter Your Email"
          onChange={(e) => setEmail(e.target.value)}
          onKeyPress={handleKeyPress}
          borderRadius="lg"
          focusBorderColor="blue.400"
        />
      </FormControl>
      <FormControl id="password" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup size="md">
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={show ? 'text' : 'password'}
            placeholder="Enter password"
            onKeyPress={handleKeyPress}
            borderRadius="lg"
            focusBorderColor="blue.400"
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? 'Hide' : 'Show'}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <Box w="100%" textAlign="right">
        <Text
          fontSize="sm"
          color="blue.500"
          cursor="pointer"
          _hover={{ textDecoration: 'underline', color: 'blue.600' }}
          onClick={onOpen}
        >
          Forgot Password?
        </Text>
      </Box>

      <Button
        colorScheme="blue"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        isLoading={loading}
        bgGradient="linear(to-r, green.400, green.500)"
        _hover={{
          bgGradient: 'linear(to-r, green.500, green.600)',
        }}
        borderRadius="lg"
      >
        Login
      </Button>
      <Button
        variant="solid"
        colorScheme="red"
        width="100%"
        onClick={() => {
          setEmail('guest@example.com');
          setPassword('123456');
        }}
        bgGradient="linear(to-r, red.400, pink.500)"
        _hover={{
          bgGradient: 'linear(to-r, red.500, pink.600)',
        }}
        borderRadius="lg"
      >
        Get Guest User Credentials
      </Button>

      <ForgotPasswordModal isOpen={isOpen} onClose={onClose} />
    </VStack>
  );
};

export default Login;
