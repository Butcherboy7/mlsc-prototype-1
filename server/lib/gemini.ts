import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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

// REMOVED: enhanceCourseData function to prevent AI-generated fake content
// This ensures we only use real data from APIs or uploaded documents