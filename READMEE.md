# 🧠 Mentora - AI-Powered Learning Companion

> **Your Complete AI Study Assistant for Academic Excellence**

[![Powered by Google Gemini](https://img.shields.io/badge/Powered%20by-Google%20Gemini-4285F4?logo=google)](https://ai.google.dev/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-007ACC?logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Mentora is an intelligent educational platform that combines AI tutoring, spaced repetition flashcards, smart notes, PDF summarization, and a code laboratory into one seamless learning experience. Built with React, TypeScript, and powered by Google Gemini AI.

## 📋 Table of Contents
- [Features](#-features)
- [Quick Start](#-quick-start)
- [How to Use](#-how-to-use)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🤖 **AI Chat Assistant**
- **5 Specialized Tutors**: Math, Coding, Business, Law, Literature
- **Multi-Modal Input**: Text, image upload (OCR), voice recognition
- **Collapsible Interface**: Maximize screen space with expandable conversation sidebar
- **Context-Aware**: Maintains conversation history for coherent discussions
- **Streaming Responses**: Real-time AI responses for better interaction

### 🧠 **Smart Flashcards**
- **Spaced Repetition**: Scientifically-proven learning algorithm
- **Difficulty Tracking**: Cards adjust based on your performance (Easy/Medium/Hard)
- **Progress Analytics**: Track learning streaks and review statistics
- **Instant Creation**: Add cards quickly from any topic

### 📝 **AI Notes**
- **Smart Generation**: Let AI create comprehensive notes from topics
- **Tag Organization**: Organize notes with customizable tags
- **Search & Filter**: Quickly find notes by title, content, or tags
- **PDF Export**: Export notes to PDF for offline studying

### 📄 **PDF Summarizer**
- **Instant Summaries**: Upload any PDF and get AI-generated summaries
- **Text Extraction**: Advanced OCR for scanned documents
- **Save to Notes**: Automatically convert summaries to study notes

### 💻 **Code Laboratory**
- **40+ Languages**: Python, JavaScript, C++, Java, and more
- **Real-Time Execution**: Run code instantly with Piston API
- **Syntax Highlighting**: Clean, readable code editor
- **Error Detection**: Debug assistance from AI

### 🏫 **Institution Mode**
- **University Search**: Browse 1000+ institutions worldwide
- **Syllabus Parser**: Upload PDFs and extract course structure
- **Semester Planner**: Organize subjects by semester
- **Custom Study Plans**: AI-generated plans based on your curriculum

### 🎯 **Career Guide**
- **MBTI Assessment**: Personality-based career recommendations
- **16 Personality Types**: Comprehensive analysis
- **Career Paths**: Suggested careers matching your profile

### 🎨 **Modern UI/UX**
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Collapsible Sidebars**: Main navigation and chat conversations expand/collapse
- **Smooth Animations**: Framer Motion powered transitions
- **Accessible**: Built with Radix UI primitives

## 🚀 Quick Start (Super Easy!)

### Option 1: Use on Replit (Easiest)
1. **Fork this Replit** - Click the fork button
2. **Get your Google Gemini API key**:
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a new API key (it's free!)
   - Copy the key
3. **Add your API key**:
   - Go to "Secrets" tab in Replit
   - Add key: `GEMINI_API_KEY`
   - Paste your API key as the value
4. **Click Run** - That's it! Your app will start automatically

### Option 2: Download and Run Locally  

#### Step 1: Prerequisites
- **Node.js 18 or newer** (IMPORTANT: Check with `node --version`)
- **Download from**: [nodejs.org](https://nodejs.org) (choose LTS version)

#### Step 2: Download Project
- Download ZIP from Replit (or clone if you have git)
- Extract to a folder
- Open terminal/command prompt in that folder

#### Step 3: Install Dependencies  
```bash
npm install
```
If you get errors, try:
```bash
# Clear npm cache and try again
npm cache clean --force
npm install
```

#### Step 4: Set up API Key
Create a file called `.env` in the main folder with:
```
GEMINI_API_KEY=your_actual_api_key_here
```

#### Step 5: Start the App
```bash
# For Windows:
npm run dev

# If above fails on Windows, try:
npx cross-env NODE_ENV=development npx tsx server/index.ts

# For Mac/Linux:  
npm run dev
```

#### Step 6: Open App
Go to `http://localhost:5000` in your browser

## 🎯 How to Use

### 1. Choose Your Study Mode
- **🧮 Math Tutor** - Solve equations, learn concepts
- **💻 Code Mentor** - Debug code, learn programming  
- **💼 Business Coach** - Business strategy and planning
- **⚖️ Legal Advisor** - Legal concepts and analysis
- **📚 Literature Guide** - Writing help and analysis

### 2. Chat with AI
- Ask questions in natural language
- Upload images of problems or text
- Get step-by-step explanations

### 3. Create Flashcards  
- Make cards for anything you're learning
- System automatically schedules reviews
- Mark difficulty to optimize learning

### 4. Take Smart Notes
- Create notes manually or let AI generate them
- Search and organize with tags
- Export to PDF when needed

## 🔧 Need Help?

### Common Local Setup Issues

#### ❌ "npm install" fails
**Fix**: Make sure you have Node.js 18+ installed
```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should work without errors
```
If outdated, download latest from [nodejs.org](https://nodejs.org)

#### ❌ "tsx command not found" or "NODE_ENV not recognized"  
**Fix for Windows**: Install cross-env first
```bash
npm install -g cross-env
npm install -g tsx
```
Then use: `npx cross-env NODE_ENV=development npx tsx server/index.ts`

#### ❌ "Cannot find module" errors
**Fix**: Delete node_modules and reinstall
```bash
rm -rf node_modules package-lock.json  # Mac/Linux
# OR for Windows: delete node_modules folder manually
npm install
```

#### ❌ "Port 5000 already in use"
**Fix**: Kill the process or use different port
```bash
# Kill process on port 5000 (Mac/Linux)
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
# Then kill the PID shown
```

#### ❌ "Can't find API key" 
**Fix**: Make sure your `.env` file is in the ROOT folder (same level as package.json)
```
mentora/
├── .env              ← HERE (not in client/ or server/)
├── package.json
├── client/
└── server/
```

#### ❌ "AI not responding"
**Fix**: Check your Gemini API key
1. Test your key at [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Make sure you have free quota remaining
3. Verify the key in your `.env` file has no extra spaces

### Getting Your Free Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with Google account  
3. Click "Create API key"
4. Copy the key and paste it in `.env` file

### Still Having Issues?
Try this simple test:
```bash
# Test if Node.js works
node -e "console.log('Node.js works!')"

# Test if npm works  
npm -v

# Test if your .env file is correct
node -e "require('dotenv').config(); console.log(process.env.GEMINI_API_KEY ? 'API key found' : 'API key missing')"
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18.3 with TypeScript 5.6
- **Build Tool**: Vite 5.4 (Lightning-fast HMR)
- **Styling**: Tailwind CSS 3.4 + shadcn/ui components
- **State Management**: TanStack Query 5.60 + React Context
- **Routing**: Wouter 3.3 (Lightweight alternative to React Router)
- **Animations**: Framer Motion 11.13
- **Forms**: React Hook Form 7.55 + Zod validation
- **UI Components**: Radix UI primitives (accessible, unstyled)
- **Icons**: Lucide React + React Icons

### Backend
- **Server**: Express.js 4.21 + Node.js 18+
- **Database**: PostgreSQL with Drizzle ORM 0.39
- **Database Host**: Neon Database (serverless)
- **Authentication**: Passport.js with local strategy
- **Session Store**: PostgreSQL-backed (connect-pg-simple)
- **File Upload**: Multer 2.0

### AI & External Services
- **AI Model**: Google Gemini 1.5 Flash (@google/genai 1.19)
- **Code Execution**: Piston API (40+ languages)
- **OCR**: Tesseract.js 6.0
- **PDF Processing**: jsPDF 3.0
- **Voice**: Web Speech API

### Development Tools
- **Language**: TypeScript (strict mode)
- **Package Manager**: npm
- **Database Migrations**: Drizzle Kit
- **Type Safety**: Zod schemas with Drizzle-Zod integration

## 📁 Project Structure

```
mentora/
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── AIChat.tsx    # Main AI chat interface
│   │   │   ├── Flashcards.tsx # Spaced repetition system
│   │   │   ├── Notes.tsx     # Note-taking system
│   │   │   ├── PDFSummarizer.tsx
│   │   │   ├── CodeLab.tsx
│   │   │   ├── InstitutionMode.tsx
│   │   │   ├── CareerGuide.tsx
│   │   │   └── ui/           # shadcn/ui components
│   │   ├── lib/              # Utilities and services
│   │   │   ├── gemini.ts     # Gemini AI service
│   │   │   ├── ocr.ts        # OCR utilities
│   │   │   ├── pdf.ts        # PDF processing
│   │   │   └── queryClient.ts # React Query setup
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Page components
│   │   └── App.tsx           # Root component
├── server/                    # Backend Express application
│   ├── index.ts              # Server entry point
│   ├── routes.ts             # API routes
│   ├── lib/
│   │   └── gemini.ts         # Server-side Gemini integration
│   └── storage.ts            # Data persistence layer
├── shared/                    # Shared code between client/server
│   └── schema.ts             # Database schemas & types
├── package.json              # Dependencies and scripts
├── vite.config.ts            # Vite configuration
├── tailwind.config.ts        # Tailwind CSS config
├── tsconfig.json             # TypeScript configuration
├── drizzle.config.ts         # Drizzle ORM config
└── README.md                 # This file
```

## 🚀 Advanced Setup (Optional)

### Add Database (Optional)
The app works without a database, but you can add one for persistence:

1. **Get a free PostgreSQL database**:
   - [Neon](https://neon.tech) (recommended)
   - [Supabase](https://supabase.com)
   - [Railway](https://railway.app)

2. **Add database URL**:
   - In Secrets: `DATABASE_URL=your_connection_string`
   - Or in .env: `DATABASE_URL=your_connection_string`

3. **Push database schema**:
   ```bash
   npm run db:push
   ```

### Deploy Your App
- **On Replit**: Your app is automatically live at `your-repl-name.replit.app`
- **Elsewhere**: Use `npm run build` then deploy the `dist` folder

## 📱 Features Walkthrough

### AI Chat Modes
- Switch between subjects anytime
- Upload images for problem solving  
- Get step-by-step explanations
- Chat history saved per session

### Smart Flashcards
- Create cards instantly
- Auto-scheduled reviews using spaced repetition
- Progress tracking and streaks
- Filter by difficulty and subject

### Institution Mode  
- Search 1000+ universities worldwide
- Upload syllabus PDFs for parsing
- Get semester-wise course breakdowns
- AI extracts subjects and topics automatically

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute
- 🐛 **Report bugs** - Open an issue with details
- 💡 **Suggest features** - Share your ideas for improvements
- 📝 **Improve documentation** - Help make the docs clearer
- 🎨 **Design improvements** - Enhance UI/UX
- 🔧 **Code contributions** - Submit pull requests

### Development Setup
```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/your-username/mentora.git
cd mentora

# Install dependencies
npm install

# Create a branch for your feature
git checkout -b feature/your-feature-name

# Make your changes and test thoroughly
npm run dev

# Commit with clear messages
git commit -m "Add: your feature description"

# Push to your fork
git push origin feature/your-feature-name

# Open a Pull Request on GitHub
```

### Code Style
- Use TypeScript strict mode
- Follow existing code conventions
- Add comments for complex logic
- Write descriptive commit messages
- Test your changes thoroughly

### Pull Request Process
1. Update the README.md with details of changes if needed
2. Ensure all existing features still work
3. Add screenshots for UI changes
4. Link any related issues

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Mentora Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🌟 Star History

If you find Mentora helpful, please consider giving it a star on GitHub! ⭐

---

## 📞 Support & Community

- **Issues**: [GitHub Issues](https://github.com/your-username/mentora/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/mentora/discussions)
- **Email**: your-email@example.com

---

## 🙏 Acknowledgments

- **Google Gemini AI** for providing powerful AI capabilities
- **shadcn/ui** for beautiful, accessible components
- **Piston API** for code execution infrastructure
- **Tesseract.js** for OCR functionality
- **Neon Database** for serverless PostgreSQL
- All open-source contributors whose libraries made this possible

---

## 📊 Project Stats

- **Languages**: TypeScript, JavaScript, CSS
- **Components**: 50+ React components
- **AI Modes**: 5 specialized tutors
- **Supported Code Languages**: 40+
- **University Database**: 1000+ institutions

---

<div align="center">

### Built with ❤️ by the Mentora Team

**Mentora** - *Your AI-Powered Learning Companion*

[⭐ Star on GitHub](https://github.com/your-username/mentora) • [🐛 Report Bug](https://github.com/your-username/mentora/issues) • [✨ Request Feature](https://github.com/your-username/mentora/issues)

---

**Ready to learn smarter? Click Run and start exploring! 🚀**

</div>
