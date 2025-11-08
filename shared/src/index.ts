export const CHAT_EVENTS = {
  JOINED_ROOM: 'joined-room',
  MESSAGE: 'message',
  JOIN_ROOM: 'join-room',
} as const;

export interface ChatMessage {
  id: string;
  nickname: string;
  icon: string;
  text: string;
  timestamp: number;
}

export interface ChatCommand {
  room: string;
  nickname: string;
  icon: string;
  text: string;
}

export interface ClientToServerEvents {
  [CHAT_EVENTS.MESSAGE]: (command: ChatCommand) => void;
  [CHAT_EVENTS.JOIN_ROOM]: (room: string) => void;
}

export interface ServerToClientEvents {
  [CHAT_EVENTS.MESSAGE]: (message: ChatMessage) => void;
  [CHAT_EVENTS.JOINED_ROOM]: (profile: Profile) => void;
}

export interface Avatar {
  emoji: string;
  name: string;
}

export interface Profile {
  room: string;
  nickname: string;
  icon: string;
}

/**
 * Utils
 */

export function shuffle<T>(array: T[]): T[] {
  const result = [...array]; // 元の配列を壊さない
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // 0〜iのランダムな整数
    // @ts-expect-error
    [result[i], result[j]] = [result[j], result[i]]; // 要素を交換
  }
  return result;
}
