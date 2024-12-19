import React from 'react';
import type { Metadata } from 'next';
import { CssBaseline } from '@mui/material';

export const metadata: Metadata = {
  title: 'AI Chat Aggregator',
  description: 'Compare responses from multiple AI models',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CssBaseline />
        {children}
      </body>
    </html>
  );
} 