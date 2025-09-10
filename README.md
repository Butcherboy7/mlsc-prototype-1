# 🎓 Mentora - AI-Powered Educational Companion

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen.svg)](https://your-deployed-app.replit.app)
[![Node.js](https://img.shields.io/badge/node.js-v20-blue.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.6.3-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

Mentora is a comprehensive AI-powered educational companion built with modern web technologies. It provides personalized learning experiences across multiple academic disciplines with features like interactive AI chat, spaced repetition flashcards, smart note-taking, and institutional course management.

## 🌟 Features

### 🤖 Multi-Modal AI Chat
- **Context-aware conversations** across different educational domains
- **Google Gemini AI integration** (Gemini-1.5-flash-latest) for intelligent responses
- **Study mode specialization** - Math Tutoring, Code Mentoring, Business Coaching, Legal Advising, and Literature Guidance
- **Image analysis** with OCR capabilities using Tesseract.js
- **PDF generation** and export functionality

### 📚 Smart Learning Tools
- **Spaced Repetition Flashcards** - Intelligent scheduling based on difficulty levels
- **Smart Notes** - AI-powered note generation and organization with tagging system
- **PDF Summarizer** - Extract and summarize content from uploaded documents
- **Code Laboratory** - Interactive coding environment with real-time execution via Piston API
- **Study Planner** - Personalized study plans with progress tracking

### 🏫 Institution Mode
- **University Integration** - Real-time university data from multiple APIs
- **Course Management** - Upload and parse syllabi with AI-powered extraction
- **Syllabus Analysis** - Intelligent course structure recognition and organization
- **Academic Planning** - Semester-wise course organization and tracking

### 🎯 Additional Features
- **Voice Recognition** - Web Speech API integration for hands-free interaction
- **Responsive Design** - Mobile-first approach with adaptive navigation
- **Dark/Light Theme** - User preference-based theming
- **Real-time Progress Tracking** - Comprehensive learning analytics
- **Secure Session Management** - PostgreSQL-backed user sessions

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with Hot Module Replacement
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React hooks and TanStack Query for server state
- **Animations**: Framer Motion for smooth transitions
- **Routing**: Wouter for lightweight client-side routing

### Backend
- **Server**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Storage**: connect-pg-simple for PostgreSQL-based sessions
- **File Upload**: Multer with 10MB limit
- **API Integration**: Real-time university data from multiple sources

### AI & External Services
- **AI Service**: Google Gemini AI (Gemini-1.5-flash-latest)
- **Code Execution**: Piston API for secure multi-language code compilation
- **OCR**: Tesseract.js for optical character recognition
- **PDF Processing**: jsPDF for generation and text extraction
- **Voice**: Web Speech API for voice input functionality

## 📁 Project Structure

```
mentora/
├── client/                    # Frontend React application
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── ui/          # shadcn/ui components
│   │   │   ├── InstitutionMode/ # Institution-specific features
│   │   │   ├── AIChat.tsx   # AI chat interface
│   │   │   ├── Flashcards.tsx # Spaced repetition system
│   │   │   ├── Notes.tsx    # Smart note-taking
│   │   │   └── ...          # Other feature components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility libraries
│   │   │   ├── gemini.ts    # Google Gemini AI integration
│   │   │   ├── ocr.ts       # OCR functionality
│   │   │   ├── pdf.ts       # PDF processing
│   │   │   └── piston.ts    # Code execution API
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   └── package.json
├── server/                   # Backend Express.js application
│   ├── lib/
│   │   └── gemini.ts        # Server-side AI integration
│   ├── index.ts             # Express server setup
│   ├── routes.ts            # API route definitions
│   └── storage.ts           # Database operations
├── shared/                   # Shared utilities and schemas
│   └── schema.ts            # Database schema definitions
├── package.json             # Root dependencies
├── drizzle.config.ts        # Database configuration
├── tailwind.config.ts       # Tailwind CSS configuration
└── vite.config.ts           # Vite build configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20 or higher
- PostgreSQL database (or Neon Database account)
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mentora.git
   cd mentora
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   DATABASE_URL=your_postgresql_connection_string
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser** and navigate to `http://localhost:5000`

## 🎯 Usage

### Study Modes
Choose from five specialized study modes:
- **🧮 Math Tutor** - Solve problems and learn mathematical concepts
- **💻 Code Mentor** - Debug code, learn programming languages
- **💼 Business Coach** - Get startup and business strategy guidance  
- **⚖️ Legal Advisor** - Understand legal concepts and analysis
- **📖 Literature Guide** - Writing assistance and literary analysis

### Flashcard System
1. Create flashcards with questions and answers
2. Study cards using the spaced repetition algorithm
3. Rate difficulty (Easy/Medium/Hard) to optimize review intervals
4. Track progress and streaks

### Smart Notes
1. Create and organize notes with tags
2. Use AI to generate notes on any topic
3. Search through your note collection
4. Export notes as PDF documents

### Institution Mode
1. Search for universities by country
2. Upload syllabus documents for AI parsing
3. Review and confirm extracted course information
4. Organize courses by semester and department

## 🔌 API Endpoints

### Institution Mode
- `GET /api/institutions/universities` - Fetch universities by country
- `GET /api/institutions/universities/:id/courses` - Get courses (requires syllabus upload)
- `POST /api/institutions/upload` - Upload and parse syllabus documents
- `POST /api/institutions/confirm` - Confirm parsed syllabus data

## 🧠 AI Integration

### Google Gemini Features
- **Contextual Chat** - Mode-aware conversations with persistent context
- **Note Generation** - AI-powered content creation for study topics
- **Concept Explanation** - Detailed explanations of complex topics
- **Syllabus Parsing** - Intelligent extraction of course information from documents

### Configuration
The AI service supports:
- Temperature: 0.7 for balanced creativity and accuracy
- Max Output Tokens: 1000 for comprehensive responses
- Context Memory: Session-based conversation history
- Mode-specific System Prompts for specialized responses

## 🎨 UI/UX Features

- **Responsive Design** - Works seamlessly on desktop and mobile
- **Smooth Animations** - Framer Motion powered transitions
- **Accessible Components** - Built with shadcn/ui and Radix UI
- **Theme Support** - Dark/light mode with next-themes
- **Mobile Navigation** - Adaptive bottom navigation on mobile
- **Loading States** - Comprehensive loading and error handling

## 🧪 Development

### Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run check        # TypeScript type checking
npm run db:push      # Push database schema changes
```

### Database Schema
The application uses Drizzle ORM with PostgreSQL. Key entities:
- **Users** - User accounts and authentication
- **Flashcards** - Spaced repetition learning cards
- **Notes** - User-generated study notes
- **Universities** - Institution data
- **Uploads** - Syllabus documents and parsed data

### Code Quality
- **TypeScript** - Full type safety across frontend and backend
- **ESLint** - Code linting and formatting
- **Drizzle ORM** - Type-safe database operations
- **Zod** - Runtime validation with drizzle-zod integration

## 🔒 Security Features

- **Input Validation** - Server-side validation for all API endpoints
- **File Upload Limits** - 10MB maximum file size for documents
- **Session Management** - Secure PostgreSQL-backed sessions
- **API Key Protection** - Environment variable-based secret management
- **CORS Configuration** - Proper cross-origin request handling

## 📈 Performance Optimizations

- **Vite Build System** - Fast development and optimized production builds
- **Code Splitting** - Lazy loading of components and routes
- **Image Optimization** - Efficient handling of uploaded images
- **Database Indexing** - Optimized queries with proper indexing
- **Caching Strategy** - Client-side caching with TanStack Query

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use existing UI components from shadcn/ui
- Maintain consistent code formatting
- Add proper type definitions
- Test your changes thoroughly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** - For providing advanced AI capabilities
- **shadcn/ui** - For the beautiful and accessible UI components
- **Replit** - For the excellent development and deployment platform
- **Neon Database** - For serverless PostgreSQL hosting
- **Piston API** - For secure code execution environment

## 📞 Support

If you have questions or need help:
- Create an issue on GitHub
- Check the documentation in the `/docs` folder
- Review the code comments and type definitions

---

**Built with ❤️ using React, TypeScript, and AI**