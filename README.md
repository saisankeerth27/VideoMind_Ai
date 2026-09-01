# VideoMind AI

AI-powered YouTube video transcript and summarization platform.

`React` · `FastAPI` · `Google Gemini` · `PostgreSQL` · `Deployed on Vercel + Render`

## 1. Overview

VideoMind AI allows users to paste a YouTube URL and generate the video's transcript and AI-powered summary in a single action. The system supports multilingual output across 25 languages and three summary modes (Short, Medium, Detailed). Users can read, search, copy, regenerate, and download the generated content as professional PDF documents.

**Live Frontend:** [https://frontend-one-bay-98.vercel.app](https://frontend-one-bay-98.vercel.app)

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

### High-Level Overview

```mermaid
flowchart LR
    U[User] --> F[React + Vite<br/>Vercel]
    F -->|REST API| B[FastAPI<br/>Render]
    B --> Y[YouTube Transcript<br/>API]
    B --> G[Google Gemini<br/>AI]
    B --> D[(PostgreSQL<br/>Supabase)]
    B --> P[PDF Service<br/>fpdf2]
```

### Detailed Request Flow

```mermaid
flowchart TD
    A[User enters YouTube URL] --> B[React Frontend]
    B -->|POST /api/videos/process| C[FastAPI Backend]
    C --> D{Validate URL}
    D -->|Invalid| E[Return Error]
    D -->|Valid| F[Extract Video ID]
    F --> G[Fetch Transcript from YouTube]
    G -->|Cached| H[Load from PostgreSQL]
    G -->|New| I[Store in PostgreSQL]
    H --> J[Text Processing]
    I --> J
    J --> K[Chunk if needed]
    K --> L[Send to Google Gemini]
    L --> M[Parse AI Response]
    M --> N[Validate JSON Structure]
    N -->|Failed| O[Retry / Fallback Model]
    O --> L
    N -->|Success| P[Store Summary in PostgreSQL]
    P --> Q[Return Transcript + Summary]
    Q --> R[React displays Results]
    R --> S{User Action}
    S -->|Search| T[Highlight matches]
    S -->|Copy| U[Clipboard]
    S -->|Download PDF| V[Generate PDF via fpdf2]
    S -->|Regenerate| W[Re-run AI generation]
    W --> L
```

### Deployment Architecture

```mermaid
flowchart LR
    subgraph Vercel
        FE[React SPA<br/>Static Build]
    end
    subgraph Render
        BE[FastAPI<br/>Gunicorn + Uvicorn]
    end
    subgraph Supabase
        DB[(PostgreSQL<br/>Connection Pooler)]
    end
    subgraph External
        YT[YouTube API]
        AI[Google Gemini API]
    end

    FE -->|HTTP REST| BE
    BE --> DB
    BE --> YT
    BE --> AI
    FE -.->|Build-time env var| FE
    BE -.->|Runtime env vars| BE
```

## 4. Technology Stack

| Layer | Technology | Hosting |
|-------|-----------|---------|
| Frontend | React 19, Vite 8, Tailwind CSS v4, Axios, React Router 7 | Vercel |
| Backend | Python 3.13, FastAPI 0.115, SQLAlchemy 2, Pydantic 2, Gunicorn | Render |
| AI | Google Gemini (google-genai SDK) | Google Cloud |
| Transcript | youtube-transcript-api | YouTube |
| Database | PostgreSQL (Supabase) | AWS (ap-southeast-1) |
| PDF | fpdf2 with embedded Noto fonts | Backend |

## 5. Project Structure

```text
VideoMind_AI/
├── backend/
│   ├── app/
│   │   ├── api/routes/       # FastAPI endpoint handlers
│   │   ├── core/             # Config, error handling
│   │   ├── database/         # SQLAlchemy engine, session, base
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── services/         # AI, YouTube, PDF services
│   │   ├── utils/            # Text chunking, language utils
│   │   └── main.py           # FastAPI app entry point
│   ├── scripts/              # One-time migration scripts
│   ├── Procfile              # Render process definition
│   ├── requirements.txt      # Python dependencies
│   ├── .python-version       # Python 3.13
│   ├── runtime.txt           # Python runtime for Render
│   └── .env.example          # Environment variable template
├── frontend/
│   ├── src/
│   │   ├── components/       # UI components (19 files)
│   │   ├── pages/            # Home, Results
│   │   ├── hooks/            # App state, context
│   │   ├── services/api.js   # Axios API client
│   │   ├── config/           # Language definitions
│   │   └── utils/            # Formatters, validators, downloads
│   ├── vercel.json           # Vercel SPA rewrite rules
│   ├── package.json
│   └── .env.example
├── render.yaml               # Render deployment config
└── README.md
```

## 6. Setup & Installation

### Prerequisites

- Python 3.13+
- Node.js 18+
- PostgreSQL 14+ (or Supabase account)
- Google Gemini API key

### Backend (Local)

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

### Frontend (Local)

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

## 8. Deployment

### Backend (Render)

1. Push to GitHub
2. Go to [render.com](https://render.com) > **New Web Service**
3. Connect your repo — Render auto-detects `render.yaml`
4. Set environment variables in the Render dashboard:
   - `DATABASE_URL` — your Supabase/PostgreSQL connection string
   - `AI_API_KEY` — your Google Gemini API key
   - `CORS_ORIGINS` — your Vercel frontend URL (e.g. `https://your-app.vercel.app`)
5. Deploy

### Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) > **New Project**
2. Connect your repo, set **Root Directory** to `frontend`
3. Set environment variable:
   - `VITE_API_BASE_URL` — your Render backend URL (e.g. `https://videomind-backend.onrender.com`)
4. Deploy
5. Copy the Vercel URL and add it to Render's `CORS_ORIGINS` env var

## 9. How It Works

1. User enters a YouTube URL, selects output language and summary length
2. Backend validates the URL and extracts the video ID
3. Transcript is retrieved from YouTube captions
4. Transcript is stored in PostgreSQL (or reused if cached)
5. If language differs from transcript, translation is generated via Gemini
6. Gemini generates the structured summary (or cached version is returned)
7. Both transcript and summary are returned in a single API response
8. React displays the results on the Summary and Transcript tabs
9. User can search, copy, regenerate, or download as PDF

## 10. API Overview

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

## 11. Database Schema

```mermaid
erDiagram
    users ||--o{ videos : creates
    videos ||--o{ transcripts : has
    videos ||--o{ summaries : has

    users {
        int id PK
        string name
        string email UK
        string password_hash
        datetime created_at
        datetime updated_at
    }

    videos {
        int id PK
        int user_id FK
        string youtube_id
        string youtube_url
        string title
        string thumbnail_url
        int duration
        datetime created_at
        datetime updated_at
    }

    transcripts {
        int id PK
        int video_id FK
        text content
        string language_code
        bool is_original
        datetime created_at
        datetime updated_at
    }

    summaries {
        int id PK
        int video_id FK
        string language_code
        string summary_length
        text overview
        text detailed_explanation
        json key_points
        json important_concepts
        json main_takeaways
        text conclusion
        datetime created_at
        datetime updated_at
    }
```

## 12. Limitations

- Videos without accessible transcripts cannot be processed
- AI generation depends on Gemini API availability and credits
- Very long videos require additional processing time
- Summary quality depends on transcript quality
- Video titles are placeholders — no metadata scraping

## 13. Future Enhancements

- User accounts and video history
- Background job processing for long videos
- Additional export formats
- Video metadata fetching
- Real-time progress via WebSockets
