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