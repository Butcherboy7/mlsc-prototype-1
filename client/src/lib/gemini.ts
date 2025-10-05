import { Message } from '../types';

const contextStore = new Map<string, Message[]>();

export const geminiService = {
  async chat(messages: Message[], includeHistory: boolean = true): Promise<string> {
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      return data.response || 'No response generated.';
    } catch (error) {
      console.error('Chat API Error:', error);
      return 'I apologize, but I encountered an error. Please try again later.';
    }
  },

  async contextualChat(userMessage: string, mode: string, sessionId: string): Promise<string> {
    if (!contextStore.has(sessionId)) {
      contextStore.set(sessionId, []);
    }
    
    const context = contextStore.get(sessionId)!;
    
    try {
      const response = await fetch('/api/ai/contextual-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage, 
          mode, 
          sessionId 
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.response;
      
      context.push({ role: 'user', content: userMessage });
      context.push({ role: 'assistant', content: aiResponse });
      
      if (context.length > 10) {
        context.splice(0, context.length - 10);
      }
      
      return aiResponse;
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
    try {
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, type }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('PDF summarization error:', error);
      return 'Unable to generate summary. Please try again.';
    }
  },

  async generateNotes(topic: string, context?: string): Promise<string> {
    try {
      const response = await fetch('/api/ai/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, context }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Notes generation error:', error);
      return 'Unable to generate notes. Please try again.';
    }
  },

  async generateNote(topic: string): Promise<{ title: string; content: string }> {
    const content = await this.generateNotes(topic);
    return {
      title: topic,
      content: content
    };
  },

  async helpWithCode(code: string, language: string, problem: string): Promise<string> {
    try {
      const response = await fetch('/api/ai/help-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, language, problem }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Code help error:', error);
      return 'Unable to help with code. Please try again.';
    }
  },

  async explainConcept(concept: string, level: string = 'intermediate'): Promise<string> {
    try {
      const response = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ concept, level }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Concept explanation error:', error);
      return 'Unable to explain concept. Please try again.';
    }
  }
};
