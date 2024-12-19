'use client';

import React from 'react';
import { Box, CircularProgress, IconButton, Tooltip } from '@mui/material';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import type { Message } from '../types';

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  onClearChat: () => void;
  selectedModel: string;
  isLoading?: boolean;
}

export function ChatWindow({ 
  messages, 
  onSendMessage, 
  onClearChat,
  selectedModel,
  isLoading = false 
}: ChatWindowProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      bgcolor: 'background.paper' 
    }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        p: 1,
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Tooltip title="Clear chat history">
          <IconButton 
            onClick={onClearChat}
            disabled={messages.length === 0}
            size="small"
          >
            <DeleteSweepIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Box sx={{ 
        flexGrow: 1, 
        overflowY: 'auto', 
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>
      <ChatInput onSend={onSendMessage} model={selectedModel} />
    </Box>
  );
} 