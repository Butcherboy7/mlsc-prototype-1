import { 
  users, 
  universities,
  courses,
  semesters,
  subjects,
  uploads,
  type User, 
  type InsertUser,
  type University,
  type InsertUniversity,
  type Course,
  type InsertCourse,
  type Semester,
  type InsertSemester,
  type Upload,
  type InsertUpload
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Institution methods
  getUniversities(): Promise<University[]>;
  createUniversity(university: InsertUniversity): Promise<University>;
  getCoursesByUniversity(universityId: number): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  getSemestersByCourse(courseId: number): Promise<Semester[]>;
  createSemester(semester: InsertSemester): Promise<Semester>;
  getSyllabusData(universityId: number, courseId: number, semesterId: number): Promise<any>;
  createUpload(upload: InsertUpload): Promise<Upload>;
  updateUploadStatus(uploadId: number, status: string, parsedData?: any): Promise<Upload>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private universities: Map<number, University>;
  private courses: Map<number, Course>;
  private semesters: Map<number, Semester>;
  private uploads: Map<number, Upload>;
  private currentId: {
    users: number;
    universities: number;
    courses: number;
    semesters: number;
    uploads: number;
  };

  constructor() {
    this.users = new Map();
    this.universities = new Map();
    this.courses = new Map();
    this.semesters = new Map();
    this.uploads = new Map();
    this.currentId = {
      users: 1,
      universities: 1,
      courses: 1,
      semesters: 1,
      uploads: 1,
    };
    
    // Seed some sample universities
    this.seedData();
  }

  private seedData() {
    // Add sample universities
    const sampleUniversities = [
      { name: 'Harvard University', country: 'USA', city: 'Cambridge' },
      { name: 'MIT', country: 'USA', city: 'Cambridge' },
      { name: 'Stanford University', country: 'USA', city: 'Stanford' },
      { name: 'University of Oxford', country: 'UK', city: 'Oxford' },
      { name: 'University of Cambridge', country: 'UK', city: 'Cambridge' },
    ];

    sampleUniversities.forEach(uni => {
      const university: University = { ...uni, id: this.currentId.universities++ };
      this.universities.set(university.id, university);
    });

    // Add sample courses
    const sampleCourses = [
      { universityId: 1, name: 'Computer Science', code: 'CS', department: 'Engineering' },
      { universityId: 1, name: 'Mathematics', code: 'MATH', department: 'Sciences' },
      { universityId: 2, name: 'Computer Science', code: 'CS', department: 'Engineering' },
      { universityId: 2, name: 'Electrical Engineering', code: 'EE', department: 'Engineering' },
    ];

    sampleCourses.forEach(course => {
      const courseEntity: Course = { ...course, id: this.currentId.courses++ };
      this.courses.set(courseEntity.id, courseEntity);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Institution methods
  async getUniversities(): Promise<University[]> {
    return Array.from(this.universities.values());
  }

  async createUniversity(insertUniversity: InsertUniversity): Promise<University> {
    const id = this.currentId.universities++;
    const university: University = { ...insertUniversity, id };
    this.universities.set(id, university);
    return university;
  }

  async getCoursesByUniversity(universityId: number): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(
      course => course.universityId === universityId
    );
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = this.currentId.courses++;
    const course: Course = { ...insertCourse, id };
    this.courses.set(id, course);
    return course;
  }

  async getSemestersByCourse(courseId: number): Promise<Semester[]> {
    return Array.from(this.semesters.values()).filter(
      semester => semester.courseId === courseId
    );
  }

  async createSemester(insertSemester: InsertSemester): Promise<Semester> {
    const id = this.currentId.semesters++;
    const semester: Semester = { ...insertSemester, id };
    this.semesters.set(id, semester);
    return semester;
  }

  async getSyllabusData(universityId: number, courseId: number, semesterId: number): Promise<any> {
    // Check if syllabus exists for this combination
    const upload = Array.from(this.uploads.values()).find(
      upload => upload.semesterId === semesterId && upload.status === 'confirmed'
    );
    
    return upload ? upload.parsedData : null;
  }

  async createUpload(insertUpload: InsertUpload): Promise<Upload> {
    const id = this.currentId.uploads++;
    const upload: Upload = { 
      ...insertUpload, 
      id,
      uploadedAt: new Date(),
    };
    this.uploads.set(id, upload);
    return upload;
  }

  async updateUploadStatus(uploadId: number, status: string, parsedData?: any): Promise<Upload> {
    const upload = this.uploads.get(uploadId);
    if (!upload) {
      throw new Error('Upload not found');
    }
    
    const updatedUpload: Upload = {
      ...upload,
      status,
      parsedData: parsedData || upload.parsedData,
    };
    
    this.uploads.set(uploadId, updatedUpload);
    return updatedUpload;
  }
}

export const storage = new MemStorage();
