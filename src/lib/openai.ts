
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

  async chat(messages: OpenAIMessage[], model: string = 'gpt-4'): Promise<string> {
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
      ? 'Provide a concise summary in 200 words or less with key bullet points:'
      : 'Provide a detailed, comprehensive summary with paragraph-by-paragraph analysis:';

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
}

export const openAIService = new OpenAIService();
