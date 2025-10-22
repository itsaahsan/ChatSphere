import {
  Avatar,
  Box,
  Button,
  Flex,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import React from 'react';
import ScrollableFeed from 'react-scrollable-feed';
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from '../utils/chatUtils';
import { Message, Reaction } from '../types';

interface ScrollableChatProps {
  messages: Message[];
  currentUserId: string;
  onReact: (message: Message, emoji: string) => void;
  onRemoveReaction: (message: Message) => void;
  onReply: (message: Message) => void;
  activeReplyId?: string;
}

const REACTION_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '👏'];

const getReactionUserId = (reactionUser: Reaction['user']) =>
  typeof reactionUser === 'string' ? reactionUser : reactionUser?._id;

const getReplySenderName = (reply: Message | string) => {
  if (!reply) return 'message';
  if (typeof reply === 'string') return 'message';
  const sender = reply.sender;
  if (!sender) return 'message';
  return typeof sender === 'string' ? sender : sender.name || 'message';
};

const getReplySnippet = (reply: Message | string) => {
  if (!reply) return '';
  if (typeof reply === 'string') return 'Original message unavailable';
  if (reply.content) return reply.content;
  if (reply.fileName) return reply.fileName;
  if (reply.fileUrl) return 'Media attachment';
  return 'Message';
};

const ScrollableChat: React.FC<ScrollableChatProps> = ({
  messages,
  currentUserId,
  onReact,
  onRemoveReaction,
  onReply,
  activeReplyId,
}) => {
  return (
    <ScrollableFeed>
      {messages &&
        messages.map((m, i) => {
          const bubbleBg = m.sender._id === currentUserId ? '#BEE3F8' : '#B9F5D0';
          const userReaction = (m.reactions || []).find(
            (reaction) => getReactionUserId(reaction.user) === currentUserId
          );

          const reactionSummary = (m.reactions || []).reduce(
            (acc, reaction) => {
              if (!reaction.emoji) return acc;
              const entry = acc.get(reaction.emoji) || {
                emoji: reaction.emoji,
                count: 0,
                hasReacted: false,
              };
              entry.count += 1;
              if (getReactionUserId(reaction.user) === currentUserId) {
                entry.hasReacted = true;
              }
              acc.set(reaction.emoji, entry);
              return acc;
            },
            new Map<
              string,
              { emoji: string; count: number; hasReacted: boolean }
            >()
          );

          const replyPreview = m.replyTo
            ? {
                sender: getReplySenderName(m.replyTo),
                snippet: getReplySnippet(m.replyTo),
              }
            : null;

          const messageText = m.content
            ? m.content
            : m.fileName || (m.fileUrl ? 'Media attachment' : '');

          const highlightOutline =
            activeReplyId && activeReplyId === m._id
              ? '0 0 0 2px rgba(66, 153, 225, 0.6)'
              : 'none';

          return (
            <Box display="flex" key={m._id}>
              {(isSameSender(messages, m, i, currentUserId) ||
                isLastMessage(messages, i, currentUserId)) && (
                <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
                  <Avatar
                    mt="7px"
                    mr={1}
                    size="sm"
                    cursor="pointer"
                    name={m.sender.name}
                    src={m.sender.pic}
                  />
                </Tooltip>
              )}
              <Box
                bg={bubbleBg}
                ml={isSameSenderMargin(messages, m, i, currentUserId)}
                mt={isSameUser(messages, m, i) ? 3 : 10}
                borderRadius="20px"
                px={3}
                py={2}
                maxW="75%"
                boxShadow={highlightOutline}
                onDoubleClick={() => onReply(m)}
                onContextMenu={(event) => {
                  event.preventDefault();
                  onReply(m);
                }}
              >
                {replyPreview && (
                  <Box
                    bg="whiteAlpha.700"
                    borderLeftWidth="3px"
                    borderLeftColor={
                      m.sender._id === currentUserId ? 'blue.400' : 'green.400'
                    }
                    borderRadius="md"
                    px={3}
                    py={2}
                    mb={2}
                  >
                    <Text fontSize="xs" color="gray.600" mb={1}>
                      Replying to {replyPreview.sender}
                    </Text>
                    <Text fontSize="sm" color="gray.700" noOfLines={2}>
                      {replyPreview.snippet}
                    </Text>
                  </Box>
                )}
                <Text whiteSpace="pre-wrap">{messageText}</Text>
                <Flex mt={2} align="center" justify="space-between" gap={2}>
                  <Button
                    size="xs"
                    variant="ghost"
                    colorScheme="blue"
                    onClick={() => onReply(m)}
                  >
                    Reply
                  </Button>
                  <HStack spacing={1} flexWrap="wrap" justify="flex-end">
                    {Array.from(reactionSummary.values()).map((reaction) => (
                      <Button
                        key={`${m._id}-${reaction.emoji}`}
                        size="xs"
                        variant={reaction.hasReacted ? 'solid' : 'ghost'}
                        colorScheme={reaction.hasReacted ? 'blue' : 'gray'}
                        onClick={() => onReact(m, reaction.emoji)}
                      >
                        <HStack spacing={1}>
                          <Text>{reaction.emoji}</Text>
                          <Text fontSize="xs">{reaction.count}</Text>
                        </HStack>
                      </Button>
                    ))}
                    <Menu placement="top">
                      <MenuButton as={Button} size="xs" variant="ghost" colorScheme="gray">
                        😊
                      </MenuButton>
                      <MenuList minW="0" p={0}>
                        {REACTION_OPTIONS.map((emoji) => (
                          <MenuItem key={emoji} onClick={() => onReact(m, emoji)}>
                            <Text fontSize="lg">{emoji}</Text>
                          </MenuItem>
                        ))}
                        {userReaction && (
                          <MenuItem onClick={() => onRemoveReaction(m)}>
                            <Text fontSize="sm">Remove my reaction</Text>
                          </MenuItem>
                        )}
                      </MenuList>
                    </Menu>
                  </HStack>
                </Flex>
              </Box>
            </Box>
          );
        })}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
