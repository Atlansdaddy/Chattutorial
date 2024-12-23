# AI Chat Aggregator

A Next.js application that allows you to interact with multiple AI models (OpenAI, Anthropic, and Google's Gemini) in a single interface.

## Features

- Chat with multiple AI models simultaneously
- Support for OpenAI's GPT-4, Anthropic's Claude, and Google's Gemini
- @ mention support to target specific models
- Modern UI with Material Design
- Real-time responses
- Message copying functionality
- Character count limit
- Auto-scrolling chat window

## Prerequisites

- Node.js 18+ installed
- API keys for:
  - OpenAI
  - Anthropic
  - Google (Gemini)

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd chatagg
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your API keys:
```env
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
GEMINI_API_KEY=your_google_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Basic Chat
1. Select a model from the dropdown (OpenAI, Anthropic, Gemini, or All)
2. Type your message
3. Press Enter or click Send

### @ Mentions
You can target specific models using @ mentions in your message:
- @openai what do you think?
- @anthropic and @gemini can you compare notes?

### Model Selection
- Choose individual models
- Select "All Models" to get responses from all available models
- Use @ mentions to target specific models regardless of selection

## Development

### Project Structure
```
src/
  ├── app/
  │   ├── api/
  │   │   └── [model]/
  │   │       └── route.ts
  │   ├── layout.tsx
  │   └── page.tsx
  ├── components/
  │   ├── chat-input.tsx
  │   ├── chat-message.tsx
  │   └── chat-window.tsx
  └── types/
      └── index.ts
```

### Technologies Used
- Next.js 14
- React 18
- Material UI
- TypeScript
- OpenAI API
- Anthropic API
- Google Generative AI API

## License

MIT #   C h a t t u t o r i a l  
 