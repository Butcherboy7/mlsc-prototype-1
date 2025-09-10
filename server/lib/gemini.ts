import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function parseSyllabusWithAI(filePath: string, universityName: string): Promise<any> {
  try {
    // Read the uploaded file
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    const prompt = `You are an expert educational data parser. Analyze this syllabus document and extract course information.

University: ${universityName}

Please parse the following syllabus document and return ONLY valid JSON in this exact format:
{
  "university": "University/College Name",
  "location": "City, State",
  "courses": [
    {
      "name": "Course/Program Name",
      "degree": "B.Tech | M.Tech | MBA | etc.",
      "departments": ["CSE", "ECE", "Mechanical"],
      "semesters": [
        { "code": "1-1", "syllabus": [] },
        { "code": "1-2", "syllabus": [] },
        { "code": "2-1", "syllabus": [] },
        { "code": "2-2", "syllabus": [] },
        { "code": "3-1", "syllabus": [] },
        { "code": "3-2", "syllabus": [] },
        { "code": "4-1", "syllabus": [] },
        { "code": "4-2", "syllabus": [] }
      ]
    }
  ]
}

Extract as much information as possible from the document. If you can't find specific information, make reasonable assumptions based on the university name and course type.

Syllabus Document Content:
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
    // Return default structure if AI parsing fails
    return {
      university: universityName,
      location: "Unknown",
      courses: [
        {
          name: "General Course",
          degree: "Undergraduate",
          departments: ["General"],
          semesters: [
            { "code": "1-1", "syllabus": [] },
            { "code": "1-2", "syllabus": [] },
            { "code": "2-1", "syllabus": [] },
            { "code": "2-2", "syllabus": [] },
            { "code": "3-1", "syllabus": [] },
            { "code": "3-2", "syllabus": [] },
            { "code": "4-1", "syllabus": [] },
            { "code": "4-2", "syllabus": [] }
          ]
        }
      ]
    };
  }
}

export async function enhanceCourseData(basicCourseData: any, universityWebPages: string[]): Promise<any> {
  try {
    if (!universityWebPages || universityWebPages.length === 0) {
      return basicCourseData;
    }

    const prompt = `You are an expert at extracting university course information. Based on this university's website URLs and the basic course data provided, enhance the course information with more detailed departments and course structures.

University websites: ${universityWebPages.join(', ')}
Current course data: ${JSON.stringify(basicCourseData, null, 2)}

Please return enhanced course data in the same JSON format, adding more specific departments and course names based on what would typically be offered at this type of institution.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        responseMimeType: "application/json"
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      return basicCourseData;
    }
  } catch (error) {
    console.error('Course enhancement error:', error);
    return basicCourseData;
  }
}