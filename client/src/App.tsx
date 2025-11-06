import { type FormEvent, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    socket.on('chat message', (msg: string) => {
      setMessages((prev) => [...prev, msg]);
    });

    // クリーンアップ関数を返却
    return () => {
      // 上で設定したイベントリスナを削除（初期化）
      socket.off('chat message');
    };
  }, []);

  const sendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    socket.emit('chat message', message);
    setMessage('');
  };

  return (
    <div>
      <h1>Simple Chat App</h1>

      <ul>
        {messages.map((m, i) => (
          <li key={i}>{m}</li>
        ))}
      </ul>

      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />

        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default App;
