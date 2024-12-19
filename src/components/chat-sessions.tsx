'use client';

import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  Menu,
  MenuItem,
  Tooltip,
  TextField,
  InputAdornment,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SortIcon from '@mui/icons-material/Sort';
import SearchIcon from '@mui/icons-material/Search';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import type { ChatSession } from '@/types';

interface ChatSessionsProps {
  sessions: ChatSession[];
  currentSession: ChatSession;
  onSessionSelect: (session: ChatSession) => void;
  onSessionDelete: (sessionId: string) => void;
  onSessionRename: (session: ChatSession, newName: string) => void;
  onSessionArchive?: (sessionId: string) => void;
}

export function ChatSessions({
  sessions,
  currentSession,
  onSessionSelect,
  onSessionDelete,
  onSessionRename,
  onSessionArchive
}: ChatSessionsProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'name'>('newest');
  const [showArchived, setShowArchived] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, session: ChatSession) => {
    setAnchorEl(event.currentTarget);
    setSelectedSession(session);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSession(null);
  };

  const handleRename = () => {
    if (selectedSession) {
      const newName = prompt('Enter new name:', selectedSession.name);
      if (newName && newName.trim()) {
        onSessionRename(selectedSession, newName.trim());
      }
    }
    handleMenuClose();
  };

  const handleSortClick = (event: React.MouseEvent<HTMLElement>) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const handleSortChange = (order: 'newest' | 'oldest' | 'name') => {
    setSortOrder(order);
    handleSortClose();
  };

  const filteredSessions = sessions
    .filter(session => 
      (showArchived ? session.status === 'archived' : session.status === 'active')
    );

  const sortedSessions = [...filteredSessions].sort((a, b) => {
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

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
        <Typography variant="h6">Chat History</Typography>
        <Box>
          <Tooltip title="Toggle Archived">
            <IconButton onClick={() => setShowArchived(!showArchived)}>
              {showArchived ? <UnarchiveIcon /> : <ArchiveIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Sort sessions">
            <IconButton onClick={handleSortClick}>
              <SortIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <List>
        {sortedSessions.map((session) => (
          <ListItem
            key={session.id}
            button
            selected={session.id === currentSession.id}
            onClick={() => onSessionSelect(session)}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {session.name}
                  {session.status === 'archived' && (
                    <Chip size="small" label="Archived" />
                  )}
                </Box>
              }
              secondary={
                <>
                  <Typography variant="caption" component="div">
                    {new Date(session.updatedAt).toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {session.messages.length} messages
                  </Typography>
                </>
              }
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" onClick={(e) => handleMenuOpen(e, session)}>
                <MoreVertIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleRename}>Rename</MenuItem>
        {onSessionArchive && selectedSession && (
          <MenuItem onClick={() => {
            if (selectedSession) {
              onSessionArchive(selectedSession.id);
            }
            handleMenuClose();
          }}>
            {selectedSession.status === 'archived' ? 'Unarchive' : 'Archive'}
          </MenuItem>
        )}
        <MenuItem onClick={() => {
          if (selectedSession) {
            onSessionDelete(selectedSession.id);
          }
          handleMenuClose();
        }}>Delete</MenuItem>
      </Menu>

      <Menu
        anchorEl={sortAnchorEl}
        open={Boolean(sortAnchorEl)}
        onClose={handleSortClose}
      >
        <MenuItem onClick={() => handleSortChange('newest')}>Newest First</MenuItem>
        <MenuItem onClick={() => handleSortChange('oldest')}>Oldest First</MenuItem>
        <MenuItem onClick={() => handleSortChange('name')}>By Name</MenuItem>
      </Menu>
    </Box>
  );
} 