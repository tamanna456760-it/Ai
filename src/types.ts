export interface BotConfig {
  id: string;
  name: string;
  tagline: string;
  avatarIcon: string; // Lucide icon identifier
  avatarColor: string; // Tailwind color class or hex
  category: 'security' | 'engineering' | 'business' | 'support' | 'data' | 'writing' | 'custom';
  systemPrompt: string;
  tone: string;
  knowledgeBase?: string;
  starterPrompts: string[];
  isCustom?: boolean;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  tokens?: number;
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  botId: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
}

export type ViewMode = 'playground' | 'studio' | 'embed';
