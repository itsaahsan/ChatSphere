import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { PhoneIcon, InfoIcon } from '@chakra-ui/icons';
import axios from 'axios';

interface Call {
  _id: string;
  caller: {
    _id: string;
    name: string;
    pic: string;
  };
  receiver: {
    _id: string;
    name: string;
    pic: string;
  };
  callType: 'voice' | 'video';
  status: 'missed' | 'rejected' | 'completed' | 'cancelled';
  duration?: number;
  createdAt: string;
}

const CallHistory: React.FC = () => {
  const [calls, setCalls] = useState<Call[]>([]);
  const toast = useToast();

  useEffect(() => {
    fetchCallHistory();
  }, []);

  const fetchCallHistory = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      };
      const { data } = await axios.get('/api/call/history', config);
      setCalls(data);
    } catch (error) {
      toast({
        title: 'Error fetching call history',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box>
      <VStack spacing={2} align="stretch">
        {calls.map((call) => (
          <HStack
            key={call._id}
            p={3}
            borderRadius="md"
            bg="gray.100"
            _hover={{ bg: 'gray.200' }}
            cursor="pointer"
          >
            <Avatar
              size="sm"
              src={call.caller.pic}
              name={call.caller.name}
            />
            <VStack align="start" flex={1} spacing={0}>
              <Text fontWeight="bold">{call.caller.name}</Text>
              <Text fontSize="sm" color="gray.600">
                {call.callType === 'voice' ? 'Voice call' : 'Video call'} • {call.status}
              </Text>
              {call.duration && (
                <Text fontSize="xs" color="gray.500">
                  Duration: {formatDuration(call.duration)}
                </Text>
              )}
            </VStack>
            <IconButton
              aria-label="Call info"
              icon={<InfoIcon />}
              size="sm"
              variant="ghost"
            />
          </HStack>
        ))}
      </VStack>
    </Box>
  );
};

export default CallHistory;
