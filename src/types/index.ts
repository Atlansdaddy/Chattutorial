export type SingleModel = 'openai' | 'anthropic' | 'gemini';
export type ModelSelection = SingleModel | 'all' | SingleModel[];

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  model?: SingleModel;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  model: ModelSelection;
  createdAt: number;
  updatedAt: number;
  status: 'active' | 'archived';
}

export interface FileAttachment {
  name: string;
  content: string;
  type: string;
  size: number;
  timestamp: number;
} 