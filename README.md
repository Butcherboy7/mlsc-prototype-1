# 🧠 Mentora - AI-Powered Learning Companion

> **Smart AI tutor with flashcards, notes, and multi-subject expertise**

Mentora helps you learn faster with AI-powered conversations, spaced repetition flashcards, smart notes, and specialized study modes for Math, Coding, Business, Law, and Literature.

## ✨ What You Get

- 🤖 **Smart AI Chat** - Get help with any subject (Math, Code, Business, Law, Literature)
- 🧠 **Smart Flashcards** - Spaced repetition system that adapts to your learning
- 📝 **AI Notes** - Generate and organize study notes automatically  
- 📄 **PDF Summarizer** - Upload PDFs and get instant summaries
- 💻 **Code Lab** - Run code in 40+ programming languages
- 🏫 **Institution Mode** - Upload syllabi and get course-specific help
- 📱 **Mobile Friendly** - Works great on phone, tablet, and desktop

## 🚀 Quick Start (Super Easy!)

### Option 1: Use on Replit (Easiest)
1. **Fork this Replit** - Click the fork button
2. **Get your Google Gemini API key**:
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a new API key (it's free!)
   - Copy the key
3. **Add your API key**:
   - Go to "Secrets" tab in Replit
   - Add key: `VITE_GEMINI_API_KEY`
   - Paste your API key as the value
4. **Click Run** - That's it! Your app will start automatically

### Option 2: Download and Run Locally  
1. **Download the code**:
   ```bash
   # Download as ZIP from Replit or use git if available
   # Extract the files to a folder
   ```

2. **Install Node.js** (if you don't have it):
   - Go to [nodejs.org](https://nodejs.org) 
   - Download and install (choose LTS version)

3. **Open terminal in the project folder and run**:
   ```bash
   npm install
   npm run dev
   ```

4. **Set up your API key**:
   - Create a file called `.env` in the main folder
   - Add this line: `VITE_GEMINI_API_KEY=your_api_key_here`
   - Replace `your_api_key_here` with your actual API key

5. **Open your browser** and go to `http://localhost:5000`

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

### Common Issues
**"Can't find API key"** - Make sure you added `VITE_GEMINI_API_KEY` in Secrets (on Replit) or `.env` file (locally)

**"App won't start"** - Try refreshing the page or clicking Stop/Run again  

**"AI not responding"** - Check your Gemini API key is valid and you have free quota

### Getting Your Free Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with Google account  
3. Click "Create API key"
4. Copy the key and paste it in Secrets or .env file

## 🎯 What's Included

### Tech Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Express.js + PostgreSQL  
- **AI**: Google Gemini AI
- **Extras**: PDF processing, OCR, code execution, voice recognition

### File Structure
```
mentora/
├── client/           # React frontend app
├── server/           # Express.js backend  
├── shared/           # Shared types and utilities
└── package.json      # Dependencies and scripts
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

**Ready to learn smarter? Click Run and start exploring! 🚀**