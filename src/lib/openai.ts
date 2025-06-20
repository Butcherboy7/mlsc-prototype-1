
import { Message } from '../types';

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// Context memory for each session
const contextStore = new Map<string, Message[]>();

const BASE_URL = 'https://api.openai.com/v1';

export const openAIService = {
  getApiKey(): string | null {
    return localStorage.getItem('openai_api_key');
  },

  setApiKey(apiKey: string): void {
    localStorage.setItem('openai_api_key', apiKey);
  },

  async chat(messages: Message[]): Promise<string> {
    const API_KEY = this.getApiKey();
    
    if (!API_KEY || API_KEY === 'your-openai-api-key-here') {
      return 'Please configure your OpenAI API key in the settings to use AI features.';
    }

    try {
      const response = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data: OpenAIResponse = await response.json();
      return data.choices[0]?.message?.content || 'No response generated.';
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return 'I apologize, but I encountered an error. Please try again later.';
    }
  },

  async contextualChat(userMessage: string, mode: string, sessionId: string): Promise<string> {
    // Get or create context for this session
    if (!contextStore.has(sessionId)) {
      contextStore.set(sessionId, []);
    }
    
    const context = contextStore.get(sessionId)!;
    
    // Add system message based on mode
    const systemMessage = this.getSystemMessage(mode);
    
    // Build conversation with context
    const messages: Message[] = [
      { role: 'system', content: systemMessage },
      ...context,
      { role: 'user', content: userMessage }
    ];
    
    try {
      const response = await this.chat(messages);
      
      // Update context
      context.push({ role: 'user', content: userMessage });
      context.push({ role: 'assistant', content: response });
      
      // Keep only last 10 messages for context
      if (context.length > 10) {
        context.splice(0, context.length - 10);
      }
      
      return response;
    } catch (error) {
      console.error('Contextual chat error:', error);
      return 'I apologize, but I encountered an error. Please try again.';
    }
  },

  getSystemMessage(mode: string): string {
    const prompts = {
      maths: 'You are an expert mathematics tutor. Help students understand mathematical concepts, solve problems step-by-step, and provide clear explanations. Always show your work and reasoning.',
      coding: 'You are a skilled programming mentor. Help with coding problems, debug issues, explain concepts, and provide best practices. Support multiple programming languages and frameworks.',
      business: 'You are a business strategy coach. Provide insights on entrepreneurship, business planning, marketing, finance, and startup guidance. Focus on practical, actionable advice.',
      legal: 'You are a legal advisor specializing in explaining legal concepts. Help understand laws, regulations, and legal processes. Always remind users to consult qualified attorneys for specific legal advice.',
      literature: 'You are a literature guide and writing coach. Help with literary analysis, writing techniques, grammar, and creative expression. Provide constructive feedback and suggestions.'
    };
    
    return prompts[mode as keyof typeof prompts] || 'You are a helpful AI assistant focused on education and learning.';
  },

  async summarizePDF(content: string, type: 'short' | 'detailed' = 'short'): Promise<string> {
    const prompt = type === 'short' 
      ? `Provide a concise summary of this document in bullet points (max 200 words). Focus on key concepts, main ideas, and important details:\n\n${content}`
      : `Provide a comprehensive, detailed summary of this document. Analyze the core content and themes, ignoring metadata or document structure. Explain the main concepts like a tutor teaching a student. Include:\n\n1. Overview of main topics\n2. Key concepts and definitions\n3. Important details and examples\n4. Structure with clear headings\n5. Educational insights\n\nDocument content:\n\n${content}`;

    const messages: Message[] = [
      { role: 'system', content: 'You are an expert document analyzer and educational content creator. Focus on the educational value and core concepts, not document metadata.' },
      { role: 'user', content: prompt }
    ];

    try {
      return await this.chat(messages);
    } catch (error) {
      console.error('PDF summarization error:', error);
      return 'Unable to generate summary. Please try again.';
    }
  },

  async generateNotes(topic: string, context?: string): Promise<string> {
    const prompt = context 
      ? `Create comprehensive study notes for: ${topic}\n\nAdditional context: ${context}`
      : `Create comprehensive study notes for: ${topic}`;

    const messages: Message[] = [
      { role: 'system', content: 'You are an expert educator. Create well-structured, comprehensive study notes with clear headings, bullet points, and examples.' },
      { role: 'user', content: prompt }
    ];

    return await this.chat(messages);
  },

  async generateNote(topic: string): Promise<{ title: string; content: string }> {
    const content = await this.generateNotes(topic);
    return {
      title: topic,
      content: content
    };
  },

  async helpWithCode(code: string, language: string, problem: string): Promise<string> {
    const prompt = `Help with this ${language} code issue: ${problem}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\``;
    
    const messages: Message[] = [
      { role: 'system', content: 'You are a skilled programming mentor. Help debug code, explain issues, and provide solutions with clear explanations.' },
      { role: 'user', content: prompt }
    ];

    return await this.chat(messages);
  },

  async explainConcept(concept: string, level: string = 'intermediate'): Promise<string> {
    const prompt = `Explain this concept at a ${level} level: ${concept}`;
    
    const messages: Message[] = [
      { role: 'system', content: 'You are a patient tutor. Provide clear, step-by-step explanations with examples.' },
      { role: 'user', content: prompt }
    ];

    return await this.chat(messages);
  }
};
