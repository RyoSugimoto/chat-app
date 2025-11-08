import { createServer } from 'node:http';
import {
  type Avatar,
  CHAT_EVENTS,
  type ChatMessage,
  type ClientToServerEvents,
  type Profile,
  shuffle,
} from '@chat/shared';
import cors from 'cors';
import express from 'express';
import { Server } from 'socket.io';
import { v4 } from 'uuid';
import avatarData from './avatars.json';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_ORIGIN,
  },
});

const rooms = new Set(['general', 'random', 'tech']);

function createAvatarGetter(avatars: Avatar[]) {
  let count: number = 0;

  return function getAvatar() {
    if (avatars.length <= count) count = 0;
    const avatar = avatars[count] as Avatar;
    count++;
    return avatar;
  };
}

const avatarGetter = Array.from(rooms).reduce(
  (a: Record<string, ReturnType<typeof createAvatarGetter>>, c) => {
    a[c] = createAvatarGetter(shuffle(avatarData));
    return a;
  },
  {},
);

io.on('connection', (socket) => {
  console.log('user connected', socket.id);

  /**
   * Join
   */

  const handleJoin: ClientToServerEvents[typeof CHAT_EVENTS.JOIN_ROOM] = (
    room,
  ) => {
    if (!rooms.has(room)) {
      socket.emit('error', `Room "${room} does not exists.`);

      return;
    }

    socket.join(room);

    const avatar = avatarGetter[room]
      ? avatarGetter[room]()
      : { emoji: '🎭', name: 'Anonymous' };

    console.log(`${socket.id} joined ${room} as ${avatar?.emoji}`);
    console.log('Avatar', avatar);

    socket.emit(CHAT_EVENTS.JOINED_ROOM, {
      room,
      nickname: avatar.name,
      icon: avatar.emoji,
    } satisfies Profile);
  };

  socket.on(CHAT_EVENTS.JOIN_ROOM, handleJoin);

  /**
   * Message
   */

  const handleMessage: ClientToServerEvents[typeof CHAT_EVENTS.MESSAGE] = ({
    room,
    nickname,
    icon,
    text,
  }) => {
    if (!rooms.has(room)) return;

    const message = {
      id: v4(),
      nickname,
      icon,
      text,
      timestamp: Date.now(),
    };

    io.to(room).emit(CHAT_EVENTS.MESSAGE, message satisfies ChatMessage);
  };

  socket.on(CHAT_EVENTS.MESSAGE, handleMessage);

  /**
   * Disconnect
   */

  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id);
  });
});

app.get('/', (_, res) => {
  return res.send('Socket.io Chat Server with Rooms');
});

app.get('/rooms', cors({ origin: CLIENT_ORIGIN }), (_, res) => {
  return res.json(Array.from(rooms));
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port "${PORT}"`);
  console.log(`🚀 Page -> ${CLIENT_ORIGIN}`);
});
