# E-Learning Platform

A full-stack learning management platform built with React, Vite, Express, and MongoDB. The app supports student learning flows, course administration, global administration, authentication, course enrollment, lesson management, payments, invoices, reviews, profile updates, file uploads, email OTP flows, and secure API access through JWT cookies.

## Project Structure

```text
E-learning Platform/
|-- e-learn/              # React + Vite frontend
|-- e-learn_backend/      # Express + MongoDB backend API
|-- package.json          # Older/root backend package metadata
|-- package-lock.json
`-- README.md
```

Most active development is split between:

- `e-learn`: frontend application and routing.
- `e-learn_backend`: Express API, database models, middleware, tests, and the Python chatbot service.
- `e-learn_backend/src/controller/chatbot`: FastAPI RAG service, PDF ingestion, embeddings, and Qdrant configuration.

## Features

- User registration with OTP verification and optional verification document upload.
- JWT cookie authentication with role-based access control.
- Roles for `user`, `course_admin`, and `admin`.
- Student dashboard with course browsing, enrollment, lessons, payments, invoices, and reviews.
- Course admin dashboard for managing courses, lessons, media, thumbnails, and reviews.
- Global admin dashboard.
- Password reset flow using OTP.
- Contact email API.
- MongoDB persistence with Mongoose models.
- Cloudinary integration for uploaded course media.
- VirusTotal integration for production file scanning.
- Course chatbot with PDF indexing and retrieval-augmented answers.
- Dense and sparse document search using Hugging Face embeddings, BM25, and Qdrant.
- API rate limiting, sanitization, logging, and global error handling.

## Tech Stack

**Frontend**

- React 19
- Vite
- React Router
- Redux Toolkit
- Axios
- React Player
- ESLint

**Backend**

- Node.js
- Express 5
- MongoDB and Mongoose
- JWT authentication
- Multer file uploads
- Cloudinary
- Nodemailer
- PDFKit invoices
- Winston logging
- Jest

**Chatbot / RAG**

- FastAPI and Uvicorn
- Google Gemini `gemini-3.8-flash`
- Hugging Face `BAAI/bge-small-en-v1.5` embeddings
- Qdrant vector database
- Qdrant BM25 sparse embeddings
- LangChain document splitting and retrieval
- Docker Compose

## Prerequisites

- Node.js 18 or newer
- npm
- MongoDB connection string, either local or hosted
- Cloudinary account for media uploads
- SMTP credentials for OTP and contact email flows
- VirusTotal API key if production file scanning is enabled
- Python 3.10 or newer
- Docker with Docker Compose
- Google API key for Gemini
- Qdrant API key

## Environment Variables

Create `e-learn_backend/.env` with the variables below. Keep this file private; it is intentionally ignored by Git.

```env
PORT=45000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=http://localhost:5173

ACCESS_TOKEN_SECRET=your_jwt_secret
ACCESS_TOKEN_EXPIRY=3600000
ACCESS_TOKEN_COOKIE_MAX_AGE_MS=3600000

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

SMTP_USER=your_email_address
SMTP_PASS=your_email_app_password

VIRUS_TOTAL_API_KEY=your_virustotal_api_key
NODE_ENV=development
```

The frontend Vite dev server proxies `/api` requests to `http://localhost:45000`, so the backend should use `PORT=45000` during local development unless you update `e-learn/vite.config.js`.

Add the chatbot variables to `e-learn_backend/.env`:

```env
CHATBOT_API_URL=http://127.0.0.1:8000
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your_qdrant_api_key
GOOGLE_API_KEY=your_google_api_key
GEMINI_MODEL=gemini-3.8-flash
```

The chatbot code checks `e-learn_backend/src/controller/chatbot/.env` first and falls back to `e-learn_backend/.env`. Docker Compose reads its variables from the chatbot directory, so this separate file is commonly used:

```env
# e-learn_backend/src/controller/chatbot/.env
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your_qdrant_api_key
GOOGLE_API_KEY=your_google_api_key
GEMINI_MODEL=gemini-3.8-flash
```

Keep `.env` files private. Qdrant's local data directory is `e-learn_backend/src/controller/chatbot/qdrant_storage/`.

## Installation

Install backend dependencies:

```bash
cd e-learn_backend
npm install
```

Install frontend dependencies:

```bash
cd ../e-learn
npm install
```

Create a Python virtual environment and install the chatbot dependencies:

```bash
cd ../e-learn_backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r src/controller/chatbot/requirements.txt
```

## Running Locally

### Start Qdrant

From the chatbot directory:

```bash
cd e-learn_backend/src/controller/chatbot
docker compose up -d
```

This starts the `qdrant/qdrant:latest` container on:

- REST API: `http://localhost:6333`
- gRPC API: `localhost:6334`
- Dashboard: `http://localhost:6333/dashboard`

Persistent Qdrant data is stored in `./qdrant_storage`. Check or stop the service with:

```bash
docker compose ps
docker compose logs -f qdrant
docker compose down
```

### Start the FastAPI chatbot

With the Python virtual environment active:

```bash
cd e-learn_backend
source .venv/bin/activate
python -m uvicorn src.controller.chatbot.api:app --reload --host 127.0.0.1 --port 8000
```

FastAPI is available at `http://127.0.0.1:8000`, with interactive API documentation at `http://127.0.0.1:8000/docs`.

Verify the chatbot server:

```bash
curl http://127.0.0.1:8000/health
# {"status":"ok"}
```

### RAG Architecture

```text
React chatbot
  -> Express API (/api/chatbot)
  -> FastAPI (/chatbot/document_fetch or /chatbot/ask)
  -> PDF extraction and 1000-character text chunks
  -> Dense embeddings: BAAI/bge-small-en-v1.5
  -> Sparse embeddings: Qdrant/bm25
  -> Qdrant hybrid collection
  -> Top matching course chunks
  -> Gemini 3.8 Flash grounded answer
```

The Express backend indexes PDF lesson resources for the current enrolled course. Each course uses a collection named `course_<sanitized_course_id>`. On a chat request, FastAPI retrieves up to four matching chunks by default, supplies those chunks as context to Gemini, and asks the model to answer only from the course material.

Start the backend API:

```bash
cd e-learn_backend
npm run dev
```

Start the frontend in a second terminal:

```bash
cd e-learn
npm run dev
```

Open the frontend at:

```text
http://localhost:5173
```

The backend health endpoint is available at:

```text
http://localhost:45000/api/health
```

## Available Scripts

Frontend scripts from `e-learn/package.json`:

```bash
npm run dev      # Start Vite dev server
npm run build    # Build production frontend
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

Backend scripts from `e-learn_backend/package.json`:

```bash
npm run dev      # Start backend with nodemon and dotenv
npm start        # Start backend with node
npm run test2    # Run Jest tests
```

## Main Frontend Routes

- `/`: home page
- `/about`: about page
- `/explore`: public course exploration
- `/contact`: contact page
- `/login`: login page
- `/signup`: registration page
- `/validate-otp`: OTP verification page
- `/forget-password`: password reset request page
- `/student-dashboard`: protected student dashboard
- `/course-admin`: protected course admin dashboard
- `/global-admin`: protected global admin dashboard
- `/course_detail/:courseId`: course details modal/page
- `/course/:courseId`: student course view
- `/enroll/:courseId`: enrollment/payment flow

## Main API Routes

Base URL during local development:

```text
http://localhost:45000/api
```

Authentication routes:

- `POST /api/auth/register-temp`
- `POST /api/auth/send-otp`
- `POST /api/auth/verify-otp`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/forget-password`
- `POST /api/auth/verify-otp-forget-password`
- `POST /api/auth/enter-new-password`
- `GET /api/auth/me`
- `PATCH /api/auth/update-profile`

Course routes:

- `GET /api/courses/available`
- `GET /api/courses/available/:courseId`
- `GET /api/courses/detail/:courseId`
- `GET /api/courses/get-all-courses`
- `POST /api/courses/upload-content`
- `PATCH /api/courses/update-course`
- `POST /api/courses/add-lesson`
- `PATCH /api/courses/update-lesson`
- `DELETE /api/courses/remove-lesson`
- `DELETE /api/courses/delete-course`
- `POST /api/courses/enroll-course`
- `GET /api/courses/my-enrollments`
- `DELETE /api/courses/unenroll`
- `GET /api/courses/course/:courseId/lessons`

Payment and review routes:

- `POST /api/payments`
- `GET /api/payments/history`
- `GET /api/payments/:paymentId/invoice`
- `POST /api/review/:courseId`
- `GET /api/reviews/:courseId`

Other routes:

- `POST /api/emails/contact`
- `GET /api/health`

Chatbot routes:

- `POST /api/chatbot/prepare`
- `POST /api/chatbot/ask`

FastAPI chatbot routes:

- `GET /health`
- `POST /chatbot/document_fetch`
- `POST /chatbot/ask`

## Notes

- The backend uses cookies for authentication, so frontend requests that require login use `withCredentials: true`.
- In production, auth cookies are marked secure when `NODE_ENV=production`.
- Uploaded assets are handled through Multer and Cloudinary.
- Invoices are generated with PDFKit.
- Logs and generated files should stay out of version control.
