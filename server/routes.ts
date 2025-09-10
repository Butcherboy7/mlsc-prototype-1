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
  
  // Get all universities from external API
  app.get('/api/institutions/universities', async (req, res) => {
    try {
      const country = req.query.country || 'USA';
      
      // Fetch from the universities API
      const response = await fetch(`https://api.ycd.dev/universities?country=${country}`);
      if (!response.ok) {
        // Fallback to local storage if API fails
        const universities = await storage.getUniversities();
        return res.json(universities);
      }
      
      const universities = await response.json();
      res.json(universities);
    } catch (error) {
      // Fallback to local storage
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
      const courses = await storage.getCoursesByUniversity(universityId);
      res.json(courses);
    } catch (error) {
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
