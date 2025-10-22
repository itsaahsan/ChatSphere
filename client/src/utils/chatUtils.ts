import { User } from '../types';

export const getSender = (loggedUser: User, users: User[]): string => {
  return users[0]._id === loggedUser._id ? users[1].name : users[0].name;
};

export const getSenderFull = (loggedUser: User, users: User[]): User => {
  return users[0]._id === loggedUser._id ? users[1] : users[0];
};

export const isSameSender = (
  messages: any[],
  m: any,
  i: number,
  userId: string
): boolean => {
  return (
    i < messages.length - 1 &&
    (messages[i + 1].sender._id !== m.sender._id ||
      messages[i + 1].sender._id === undefined) &&
    messages[i].sender._id !== userId
  );
};

export const isLastMessage = (
  messages: any[],
  i: number,
  userId: string
): boolean => {
  return (
    i === messages.length - 1 &&
    messages[messages.length - 1].sender._id !== userId &&
    messages[messages.length - 1].sender._id
  );
};

export const isSameSenderMargin = (
  messages: any[],
  m: any,
  i: number,
  userId: string
): number | string => {
  if (
    i < messages.length - 1 &&
    messages[i + 1].sender._id === m.sender._id &&
    messages[i].sender._id !== userId
  )
    return 33;
  else if (
    (i < messages.length - 1 &&
      messages[i + 1].sender._id !== m.sender._id &&
      messages[i].sender._id !== userId) ||
    (i === messages.length - 1 && messages[i].sender._id !== userId)
  )
    return 0;
  else return 'auto';
};

export const isSameUser = (messages: any[], m: any, i: number): boolean => {
  return i > 0 && messages[i - 1].sender._id === m.sender._id;
};

export const formatTime = (date: Date | string | undefined): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDate = (date: Date | string | undefined): string => {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - d.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return formatTime(date);
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
};

export const truncateText = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};
