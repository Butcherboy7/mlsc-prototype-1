
import { useState, useCallback } from 'react';
import { StudyMode } from '@/types';

interface AIResponse {
  content: string;
  suggestions?: string[];
  followUps?: string[];
}

export const useAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock AI service - in a real app, you'd connect to Gemini API
  const callAI = useCallback(async (
    prompt: string, 
    context: { mode: StudyMode; type: 'summarize' | 'explain' | 'question' | 'plan' | 'notes' }
  ): Promise<AIResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      // Mock responses based on context
      const responses = generateMockResponse(prompt, context);
      return responses;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'AI service error';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const summarizePDF = useCallback(async (text: string, mode: StudyMode): Promise<AIResponse> => {
    return callAI(`Summarize this ${mode} content: ${text.slice(0, 1000)}...`, { 
      mode, 
      type: 'summarize' 
    });
  }, [callAI]);

  const generateNotes = useCallback(async (topic: string, mode: StudyMode): Promise<AIResponse> => {
    return callAI(`Generate comprehensive notes for: ${topic}`, { 
      mode, 
      type: 'notes' 
    });
  }, [callAI]);

  const explainConcept = useCallback(async (concept: string, mode: StudyMode): Promise<AIResponse> => {
    return callAI(`Explain this ${mode} concept: ${concept}`, { 
      mode, 
      type: 'explain' 
    });
  }, [callAI]);

  const answerQuestion = useCallback(async (question: string, mode: StudyMode): Promise<AIResponse> => {
    return callAI(question, { 
      mode, 
      type: 'question' 
    });
  }, [callAI]);

  const generateStudyPlan = useCallback(async (topic: string, duration: number, mode: StudyMode): Promise<AIResponse> => {
    return callAI(`Create a ${duration}-day study plan for ${topic}`, { 
      mode, 
      type: 'plan' 
    });
  }, [callAI]);

  return {
    isLoading,
    error,
    summarizePDF,
    generateNotes,
    explainConcept,
    answerQuestion,
    generateStudyPlan
  };
};

// Mock response generator
function generateMockResponse(prompt: string, context: { mode: StudyMode; type: string }): AIResponse {
  const { mode, type } = context;
  
  const baseResponses = {
    summarize: {
      maths: "## Mathematical Concepts Summary\n\n**Key Points:**\n- Linear equations and their applications\n- Quadratic functions and graphing\n- Calculus fundamentals\n\n**Important Formulas:**\n```\ny = mx + b (linear)\nf(x) = ax² + bx + c (quadratic)\n```",
      coding: "## Programming Concepts Summary\n\n**Core Topics:**\n- Data structures (arrays, objects)\n- Functions and scope\n- Algorithms and complexity\n\n**Code Example:**\n```javascript\nfunction factorial(n) {\n  return n <= 1 ? 1 : n * factorial(n - 1);\n}\n```",
      business: "## Business Strategy Summary\n\n**Key Components:**\n- Market analysis and positioning\n- Financial planning and forecasting\n- Operations and supply chain\n- Human resources management",
      law: "## Legal Principles Summary\n\n**Fundamental Concepts:**\n- Constitutional law basics\n- Contract formation and enforcement\n- Tort liability principles\n- Criminal vs. civil law distinctions",
      literature: "## Literary Analysis Summary\n\n**Critical Elements:**\n- Narrative structure and plot development\n- Character analysis and motivation\n- Themes and symbolism\n- Historical and cultural context"
    },
    explain: {
      maths: "Let me break down this mathematical concept step by step:\n\n1. **Definition**: Clear mathematical definition\n2. **Visual Representation**: Graphs or diagrams help understanding\n3. **Real-world Applications**: How this applies practically\n4. **Common Mistakes**: What to avoid when solving problems",
      coding: "Here's how this programming concept works:\n\n1. **Syntax**: The basic structure and rules\n2. **Logic Flow**: How the code executes step by step\n3. **Best Practices**: Clean, efficient coding techniques\n4. **Debugging Tips**: Common issues and solutions",
      business: "This business concept involves:\n\n1. **Core Principle**: The fundamental idea\n2. **Strategic Importance**: Why it matters for success\n3. **Implementation**: How to apply it practically\n4. **Metrics**: How to measure effectiveness",
      law: "This legal concept encompasses:\n\n1. **Legal Definition**: Precise legal meaning\n2. **Case Law**: Relevant court decisions\n3. **Practical Application**: Real-world scenarios\n4. **Exceptions**: When the rule doesn't apply",
      literature: "This literary element functions as:\n\n1. **Definition**: What it means in literary context\n2. **Examples**: Specific instances in famous works\n3. **Analysis Techniques**: How to identify and interpret\n4. **Significance**: Why authors use this device"
    }
  };

  const content = baseResponses[type as keyof typeof baseResponses]?.[mode] || 
    "I understand you're asking about " + prompt + ". Let me provide a comprehensive explanation tailored to " + mode + " studies.";

  const suggestions = [
    `Create flashcards for key ${mode} concepts`,
    `Generate practice problems`,
    `Explore related topics in ${mode}`,
    `Set up a study schedule`
  ];

  const followUps = [
    `Can you explain this in simpler terms?`,
    `What are some practice exercises?`,
    `How does this connect to other topics?`,
    `What are common exam questions about this?`
  ];

  return { content, suggestions, followUps };
}
