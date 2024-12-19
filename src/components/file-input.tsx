'use client';

import React, { useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Chip,
  Stack,
  Tooltip
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import type { FileAttachment } from '@/types';

interface FileInputProps {
  onFileSelect: (file: FileAttachment) => void;
  onFileRemove: (fileName: string) => void;
  attachments: FileAttachment[];
}

export function FileInput({ onFileSelect, onFileRemove, attachments }: FileInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const allowedTypes = ['text/plain', 'text/markdown', 'application/json', 'text/csv'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only text files (.txt, .md, .json, .csv) are supported');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    try {
      const content = await file.text();
      const attachment: FileAttachment = {
        name: file.name,
        content,
        type: file.type,
        size: file.size,
        timestamp: Date.now()
      };
      onFileSelect(attachment);
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Error reading file');
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".txt,.md,.json,.csv"
        style={{ display: 'none' }}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<AttachFileIcon />}
          onClick={() => fileInputRef.current?.click()}
          size="small"
        >
          Attach File
        </Button>
        {attachments.length > 0 && (
          <Typography variant="caption" color="text.secondary">
            {attachments.length} file(s) attached
          </Typography>
        )}
      </Box>
      {attachments.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          {attachments.map((file) => (
            <Tooltip
              key={file.name}
              title={`${file.name} (${(file.size / 1024).toFixed(1)}KB)`}
            >
              <Chip
                label={file.name}
                onDelete={() => onFileRemove(file.name)}
                size="small"
                deleteIcon={<DeleteIcon />}
              />
            </Tooltip>
          ))}
        </Stack>
      )}
    </Box>
  );
} 