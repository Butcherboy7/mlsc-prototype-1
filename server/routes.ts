import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from 'multer';
import fetch from 'node-fetch';

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Institution Mode routes
  
  // Get all universities/colleges from Indian APIs
  app.get('/api/institutions/universities', async (req, res) => {
    try {
      const country = (req.query.country as string) || 'India';
      const state = req.query.state as string;
      
      if (country === 'India') {
        // Use Indian Colleges API for comprehensive data
        let apiUrl = 'https://colleges-api.onrender.com/colleges';
        if (state) {
          apiUrl += `/${encodeURIComponent(state)}`;
        }
        apiUrl += '?limit=100'; // Get more results
        
        const response = await fetch(apiUrl);
        if (response.ok) {
          const data = await response.json() as any;
          const formattedColleges = data.colleges?.map((college: any, index: number) => ({
            id: index + 1,
            name: college.Name,
            country: 'India',
            state: college.State,
            city: college.City,
            address: `${college.Address_line1 || ''} ${college.Address_line2 || ''}`.trim(),
            type: 'college' // We'll determine this from the name
          })) || [];
          
          return res.json(formattedColleges);
        }
        
        // Fallback to CollegeAPI for engineering/medical colleges
        try {
          const engResponse = await fetch('https://college-api-college-api.onrender.com/engineering_colleges');
          if (engResponse.ok) {
            const engData = await engResponse.json() as any[];
            const formattedEngColleges = engData.map((college: any, index: number) => ({
              id: index + 1000, // Offset to avoid ID conflicts
              name: college.college_name || college.name,
              country: 'India',
              state: college.state,
              city: college.city,
              type: 'engineering'
            }));
            return res.json(formattedEngColleges);
          }
        } catch (e) {
          // Continue to fallback
        }
      } else {
        // Use YCD API for other countries
        const response = await fetch(`https://api.ycd.dev/universities?country=${country}`);
        if (response.ok) {
          const universities = await response.json();
          return res.json(universities);
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

  // Get courses by university
  app.get('/api/institutions/universities/:universityId/courses', async (req, res) => {
    try {
      const universityId = parseInt(req.params.universityId);
      const universityName = req.query.name as string || '';
      const universityType = req.query.type as string || '';
      
      // Generate courses based on university type and name
      let courses = [];
      
      // Determine university type from name if not provided
      const name = universityName.toLowerCase();
      let detectedType = universityType;
      
      if (!detectedType) {
        if (name.includes('iit') || name.includes('indian institute of technology')) {
          detectedType = 'engineering';
        } else if (name.includes('iim') || name.includes('indian institute of management')) {
          detectedType = 'management';
        } else if (name.includes('aiims') || name.includes('medical') || name.includes('hospital')) {
          detectedType = 'medical';
        } else if (name.includes('engineering') || name.includes('technology') || name.includes('polytechnic')) {
          detectedType = 'engineering';
        } else if (name.includes('management') || name.includes('business')) {
          detectedType = 'management';
        } else if (name.includes('law')) {
          detectedType = 'law';
        } else if (name.includes('pharmacy')) {
          detectedType = 'pharmacy';
        } else if (name.includes('dental')) {
          detectedType = 'dental';
        } else if (name.includes('architecture')) {
          detectedType = 'architecture';
        } else {
          detectedType = 'general';
        }
      }
      
      // Generate courses based on type
      switch (detectedType) {
        case 'engineering':
          courses = [
            { id: 1, name: 'Computer Science Engineering', code: 'CSE', department: 'Engineering', universityId },
            { id: 2, name: 'Electronics and Communication', code: 'ECE', department: 'Engineering', universityId },
            { id: 3, name: 'Mechanical Engineering', code: 'ME', department: 'Engineering', universityId },
            { id: 4, name: 'Civil Engineering', code: 'CE', department: 'Engineering', universityId },
            { id: 5, name: 'Electrical Engineering', code: 'EE', department: 'Engineering', universityId },
            { id: 6, name: 'Information Technology', code: 'IT', department: 'Engineering', universityId },
            { id: 7, name: 'Chemical Engineering', code: 'ChE', department: 'Engineering', universityId },
            { id: 8, name: 'Aerospace Engineering', code: 'AE', department: 'Engineering', universityId }
          ];
          break;
        case 'medical':
          courses = [
            { id: 11, name: 'Bachelor of Medicine and Surgery', code: 'MBBS', department: 'Medical', universityId },
            { id: 12, name: 'Bachelor of Dental Surgery', code: 'BDS', department: 'Medical', universityId },
            { id: 13, name: 'Bachelor of Physiotherapy', code: 'BPT', department: 'Medical', universityId },
            { id: 14, name: 'Bachelor of Nursing', code: 'BSc Nursing', department: 'Medical', universityId },
            { id: 15, name: 'Bachelor of Pharmacy', code: 'B.Pharm', department: 'Medical', universityId },
            { id: 16, name: 'Master of Surgery', code: 'MS', department: 'Medical', universityId }
          ];
          break;
        case 'management':
          courses = [
            { id: 21, name: 'Master of Business Administration', code: 'MBA', department: 'Management', universityId },
            { id: 22, name: 'Bachelor of Business Administration', code: 'BBA', department: 'Management', universityId },
            { id: 23, name: 'Post Graduate Diploma in Management', code: 'PGDM', department: 'Management', universityId },
            { id: 24, name: 'Bachelor of Commerce', code: 'B.Com', department: 'Commerce', universityId },
            { id: 25, name: 'Master of Commerce', code: 'M.Com', department: 'Commerce', universityId }
          ];
          break;
        case 'law':
          courses = [
            { id: 31, name: 'Bachelor of Laws', code: 'LLB', department: 'Law', universityId },
            { id: 32, name: 'Master of Laws', code: 'LLM', department: 'Law', universityId },
            { id: 33, name: 'Integrated BA LLB', code: 'BA LLB', department: 'Law', universityId },
            { id: 34, name: 'Integrated BBA LLB', code: 'BBA LLB', department: 'Law', universityId }
          ];
          break;
        case 'pharmacy':
          courses = [
            { id: 41, name: 'Bachelor of Pharmacy', code: 'B.Pharm', department: 'Pharmacy', universityId },
            { id: 42, name: 'Master of Pharmacy', code: 'M.Pharm', department: 'Pharmacy', universityId },
            { id: 43, name: 'Doctor of Pharmacy', code: 'Pharm.D', department: 'Pharmacy', universityId }
          ];
          break;
        default:
          courses = [
            { id: 51, name: 'Bachelor of Arts', code: 'BA', department: 'Arts', universityId },
            { id: 52, name: 'Bachelor of Science', code: 'BSc', department: 'Science', universityId },
            { id: 53, name: 'Master of Arts', code: 'MA', department: 'Arts', universityId },
            { id: 54, name: 'Master of Science', code: 'MSc', department: 'Science', universityId },
            { id: 55, name: 'Bachelor of Computer Applications', code: 'BCA', department: 'Computer Science', universityId },
            { id: 56, name: 'Master of Computer Applications', code: 'MCA', department: 'Computer Science', universityId }
          ];
      }
      
      res.json(courses);
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

      // Simulate AI parsing (in real implementation, this would use Gemini AI)
      const mockParsedData = {
        subjects: [
          {
            name: 'Data Structures and Algorithms',
            code: 'CS301',
            credits: 3,
            instructor: 'Dr. Smith',
          },
          {
            name: 'Database Systems',
            code: 'CS302',
            credits: 3,
            instructor: 'Dr. Johnson',
          },
        ],
        timetable: [
          {
            subject: 'Data Structures and Algorithms',
            day: 'Monday',
            startTime: '09:00',
            endTime: '10:30',
            location: 'Room A101',
          },
        ],
        examCalendar: [
          {
            subject: 'Data Structures and Algorithms',
            type: 'Midterm',
            date: '2024-11-15',
            duration: 120,
            location: 'Hall A',
          },
        ],
      };

      // Update upload with parsed data
      const updatedUpload = await storage.updateUploadStatus(
        upload.id, 
        'processed', 
        mockParsedData
      );

      res.json({ 
        success: true, 
        uploadId: upload.id,
        parsedData: mockParsedData 
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to process upload' });
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
