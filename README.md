# 🧠 Mentora - AI-Powered Educational Companion

> **Intelligent Learning Platform for the Modern Student**

[![Powered by Google Gemini](https://img.shields.io/badge/Powered%20by-Google%20Gemini-4285F4?logo=google)](https://ai.google.dev/)
[![Built with React](https://img.shields.io/badge/Built%20with-React-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📘 Project Description

### What is Mentora?

**Mentora** is an all-in-one AI-powered educational companion designed to revolutionize the learning experience for students across multiple disciplines. Built for the MLSC Hackathon, Mentora combines cutting-edge artificial intelligence with proven learning methodologies to create a comprehensive study platform that adapts to each student's unique needs.

### The Problem We Solve

Modern students face several critical challenges:
- **Information Overload**: Too many resources, not enough guidance
- **Lack of Personalization**: One-size-fits-all approaches don't work for everyone
- **Inefficient Study Methods**: Traditional memorization without retention strategies
- **Limited Access to Subject Experts**: Not everyone can afford private tutoring
- **Fragmented Tools**: Students juggle multiple apps for different learning needs

### Our Solution

Mentora provides a **unified learning ecosystem** that combines:
- 🤖 **AI-Powered Tutoring** across 5 major disciplines (Math, Coding, Business, Law, Literature)
- 🧠 **Smart Flashcards** with scientifically-proven spaced repetition algorithms
- 📝 **AI Note Generation** for efficient content summarization and organization
- 📄 **PDF Intelligence** for instant document summarization and analysis
- 💻 **Interactive Code Laboratory** supporting 40+ programming languages
- 🏫 **Institution-Specific Learning** with syllabus parsing and course mapping
- 🎯 **Career Guidance** with MBTI-based personality assessments
- 📱 **Mobile-First Design** for learning anywhere, anytime

### Key Features

✨ **Multi-Modal AI Chat**
- Context-aware conversations across different educational domains
- Image upload and OCR for problem-solving from textbooks
- Voice input support for hands-free interaction
- Conversation history with collapsible sidebar interface

🎯 **Spaced Repetition Learning**
- Intelligent flashcard scheduling based on difficulty
- Progress tracking with streak counters
- Auto-review reminders for optimal retention

📚 **Smart Content Processing**
- PDF text extraction and AI-powered summarization
- Image-to-text conversion with Tesseract.js OCR
- Automatic note generation from study materials

💻 **Code Laboratory**
- Real-time code execution in 40+ languages
- Syntax highlighting and error detection
- Built-in learning assistant for debugging

🏫 **Institution Mode**
- Search database of 1000+ universities worldwide
- Syllabus PDF parsing and course extraction
- Semester-wise subject breakdown
- Personalized study plans based on curriculum

---

## 🧪 Methodology

### System Architecture

Mentora follows a modern **full-stack JavaScript architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  UI Components│  │  State Mgmt  │  │  API Client  │      │
│  │  (shadcn/ui) │  │ (React Query)│  │   (Fetch)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                   Server Layer (Express.js)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  API Routes  │  │   Services   │  │   Database   │      │
│  │  (REST)      │  │  (Business)  │  │  (Drizzle)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                   External Services                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Google Gemini│  │  Piston API  │  │  PostgreSQL  │      │
│  │     (AI)     │  │ (Code Exec)  │  │    (Neon)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### How It Works: Step-by-Step Flow

#### 1. AI Chat System
```
User Input → Mode Selection → Context Building → Gemini API
     ↓
Image/Voice → OCR/Speech API → Text Extraction
     ↓
Text Processing → AI Response → Streaming Display
     ↓
Chat History → Local Storage → Conversation Management
```

**Implementation Details:**
- Uses Google Gemini 1.5 Flash for fast, context-aware responses
- Maintains conversation context for multi-turn interactions
- Supports multimodal inputs (text, images, voice)
- Implements streaming responses for real-time interaction

#### 2. Spaced Repetition Algorithm
```
New Card → Initial Review (Immediate)
    ↓
Easy/Medium/Hard Rating
    ↓
Calculate Next Review Date:
  - Easy: +7 days
  - Medium: +3 days  
  - Hard: +1 day
    ↓
Schedule Review → Notification → Practice Session
```

**Implementation Details:**
- Custom algorithm based on SM-2 (SuperMemo 2) principles
- Stores card data in browser localStorage
- Tracks review streaks and performance metrics
- Auto-adjusts difficulty based on user performance

#### 3. PDF Summarization Pipeline
```
PDF Upload → Text Extraction (jsPDF)
    ↓
Chunk Text (1000 tokens/chunk)
    ↓
Send to Gemini API with summarization prompt
    ↓
Aggregate Summaries → Display to User
    ↓
Save to Notes (Optional)
```

#### 4. Code Laboratory Execution
```
User Code → Language Selection → Piston API
    ↓
Request Payload: { language, version, files, stdin }
    ↓
Server-Side Execution → Output/Error
    ↓
Syntax Highlighting → Display Results
```

#### 5. Institution Mode Workflow
```
University Search → Course Selection → Semester Setup
    ↓
Syllabus PDF Upload → Text Extraction
    ↓
AI Parsing (Gemini) → Subject Extraction
    ↓
Course Structure → Topic Breakdown → Study Dashboard
```

### Data Flow Architecture

**Frontend State Management:**
- **React Query** for server state (caching, synchronization)
- **React Context** for global UI state (theme, sidebar)
- **localStorage** for persistent data (notes, flashcards, settings)

**Backend Architecture:**
- **Express.js** as web server
- **RESTful API** design pattern
- **PostgreSQL** for optional data persistence
- **Session-based** authentication (passport.js)

### AI Integration Strategy

**Gemini API Configuration:**
```typescript
model: "gemini-1.5-flash-latest"
parameters:
  - temperature: 0.7 (balanced creativity)
  - maxOutputTokens: 2048
  - topP: 0.9
  - topK: 40
```

**Context Management:**
- Maintains conversation history (last 10 messages)
- Injects mode-specific system prompts
- Handles multimodal inputs (text + images)
- Implements retry logic for API failures

---

## 👥 Team Details

### Team Members

| Name | Role | Contributions |
|------|------|---------------|
| **[Mohammed Abdullah]** | Full-Stack Developer | Architecture design, AI integration, frontend development |
| **[Vikranth Mihir]** | UI/UX Designer | Interface design, user experience optimization |
| **[Naimish Patel]** | Backend Developer | API development, server configuration |
| **[Mohd Asim]** | ML Engineer | AI prompt engineering, testing |

> 💡 **Note:** Please update this section with your actual team member names and roles.

### Contributions Breakdown

- **Frontend Development (40%)**: React components, state management, responsive design
- **Backend Development (25%)**: Express API, database integration, authentication
- **AI Integration (20%)**: Gemini API setup, prompt engineering, multimodal processing
- **Testing & Optimization (15%)**: Performance tuning, bug fixes, user testing

---

## 🧰 Technology Stack

### Frontend Technologies
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4 (Fast HMR, optimized production builds)
- **Styling**: Tailwind CSS 3.4 + shadcn/ui component library
- **Animations**: Framer Motion 11.13 for smooth transitions
- **State Management**: 
  - TanStack Query 5.60 (server state)
  - React Context (global state)
- **Routing**: Wouter 3.3 (lightweight client-side routing)
- **Forms**: React Hook Form 7.55 + Zod validation
- **UI Components**: Radix UI primitives (accessible, customizable)
- **Icons**: Lucide React 0.453 + React Icons 5.4

### Backend Technologies
- **Runtime**: Node.js 18+ with ES Modules
- **Framework**: Express.js 4.21
- **Language**: TypeScript 5.6
- **Database ORM**: Drizzle ORM 0.39 (type-safe, performant)
- **Database**: PostgreSQL (via Neon Database serverless)
- **Session Store**: connect-pg-simple (PostgreSQL-backed sessions)
- **Authentication**: Passport.js with local strategy
- **File Upload**: Multer 2.0

### AI & Machine Learning
- **Primary AI**: Google Gemini AI 1.5 Flash
  - API: @google/genai 1.19
  - Model: gemini-1.5-flash-latest
  - Capabilities: Text generation, image understanding, code analysis
- **OCR**: Tesseract.js 6.0 (optical character recognition)
- **NLP**: Built-in Gemini natural language understanding

### External APIs & Services
- **Code Execution**: Piston API (supports 40+ languages)
- **AI Service**: Google AI Studio (Gemini API)
- **Database Host**: Neon Database (serverless PostgreSQL)
- **Voice Recognition**: Web Speech API (browser native)

### Development Tools
- **Package Manager**: npm
- **Type Checking**: TypeScript compiler
- **Code Bundler**: Vite + esbuild
- **Database Migrations**: Drizzle Kit 0.30
- **API Testing**: Built-in REST client

### Libraries & Utilities
- **PDF Processing**: jsPDF 3.0
- **Date Handling**: date-fns 3.6
- **Validation**: Zod 3.24
- **HTTP Client**: node-fetch 3.3
- **Unique IDs**: nanoid 5.1
- **Toast Notifications**: Sonner 2.0
- **Charts**: Recharts 2.15

### Deployment Infrastructure
- **Primary Host**: Replit (development + production)
- **Alternative**: Can deploy to Vercel, Netlify, Railway
- **CI/CD**: Integrated with Replit workflows
- **Domain**: *.replit.app (custom domains supported)

---

## 🎥 Demonstration Video

### Video Link
🎬 **[Watch Demo Video](https://drive.google.com/file/d/1Gb0lJcbg6fgTQ9acJKAXbrDlgwniQF7G/view?usp=drivesdk)**


### How to Deploy Your Own Instance

#### Option 1: Deploy on Replit (Recommended)
1. Fork this Replit project
2. Add `GEMINI_API_KEY` to Secrets
3. Click "Run"
4. Your app is live at `https://your-repl-name.replit.app`

#### Option 2: Deploy on Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Build the project
npm run build

# Deploy
vercel --prod
```

#### Option 3: Deploy on Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

#### Option 4: Self-Hosted (VPS/Cloud)
```bash
# Build production bundle
npm run build

# Start production server
npm start

# Use PM2 for process management
pm2 start dist/index.js --name mentora
```

### Required Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | ✅ Yes |
| `DATABASE_URL` | PostgreSQL connection string | ❌ Optional |
| `NODE_ENV` | Environment (production/development) | ✅ Yes |

### Getting API Keys

**Google Gemini API** (Free Tier Available):
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Copy and store securely

**PostgreSQL Database** (Optional):
- [Neon Database](https://neon.tech) - Recommended, free tier
- [Supabase](https://supabase.com) - Free tier available
- [Railway](https://railway.app) - $5 free credit

---

## 📚 References

### Research & Inspiration
1. **Spaced Repetition Systems**
   - Wozniak, P. A. (1990). *SuperMemo Algorithm SM-2*
   - Ebbinghaus, H. (1885). *Memory: A Contribution to Experimental Psychology*

2. **AI in Education**
   - [Google AI for Education](https://ai.google/education/)
   - [OpenAI Research on Educational AI](https://openai.com/research)
   - [Personalized Learning with AI](https://www.sciencedirect.com/topics/computer-science/personalized-learning)

3. **Learning Methodologies**
   - Bloom's Taxonomy for Educational Objectives
   - Active Recall and Spaced Repetition research
   - Cognitive Load Theory (Sweller, 1988)

### APIs & Services Used
- **[Google Gemini API](https://ai.google.dev/)** - Multimodal AI capabilities
- **[Piston API](https://github.com/engineer-man/piston)** - Code execution engine
- **[Tesseract.js](https://tesseract.projectnaptha.com/)** - OCR library
- **[Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)** - Browser voice recognition

### Open Source Libraries
- **[React](https://react.dev/)** - UI library
- **[shadcn/ui](https://ui.shadcn.com/)** - Component library
- **[Drizzle ORM](https://orm.drizzle.team/)** - Database toolkit
- **[TanStack Query](https://tanstack.com/query)** - Data fetching

### Design Inspiration
- Modern educational platforms (Khan Academy, Coursera)
- Note-taking apps (Notion, Obsidian)
- Flashcard systems (Anki, Quizlet)

### Datasets & Resources
- **University Database**: Hipolabs University Domains API
- **Programming Languages**: Piston supported languages list
- **Career Assessment**: MBTI personality framework

---
## 🖼️ Assets / Screenshots

### 1. Landing Page & Dashboard
![Dashboard](https://drive.google.com/uc?export=view&id=1RpW5TShH3VNGXZOz-g2oYBaQCPqEeMN6)
> Main dashboard showing quick access to all features and learning statistics

### 2. AI Chat Interface
![AI Chat](https://drive.google.com/uc?export=view&id=1Ppt2E5r0d_y2GkxAinuftzcQ_gxNLVcN)
> Multi-modal AI chat with collapsible conversation sidebar and mode selection

### 3. Study Mode Selection
![Study Modes](https://drive.google.com/uc?export=view&id=1MDL8IvR9J87w92H6yzgSC2OV-lNYZs7A)
> Five specialized AI tutors: Math, Coding, Business, Law, Literature

### 4. Smart Flashcards
![Flashcards](https://drive.google.com/uc?export=view&id=1gtWdikF3WNyJ9vghfRZECZmZ5Xy5KGhT)
> Spaced repetition flashcard system with progress tracking and difficulty rating

### 5. AI Notes
![Notes](https://drive.google.com/uc?export=view&id=1fIM76uawrOMQ7ov5lEZPuapTiCTHdvSz)
> Smart note-taking interface with AI generation and tag-based organization

### 6. PDF Summarizer
![PDF Summarizer](https://drive.google.com/uc?export=view&id=1x1sjuPMFUxRM0jfm-pR5VwtYm0ggcgrc)
> Upload documents and get instant AI-powered summaries

### 7. Code Laboratory
![Code Lab](https://drive.google.com/uc?export=view&id=1OdYK_oP9-6JOqO-_dhFRk0vLjgNHt3D0)
> Interactive coding environment with 40+ language support

### 8. Career Guide
![Career Guide](https://drive.google.com/uc?export=view&id=17hAPn2A13H38q_lHmcPM-Dd9BuJviw1B)
> MBTI-based personality assessment with career recommendations

---

## 🚀 Quick Start Guide

### For Hackathon Judges & Reviewers

**Test the Live App**: [https://your-repl-name.replit.app](https://your-repl-name.replit.app)

**Try These Features**:
1. ✅ Select "Math Tutor" mode and ask: *"Explain quadratic equations with examples"*
2. ✅ Create a flashcard with front: *"What is React?"* and practice it
3. ✅ Upload a sample PDF to test the summarization feature
4. ✅ Go to Code Lab and run a Python "Hello World" program
5. ✅ Try the Career Guide to see MBTI assessment

### Running Locally

```bash
# Clone the repository
git clone <repository-url>
cd mentora

# Install dependencies
npm install

# Set up environment variables
echo "GEMINI_API_KEY=your_key_here" > .env

# Start development server
npm run dev

# Open browser
# Navigate to http://localhost:5000
```

---

## 🏆 MLSC Hackathon Submission

### Theme Alignment
This project aligns with the hackathon's focus on **innovative educational technology** and **AI-powered learning solutions**.

### Innovation Highlights
- ✨ **Multi-modal AI Integration**: Text, image, and voice inputs
- 🧠 **Adaptive Learning**: Personalized spaced repetition algorithms
- 🎯 **Comprehensive Platform**: 8+ features in one unified app
- 🏫 **Institution-Specific**: Custom syllabus parsing and course mapping
- 📱 **Accessibility**: Mobile-first, responsive design

### Impact & Scalability
- **Target Users**: 100M+ students worldwide
- **Use Cases**: K-12, higher education, professional learning
- **Scalability**: Cloud-native architecture ready for growth
- **Monetization**: Freemium model with premium AI features

### Technical Excellence
- Modern tech stack with TypeScript
- Clean, maintainable codebase
- Comprehensive error handling
- Responsive, accessible UI
- Performance optimized

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contact & Support

**Team Contact**: your-email@example.com

**Project Repository**: [GitHub Link](https://github.com/your-username/mentora)

**Report Issues**: [Issue Tracker](https://github.com/your-username/mentora/issues)

---

<div align="center">

### Built with ❤️ for MLSC Hackathon 2024

**Mentora** - *Your AI-Powered Learning Companion*

 [📹 Video](https://drive.google.com/file/d/1Gb0lJcbg6fgTQ9acJKAXbrDlgwniQF7G/view?usp=drivesdk) | [📖 Docs](./README.md) | [🐛 Issues](https://github.com/your-username/mentora/issues)

</div>
