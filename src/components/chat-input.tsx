'use client';

import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

interface ChatInputProps {
  onSend: (message: string) => void;
  model: string;
}

export function ChatInput({ onSend, model }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(input);
      setInput('');
    }
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        borderTop: 1, 
        borderColor: 'divider',
        p: 2,
        backgroundColor: 'background.default'
      }}
    >
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            size="small"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            variant="outlined"
            inputProps={{ maxLength: 1000 }}
          />
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ minWidth: '4rem' }}
          >
            {input.length}/1000
          </Typography>
          <Button
            type="submit"
            variant="contained"
            endIcon={<SendIcon />}
            disabled={!input.trim()}
          >
            Send
          </Button>
        </Box>
      </form>
    </Paper>
  );
} 