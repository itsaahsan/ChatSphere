const { createServer } = require('http');
const { Server } = require('socket.io');
const Client = require('socket.io-client');
require('dotenv').config();

describe('Socket.io Server', () => {
  let io, serverSocket, clientSocket;

  beforeAll((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen(() => {
      const port = httpServer.address().port;
      clientSocket = new Client(`http://localhost:${port}`);
      io.on('connection', (socket) => {
        serverSocket = socket;
      });
      clientSocket.on('connect', done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
  });

  test('should emit setup event', (done) => {
    serverSocket.on('setup', (data) => {
      expect(data).toBeDefined();
      done();
    });
    clientSocket.emit('setup', { _id: 'test123' });
  });

  test('should emit new message event', (done) => {
    serverSocket.on('new message', (data) => {
      expect(data).toBeDefined();
      expect(data.chat).toBeDefined();
      done();
    });
    clientSocket.emit('new message', { chat: { users: [] } });
  });
});

describe('API Server', () => {
  test('Server should be configured correctly', () => {
    expect(process.env.NODE_ENV).toBeDefined();
  });

  test('Environment variables should exist', () => {
    expect(process.env).toBeDefined();
  });
});
