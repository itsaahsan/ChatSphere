import React, { useState, useEffect, useCallback } from 'react';
import { useChat } from '../context/ChatContext';
import {
  Box,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  useToast,
} from '@chakra-ui/react';
import { ArrowBackIcon, CloseIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { getSender, getSenderFull } from '../utils/chatUtils';
import ProfileModal from './ProfileModal';
import UpdateGroupChatModal from './UpdateGroupChatModal';
import {
  fetchMessages,
  sendMessage,
  addReaction,
  removeReaction,
} from '../utils/api';
import ScrollableChat from './ScrollableChat';
import io, { Socket } from 'socket.io-client';
import { Message } from '../types';

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL ||
  (process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL.replace(/\/api\/?$/, '')
    : 'http://localhost:5001');
let socket: Socket, selectedChatCompare: any;

interface SingleChatProps {
  fetchAgain: boolean;
  setFetchAgain: React.Dispatch<React.SetStateAction<boolean>>;
}

const SingleChat: React.FC<SingleChatProps> = ({
  fetchAgain,
  setFetchAgain,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const toast = useToast();

  const { selectedChat, setSelectedChat, user, notification, setNotification } =
    useChat();

  const fetchMessagesHandler = useCallback(async () => {
    if (!selectedChat) return;

    try {
      setLoading(true);
      const data = await fetchMessages(selectedChat._id);
      setMessages(data);
      setLoading(false);

      socket.emit('join chat', selectedChat._id);
    } catch (error) {
      toast({
        title: 'Error Occurred!',
        description: 'Failed to Load the Messages',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
    }
  }, [selectedChat, toast, fetchAgain]);

  useEffect(() => {
    socket = io(SOCKET_URL);
    socket.emit('setup', user);
    socket.on('connected', () => setSocketConnected(true));
    socket.on('typing', () => setIsTyping(true));
    socket.on('stop typing', () => setIsTyping(false));
  }, [user]);

  useEffect(() => {
    fetchMessagesHandler();
    selectedChatCompare = selectedChat;
    setReplyingTo(null);
  }, [selectedChat, fetchMessagesHandler]);

  useEffect(() => {
    if (!replyingTo) return;
    const latest = messages.find((msg) => msg._id === replyingTo._id);
    if (!latest) {
      setReplyingTo(null);
      return;
    }
    if (latest !== replyingTo) {
      setReplyingTo(latest);
    }
  }, [messages, replyingTo]);

  useEffect(() => {
    const handleMessageReceived = (newMessageReceived: Message) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat
      ) {
        const exists = notification.some(
          (msg) => msg._id === newMessageReceived._id
        );
        if (!exists) {
          setNotification([newMessageReceived, ...notification]);
          setFetchAgain((prev) => !prev);
        }
      } else {
        setMessages((prev) => [...prev, newMessageReceived]);
      }
    };

    const handleReactionUpdate = (data: {
      messageId: string;
      reaction: string;
      userId: string;
    }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg._id !== data.messageId) return msg;
          const reactions = Array.isArray(msg.reactions) ? [...msg.reactions] : [];
          const existingIndex = reactions.findIndex((reaction) => {
            const reactionUser = typeof reaction.user === 'string'
              ? reaction.user
              : reaction.user?._id;
            return reactionUser === data.userId;
          });

          if (existingIndex >= 0) {
            reactions[existingIndex] = {
              ...reactions[existingIndex],
              emoji: data.reaction,
              user: reactions[existingIndex].user,
            };
          } else {
            reactions.push({ user: data.userId, emoji: data.reaction });
          }

          return {
            ...msg,
            reactions,
          };
        })
      );
    };

    const handleReactionRemoved = (data: { messageId: string; userId: string }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg._id !== data.messageId) return msg;
          const reactions = (msg.reactions || []).filter((reaction) => {
            const reactionUser = typeof reaction.user === 'string'
              ? reaction.user
              : reaction.user?._id;
            return reactionUser !== data.userId;
          });

          return {
            ...msg,
            reactions,
          };
        })
      );
    };

    socket.on('message received', handleMessageReceived);
    socket.on('reaction update', handleReactionUpdate);
    socket.on('reaction removed', handleReactionRemoved);

    return () => {
      socket.off('message received', handleMessageReceived);
      socket.off('reaction update', handleReactionUpdate);
      socket.off('reaction removed', handleReactionRemoved);
    };
  }, [notification, setNotification, setFetchAgain]);

  const handleSendMessage = async () => {
    if (!newMessage || !selectedChat) return;

    socket.emit('stop typing', selectedChat._id);
    try {
      const payload: any = {
        content: newMessage,
        chatId: selectedChat._id,
      };

      if (replyingTo) {
        payload.replyTo = replyingTo._id;
      }

      setNewMessage('');
      const data = await sendMessage(payload);
      setReplyingTo(null);

      socket.emit('new message', data);
      setMessages((prev) => [...prev, data]);
    } catch (error) {
      toast({
        title: 'Error Occurred!',
        description: 'Failed to send the Message',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
    }
  };

  const updateMessageReactions = (
    messageId: string,
    reactions: Message['reactions']
  ) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === messageId
          ? {
              ...msg,
              reactions,
            }
          : msg
      )
    );
  };

  const handleReaction = async (message: Message, emoji: string) => {
    if (!selectedChat || !user) return;

    const existingReaction = (message.reactions || []).find((reaction) => {
      const reactionUser = typeof reaction.user === 'string'
        ? reaction.user
        : reaction.user?._id;
      return reactionUser === user._id;
    });

    try {
      if (existingReaction && existingReaction.emoji === emoji) {
        const updated = await removeReaction(message._id);
        socket.emit('reaction removed', {
          chatId: selectedChat._id,
          messageId: message._id,
          userId: user._id,
        });
        updateMessageReactions(message._id, updated.reactions || []);
        return;
      }

      const updated = await addReaction(message._id, emoji);
      socket.emit('message reaction', {
        chatId: selectedChat._id,
        messageId: message._id,
        reaction: emoji,
        userId: user._id,
      });
      updateMessageReactions(message._id, updated.reactions || []);
    } catch (error) {
      toast({
        title: 'Error Occurred!',
        description: 'Failed to update reaction',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
    }
  };

  const handleRemoveReaction = async (message: Message) => {
    if (!selectedChat || !user) return;

    try {
      const updated = await removeReaction(message._id);
      socket.emit('reaction removed', {
        chatId: selectedChat._id,
        messageId: message._id,
        userId: user._id,
      });
      updateMessageReactions(message._id, updated.reactions || []);
    } catch (error) {
      toast({
        title: 'Error Occurred!',
        description: 'Failed to remove reaction',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
    }
  };

  const handleReplySelect = (message: Message) => {
    setReplyingTo(message);
  };

  const typingHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit('typing', selectedChat?._id);
    }
    let lastTypingTime = new Date().getTime();
    const timerLength = 3000;
    setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit('stop typing', selectedChat?._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const sendMessageHandler = async (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setReplyingTo(null);
      return;
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      await handleSendMessage();
    }
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: '28px', md: '30px' }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: 'space-between' }}
            alignItems="center"
          >
            <IconButton
              aria-label="back"
              display={{ base: 'flex', md: 'none' }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat(null)}
            />
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user!, selectedChat.users)}
                <ProfileModal user={getSenderFull(user!, selectedChat.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessagesHandler}
                />
              </>
            )}
          </Text>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflowY: 'scroll',
                  scrollbarWidth: 'none',
                }}
              >
                <ScrollableChat
                  messages={messages}
                  currentUserId={user!._id}
                  onReact={handleReaction}
                  onRemoveReaction={handleRemoveReaction}
                  onReply={handleReplySelect}
                  activeReplyId={replyingTo?._id}
                />
              </div>
            )}

            {replyingTo && (
              <Box
                bg="white"
                borderRadius="md"
                p={2}
                mb={2}
                borderLeftWidth="4px"
                borderLeftColor="blue.400"
                boxShadow="sm"
              >
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box mr={2} flex="1">
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Replying to {replyingTo.sender?.name || 'message'}
                    </Text>
                    <Text fontSize="sm" color="gray.700" noOfLines={2}>
                      {replyingTo.content || replyingTo.fileName || 'Media message'}
                    </Text>
                  </Box>
                  <IconButton
                    aria-label="Cancel reply"
                    icon={<CloseIcon />}
                    size="sm"
                    variant="ghost"
                    onClick={() => setReplyingTo(null)}
                  />
                </Box>
              </Box>
            )}

            <FormControl onKeyDown={sendMessageHandler} isRequired mt={3}>
              {isTyping ? (
                <div>
                  <Text fontSize="sm" color="gray.500">Typing...</Text>
                </div>
              ) : (
                <></>
              )}
              <Box display="flex" alignItems="center" gap={2}>
                <Input
                  variant="filled"
                  bg="#E0E0E0"
                  placeholder="Enter a message.."
                  value={newMessage}
                  onChange={typingHandler}
                  flex={1}
                />
                <IconButton
                  aria-label="Send message"
                  icon={<ArrowForwardIcon />}
                  colorScheme="blue"
                  onClick={handleSendMessage}
                  isDisabled={!newMessage.trim()}
                  size="lg"
                />
              </Box>
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
