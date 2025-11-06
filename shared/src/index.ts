export interface ChatMessage {
  user: string;
  text: string;
  timestamp: number;
}

export const formatMessage = (msg: ChatMessage) =>
  `[${new Date(msg.timestamp).toLocaleTimeString()}] ${msg.user}: ${msg.text}`;

export interface ServerToClientEvents {
  'chat message': (msc: string) => void;
}

export interface ClientToServerEvents {
  'chat message': (msg: string) => void;
}
