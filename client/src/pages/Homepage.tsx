import React, { useEffect } from 'react';
import {
  Container,
  Box,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Heading,
  VStack,
} from '@chakra-ui/react';
import Login from '../components/Login';
import Signup from '../components/Signup';
import { useNavigate } from 'react-router-dom';

const Homepage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('userInfo');
    if (user) {
      navigate('/chats');
    }
  }, [navigate]);

  return (
    <Container maxW="xl" centerContent py={8}>
      <VStack spacing={6} w="100%">
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          p={6}
          bg="white"
          w="100%"
          borderRadius="2xl"
          boxShadow="dark-lg"
        >
          <Heading
            fontSize={{ base: '3xl', md: '5xl' }}
            fontFamily="Work sans"
            bgGradient="linear(to-r, green.400, green.500)"
            bgClip="text"
            fontWeight="extrabold"
          >
            ChatSphere
          </Heading>
          <Text
            fontSize="md"
            color="gray.600"
            mt={2}
            fontWeight="medium"
          >
            Connect, Chat, Collaborate
          </Text>
        </Box>
        
        <Box
          bg="white"
          w="100%"
          p={6}
          borderRadius="2xl"
          boxShadow="dark-lg"
        >
          <Tabs
            isFitted
            variant="enclosed"
            colorScheme="green"
          >
            <TabList mb="1em" border="none">
              <Tab
                _selected={{
                  bg: 'green.500',
                  color: 'white',
                  borderRadius: 'lg',
                }}
                borderRadius="lg"
                mr={2}
                fontWeight="semibold"
              >
                Login
              </Tab>
              <Tab
                _selected={{
                  bg: 'green.500',
                  color: 'white',
                  borderRadius: 'lg',
                }}
                borderRadius="lg"
                fontWeight="semibold"
              >
                Sign Up
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Login />
              </TabPanel>
              <TabPanel>
                <Signup />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>

        <Text fontSize="xs" color="gray.400" textAlign="center">
          © 2025 ChatSphere. Secure messaging for everyone.
        </Text>
      </VStack>
    </Container>
  );
};

export default Homepage;
