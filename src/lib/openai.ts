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

export interface StudyContext {
  mode: string;
  conversationHistory: OpenAIMessage[];
  userProfile?: {
    level: 'beginner' | 'intermediate' | 'advanced';
    preferences: string[];
  };
}

class OpenAIService {
  private apiKey: string = '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';
  private baseUrl: string = 'https://openrouter.ai/api/v1';
  private contexts: Map<string, StudyContext> = new Map();

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

  // Context-aware chat for study modes
  async contextualChat(
    userMessage: string,
    mode: string,
    sessionId: string,
    imageAnalysis?: string
  ): Promise<string> {
    let context = this.contexts.get(sessionId);
    
    if (!context) {
      context = {
        mode,
        conversationHistory: [],
        userProfile: {
          level: 'intermediate',
          preferences: []
        }
      };
      this.contexts.set(sessionId, context);
    }

    // Build context-aware system prompt
    const systemPrompt = this.getContextualSystemPrompt(mode, context);
    
    // Add user message to history
    const userMsg: OpenAIMessage = {
      role: 'user',
      content: imageAnalysis ? `${userMessage}\n\nImage Analysis: ${imageAnalysis}` : userMessage
    };
    
    context.conversationHistory.push(userMsg);

    // Keep only last 10 messages for context window management
    const recentHistory = context.conversationHistory.slice(-10);
    
    const messages: OpenAIMessage[] = [
      { role: 'system', content: systemPrompt },
      ...recentHistory
    ];

    const response = await this.chat(messages);
    
    // Add AI response to history
    context.conversationHistory.push({
      role: 'assistant',
      content: response
    });

    return response;
  }

  private getContextualSystemPrompt(mode: string, context: StudyContext): string {
    const basePrompts = {
      maths: `You are an expert mathematics tutor with deep knowledge across all mathematical disciplines. You adapt your teaching style based on the student's level and provide step-by-step solutions with clear explanations. You can solve problems from images, handle handwritten equations, and explain concepts from basic arithmetic to advanced calculus, linear algebra, and beyond.

Key behaviors:
- Always show your work step-by-step
- Explain the reasoning behind each step
- Provide alternative solution methods when applicable
- Use visual aids and examples when helpful
- Ask clarifying questions if the problem is unclear`,

      coding: `You are a senior software engineer and coding mentor with expertise across multiple programming languages. You help students understand programming concepts, debug code, optimize solutions, and learn best practices. You can analyze code from screenshots and provide comprehensive feedback.

Key behaviors:
- Explain code line by line when needed
- Suggest improvements and optimizations
- Teach debugging techniques
- Provide examples and alternative approaches
- Focus on clean, readable, and efficient code
- Help with both syntax and algorithmic thinking`,

      business: `You are a seasoned business strategist and coach with experience in startups, corporate strategy, marketing, finance, and operations. You help students understand business concepts, analyze case studies, and develop strategic thinking skills.

Key behaviors:
- Use real-world examples and case studies
- Break down complex business concepts into digestible parts
- Provide frameworks for analysis (SWOT, Porter's Five Forces, etc.)
- Connect theory to practical applications
- Ask probing questions to develop critical thinking`,

      legal: `You are a legal education expert specializing in constitutional law, case law analysis, legal writing, and jurisprudence. You help students understand legal principles, analyze cases, and develop legal reasoning skills for educational purposes only.

Key behaviors:
- Explain legal concepts clearly with examples
- Break down case law and precedents
- Help with legal writing and argumentation
- Provide historical context for legal developments
- Emphasize critical analysis and reasoning
- Always clarify this is for educational purposes only`,

      literature: `You are a literature professor and literary critic with deep knowledge of world literature, literary theory, and critical analysis. You help students understand literary works, develop analytical skills, and appreciate the art of writing.

Key behaviors:
- Provide rich context about authors and historical periods
- Explain literary devices and techniques
- Guide close reading and textual analysis
- Connect themes across different works
- Encourage personal interpretation while teaching analytical frameworks
- Help with essay writing and critical thinking`
    };

    const modeKey = mode.toLowerCase().replace(/\s+/g, '').replace('tutor', '').replace('mentor', '').replace('coach', '').replace('advisor', '').replace('guide', '');
    let prompt = basePrompts[modeKey as keyof typeof basePrompts] || basePrompts.maths;

    // Add conversation context
    if (context.conversationHistory.length > 0) {
      prompt += `\n\nConversation context: We've been discussing ${mode.toLowerCase()} topics. Continue building on our previous conversation naturally.`;
    }

    // Add user level adaptation
    if (context.userProfile?.level) {
      const levelGuidance = {
        beginner: "Explain concepts from the ground up, use simple language, and provide plenty of examples.",
        intermediate: "Balance fundamental explanations with more advanced concepts, and challenge the student appropriately.",
        advanced: "Focus on nuanced concepts, advanced techniques, and encourage independent problem-solving."
      };
      prompt += `\n\nStudent level: ${context.userProfile.level}. ${levelGuidance[context.userProfile.level]}`;
    }

    return prompt;
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

  // Clear context for a session
  clearContext(sessionId: string): void {
    this.contexts.delete(sessionId);
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
