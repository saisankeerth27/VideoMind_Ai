# VideoMind AI

AI-powered YouTube video transcript and summarization platform.

`React` · `FastAPI` · `Google Gemini` · `PostgreSQL`

## 1. Overview

VideoMind AI allows users to paste a YouTube URL and generate the video's transcript and AI-powered summary in a single action. The system supports multilingual output across 25 languages and three summary modes (Short, Medium, Detailed). Users can read, search, copy, regenerate, and download the generated content as professional PDF documents.

## 2. Key Features

- One-click transcript extraction and AI summary generation
- YouTube URL validation and video ID extraction
- Automatic transcript retrieval via youtube-transcript-api
- Google Gemini-powered structured summarization
- 25 supported output languages with automatic translation
- Short / Medium / Detailed summary modes
- Searchable transcript with match highlighting
- Copy summary or transcript to clipboard
- Summary retry on failure and explicit regeneration
- Professional PDF export (Summary, Transcript, Complete Analysis)
- TXT download for summary and transcript
- Result caching to avoid redundant AI calls
- Structured error handling with user-friendly messages

## 3. Architecture

```mermaid
flowchart LR
    U[User] --> F[React + Vite]
    F -->|POST /api/videos/process| B[FastAPI]
    B --> Y[YouTube Transcript API]
    B --> G[Google Gemini]
    B --> D[(PostgreSQL)]
    B --> P[PDF Service - fpdf2]
    F -->|GET *.pdf| P
```

**One-click processing:** The user selects output language and summary length, then clicks Generate once. The backend extracts the transcript, generates/retrieves the AI summary, and returns both in a single response.
                         ┌──────────────────────┐
                         │        USER          │
                         │  YouTube Video URL   │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   REACT + VITE UI    │
                         │                      │
                         │ • URL Input          │
                         │ • Language Selection │
                         │ • Summary Length     │
                         │ • Generate           │
                         └──────────┬───────────┘
                                    │
                                    │ HTTP / REST API
                                    ▼
                    ┌──────────────────────────────┐
                    │       FASTAPI BACKEND        │
                    │                              │
                    │ • URL Validation             │
                    │ • Request Handling           │
                    │ • Processing Orchestration   │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ▼                             ▼
          ┌──────────────────┐          ┌──────────────────┐
           │ POSTGRESQL   │
           │    DATABASE      │
          │ SERVICE          │          │                  │
          │                  │          │ • Videos         │
          │ • Get Transcript │          │ • Transcripts    │
          │ • Detect Language│          │ • Summaries      │
          └────────┬─────────┘          └────────▲─────────┘
                   │                             │
                   │ Transcript                  │
                   └──────────────┬──────────────┘
                                  │
                                  ▼
                         ┌──────────────────────┐
                         │   TEXT PROCESSING    │
                         │                      │
                         │ • Cleaning           │
                         │ • Normalization      │
                         │ • Size Analysis      │
                         │ • Chunking            │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    GOOGLE GEMINI     │
                         │       AI SERVICE     │
                         │                      │
                         │ • Summarization      │
                         │ • Key Points         │
                         │ • Concepts           │
                         │ • Detailed Analysis  │
                         │ • Multilingual Output│
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   SUMMARY VALIDATION │
                         │                      │
                         │ • JSON Validation    │
                         │ • Error Handling      │
                         │ • Response Formatting│
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                          │    POSTGRESQL DATABASE   │
                         │                      │
                         │ Store / Retrieve:    │
                         │ • Transcript         │
                         │ • Summary            │
                         │ • Language           │
                         │ • Summary Length     │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    FASTAPI RESPONSE  │
                         │                      │
                         │ Transcript + Summary │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │     REACT RESULTS    │
                         │                      │
                         │  ┌────────┐ ┌──────┐ │
                         │  │Summary │ │Trans.│ │
                         │  └────────┘ └──────┘ │
                         │                      │
                         │ • Search              │
                         │ • Copy                │
                         │ • Regenerate          │
                         │ • Download PDF        │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │     PDF SERVICE      │
                         │                      │
                         │ • Summary PDF        │
                         │ • Transcript PDF     │
                         │ • Complete PDF       │
                         └──────────────────────┘

## 4. Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, Tailwind CSS v4, Axios, React Router 7 |
| Backend | Python 3.13, FastAPI 0.115, SQLAlchemy 2, Pydantic 2 |
| AI | Google Gemini (google-genai SDK) |
| Transcript | youtube-transcript-api |
| Database | PostgreSQL 14+ |
| PDF | fpdf2 with embedded Noto fonts |

## 5. Project Structure

```text
VideoMind_AI/
├── backend/
│   ├── app/
│   │   ├── api/routes/       # FastAPI endpoints
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic request/response
│   │   ├── services/         # AI, YouTube, PDF services
│   │   └── main.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── pages/            # Home, Results
│   │   ├── hooks/            # Application state
│   │   ├── services/api.js   # API client
│   │   └── config/           # Languages, settings
│   ├── package.json
│   └── .env.example
└── README.md
```

## 6. Setup & Installation

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Google Gemini API key

### Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

Configure `backend/.env` (see Section 7), then start:

```powershell
uvicorn app.main:app --reload --port 8000
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## 7. Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
AI_API_KEY=your_gemini_api_key
AI_MODEL=gemini-flash-latest
AI_FALLBACK_MODELS=gemini-flash-lite-latest
CORS_ORIGINS=http://localhost:5173
DEBUG=false
```

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:8000
```

## 8. How It Works

1. User enters a YouTube URL, selects output language and summary length
2. Backend validates the URL and extracts the video ID
3. Transcript is retrieved from YouTube captions
4. Transcript is stored in PostgreSQL (or reused if cached)
5. If language differs from transcript, translation is generated via Gemini
6. Gemini generates the structured summary (or cached version is returned)
7. Both transcript and summary are returned in a single API response
8. React displays the results on the Summary and Transcript tabs
9. User can search, copy, regenerate, or download as PDF

## 9. API Overview

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/videos/process` | One-click: transcript + summary |
| `GET` | `/api/videos/{id}` | Video details |
| `GET` | `/api/videos/{id}/transcript` | Original transcript |
| `POST` | `/api/videos/{id}/generate` | Retry/regenerate for a language |
| `POST` | `/api/videos/{id}/summary` | Standalone summary generation |
| `GET` | `/api/videos/{id}/summary/pdf` | Download summary PDF |
| `GET` | `/api/videos/{id}/transcript/pdf` | Download transcript PDF |
| `GET` | `/api/videos/{id}/pdf` | Download complete analysis PDF |

## 10. Usage

1. Start PostgreSQL and create the database: `CREATE DATABASE youtube_ai;`
2. Start the FastAPI backend on port 8000
3. Start the React frontend
4. Open `http://localhost:5173`
5. Paste a YouTube URL, select language and summary length, click **Generate**
6. View the transcript and summary on the results page
7. Use **Copy** to copy content, **Download PDF** to export, or **Regenerate** to create a new summary

## 11. Limitations

- Videos without accessible transcripts cannot be processed
- AI generation depends on Gemini API availability and credits
- Very long videos require additional processing time
- Summary quality depends on transcript quality
- Video titles are placeholders — no metadata scraping

## 12. Future Enhancements

- User accounts and video history
- Cloud deployment configuration
- Background job processing for long videos
- Additional export formats
- Video metadata fetching
#   V i d e o M i n d _ A i  
 