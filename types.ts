
export enum Sender {
  USER = 'user',
  AI = 'ai',
  SYSTEM = 'system'
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: number;
  isStreaming?: boolean;
}

export enum Tab {
  CHAT = 'chat',
  RELIEF = 'relief', // Bubble wrap & Breathing
  GAME = 'game'      // Sokoban Game
}

export interface BreathingPhase {
  label: string;
  duration: number; // seconds
  scale: number;
  instruction: string;
}
