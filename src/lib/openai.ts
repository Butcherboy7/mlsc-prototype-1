
export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

class OpenAIService {
  private apiKey: string | null = null;

  constructor() {
    // Try to get API key from environment or localStorage
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || localStorage.getItem('openai_api_key');
  }

  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('openai_api_key', key);
  }

  getApiKey(): string | null {
    return this.apiKey;
  }

  async chat(messages: OpenAIMessage[], model: string = 'gpt-3.5-turbo'): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data: OpenAIResponse = await response.json();
      return data.choices[0]?.message?.content || 'No response generated';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  async summarizePDF(content: string, type: 'short' | 'detailed'): Promise<string> {
    const prompt = type === 'short' 
      ? 'Provide a concise bullet-point summary of the following content:'
      : 'Provide a detailed, comprehensive summary of the following content with explanations:';

    return this.chat([
      { role: 'system', content: 'You are a helpful assistant that creates summaries.' },
      { role: 'user', content: `${prompt}\n\n${content}` }
    ]);
  }

  async generateNote(topic: string): Promise<{ title: string; content: string }> {
    const response = await this.chat([
      { role: 'system', content: 'You are an educational content creator. Generate comprehensive study notes.' },
      { role: 'user', content: `Create detailed study notes about: ${topic}` }
    ]);

    return {
      title: `Study Notes: ${topic}`,
      content: response
    };
  }
}

export const openAIService = new OpenAIService();
