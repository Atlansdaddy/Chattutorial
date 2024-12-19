'use client';

import React from 'react';
import { Paper, Typography, IconButton, Box } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PersonIcon from '@mui/icons-material/Person';
import type { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const getModelLabel = (model?: string) => {
    switch (model) {
      case 'openai':
        return '🤖 GPT-4';
      case 'anthropic':
        return '🧠 Claude';
      case 'gemini':
        return '💫 Gemini';
      default:
        return '👤 User';
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
        mb: 2 
      }}
    >
      <Box sx={{ maxWidth: '70%' }}>
        <Typography 
          variant="caption" 
          sx={{ 
            ml: 1, 
            mb: 0.5, 
            display: 'block',
            color: 'text.secondary',
            fontSize: '1.25rem'
          }}
        >
          {message.role === 'user' ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
              <PersonIcon sx={{ fontSize: 20 }} />
              <span>User</span>
            </Box>
          ) : (
            <span>{getModelLabel(message.model)}</span>
          )}
        </Typography>
        <Paper
          elevation={1}
          sx={{
            p: 2,
            backgroundColor: message.role === 'user' ? '#e3f2fd' : 
              message.model === 'openai' ? '#4caf50' :
              message.model === 'anthropic' ? '#e91e63' :
              message.model === 'gemini' ? '#03a9f4' :
              '#f5f5f5',
          }}
        >
          <Typography 
            variant="body1" 
            sx={{ 
              whiteSpace: 'pre-wrap',
              color: message.role === 'user' ? 'text.primary' : '#ffffff'
            }}
          >
            {message.content}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <IconButton 
              size="small" 
              onClick={handleCopy}
              sx={{ 
                opacity: 0.7,
                '&:hover': { opacity: 1 },
                color: message.role === 'user' ? 'inherit' : '#ffffff'
              }}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
} 