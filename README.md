# AI-Powered Career Intelligence

A full-stack MERN application that helps job seekers manage their resumes, benchmark them against real job descriptions, and get AI-driven career guidance — plus an admin dashboard for platform operators.

## Features

**For users**
- 🔐 JWT-based authentication (register/login)
- 📄 Resume upload & parsing (PDF/DOCX) with full version history (view, download, activate, delete past versions)
- 🎯 ATS analysis — score a resume against a specific job description, with match history
- 🧭 Career recommendations based on parsed resume data
- 💼 Job recommendations via the Adzuna job search API, ranked by skill match
- 📚 Course/certification recommendations to close skill gaps
- ✍️ AI-assisted resume improvement suggestions
- 💬 AI chat assistant (powered by Groq)
- 📊 Personal dashboard summarizing resume, skill-gap, and job-search activity
- 📝 Feedback submission

**Admin dashboard** (separate `/admin` auth and role-gated APIs)
- User, resume, job, and course management
- Platform analytics (ATS, career, job recommendation, skill-gap)
- Activity logs, notifications, feedback triage, and system settings
- Resume parsing monitoring

## Tech Stack

**Client:** React 19, Vite, React Router, React Hook Form, Axios, React Toastify, React Icons

**Server:** Node.js, Express 5, MongoDB (Mongoose), JWT, bcrypt, Multer, Groq SDK, `pdf-parse-new` / `pdfjs-dist` (PDF parsing), `mammoth` (DOCX parsing)

**Infra:** Docker & Docker Compose

## Project Structure

```
.
├── client/          # React (Vite) frontend
│   └── src/
│       ├── pages/       # Route-level pages (user + admin)
│       ├── components/
│       ├── context/
│       ├── routes/
│       └── services/
├── server/          # Express backend
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── services/       # AI, resume, job & course recommendation logic
│   ├── middleware/
│   └── scripts/         # e.g. createAdmin.js
├── docker-compose.yml
├── DEPLOYMENT.md
└── ADMIN_DASHBOARD_SETUP.md
```

## Getting Started

### Prerequisites
- Node.js 
- MongoDB (local or hosted, e.g. MongoDB Atlas)
- A [Groq API key](https://console.groq.com/) for AI features
- (Optional) [Adzuna API](https://developer.adzuna.com/) credentials for live job recommendations
### 1. Clone the repo
```bash
git clone https://github.com/Arunkumar-9/Al-Powered-Career-Intelligence.git
cd Al-Powered-Career-Intelligence
```

### 2. Configure the server
Create `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/aiCareerGuidance
JWT_SECRET=your_long_random_secret
GROQ_API_KEY=your_groq_api_key
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_APP_KEY=your_adzuna_app_key
ADZUNA_COUNTRY=in
CLIENT_URL=http://localhost:5173
```

### 3. Configure the client
Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000
```

### 4. Install & run
```bash
# Server
cd server
npm install
npm run dev

# Client (in a separate terminal)
cd client
npm install
npm run dev
```

The client runs on `http://localhost:5173` and the API on `http://localhost:5000`.

### 5. Create an admin account
```bash
cd server
node scripts/createAdmin.js "Admin Name" admin@example.com "StrongPasswordHere"
```
Then sign in at `/admin/login`.

## Running with Docker

```bash
docker compose up --build
```
This starts MongoDB, the server, and the client. Open `http://localhost:8080` (API at `http://localhost:5000`). See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment notes.

## License

Licensed under the [MIT License](./LICENSE).
