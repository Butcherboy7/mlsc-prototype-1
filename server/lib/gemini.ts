import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import { config } from "dotenv";

// Load environment variables
config();

// Verify API key exists
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('ERROR: GEMINI_API_KEY not found in environment variables!');
  console.error('Please check your .env file contains: GEMINI_API_KEY=your_key_here');
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const contextStore = new Map<string, Message[]>();

export async function parseSyllabusWithAI(extractedText: string, universityName: string): Promise<any> {
  try {
    // Validate the extracted text content
    if (!extractedText || extractedText.trim().length < 50) {
      throw new Error('No meaningful text content provided. Please ensure the PDF contains readable text.');
    }
    
    const fileContent = extractedText;
    console.log(`Processing ${fileContent.length} characters of extracted text`);
    
    const prompt = `You are an expert educational data parser. Analyze this REAL syllabus document and extract ACTUAL course information.

University: ${universityName}

IMPORTANT: This is a REAL document upload. Parse the ACTUAL content and return REAL data, not generic placeholders.

Document Analysis Instructions:
1. Extract the real course name(s) from the document
2. Identify the actual degree type (B.Tech, M.Tech, MBA, etc.)
3. Find actual subject names, codes, and credits if available
4. Extract real timetable information if present
5. Look for exam schedules and dates
6. Identify department names and specializations

Return ONLY valid JSON in this exact format with REAL extracted data:
{
  "university": "${universityName}",
  "location": "City, State (extract from document if available)",
  "courses": [
    {
      "name": "ACTUAL Course Name from document",
      "degree": "ACTUAL Degree type from document",
      "departments": ["ACTUAL departments found"],
      "subjects": [
        {
          "name": "ACTUAL subject name",
          "code": "ACTUAL subject code",
          "credits": "ACTUAL credits",
          "semester": "ACTUAL semester"
        }
      ],
      "semesters": [
        { "code": "1-1", "syllabus": ["ACTUAL subjects for this semester"] },
        { "code": "1-2", "syllabus": ["ACTUAL subjects for this semester"] }
      ]
    }
  ],
  "timetable": [
    {
      "subject": "ACTUAL subject name",
      "day": "ACTUAL day",
      "time": "ACTUAL time",
      "location": "ACTUAL location if available"
    }
  ],
  "examSchedule": [
    {
      "subject": "ACTUAL subject",
      "date": "ACTUAL date if available",
      "type": "ACTUAL exam type"
    }
  ]
}

Document Content to Parse:
${fileContent}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            university: { type: "string" },
            location: { type: "string" },
            courses: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  degree: { type: "string" },
                  departments: {
                    type: "array",
                    items: { type: "string" }
                  },
                  semesters: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        code: { type: "string" },
                        syllabus: { type: "array" }
                      }
                    }
                  }
                }
              }
            }
          },
          required: ["university", "location", "courses"]
        }
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      throw new Error("Empty response from AI");
    }
  } catch (error) {
    console.error('AI parsing error:', error);
    
    // Return error message instead of dummy data
    throw new Error(`Failed to parse syllabus content: ${error}. Please ensure the text contains valid syllabus information.`);
  }
}

export async function chat(messages: Message[]): Promise<string> {
  try {
    const prompt = messages.map(msg => {
      if (msg.role === 'system') {
        return `System: ${msg.content}`;
      } else if (msg.role === 'user') {
        return `User: ${msg.content}`;
      } else {
        return `Assistant: ${msg.content}`;
      }
    }).join('\n\n');

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1000,
      },
      contents: prompt,
    });

    return response.text || 'No response generated.';
  } catch (error) {
    console.error('Gemini API Error:', error);
    return 'I apologize, but I encountered an error. Please try again later.';
  }
}

export async function contextualChat(userMessage: string, mode: string, sessionId: string): Promise<string> {
  if (!contextStore.has(sessionId)) {
    contextStore.set(sessionId, []);
  }
  
  const context = contextStore.get(sessionId)!;
  const systemMessage = getSystemMessage(mode);
  
  const messages: Message[] = [
    { role: 'system', content: systemMessage },
    ...context,
    { role: 'user', content: userMessage }
  ];
  
  try {
    const response = await chat(messages);
    
    context.push({ role: 'user', content: userMessage });
    context.push({ role: 'assistant', content: response });
    
    if (context.length > 10) {
      context.splice(0, context.length - 10);
    }
    
    return response;
  } catch (error) {
    console.error('Contextual chat error:', error);
    return 'I apologize, but I encountered an error. Please try again.';
  }
}

function getSystemMessage(mode: string): string {
  const prompts: Record<string, string> = {
    maths: 'You are an expert mathematics tutor. Help students understand mathematical concepts, solve problems step-by-step, and provide clear explanations. Always show your work and reasoning.',
    coding: 'You are a skilled programming mentor. Help with coding problems, debug issues, explain concepts, and provide best practices. Support multiple programming languages and frameworks.',
    business: 'You are a business strategy coach. Provide insights on entrepreneurship, business planning, marketing, finance, and startup guidance. Focus on practical, actionable advice.',
    legal: 'You are a legal advisor specializing in explaining legal concepts. Help understand laws, regulations, and legal processes. Always remind users to consult qualified attorneys for specific legal advice.',
    literature: 'You are a literature guide and writing coach. Help with literary analysis, writing techniques, grammar, and creative expression. Provide constructive feedback and suggestions.'
  };
  
  return prompts[mode] || 'You are a helpful AI assistant focused on education and learning.';
}

export async function summarizePDF(content: string, type: 'short' | 'detailed' = 'short'): Promise<string> {
  const prompt = type === 'short' 
    ? `Provide a concise summary of this document in bullet points (max 200 words). Focus on key concepts, main ideas, and important details:\n\n${content}`
    : `Provide a comprehensive, detailed summary of this document. Analyze the core content and themes, ignoring metadata or document structure. Explain the main concepts like a tutor teaching a student. Include:\n\n1. Overview of main topics\n2. Key concepts and definitions\n3. Important details and examples\n4. Structure with clear headings\n5. Educational insights\n\nDocument content:\n\n${content}`;

  const messages: Message[] = [
    { role: 'system', content: 'You are an expert document analyzer and educational content creator. Focus on the educational value and core concepts, not document metadata.' },
    { role: 'user', content: prompt }
  ];

  try {
    return await chat(messages);
  } catch (error) {
    console.error('PDF summarization error:', error);
    return 'Unable to generate summary. Please try again.';
  }
}

export async function generateNotes(topic: string, context?: string): Promise<string> {
  const prompt = context 
    ? `Create comprehensive study notes for: ${topic}\n\nAdditional context: ${context}`
    : `Create comprehensive study notes for: ${topic}`;

  const messages: Message[] = [
    { role: 'system', content: 'You are an expert educator. Create well-structured, comprehensive study notes with clear headings, bullet points, and examples.' },
    { role: 'user', content: prompt }
  ];

  return await chat(messages);
}

export async function helpWithCode(code: string, language: string, problem: string): Promise<string> {
  const prompt = `Help with this ${language} code issue: ${problem}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\``;
  
  const messages: Message[] = [
    { role: 'system', content: 'You are a skilled programming mentor. Help debug code, explain issues, and provide solutions with clear explanations.' },
    { role: 'user', content: prompt }
  ];

  return await chat(messages);
}

export async function explainConcept(concept: string, level: string = 'intermediate'): Promise<string> {
  const prompt = `Explain this concept at a ${level} level: ${concept}`;
  
  const messages: Message[] = [
    { role: 'system', content: 'You are a patient tutor. Provide clear, step-by-step explanations with examples.' },
    { role: 'user', content: prompt }
  ];

  return await chat(messages);
}