import { createServer } from 'node:http';
import { formatMessage } from '@chat/shared';
import express from 'express';
import { Server } from 'socket.io';

const PROTOCOL = process.env.PROTOCOL || 'http://';
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_ORIGIN,
  },
});

io.on('connection', (socket) => {
  console.log('user connected', socket.id);

  socket.on('chat message', (msg: string) => {
    console.log(
      'message:',
      formatMessage({ user: socket.id, text: msg, timestamp: Date.now() }),
    );
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port "${PORT}"`);
  console.log(`🚀 Page -> ${CLIENT_ORIGIN}`);
});
