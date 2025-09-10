import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from 'multer';
import fetch from 'node-fetch';
import { parseSyllabusWithAI } from './lib/gemini';

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
        // Try working Indian university APIs
        try {
          // First try the Clueless Community College API which has comprehensive Indian data
          const response = await fetch('https://collegeapi.onrender.com/api/universities');
          if (response.ok) {
            const data = await response.json() as any;
            let universities = data.data || data.universities || data;
            
            // Ensure universities is an array
            if (Array.isArray(universities)) {
              // REMOVED: Mala Reddy University injection - only use real API data
              // Note: If user needs this university, it should be sourced from a real API
              
              // Format and sort alphabetically
              const formattedUniversities = universities
                .map((uni: any, index: number) => ({
                  id: index + 1,
                  name: uni.name || uni.university_name || uni.college_name,
                  country: 'India',
                  state: uni.state || uni['state-province'] || 'Unknown',
                  city: uni.city || uni.district || 'Unknown',
                  domains: uni.domains || [uni.website] || [],
                  web_pages: uni.web_pages || [uni.website] || []
                }))
                .filter(uni => uni.name) // Remove entries without names
                .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically
              
              return res.json(formattedUniversities);
            }
          }
        } catch (apiError) {
          console.log('Clueless Community API unavailable, trying other sources');
        }
        
        // Fallback to try another working API
        try {
          const response = await fetch('https://api.sampleapis.com/universities/universities');
          if (response.ok) {
            const universities = await response.json() as any[];
            const indianUnis = universities.filter(uni => 
              uni.country === 'India' || 
              (uni.name && uni.name.toLowerCase().includes('india'))
            );
            
            if (indianUnis.length > 0) {
              const formattedUniversities = indianUnis.map((uni: any, index: number) => ({
                id: index + 1,
                name: uni.name,
                country: 'India',
                state: uni.state_province || 'Unknown',
                city: uni.state_province || 'Unknown',
                domains: uni.domains || [],
                web_pages: uni.web_pages || []
              })).sort((a, b) => a.name.localeCompare(b.name));
              
              return res.json(formattedUniversities);
            }
          }
        } catch (secondaryError) {
          console.log('Secondary API also unavailable, using curated list');
        }
        
        // No hardcoded fallback - return error if APIs fail
        return res.status(503).json({ 
          error: 'University data APIs are temporarily unavailable. Please try again in a few minutes.',
          message: 'We rely on real-time university data and do not use placeholder content.'
        });
      } else {
        // Use hipolabs API for other countries
        try {
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
        } catch (apiError) {
          console.log('hipolabs API unavailable for country:', country);
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

  // Get university course data - REAL DATA ONLY
  app.get('/api/institutions/universities/:universityId/courses', async (req, res) => {
    try {
      // Course data is not available from real APIs currently
      // User should upload syllabus documents for real course information
      return res.status(503).json({
        error: 'Course data not available from real APIs',
        message: 'Please upload a syllabus document to get real course information for this university.',
        suggestion: 'Use the AI-powered syllabus parsing feature to extract course details from uploaded documents.',
        uploadEndpoint: '/api/institutions/upload'
      });
      
      /* REMOVED: All hardcoded course generation logic below
      const universityId = parseInt(req.params.universityId);
      const universityName = req.query.name as string || '';
      const universityLocation = req.query.location as string || 'Unknown';
      
      // Semester structures based on degree type
      const btechSemesters = [
        { "code": "1-1", "syllabus": [] },
        { "code": "1-2", "syllabus": [] },
        { "code": "2-1", "syllabus": [] },
        { "code": "2-2", "syllabus": [] },
        { "code": "3-1", "syllabus": [] },
        { "code": "3-2", "syllabus": [] },
        { "code": "4-1", "syllabus": [] },
        { "code": "4-2", "syllabus": [] }
      ];
      
      const threYearSemesters = [
        { "code": "1-1", "syllabus": [] },
        { "code": "1-2", "syllabus": [] },
        { "code": "2-1", "syllabus": [] },
        { "code": "2-2", "syllabus": [] },
        { "code": "3-1", "syllabus": [] },
        { "code": "3-2", "syllabus": [] }
      ];
      
      const mbbsSemesters = [
        { "code": "1-1", "syllabus": [] },
        { "code": "1-2", "syllabus": [] },
        { "code": "2-1", "syllabus": [] },
        { "code": "2-2", "syllabus": [] },
        { "code": "3-1", "syllabus": [] },
        { "code": "3-2", "syllabus": [] },
        { "code": "4-1", "syllabus": [] },
        { "code": "4-2", "syllabus": [] },
        { "code": "5-1", "syllabus": [] }
      ];
      
      const mbaSemesters = [
        { "code": "1-1", "syllabus": [] },
        { "code": "1-2", "syllabus": [] },
        { "code": "2-1", "syllabus": [] },
        { "code": "2-2", "syllabus": [] }
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
            "semesters": btechSemesters // B.Tech is 4 years (8 semesters)
          },
          {
            "name": "Electronics and Communication Engineering",
            "degree": "B.Tech",
            "departments": ["ECE", "VLSI", "Embedded Systems"],
            "semesters": btechSemesters
          },
          {
            "name": "Mechanical Engineering",
            "degree": "B.Tech",
            "departments": ["Mechanical", "Automotive", "Manufacturing"],
            "semesters": btechSemesters
          },
          {
            "name": "Civil Engineering",
            "degree": "B.Tech",
            "departments": ["Civil", "Structural", "Environmental"],
            "semesters": btechSemesters
          }
        ];
      } else if (name.includes('iim') || name.includes('indian institute of management')) {
        courses = [
          {
            "name": "Master of Business Administration",
            "degree": "MBA",
            "departments": ["Finance", "Marketing", "Operations", "HR"],
            "semesters": mbaSemesters // MBA is 2 years (4 semesters)
          }
        ];
      } else if (name.includes('aiims') || name.includes('medical') || name.includes('hospital')) {
        courses = [
          {
            "name": "Bachelor of Medicine and Surgery",
            "degree": "MBBS",
            "departments": ["General Medicine", "Surgery", "Pediatrics"],
            "semesters": mbbsSemesters // MBBS is 5.5 years (9 semesters)
          }
        ];
      } else if (name.includes('law')) {
        courses = [
          {
            "name": "Bachelor of Laws",
            "degree": "LLB",
            "departments": ["Constitutional Law", "Criminal Law", "Corporate Law"],
            "semesters": threYearSemesters // LLB is 3 years (6 semesters)
          }
        ];
      } else if (name.includes('mala reddy')) {
        courses = [
          {
            "name": "Computer Science Engineering",
            "degree": "B.Tech",
            "departments": ["CSE", "IT", "AI & Data Science"],
            "semesters": btechSemesters // B.Tech is 4 years (8 semesters)
          },
          {
            "name": "Electronics and Communication Engineering",
            "degree": "B.Tech",
            "departments": ["ECE", "VLSI", "Communication Systems"],
            "semesters": btechSemesters
          },
          {
            "name": "Mechanical Engineering",
            "degree": "B.Tech",
            "departments": ["Mechanical", "Thermal", "Manufacturing"],
            "semesters": btechSemesters
          },
          {
            "name": "Civil Engineering",
            "degree": "B.Tech",
            "departments": ["Civil", "Structural", "Transportation"],
            "semesters": btechSemesters
          },
          {
            "name": "Master of Business Administration",
            "degree": "MBA",
            "departments": ["Finance", "Marketing", "HR", "Operations"],
            "semesters": mbaSemesters
          }
        ];
      } else {
        // Default courses for general universities
        courses = [
          {
            "name": "Computer Science Engineering",
            "degree": "B.Tech",
            "departments": ["CSE", "IT", "Software Engineering"],
            "semesters": btechSemesters // B.Tech is 4 years (8 semesters)
          },
          {
            "name": "Bachelor of Business Administration",
            "degree": "BBA",
            "departments": ["Finance", "Marketing", "HR"],
            "semesters": threYearSemesters // BBA is 3 years (6 semesters)
          },
          {
            "name": "Bachelor of Science",
            "degree": "BSc",
            "departments": ["Physics", "Chemistry", "Mathematics"],
            "semesters": threYearSemesters // BSc is 3 years (6 semesters)
          }
        ];
      }
      
      // REMOVED: AI course enhancement to prevent fabricated data
      // We only use predefined course structures based on university type
      
      const response = {
        "university": universityName,
        "location": universityLocation,
        "courses": courses
      */ // End of removed hardcoded course logic
    } catch (error) {
      console.error('Error checking course data availability:', error);
      return res.status(503).json({ 
        error: 'Course data service unavailable',
        message: 'Please upload a syllabus document for real course information.'
      });
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

  // Parse syllabus with extracted text
  app.post('/api/institutions/upload', async (req, res) => {
    try {
      const { extractedText, semesterId, universityName, filename } = req.body;
      
      if (!extractedText || typeof extractedText !== 'string') {
        return res.status(400).json({ error: 'No extracted text provided. Please ensure the document contains readable text.' });
      }

      // Create upload record with text instead of file
      const upload = await storage.createUpload({
        semesterId: parseInt(semesterId),
        filename: filename || 'uploaded_document.pdf',
        fileType: 'application/pdf',
        filePath: '', // No file path since we're using extracted text
        status: 'pending',
      });

      // Use AI to parse the syllabus text
      const parsedData = await parseSyllabusWithAI(extractedText, universityName || 'Unknown University');

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
      console.error('Syllabus parsing error:', error);
      res.status(500).json({ 
        error: 'Failed to process syllabus text', 
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // REMOVED: AI-enhanced course data endpoint that returned dummy data
  // This endpoint violated the "real data only" requirement
  // Users should upload syllabus documents for real course information

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
