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

// Convert our messages to Gemini format
function convertToGeminiMessages(messages: Message[]) {
  return messages.map(message => ({
    role: message.role === 'user' ? 'user' : 'model',
    parts: [{ text: message.content }]
  }));
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
          model: 'gpt-4-turbo-preview',
          messages: openaiMessages,
          temperature: 0.7,
          max_tokens: 1000,
        });
        return NextResponse.json({ content: openaiResponse.choices[0].message.content });

      case 'anthropic':
        const anthropicMessages = convertToAnthropicMessages(messages);
        const anthropicResponse = await anthropic.messages.create({
          model: 'claude-3-opus-20240229',
          messages: anthropicMessages,
          max_tokens: 1024,
          temperature: 0.7,
        });
        return NextResponse.json({ content: anthropicResponse.content[0].text });

      case 'gemini':
        const geminiModel = genAI.getGenerativeModel({
          model: 'gemini-pro',
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
            topP: 0.8,
            topK: 40,
          },
        });

        // Start a chat session
        const chat = geminiModel.startChat({
          history: convertToGeminiMessages(messages.slice(0, -1)),
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
            topP: 0.8,
            topK: 40,
          },
        });

        // Send the last message
        const lastMessage = messages[messages.length - 1];
        const geminiResponse = await chat.sendMessage(lastMessage.content);
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