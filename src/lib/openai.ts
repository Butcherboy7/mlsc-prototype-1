
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
  private apiKey: string = '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';
  private baseUrl: string = 'https://openrouter.ai/api/v1';

  async chat(messages: OpenAIMessage[], model: string = 'openai/gpt-3.5-turbo'): Promise<string> {
    try {
      console.log('Making API call to:', this.baseUrl);
      console.log('Using model:', model);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Mentora App',
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      console.log('API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data: OpenAIResponse = await response.json();
      console.log('API Response data:', data);
      
      return data.choices[0]?.message?.content || 'No response generated';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  async summarizePDF(content: string, type: 'short' | 'detailed'): Promise<string> {
    const prompt = type === 'short' 
      ? 'Provide a concise summary in 1-2 paragraphs with key points:'
      : 'Provide a detailed, comprehensive summary with section-wise breakdown:';

    return this.chat([
      { role: 'system', content: 'You are a helpful assistant that creates accurate summaries based on the provided content.' },
      { role: 'user', content: `${prompt}\n\n${content}` }
    ]);
  }

  async generateNote(topic: string): Promise<{ title: string; content: string }> {
    const response = await this.chat([
      { role: 'system', content: 'You are an educational content creator. Generate comprehensive, well-structured study notes with clear sections and bullet points.' },
      { role: 'user', content: `Create detailed study notes about: ${topic}. Include key concepts, definitions, and examples.` }
    ]);

    return {
      title: `Study Notes: ${topic}`,
      content: response
    };
  }

  async helpWithCode(code: string, language: string, question: string): Promise<string> {
    return this.chat([
      { role: 'system', content: `You are an expert ${language} programming assistant. Help analyze code, fix bugs, suggest improvements, and answer coding questions.` },
      { role: 'user', content: `Language: ${language}\n\nCode:\n${code}\n\nQuestion: ${question}` }
    ]);
  }

  // Legacy methods for compatibility (will be removed after refactoring)
  getApiKey(): string {
    return this.apiKey;
  }

  setApiKey(key: string): void {
    this.apiKey = key;
  }
}

export const openAIService = new OpenAIService();
