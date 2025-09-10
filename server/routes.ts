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
        // Try hipolabs API first, but have comprehensive Indian universities as fallback
        try {
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
        } catch (apiError) {
          console.log('hipolabs API unavailable, using comprehensive Indian university list');
        }
        
        // Comprehensive fallback list of major Indian universities
        const indianUniversities = [
          // IITs
          { id: 1, name: 'Indian Institute of Technology Bombay', country: 'India', state: 'Maharashtra', city: 'Mumbai', domains: ['iitb.ac.in'], web_pages: ['https://www.iitb.ac.in'] },
          { id: 2, name: 'Indian Institute of Technology Delhi', country: 'India', state: 'Delhi', city: 'New Delhi', domains: ['iitd.ac.in'], web_pages: ['https://www.iitd.ac.in'] },
          { id: 3, name: 'Indian Institute of Technology Kanpur', country: 'India', state: 'Uttar Pradesh', city: 'Kanpur', domains: ['iitk.ac.in'], web_pages: ['https://www.iitk.ac.in'] },
          { id: 4, name: 'Indian Institute of Technology Kharagpur', country: 'India', state: 'West Bengal', city: 'Kharagpur', domains: ['iitkgp.ac.in'], web_pages: ['https://www.iitkgp.ac.in'] },
          { id: 5, name: 'Indian Institute of Technology Madras', country: 'India', state: 'Tamil Nadu', city: 'Chennai', domains: ['iitm.ac.in'], web_pages: ['https://www.iitm.ac.in'] },
          { id: 6, name: 'Indian Institute of Technology Roorkee', country: 'India', state: 'Uttarakhand', city: 'Roorkee', domains: ['iitr.ac.in'], web_pages: ['https://www.iitr.ac.in'] },
          { id: 7, name: 'Indian Institute of Technology Guwahati', country: 'India', state: 'Assam', city: 'Guwahati', domains: ['iitg.ac.in'], web_pages: ['https://www.iitg.ac.in'] },
          { id: 8, name: 'Indian Institute of Technology Hyderabad', country: 'India', state: 'Telangana', city: 'Hyderabad', domains: ['iith.ac.in'], web_pages: ['https://www.iith.ac.in'] },
          { id: 9, name: 'Indian Institute of Technology Bhubaneswar', country: 'India', state: 'Odisha', city: 'Bhubaneswar', domains: ['iitbbs.ac.in'], web_pages: ['https://www.iitbbs.ac.in'] },
          { id: 10, name: 'Indian Institute of Technology Gandhinagar', country: 'India', state: 'Gujarat', city: 'Gandhinagar', domains: ['iitgn.ac.in'], web_pages: ['https://www.iitgn.ac.in'] },
          
          // IIMs
          { id: 11, name: 'Indian Institute of Management Ahmedabad', country: 'India', state: 'Gujarat', city: 'Ahmedabad', domains: ['iima.ac.in'], web_pages: ['https://www.iima.ac.in'] },
          { id: 12, name: 'Indian Institute of Management Bangalore', country: 'India', state: 'Karnataka', city: 'Bangalore', domains: ['iimb.ac.in'], web_pages: ['https://www.iimb.ac.in'] },
          { id: 13, name: 'Indian Institute of Management Calcutta', country: 'India', state: 'West Bengal', city: 'Kolkata', domains: ['iimcal.ac.in'], web_pages: ['https://www.iimcal.ac.in'] },
          { id: 14, name: 'Indian Institute of Management Lucknow', country: 'India', state: 'Uttar Pradesh', city: 'Lucknow', domains: ['iiml.ac.in'], web_pages: ['https://www.iiml.ac.in'] },
          { id: 15, name: 'Indian Institute of Management Indore', country: 'India', state: 'Madhya Pradesh', city: 'Indore', domains: ['iimidr.ac.in'], web_pages: ['https://www.iimidr.ac.in'] },
          
          // AIIMS
          { id: 16, name: 'All India Institute of Medical Sciences Delhi', country: 'India', state: 'Delhi', city: 'New Delhi', domains: ['aiims.ac.in'], web_pages: ['https://www.aiims.ac.in'] },
          { id: 17, name: 'All India Institute of Medical Sciences Bhubaneswar', country: 'India', state: 'Odisha', city: 'Bhubaneswar', domains: ['aiimsbhubaneswar.ac.in'], web_pages: ['https://www.aiimsbhubaneswar.ac.in'] },
          { id: 18, name: 'All India Institute of Medical Sciences Jodhpur', country: 'India', state: 'Rajasthan', city: 'Jodhpur', domains: ['aiimsjodhpur.ac.in'], web_pages: ['https://www.aiimsjodhpur.ac.in'] },
          
          // NITs
          { id: 19, name: 'National Institute of Technology Tiruchirappalli', country: 'India', state: 'Tamil Nadu', city: 'Tiruchirappalli', domains: ['nitt.edu'], web_pages: ['https://www.nitt.edu'] },
          { id: 20, name: 'National Institute of Technology Warangal', country: 'India', state: 'Telangana', city: 'Warangal', domains: ['nitw.ac.in'], web_pages: ['https://www.nitw.ac.in'] },
          { id: 21, name: 'National Institute of Technology Rourkela', country: 'India', state: 'Odisha', city: 'Rourkela', domains: ['nitrkl.ac.in'], web_pages: ['https://www.nitrkl.ac.in'] },
          { id: 22, name: 'National Institute of Technology Surathkal', country: 'India', state: 'Karnataka', city: 'Surathkal', domains: ['nitk.ac.in'], web_pages: ['https://www.nitk.ac.in'] },
          
          // Central Universities
          { id: 23, name: 'Jawaharlal Nehru University', country: 'India', state: 'Delhi', city: 'New Delhi', domains: ['jnu.ac.in'], web_pages: ['https://www.jnu.ac.in'] },
          { id: 24, name: 'University of Delhi', country: 'India', state: 'Delhi', city: 'New Delhi', domains: ['du.ac.in'], web_pages: ['https://www.du.ac.in'] },
          { id: 25, name: 'Banaras Hindu University', country: 'India', state: 'Uttar Pradesh', city: 'Varanasi', domains: ['bhu.ac.in'], web_pages: ['https://www.bhu.ac.in'] },
          { id: 26, name: 'Aligarh Muslim University', country: 'India', state: 'Uttar Pradesh', city: 'Aligarh', domains: ['amu.ac.in'], web_pages: ['https://www.amu.ac.in'] },
          { id: 27, name: 'University of Hyderabad', country: 'India', state: 'Telangana', city: 'Hyderabad', domains: ['uohyd.ac.in'], web_pages: ['https://www.uohyd.ac.in'] },
          { id: 28, name: 'Jadavpur University', country: 'India', state: 'West Bengal', city: 'Kolkata', domains: ['jaduniv.edu.in'], web_pages: ['https://www.jaduniv.edu.in'] },
          
          // State Universities
          { id: 29, name: 'Anna University', country: 'India', state: 'Tamil Nadu', city: 'Chennai', domains: ['annauniv.edu'], web_pages: ['https://www.annauniv.edu'] },
          { id: 30, name: 'University of Mumbai', country: 'India', state: 'Maharashtra', city: 'Mumbai', domains: ['mu.ac.in'], web_pages: ['https://www.mu.ac.in'] },
          { id: 31, name: 'University of Pune', country: 'India', state: 'Maharashtra', city: 'Pune', domains: ['unipune.ac.in'], web_pages: ['https://www.unipune.ac.in'] },
          { id: 32, name: 'Bangalore University', country: 'India', state: 'Karnataka', city: 'Bangalore', domains: ['bangaloreuniversity.ac.in'], web_pages: ['https://www.bangaloreuniversity.ac.in'] },
          { id: 33, name: 'University of Calcutta', country: 'India', state: 'West Bengal', city: 'Kolkata', domains: ['caluniv.ac.in'], web_pages: ['https://www.caluniv.ac.in'] },
          { id: 34, name: 'Gujarat University', country: 'India', state: 'Gujarat', city: 'Ahmedabad', domains: ['gujaratuniversity.ac.in'], web_pages: ['https://www.gujaratuniversity.ac.in'] },
          { id: 35, name: 'Osmania University', country: 'India', state: 'Telangana', city: 'Hyderabad', domains: ['osmania.ac.in'], web_pages: ['https://www.osmania.ac.in'] },
          
          // Private Universities
          { id: 36, name: 'Birla Institute of Technology and Science Pilani', country: 'India', state: 'Rajasthan', city: 'Pilani', domains: ['bits-pilani.ac.in'], web_pages: ['https://www.bits-pilani.ac.in'] },
          { id: 37, name: 'Vellore Institute of Technology', country: 'India', state: 'Tamil Nadu', city: 'Vellore', domains: ['vit.ac.in'], web_pages: ['https://www.vit.ac.in'] },
          { id: 38, name: 'Manipal Academy of Higher Education', country: 'India', state: 'Karnataka', city: 'Manipal', domains: ['manipal.edu'], web_pages: ['https://www.manipal.edu'] },
          { id: 39, name: 'Amity University', country: 'India', state: 'Uttar Pradesh', city: 'Noida', domains: ['amity.edu'], web_pages: ['https://www.amity.edu'] },
          { id: 40, name: 'SRM Institute of Science and Technology', country: 'India', state: 'Tamil Nadu', city: 'Chennai', domains: ['srmist.edu.in'], web_pages: ['https://www.srmist.edu.in'] },
          { id: 41, name: 'Lovely Professional University', country: 'India', state: 'Punjab', city: 'Phagwara', domains: ['lpu.ac.in'], web_pages: ['https://www.lpu.ac.in'] },
          { id: 42, name: 'Christ University', country: 'India', state: 'Karnataka', city: 'Bangalore', domains: ['christuniversity.in'], web_pages: ['https://www.christuniversity.in'] },
          { id: 43, name: 'Symbiosis International University', country: 'India', state: 'Maharashtra', city: 'Pune', domains: ['siu.edu.in'], web_pages: ['https://www.siu.edu.in'] },
          
          // Deemed Universities
          { id: 44, name: 'Indian Statistical Institute', country: 'India', state: 'West Bengal', city: 'Kolkata', domains: ['isical.ac.in'], web_pages: ['https://www.isical.ac.in'] },
          { id: 45, name: 'Tata Institute of Fundamental Research', country: 'India', state: 'Maharashtra', city: 'Mumbai', domains: ['tifr.res.in'], web_pages: ['https://www.tifr.res.in'] },
          { id: 46, name: 'Indian Institute of Science', country: 'India', state: 'Karnataka', city: 'Bangalore', domains: ['iisc.ac.in'], web_pages: ['https://www.iisc.ac.in'] },
          { id: 47, name: 'Indian Institute of Science Education and Research Pune', country: 'India', state: 'Maharashtra', city: 'Pune', domains: ['iiserpune.ac.in'], web_pages: ['https://www.iiserpune.ac.in'] },
          { id: 48, name: 'Homi Bhabha National Institute', country: 'India', state: 'Maharashtra', city: 'Mumbai', domains: ['hbni.ac.in'], web_pages: ['https://www.hbni.ac.in'] },
          
          // More Engineering Colleges
          { id: 49, name: 'Delhi Technological University', country: 'India', state: 'Delhi', city: 'New Delhi', domains: ['dtu.ac.in'], web_pages: ['https://www.dtu.ac.in'] },
          { id: 50, name: 'Netaji Subhas University of Technology', country: 'India', state: 'Delhi', city: 'New Delhi', domains: ['nsut.ac.in'], web_pages: ['https://www.nsut.ac.in'] }
        ];
        
        return res.json(indianUniversities);
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
