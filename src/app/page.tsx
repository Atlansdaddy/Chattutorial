'use client';

import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Select,
  MenuItem, 
  Box,
  FormControl,
  InputLabel,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Drawer,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { ChatWindow } from '../components/chat-window';
import { ChatSessions } from '../components/chat-sessions';
import { FileInput } from '../components/file-input';
import { 
  saveChatSession, 
  getChatSessions, 
  deleteChatSession, 
  createNewSession, 
  updateSession,
  archiveSession,
  getSortedSessions,
  searchSessions
} from '../utils/chat-storage';
import type { Message, SingleModel, ModelSelection, ChatSession, FileAttachment } from '../types';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelSelection>('openai');
  const [isLoading, setIsLoading] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState<ChatSession>(() => 
    createNewSession('openai')
  );
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSessions, setFilteredSessions] = useState<ChatSession[]>([]);

  // Load sessions on mount
  useEffect(() => {
    const loadedSessions = getChatSessions();
    setSessions(loadedSessions);
    if (loadedSessions.length > 0) {
      setCurrentSession(loadedSessions[0]);
      setMessages(loadedSessions[0].messages);
      setSelectedModel(loadedSessions[0].model);
    }
  }, []);

  // Save session when messages change
  useEffect(() => {
    if (currentSession) {
      const updatedSession = updateSession(currentSession, messages);
      setCurrentSession(updatedSession);
      saveChatSession(updatedSession);
      setSessions(prev => {
        const index = prev.findIndex(s => s.id === updatedSession.id);
        if (index >= 0) {
          const newSessions = [...prev];
          newSessions[index] = updatedSession;
          return newSessions;
        }
        return [...prev, updatedSession];
      });
    }
  }, [messages]);

  // Update filtered sessions when search query or sessions change
  useEffect(() => {
    let filtered = sessions;
    if (searchQuery) {
      filtered = searchSessions(sessions, searchQuery);
    }
    setFilteredSessions(getSortedSessions(filtered));
  }, [searchQuery, sessions]);

  const addMessage = (message: Message) => {
    const messageWithTimestamp = {
      ...message,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, messageWithTimestamp]);
  };

  const handleClearChat = () => {
    setClearDialogOpen(true);
  };

  const confirmClearChat = () => {
    setMessages([]);
    setClearDialogOpen(false);
  };

  const handleNewSession = () => {
    const newSession = createNewSession(selectedModel);
    setCurrentSession(newSession);
    setMessages([]);
    setSessions(prev => [...prev, newSession]);
    saveChatSession(newSession);
  };

  const handleSessionSelect = (session: ChatSession) => {
    setCurrentSession(session);
    setMessages(session.messages);
    setSelectedModel(session.model);
    setDrawerOpen(false);
  };

  const handleSessionDelete = (sessionId: string) => {
    deleteChatSession(sessionId);
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSession.id === sessionId) {
      const remainingSessions = sessions.filter(s => s.id !== sessionId);
      if (remainingSessions.length > 0) {
        handleSessionSelect(remainingSessions[0]);
      } else {
        const newSession = createNewSession(selectedModel);
        handleSessionSelect(newSession);
      }
    }
  };

  const handleSessionRename = (session: ChatSession, newName: string) => {
    const updatedSession = { ...session, name: newName };
    saveChatSession(updatedSession);
    setSessions(prev => prev.map(s => s.id === session.id ? updatedSession : s));
    if (currentSession.id === session.id) {
      setCurrentSession(updatedSession);
    }
  };

  const handleFileSelect = (file: FileAttachment) => {
    setAttachments(prev => [...prev, file]);
    // Add file content as a system message
    addMessage({
      role: 'system',
      content: `File attached: ${file.name}\n\n${file.content}`,
      model: selectedModel as SingleModel
    });
  };

  const handleFileRemove = (fileName: string) => {
    setAttachments(prev => prev.filter(f => f.name !== fileName));
  };

  const handleSendMessage = async (content: string) => {
    try {
      setIsLoading(true);
      
      const userMessage: Message = { 
        role: 'user', 
        content,
        timestamp: Date.now()
      };
      addMessage(userMessage);

      // Check for @ mentions
      const mentions = content.match(/@(openai|anthropic|gemini|user)/gi);
      const mentionedModels = mentions?.map(m => m.slice(1).toLowerCase()) || [];

      if (mentionedModels.length > 0) {
        const validModels = mentionedModels.filter(m => m !== 'user') as SingleModel[];
        
        for (const mentionedModel of validModels) {
          try {
            const response = await fetch(`/api/${mentionedModel}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ messages: [...messages, userMessage] }),
            });
            
            if (!response.ok) {
              const errorMessage: Message = {
                role: 'assistant',
                content: `Note: ${mentionedModel.toUpperCase()} is unavailable.`,
                model: mentionedModel,
                timestamp: Date.now()
              };
              addMessage(errorMessage);
              continue;
            }

            const data = await response.json();
            const assistantMessage: Message = {
              role: 'assistant',
              content: data.content,
              model: mentionedModel,
              timestamp: Date.now()
            };
            addMessage(assistantMessage);
          } catch (error) {
            const errorMessage: Message = {
              role: 'assistant',
              content: `Error: Failed to get response from ${mentionedModel.toUpperCase()}.`,
              model: mentionedModel,
              timestamp: Date.now()
            };
            addMessage(errorMessage);
          }
        }
      } else {
        const selectedModels = selectedModel === 'all' ? ['openai', 'anthropic', 'gemini'] as const : 
                             Array.isArray(selectedModel) ? selectedModel : [selectedModel];
        
        for (const currentModel of selectedModels) {
          try {
            const response = await fetch(`/api/${currentModel}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ messages: [...messages, userMessage] }),
            });

            if (!response.ok) {
              const errorMessage: Message = {
                role: 'assistant',
                content: `Note: ${currentModel.toUpperCase()} is unavailable.`,
                model: currentModel,
                timestamp: Date.now()
              };
              addMessage(errorMessage);
              continue;
            }

            const data = await response.json();
            const assistantMessage: Message = {
              role: 'assistant',
              content: data.content,
              model: currentModel,
              timestamp: Date.now()
            };
            addMessage(assistantMessage);
          } catch (error) {
            const errorMessage: Message = {
              role: 'assistant',
              content: `Error: Failed to get response from ${currentModel.toUpperCase()}.`,
              model: currentModel,
              timestamp: Date.now()
            };
            addMessage(errorMessage);
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      const errorModel = Array.isArray(selectedModel) ? selectedModel[0] : 
                        selectedModel === 'all' ? 'openai' : selectedModel;
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, there was an error processing your request.',
        model: errorModel,
        timestamp: Date.now()
      };
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchiveSession = (sessionId: string) => {
    archiveSession(sessionId);
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, status: session.status === 'archived' ? 'active' : 'archived' } 
        : session
    ));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          AI Chat Aggregator
        </Typography>
        <Box>
          <Tooltip title="New Chat">
            <IconButton onClick={handleNewSession} sx={{ mr: 1 }}>
              <AddIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Chat History">
            <IconButton onClick={() => setDrawerOpen(true)}>
              <HistoryIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Paper elevation={3} sx={{ overflow: 'hidden' }}>
        <Box p={2} borderBottom={1} borderColor="divider">
          <Stack spacing={2}>
            <FormControl>
              <InputLabel>Model</InputLabel>
              <Select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as ModelSelection)}
                label="Model"
              >
                <MenuItem value="all">🤖 All Models</MenuItem>
                <MenuItem value="openai">🤖 OpenAI (GPT-4)</MenuItem>
                <MenuItem value="anthropic">🧠 Anthropic (Claude)</MenuItem>
                <MenuItem value="gemini">💫 Google (Gemini)</MenuItem>
              </Select>
            </FormControl>
            <FileInput
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              attachments={attachments}
            />
          </Stack>
        </Box>
        <Box height="calc(100vh - 20rem)">
          <ChatWindow
            messages={messages}
            onSendMessage={handleSendMessage}
            onClearChat={handleClearChat}
            selectedModel={Array.isArray(selectedModel) ? selectedModel[0] : 
                         selectedModel === 'all' ? 'openai' : selectedModel}
            isLoading={isLoading}
          />
        </Box>
      </Paper>

      {/* Chat History Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 350 }}>
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <ChatSessions
            sessions={filteredSessions}
            currentSession={currentSession}
            onSessionSelect={handleSessionSelect}
            onSessionDelete={handleSessionDelete}
            onSessionRename={handleSessionRename}
            onSessionArchive={handleArchiveSession}
          />
        </Box>
      </Drawer>

      {/* Clear Chat Dialog */}
      <Dialog
        open={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
        aria-labelledby="clear-dialog-title"
      >
        <DialogTitle id="clear-dialog-title">
          Clear Chat History
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to clear the entire chat history? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmClearChat} color="error" autoFocus>
            Clear
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 