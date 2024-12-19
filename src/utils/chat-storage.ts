import { ChatSession, Message, ModelSelection } from '@/types';

const STORAGE_KEY = 'chat_sessions';

export function saveChatSession(session: ChatSession): void {
  const sessions = getChatSessions();
  const existingIndex = sessions.findIndex(s => s.id === session.id);
  
  if (existingIndex >= 0) {
    sessions[existingIndex] = session;
  } else {
    sessions.push(session);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function getChatSessions(): ChatSession[] {
  try {
    const sessionsJson = localStorage.getItem(STORAGE_KEY);
    const sessions = sessionsJson ? JSON.parse(sessionsJson) : [];
    return sessions.map((session: any) => ({
      ...session,
      status: session.status || 'active', // Add default status for backward compatibility
      messages: session.messages.map((msg: any) => ({
        ...msg,
        timestamp: msg.timestamp || Date.now() // Add default timestamp for backward compatibility
      }))
    }));
  } catch (error) {
    console.error('Error loading chat sessions:', error);
    return [];
  }
}

export function deleteChatSession(sessionId: string): void {
  const sessions = getChatSessions();
  const filteredSessions = sessions.filter(s => s.id !== sessionId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredSessions));
}

export function archiveSession(sessionId: string): void {
  const sessions = getChatSessions();
  const updatedSessions = sessions.map(session => 
    session.id === sessionId 
      ? { ...session, status: session.status === 'archived' ? 'active' : 'archived' } 
      : session
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
}

export function createNewSession(model: ModelSelection): ChatSession {
  return {
    id: generateId(),
    name: `Chat ${new Date().toLocaleString()}`,
    messages: [],
    model,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    status: 'active' as const
  };
}

export function updateSession(session: ChatSession, messages: Message[]): ChatSession {
  return {
    ...session,
    messages,
    updatedAt: Date.now()
  };
}

export function getSortedSessions(
  sessions: ChatSession[], 
  sortOrder: 'newest' | 'oldest' | 'name' = 'newest'
): ChatSession[] {
  return [...sessions].sort((a, b) => {
    switch (sortOrder) {
      case 'newest':
        return b.updatedAt - a.updatedAt;
      case 'oldest':
        return a.updatedAt - b.updatedAt;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });
}

export function searchSessions(
  sessions: ChatSession[],
  query: string
): ChatSession[] {
  const searchTerm = query.toLowerCase();
  return sessions.filter(session => {
    // Search in session name
    if (session.name.toLowerCase().includes(searchTerm)) return true;
    
    // Search in messages
    return session.messages.some(msg => 
      msg.content.toLowerCase().includes(searchTerm)
    );
  });
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
} 