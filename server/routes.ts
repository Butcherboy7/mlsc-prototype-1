import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from 'multer';
import fetch from 'node-fetch';
import { parseSyllabusWithAI, enhanceCourseData } from './lib/gemini';

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Institution Mode routes
  
  // Get all universities from hipolabs API
  app.get('/api/institutions/universities', async (req, res) => {
    try {
      const country = (req.query.country as string) || 'India';
      
      if (country === 'India') {
        // Use hipolabs API for comprehensive university data
        const response = await fetch('https://universities.hipolabs.com/search?country=India');
        if (response.ok) {
          const universities = await response.json() as any[];
          const formattedUniversities = universities.map((uni: any, index: number) => ({
            id: index + 1,
            name: uni.name,
            country: uni.country,
            state: uni['state-province'] || 'Unknown',
            city: uni['state-province'] || 'Unknown',
            domains: uni.domains || [],
            web_pages: uni.web_pages || [],
            alpha_two_code: uni.alpha_two_code
          }));
          
          return res.json(formattedUniversities);
        }
      } else {
        // Use hipolabs API for other countries
        const response = await fetch(`https://universities.hipolabs.com/search?country=${country}`);
        if (response.ok) {
          const universities = await response.json() as any[];
          const formattedUniversities = universities.map((uni: any, index: number) => ({
            id: index + 1,
            name: uni.name,
            country: uni.country,
            state: uni['state-province'] || 'Unknown',
            city: uni['state-province'] || 'Unknown',
            domains: uni.domains || [],
            web_pages: uni.web_pages || [],
            alpha_two_code: uni.alpha_two_code
          }));
          return res.json(formattedUniversities);
        }
      }
      
      // Final fallback to local storage
      const universities = await storage.getUniversities();
      res.json(universities);
    } catch (error) {
      console.error('Error fetching universities:', error);
      try {
        const universities = await storage.getUniversities();
        res.json(universities);
      } catch (fallbackError) {
        res.status(500).json({ error: 'Failed to fetch universities' });
      }
    }
  });

  // Get university course data in the specified format
  app.get('/api/institutions/universities/:universityId/courses', async (req, res) => {
    try {
      const universityId = parseInt(req.params.universityId);
      const universityName = req.query.name as string || '';
      const universityLocation = req.query.location as string || 'Unknown';
      
      // Standard semester structure
      const standardSemesters = [
        { "code": "1-1", "syllabus": [] },
        { "code": "1-2", "syllabus": [] },
        { "code": "2-1", "syllabus": [] },
        { "code": "2-2", "syllabus": [] },
        { "code": "3-1", "syllabus": [] },
        { "code": "3-2", "syllabus": [] },
        { "code": "4-1", "syllabus": [] },
        { "code": "4-2", "syllabus": [] }
      ];
      
      // Get university info from the universities array if available
      let universityData = null;
      try {
        const universityResponse = await fetch(`https://universities.hipolabs.com/search?country=${req.query.country || 'India'}`);
        if (universityResponse.ok) {
          const universities = await universityResponse.json() as any[];
          universityData = universities.find((uni: any) => uni.name === universityName);
        }
      } catch (error) {
        console.log('Could not fetch university data for enhancement:', error);
      }
      
      // Determine university type from name
      const name = universityName.toLowerCase();
      let courses = [];
      
      if (name.includes('iit') || name.includes('indian institute of technology')) {
        courses = [
          {
            "name": "Computer Science Engineering",
            "degree": "B.Tech",
            "departments": ["CSE", "AI & ML", "Data Science"],
            "semesters": standardSemesters
          },
          {
            "name": "Electronics and Communication Engineering",
            "degree": "B.Tech",
            "departments": ["ECE", "VLSI", "Embedded Systems"],
            "semesters": standardSemesters
          },
          {
            "name": "Mechanical Engineering",
            "degree": "B.Tech",
            "departments": ["Mechanical", "Automotive", "Manufacturing"],
            "semesters": standardSemesters
          }
        ];
      } else if (name.includes('iim') || name.includes('indian institute of management')) {
        courses = [
          {
            "name": "Master of Business Administration",
            "degree": "MBA",
            "departments": ["Finance", "Marketing", "Operations", "HR"],
            "semesters": standardSemesters.slice(0, 4) // MBA is typically 2 years
          }
        ];
      } else if (name.includes('aiims') || name.includes('medical') || name.includes('hospital')) {
        courses = [
          {
            "name": "Bachelor of Medicine and Surgery",
            "degree": "MBBS",
            "departments": ["General Medicine", "Surgery", "Pediatrics"],
            "semesters": [...standardSemesters, { "code": "5-1", "syllabus": [] }, { "code": "5-2", "syllabus": [] }] // MBBS is 5.5 years
          }
        ];
      } else if (name.includes('law')) {
        courses = [
          {
            "name": "Bachelor of Laws",
            "degree": "LLB",
            "departments": ["Constitutional Law", "Criminal Law", "Corporate Law"],
            "semesters": standardSemesters.slice(0, 6) // LLB is typically 3 years
          }
        ];
      } else {
        // Default courses for general universities
        courses = [
          {
            "name": "Computer Science Engineering",
            "degree": "B.Tech",
            "departments": ["CSE", "IT", "Software Engineering"],
            "semesters": standardSemesters
          },
          {
            "name": "Bachelor of Business Administration",
            "degree": "BBA",
            "departments": ["Finance", "Marketing", "HR"],
            "semesters": standardSemesters.slice(0, 6) // BBA is typically 3 years
          },
          {
            "name": "Bachelor of Science",
            "degree": "BSc",
            "departments": ["Physics", "Chemistry", "Mathematics"],
            "semesters": standardSemesters.slice(0, 6) // BSc is typically 3 years
          }
        ];
      }
      
      // Try to enhance course data using AI if university web pages are available
      if (universityData?.web_pages && universityData.web_pages.length > 0) {
        try {
          const enhancedData = await enhanceCourseData({
            university: universityName,
            location: universityLocation,
            courses: courses
          }, universityData.web_pages);
          courses = enhancedData.courses;
        } catch (enhanceError) {
          console.log('Could not enhance course data, using default:', enhanceError);
        }
      }
      
      const response = {
        "university": universityName,
        "location": universityLocation,
        "courses": courses
      };
      
      res.json(response);
    } catch (error) {
      console.error('Error fetching courses:', error);
      res.status(500).json({ error: 'Failed to fetch courses' });
    }
  });

  // Get semesters by course
  app.get('/api/institutions/courses/:courseId/semesters', async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const semesters = await storage.getSemestersByCourse(courseId);
      res.json(semesters);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch semesters' });
    }
  });

  // Check if syllabus exists
  app.get('/api/institutions/syllabus/:universityId/:courseId/:semesterId', async (req, res) => {
    try {
      const { universityId, courseId, semesterId } = req.params;
      const syllabusData = await storage.getSyllabusData(
        parseInt(universityId),
        parseInt(courseId), 
        parseInt(semesterId)
      );
      res.json({ exists: !!syllabusData, data: syllabusData });
    } catch (error) {
      res.status(500).json({ error: 'Failed to check syllabus' });
    }
  });

  // Upload and parse syllabus
  app.post('/api/institutions/upload', upload.single('syllabus'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { semesterId } = req.body;
      
      // Create upload record
      const upload = await storage.createUpload({
        semesterId: parseInt(semesterId),
        filename: req.file.originalname,
        fileType: req.file.mimetype,
        filePath: req.file.path,
        status: 'pending',
      });

      // Use AI to parse the syllabus document
      const { universityName } = req.body;
      const parsedData = await parseSyllabusWithAI(req.file.path, universityName || 'Unknown University');

      // Update upload with parsed data
      const updatedUpload = await storage.updateUploadStatus(
        upload.id, 
        'processed', 
        parsedData
      );

      res.json({ 
        success: true, 
        uploadId: upload.id,
        parsedData: parsedData 
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to process upload' });
    }
  });

  // AI-enhanced course data when API data is insufficient
  app.post('/api/institutions/ai-parse', async (req, res) => {
    try {
      const { universityName, universityLocation, webPages } = req.body;
      
      if (!universityName) {
        return res.status(400).json({ error: 'University name is required' });
      }
      
      // Use AI to generate enhanced course data based on university info
      const baseData = {
        university: universityName,
        location: universityLocation || 'Unknown',
        courses: [
          {
            "name": "General Program",
            "degree": "Undergraduate",
            "departments": ["General"],
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
      };
      
      // Enhance with AI if web pages are available
      let enhancedData = baseData;
      if (webPages && webPages.length > 0) {
        try {
          enhancedData = await enhanceCourseData(baseData, webPages);
        } catch (aiError) {
          console.log('AI enhancement failed, using base data:', aiError);
        }
      }
      
      res.json(enhancedData);
    } catch (error) {
      console.error('Error in AI parse:', error);
      res.status(500).json({ error: 'Failed to generate course data' });
    }
  });

  // Confirm and save syllabus
  app.post('/api/institutions/confirm', async (req, res) => {
    try {
      const { uploadId, confirmedData } = req.body;
      
      const updatedUpload = await storage.updateUploadStatus(
        uploadId,
        'confirmed',
        confirmedData
      );

      res.json({ success: true, upload: updatedUpload });
    } catch (error) {
      res.status(500).json({ error: 'Failed to confirm syllabus' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
