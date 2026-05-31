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
- `e-learn_backend`: backend API, database models, controllers, middleware, tests, logs, invoices, and documentation diagrams.

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

## Prerequisites

- Node.js 18 or newer
- npm
- MongoDB connection string, either local or hosted
- Cloudinary account for media uploads
- SMTP credentials for OTP and contact email flows
- VirusTotal API key if production file scanning is enabled

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

## Running Locally

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

## Notes

- The backend uses cookies for authentication, so frontend requests that require login use `withCredentials: true`.
- In production, auth cookies are marked secure when `NODE_ENV=production`.
- Uploaded assets are handled through Multer and Cloudinary.
- Invoices are generated with PDFKit.
- Logs and generated files should stay out of version control.
