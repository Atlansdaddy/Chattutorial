import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Message } from '@/types';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

// Initialize API clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Convert our messages to OpenAI format
function convertToOpenAIMessages(messages: Message[]): ChatCompletionMessageParam[] {
  return messages.map(({ role, content }) => ({
    role: role === 'system' ? 'system' : 
          role === 'user' ? 'user' : 'assistant',
    content: content
  }));
}

// Convert our messages to Anthropic format
function convertToAnthropicMessages(messages: Message[]) {
  return messages.map(({ role, content }) => ({
    role: role === 'user' ? 'user' : 'assistant',
    content
  })) as { role: 'user' | 'assistant'; content: string }[];
}

export async function POST(
  request: NextRequest,
  { params }: { params: { model: string } }
) {
  try {
    const { messages }: { messages: Message[] } = await request.json();
    const model = params.model;

    switch (model) {
      case 'openai':
        const openaiMessages = convertToOpenAIMessages(messages);
        const openaiResponse = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: openaiMessages,
        });
        return NextResponse.json({ content: openaiResponse.choices[0].message.content });

      case 'anthropic':
        const anthropicMessages = convertToAnthropicMessages(messages);
        const anthropicResponse = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-latest',
          messages: anthropicMessages,
          max_tokens: 1024,
        });
        return NextResponse.json({ content: anthropicResponse.content[0].text });

      case 'gemini':
        const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        const geminiChat = geminiModel.startChat();
        const lastMessage = messages[messages.length - 1];
        const geminiResponse = await geminiChat.sendMessage(lastMessage.content);
        const geminiResult = await geminiResponse.response;
        const content = geminiResult.text();
        return NextResponse.json({ content: content || '' });

      default:
        return NextResponse.json(
          { error: `Invalid model: ${model}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error(`Error in ${params.model} route:`, error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
} 