const express = require('express');
const dotenv = require('dotenv');
const net = require('net');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const statusRoutes = require('./routes/statusRoutes');
const callRoutes = require('./routes/callRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const broadcastRoutes = require('./routes/broadcastRoutes');
const cors = require('cors');
const path = require('path');

dotenv.config();

const parseOrigins = (value = '') =>
  value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const buildCorsConfig = () => {
  if (process.env.NODE_ENV === 'production') {
    const allowedOrigins = parseOrigins(process.env.FRONTEND_URL || '');

    if (allowedOrigins.length === 0) {
      console.warn(
        '⚠️ FRONTEND_URL is not configured. Allowing all origins in production can be insecure.'
      );
      return {
        express: {
          origin: true,
          credentials: true,
        },
        socket: '*',
      };
    }

    const originChecker = (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.warn(`❌ Blocked request from unauthorized origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    };

    return {
      express: {
        origin: originChecker,
        credentials: true,
      },
      socket: allowedOrigins,
    };
  }

  const devOrigins = parseOrigins(process.env.DEV_FRONTEND_URLS || '');
  const defaultDevOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
  const allowedOrigins = Array.from(new Set([...defaultDevOrigins, ...devOrigins]));

  return {
    express: {
      origin: true,
      credentials: true,
    },
    socket: allowedOrigins.length ? allowedOrigins : '*',
  };
};

const { express: expressCorsOptions, socket: socketCorsOrigin } = buildCorsConfig();

const app = express();

app.use(cors(expressCorsOptions));

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.get('/', (req, res) => {
  res.send('API is running');
});

app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/call', callRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/broadcast', broadcastRoutes);

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

app.use(notFound);
app.use(errorHandler);

const isPortAvailable = (port) => {
  return new Promise((resolve, reject) => {
    const tester = net.createServer()
      .once('error', (error) => {
        if (error.code === 'EADDRINUSE' || error.code === 'EACCES') {
          resolve(false);
        } else {
          reject(error);
        }
      })
      .once('listening', () => {
        tester.close(() => resolve(true));
      })
      .listen(port, '0.0.0.0');
  });
};

const findAvailablePort = async (preferredPort, attempts = 10) => {
  const basePort = Number(preferredPort) || 5000;

  for (let i = 0; i < attempts; i += 1) {
    const candidate = basePort + i;
    const available = await isPortAvailable(candidate);
    if (available) {
      return { port: candidate, offset: i };
    }
  }

  throw new Error(`No available ports found starting at ${basePort}`);
};

const setupSocketServer = (httpServer, corsOrigin) => {
  const io = require('socket.io')(httpServer, {
    pingTimeout: 60000,
    cors: {
      origin: corsOrigin,
      credentials: true,
    },
  });

  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log('🔌 New socket connection:', socket.id);

    socket.on('setup', (userData) => {
      socket.join(userData._id);
      onlineUsers.set(userData._id, socket.id);
      socket.broadcast.emit('online users', userData._id);
      socket.emit('connected');

      const allOnlineUsers = Array.from(onlineUsers.keys());
      socket.emit('all online users', allOnlineUsers);
    });

    socket.on('join chat', (room) => {
      socket.join(room);
      console.log('User joined room: ' + room);
    });

    socket.on('typing', (data) => {
      const { room, userName } = data;
      socket.in(room).emit('typing', { room, userName });
    });

    socket.on('stop typing', (room) => {
      socket.in(room).emit('stop typing', room);
    });

    socket.on('new message', (newMessageReceived) => {
      const chat = newMessageReceived.chat;

      if (!chat.users) return console.log('chat.users not defined');

      chat.users.forEach((user) => {
        if (user._id === newMessageReceived.sender._id) return;
        socket.in(user._id).emit('message received', newMessageReceived);
      });
    });

    socket.on('message delivered', (data) => {
      socket.in(data.chatId).emit('message status update', {
        messageId: data.messageId,
        status: 'delivered',
      });
    });

    socket.on('message read', (data) => {
      socket.in(data.chatId).emit('message status update', {
        messageId: data.messageId,
        status: 'read',
      });
    });

    socket.on('message reaction', (data) => {
      const { chatId, messageId, reaction, userId } = data;
      socket.in(chatId).emit('reaction update', {
        messageId,
        reaction,
        userId,
      });
    });

    socket.on('reaction removed', (data) => {
      const { chatId, messageId, userId } = data;
      socket.in(chatId).emit('reaction removed', {
        messageId,
        userId,
      });
    });

    socket.on('message edited', (data) => {
      const { chatId, messageId, newContent } = data;
      socket.in(chatId).emit('message updated', {
        messageId,
        newContent,
      });
    });

    socket.on('message deleted', (data) => {
      const { chatId, messageId } = data;
      socket.in(chatId).emit('message removed', messageId);
    });

    socket.on('call user', (data) => {
      const { userToCall, signalData, from, name, callType, callId } = data;
      io.to(userToCall).emit('call incoming', {
        signal: signalData,
        from,
        name,
        callType,
        callId,
      });
    });

    socket.on('answer call', (data) => {
      io.to(data.to).emit('call accepted', {
        signal: data.signal,
        callId: data.callId,
      });
    });

    socket.on('reject call', (data) => {
      io.to(data.to).emit('call rejected', {
        callId: data.callId,
      });
    });

    socket.on('end call', (data) => {
      io.to(data.to).emit('call ended', {
        callId: data.callId,
      });
    });

    socket.on('user status change', (data) => {
      const { userId, status } = data;
      socket.broadcast.emit('status changed', { userId, status });
    });

    socket.on('user added to group', (data) => {
      const { chatId, users } = data;
      users.forEach((userId) => {
        socket.in(userId).emit('added to group', chatId);
      });
    });

    socket.on('user removed from group', (data) => {
      const { chatId, userId } = data;
      socket.in(userId).emit('removed from group', chatId);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected:', socket.id);
      let disconnectedUserId;
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          onlineUsers.delete(userId);
          break;
        }
      }
      if (disconnectedUserId) {
        socket.broadcast.emit('offline users', disconnectedUserId);
      }
    });
  });
};

const registerGracefulShutdown = (httpServer) => {
  const shutdown = (signal) => {
    console.log(`\n📴 ${signal} received, shutting down gracefully...`);
    httpServer.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

const startServer = async () => {
  const desiredPort = parseInt(process.env.PORT, 10) || 5000;

  try {
    const { port, offset } = await findAvailablePort(desiredPort);

    if (offset > 0) {
      console.warn(`⚠️ Port ${desiredPort} is unavailable. Switching to port ${port}.`);
    }

    process.env.PORT = port;

    return await new Promise((resolve, reject) => {
      const httpServer = app.listen(port, () => {
        console.log('\n========================================');
        console.log(`✅ Server started on PORT ${port}`);
        console.log(`✅ API available at: http://localhost:${port}`);
        console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log('========================================\n');
        resolve(httpServer);
      });

      httpServer.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          reject(new Error(`Port ${port} became unavailable before the server could start.`));
        } else {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error.message);
    console.error('Please free the desired port or adjust the PORT value in the environment configuration.');
    process.exit(1);
  }
};

const initialize = async () => {
  await connectDB();
  const server = await startServer();
  setupSocketServer(server, socketCorsOrigin);
  registerGracefulShutdown(server);
};

initialize().catch((error) => {
  console.error('❌ Server initialization failed:', error);
  process.exit(1);
});
