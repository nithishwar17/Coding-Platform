# CodeCook 🧑‍🍳👨‍💻

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5.0-blue?logo=prisma)

CodeCook is a modern, high-performance competitive programming platform designed to rival industry standards like LeetCode and HackerRank. It empowers software engineers to hone their algorithmic problem-solving skills through a highly performant, visually stunning, and AI-augmented web interface.

🌐 **Live Demo:** [https://coding-platform-6kv2.vercel.app](https://coding-platform-6kv2.vercel.app)

---

## ✨ Features

- **Massive Problem Library:** Over 400 carefully curated algorithmic coding challenges (Easy, Medium, Hard).
- **Secure Code Execution:** Write and run real code in the browser. Powered by Judge0 for secure, isolated Remote Code Execution (RCE) in Docker containers. Supports Python and Java.
- **AI Coding Mentor:** Stuck on a problem? Ask the integrated AI Mentor (powered by Google Gemini 3.5 Flash) for pedagogical hints, time complexity analysis, and code reviews—without giving away the direct answers!
- **Developer-First UI:** A beautiful, responsive glassmorphism interface featuring resizable sliding IDE panels, dark mode, and a highly polished code editor.
- **Gamification & Tracking:** Track your progress with a GitHub-style contribution heatmap, earn XP, maintain your daily coding streak, and visualize your problem-solving ratio.
- **Markdown Support:** Rich rendering for problem descriptions and AI Mentor feedback.

## 🛠️ Technology Stack

- **Frontend:** Next.js (App Router), React, TypeScript, Custom CSS Modules
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL (Production) / SQLite (Local)
- **Code Execution:** Judge0 CE
- **AI Integration:** Google GenAI API (Gemini Models)
- **Authentication:** NextAuth.js

## 🚀 Getting Started (Local Development)

Follow these instructions to run a copy of the project on your local machine for development and testing.

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/nithishwar17/Coding-Platform.git
cd Coding-Platform
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory and add the following variables. Do **not** commit this file to version control.

```env
# Database URL (SQLite for local dev)
DATABASE_URL="file:./dev.db"

# Google Gemini API Key for the AI Mentor
GEMINI_API_KEY="your_gemini_api_key_here"
```

### 4. Database Setup
Initialize the Prisma database and push the schema:
```bash
npx prisma generate
npx prisma db push
```

*(Note: To populate the database with problems, you can use the provided scraping scripts in the `/scripts` directory if available).*

### 5. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## 🧠 Architecture Overview

CodeCook adopts a decoupled monolithic architecture leveraging serverless deployment patterns on Vercel. 

- **Code Submissions:** Code payloads are serialized and securely proxied to a Judge0 instance, which spawns transient, heavily restricted Docker containers with strict memory/time limits to evaluate the submission against hidden test cases.
- **AI Mentorship:** The AI integration utilizes the `@google/genai` SDK. It features a robust fallback routing mechanism that catches `503 Service Unavailable` errors during traffic spikes and seamlessly redirects the prompt to high-availability lightweight models (`gemini-3.5-flash-lite`).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
