import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Institution Mode tables
export const universities = pgTable("universities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  country: text("country"),
  city: text("city"),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  universityId: integer("university_id").references(() => universities.id),
  name: text("name").notNull(),
  code: text("code"),
  department: text("department"),
});

export const semesters = pgTable("semesters", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").references(() => courses.id),
  name: text("name").notNull(), // e.g., "Fall 2024", "Spring 2025"
  year: integer("year").notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
});

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  semesterId: integer("semester_id").references(() => semesters.id),
  name: text("name").notNull(),
  code: text("code"),
  credits: integer("credits"),
  instructor: text("instructor"),
});

export const timetable = pgTable("timetable", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id").references(() => subjects.id),
  dayOfWeek: integer("day_of_week").notNull(), // 0=Sunday, 1=Monday, etc.
  startTime: text("start_time").notNull(), // "09:00"
  endTime: text("end_time").notNull(), // "10:30"
  location: text("location"),
});

export const examCalendar = pgTable("exam_calendar", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id").references(() => subjects.id),
  examType: text("exam_type").notNull(), // "midterm", "final", "quiz"
  examDate: timestamp("exam_date").notNull(),
  duration: integer("duration"), // in minutes
  location: text("location"),
});

export const uploads = pgTable("uploads", {
  id: serial("id").primaryKey(),
  semesterId: integer("semester_id").references(() => semesters.id),
  filename: text("filename").notNull(),
  fileType: text("file_type").notNull(),
  filePath: text("file_path").notNull(),
  parsedData: jsonb("parsed_data"), // Stores the AI-parsed JSON
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  status: text("status").notNull().default("pending"), // "pending", "processed", "confirmed"
});

// Chat tables for AI personal chatbot
export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  mode: text("mode").notNull(), // The study mode selected for this chat
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id").references(() => chats.id, { onDelete: 'cascade' }).notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Existing user schema
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Institution Mode schemas
export const insertUniversitySchema = createInsertSchema(universities).omit({ id: true });
export const insertCourseSchema = createInsertSchema(courses).omit({ id: true });
export const insertSemesterSchema = createInsertSchema(semesters).omit({ id: true });
export const insertSubjectSchema = createInsertSchema(subjects).omit({ id: true });
export const insertTimetableSchema = createInsertSchema(timetable).omit({ id: true });
export const insertExamCalendarSchema = createInsertSchema(examCalendar).omit({ id: true });
export const insertUploadSchema = createInsertSchema(uploads).omit({ id: true, uploadedAt: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertUniversity = z.infer<typeof insertUniversitySchema>;
export type University = typeof universities.$inferSelect;

export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;

export type InsertSemester = z.infer<typeof insertSemesterSchema>;
export type Semester = typeof semesters.$inferSelect;

export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type Subject = typeof subjects.$inferSelect;

export type InsertTimetable = z.infer<typeof insertTimetableSchema>;
export type Timetable = typeof timetable.$inferSelect;

export type InsertExamCalendar = z.infer<typeof insertExamCalendarSchema>;
export type ExamCalendar = typeof examCalendar.$inferSelect;

export type InsertUpload = z.infer<typeof insertUploadSchema>;
export type Upload = typeof uploads.$inferSelect;

export const insertChatSchema = createInsertSchema(chats).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, timestamp: true });

export type InsertChat = z.infer<typeof insertChatSchema>;
export type Chat = typeof chats.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
