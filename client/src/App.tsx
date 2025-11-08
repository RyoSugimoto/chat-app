import {
  CHAT_EVENTS,
  type ChatCommand,
  type ChatMessage,
  type ServerToClientEvents,
} from '@chat/shared';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

function App() {
  const [room, setRoom] = useState<string>('general');
  const [joinedRoom, setJoinedRoom] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [nickname, setNickname] = useState<string>('User');
  const [icon, setIcon] = useState<string>('👤');
  const [rooms, setRooms] = useState<string[]>(['general']);
  /** 入力変換中か */
  const [composition, setComposition] = useState(false);

  useEffect(() => {
    async function initRooms() {
      const res = await fetch('http://localhost:3000/rooms', {
        method: 'GET',
      });
      const roomList = await res.json();

      setRooms(roomList);
      setRoom(roomList[0] || 'general');
    }

    initRooms();

    const handleJoined: ServerToClientEvents[typeof CHAT_EVENTS.JOINED_ROOM] =
      ({ room, nickname, icon }) => {
        setJoinedRoom(room);
        setNickname(nickname);
        setIcon(icon);
        setMessages([]);
      };

    socket.on(CHAT_EVENTS.JOINED_ROOM, handleJoined);

    const handleMessage: ServerToClientEvents[typeof CHAT_EVENTS.MESSAGE] = (
      chatMessage,
    ) => {
      setMessages((prev) => [...prev, chatMessage]);
    };

    socket.on(CHAT_EVENTS.MESSAGE, handleMessage);

    // クリーンアップ関数を返却
    return () => {
      // 上で設定したイベントリスナを削除（初期化）
      socket.off(CHAT_EVENTS.JOINED_ROOM);
      socket.off(CHAT_EVENTS.MESSAGE);
    };
  }, []);

  const joinRoom = () => {
    socket.emit(CHAT_EVENTS.JOIN_ROOM, room satisfies string);
  };

  const sendMessage = () => {
    if (!joinedRoom || !text.trim()) return;

    const data = {
      room: joinedRoom,
      nickname,
      icon,
      text,
    };

    socket.emit(CHAT_EVENTS.MESSAGE, data satisfies ChatCommand);

    setText('');
  };

  return (
    <div>
      <h1>Chat Rooms</h1>

      <section>
        <h2>Room</h2>
        <input
          type="text"
          list="room-list"
          onChange={(e) => {
            const targetRoom = e.target.value;

            if (!rooms.includes(targetRoom)) return;

            setRoom(targetRoom);
          }}
        />
        <datalist id="room-list">
          {rooms.map((room) => {
            return (
              <option value={room} key={room}>
                {room}
              </option>
            );
          })}
        </datalist>

        <button type="button" onClick={() => joinRoom()}>
          Join
        </button>
      </section>

      {joinedRoom && (
        <section>
          <h2>{room}</h2>

          <p>
            Your avatar:{' '}
            <b>
              {icon} {nickname}
            </b>
          </p>

          <ul>
            {messages.map(({ id, nickname, icon, text, timestamp }) => {
              const formatted = new Intl.DateTimeFormat(undefined, {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              }).format(timestamp);
              return (
                <li key={id}>
                  <div>
                    {icon} {nickname}
                  </div>
                  <div>{text}</div>
                  <div>{formatted}</div>
                </li>
              );
            })}
          </ul>

          <div>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                switch (e.key) {
                  case 'Enter':
                    if (!composition) {
                      sendMessage();
                    }
                }
              }}
              placeholder="Type a message..."
              onCompositionStart={() => setComposition(true)}
              onCompositionEnd={() => setComposition(false)}
            />

            <button type="submit" onClick={() => sendMessage()}>
              Send
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
