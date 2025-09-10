# Overview

Mentora is an AI-powered educational companion app built with React and TypeScript. The application provides multiple study modes including math tutoring, code mentoring, business coaching, legal advising, and literature guidance. It features an interactive chat interface powered by Google Gemini AI, smart note-taking capabilities, flashcard-based spaced repetition learning, PDF summarization, and a built-in code laboratory for programming practice.

The app is designed as a comprehensive learning platform that adapts to different educational contexts and provides personalized AI assistance across various academic disciplines.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: React hooks and context for local state, TanStack Query for server state
- **Animations**: Framer Motion for smooth transitions and micro-interactions
- **Routing**: Wouter for lightweight client-side routing

## Backend Architecture
- **Server**: Express.js with TypeScript running in development mode via tsx
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Structure**: RESTful API with modular route registration
- **Session Management**: PostgreSQL-based session storage with connect-pg-simple

## Data Storage Solutions
- **Primary Database**: PostgreSQL hosted on Neon Database
- **Local Storage**: Browser localStorage for client-side data persistence (notes, flashcards)
- **Schema Management**: Drizzle Kit for database migrations and schema evolution
- **Type Safety**: Drizzle-Zod integration for runtime validation and type inference

## Authentication and Authorization
- **User Model**: Basic username/password authentication schema
- **Session Storage**: Server-side session management with PostgreSQL backend
- **Security**: Password hashing and secure session handling (implementation pending)

## External Service Integrations
- **AI Service**: Google Gemini AI (Gemini-1.5-flash-latest) for conversational AI, content generation, and educational assistance
- **Code Execution**: Piston API for secure code compilation and execution across multiple programming languages
- **OCR Service**: Tesseract.js for optical character recognition from uploaded images
- **PDF Processing**: jsPDF for PDF generation and text extraction capabilities
- **Voice Recognition**: Web Speech API for voice input functionality

## Key Features
- **Multi-Modal AI Chat**: Context-aware conversations across different educational domains
- **Spaced Repetition Learning**: Intelligent flashcard system with difficulty-based scheduling
- **Smart Notes**: AI-powered note generation and organization
- **Code Laboratory**: Interactive coding environment with real-time execution
- **PDF Summarization**: Extract and summarize content from uploaded documents
- **Image Analysis**: OCR-based text extraction from images with content type detection
- **Responsive Design**: Mobile-first approach with adaptive navigation patterns

## Development Environment
- **Build Tool**: Vite with HMR and TypeScript support
- **Code Quality**: ESLint and TypeScript compiler for static analysis
- **Development Server**: Express with Vite middleware integration
- **Asset Management**: Vite-based asset bundling and optimization