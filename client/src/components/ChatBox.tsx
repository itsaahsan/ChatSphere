import React from 'react';
import { Box } from '@chakra-ui/react';
import { useChat } from '../context/ChatContext';
import SingleChat from './SingleChat';

interface ChatBoxProps {
  fetchAgain: boolean;
  setFetchAgain: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatBox: React.FC<ChatBoxProps> = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = useChat();

  return (
    <Box
      display={{ base: selectedChat ? 'flex' : 'none', md: 'flex' }}
      alignItems="center"
      flexDir="column"
      p={3}
      bg="white"
      w={{ base: '100%', md: '68%' }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </Box>
  );
};

export default ChatBox;
