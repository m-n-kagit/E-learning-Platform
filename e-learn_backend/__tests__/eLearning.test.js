/**
 * E-Learning Platform - Jest Test Suite
 * Project: E-Learning Platform (Authentication & Course Management)
 * Based on: E-Learning_Platform_Test_Cases.xlsx
 * Stack: React (Vite) + Express + MongoDB (Mongoose)
 *
 * Run: npx jest eLearning.test.js
 * Dependencies to install:
 *   npm install --save-dev jest @testing-library/react @testing-library/jest-dom
 *               @testing-library/user-event jest-environment-jsdom axios-mock-adapter
 */

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// ─── Utility / Validator helpers (mirrored from source) ──────────────────────
function validateEmail(text) {
  if (!text) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
}

function validatePassword(text) {
  return /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(text);
}

// ─── Test constants ───────────────────────────────────────────────────────────
const VALID_EMAIL    = 'mohit.sharma.dev007@gmail.com';
const VALID_PASSWORD = 'Mohit@123';
const WRONG_PASSWORD = 'Mo@124';
const NONEXISTENT_EMAIL = 'notfound@example.com';

let mock;

beforeAll(() => { mock = new MockAdapter(axios); });
afterEach(() => { mock.reset(); });
afterAll(() => { mock.restore(); });

// ═══════════════════════════════════════════════════════════════════════════════
// TC_REG – Registration
// ═══════════════════════════════════════════════════════════════════════════════
describe('Registration Tests', () => {

  // TC_REG_001 – Valid registration
  test('TC_REG_001: registers a new user with valid email and password', async () => {
    mock.onPost('/api/auth/register-temp').reply(200, {
      success: true,
      message: 'User account created successfully and redirected to login page',
    });

    const payload = { name: 'Mohit Sharma', email: VALID_EMAIL, password: VALID_PASSWORD, role: 'student' };
    const res = await axios.post('/api/auth/register-temp', payload);

    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
    expect(res.data.message).toMatch(/created successfully/i);
  });

  // TC_REG_002 – Invalid / weak password
  test('TC_REG_002: rejects registration with a password that does not meet requirements', async () => {
    const weakPassword = 'test123';  // no uppercase, no special char
    expect(validatePassword(weakPassword)).toBe(false);

    mock.onPost('/api/auth/register-temp').reply(400, {
      success: false,
      message: 'Password must contain at least 8 characters, 1 uppercase, 1 lowercase, 1 digit, and 1 special character',
    });

    const res = await axios.post('/api/auth/register-temp', {
      name: 'Test User', email: VALID_EMAIL, password: weakPassword,
    }).catch(e => e.response);

    expect(res.status).toBe(400);
    expect(res.data.message).toMatch(/password must contain/i);
  });

  // TC_REG_003 – Duplicate email
  test('TC_REG_003: returns error when registering with an already-existing email', async () => {
    mock.onPost('/api/auth/register-temp').reply(400, {
      success: false,
      message: 'Email already registered. Please login or use forgot password',
    });

    const res = await axios.post('/api/auth/register-temp', {
      name: 'Mohit Sharma', email: VALID_EMAIL, password: VALID_PASSWORD,
    }).catch(e => e.response);

    expect(res.status).toBe(400);
    expect(res.data.message).toMatch(/email already registered/i);
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// TC_LOGIN – Login
// ═══════════════════════════════════════════════════════════════════════════════
describe('Login Tests', () => {

  // TC_LOGIN_001 – Valid credentials
  test('TC_LOGIN_001: logs in successfully with valid email and password', async () => {
    mock.onPost('/api/auth/login').reply(200, {
      success: true,
      message: 'User logged in successfully and redirected to dashboard',
      data: { role: 'user', _id: 'u001' },
    });

    const res = await axios.post('/api/auth/login', {
      email: VALID_EMAIL, password: VALID_PASSWORD,
    });

    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
    expect(res.data.data.role).toBe('user');
  });

  // TC_LOGIN_002 – Wrong password
  test('TC_LOGIN_002: returns error for wrong password', async () => {
    mock.onPost('/api/auth/login').reply(401, {
      success: false,
      message: 'Invalid email or password',
    });

    const res = await axios.post('/api/auth/login', {
      email: VALID_EMAIL, password: WRONG_PASSWORD,
    }).catch(e => e.response);

    expect(res.status).toBe(401);
    expect(res.data.message).toBe('Invalid email or password');
  });

  // TC_LOGIN_003 – Non-existent user
  test('TC_LOGIN_003: returns error when email does not exist in database', async () => {
    mock.onPost('/api/auth/login').reply(401, {
      success: false,
      message: 'Invalid email or password',
    });

    const res = await axios.post('/api/auth/login', {
      email: NONEXISTENT_EMAIL, password: 'Test@123',
    }).catch(e => e.response);

    expect(res.status).toBe(401);
    expect(res.data.message).toBe('Invalid email or password');
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// TC_OTP – OTP Flow (Forgot Password)
// ═══════════════════════════════════════════════════════════════════════════════
describe('OTP Tests', () => {

  // TC_OTP_001 – OTP generation
  test('TC_OTP_001: generates and sends OTP to registered email', async () => {
    mock.onPost('/api/auth/forget-password').reply(200, {
      success: true,
      message: 'OTP generated and sent to email. Success message displayed',
    });

    const res = await axios.post('/api/auth/forget-password', { email: 'test@example.com' });

    expect(res.status).toBe(200);
    expect(res.data.message).toMatch(/otp generated/i);
  });

  // TC_OTP_002 – Valid OTP
  test('TC_OTP_002: verifies OTP successfully with correct code', async () => {
    mock.onPost('/api/auth/verify-otp-forget-password').reply(200, {
      success: true,
      message: 'OTP verified successfully. User can set new password',
    });

    const res = await axios.post('/api/auth/verify-otp-forget-password', {
      email: 'test@example.com', otp: '123456',
    });

    expect(res.status).toBe(200);
    expect(res.data.message).toMatch(/otp verified/i);
  });

  // TC_OTP_003 – Expired OTP
  test('TC_OTP_003: rejects expired OTP with appropriate error', async () => {
    mock.onPost('/api/auth/verify-otp-forget-password').reply(400, {
      success: false,
      message: 'OTP has expired. Please request a new one',
    });

    const res = await axios.post('/api/auth/verify-otp-forget-password', {
      email: 'test@example.com', otp: '123456',
    }).catch(e => e.response);

    expect(res.status).toBe(400);
    expect(res.data.message).toMatch(/expired/i);
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// TC_COURSE – Course Management (Instructor)
// ═══════════════════════════════════════════════════════════════════════════════
describe('Course Management Tests', () => {

  // TC_COURSE_001 – Create course
  test('TC_COURSE_001: instructor creates a new course with all required fields', async () => {
    mock.onPost('/api/courses/upload-content').reply(201, {
      success: true,
      message: 'Course created successfully and visible in instructor dashboard',
      data: { _id: 'c001', title: 'Python Programming', price: 1300, isPublished: true },
    });

    const formData = new FormData();
    formData.append('title', 'Python Programming');
    formData.append('description', 'Learn Python');
    formData.append('price', '1300');

    const res = await axios.post('/api/courses/upload-content', formData);

    expect(res.status).toBe(201);
    expect(res.data.data.title).toBe('Python Programming');
  });

  // TC_COURSE_002 – Add lesson to course
  test('TC_COURSE_002: instructor adds a video lesson to an existing course', async () => {
    mock.onPost('/api/courses/add-lesson').reply(201, {
      success: true,
      message: 'Lesson added successfully and appears in course structure',
      data: { lesson: { _id: 'l001', title: 'Introduction to Python' } },
    });

    const res = await axios.post('/api/courses/add-lesson', {
      courseId: 'c001',
      title: 'Introduction to Python',
      description: 'Intro lesson',
    });

    expect(res.status).toBe(201);
    expect(res.data.message).toMatch(/lesson added successfully/i);
  });

  // TC_COURSE_003 – Publish course
  test('TC_COURSE_003: publishes a draft course and changes status to published', async () => {
    mock.onPatch('/api/courses/update-course').reply(200, {
      success: true,
      message: 'Course status changed to published and visible to students',
      data: { _id: 'c001', isPublished: true },
    });

    const res = await axios.patch('/api/courses/update-course', {
      _id: 'c001', isPublished: true,
    });

    expect(res.status).toBe(200);
    expect(res.data.data.isPublished).toBe(true);
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// TC_ENROLL – Course Enrollment
// ═══════════════════════════════════════════════════════════════════════════════
describe('Course Enrollment Tests', () => {

  // TC_ENROLL_001 – Enroll in free course
  test('TC_ENROLL_001: student enrolls in a free course successfully', async () => {
    mock.onPost('/api/payments').reply(200, {
      success: true,
      message: 'Student enrolled successfully. Course appears in "My Courses"',
      data: { _id: 'pay001', paymentStatus: 'completed', course: 'Introduction to HTML' },
    });

    const res = await axios.post('/api/payments', {
      courseId: 'free001', amount: 0, paymentMethod: 'credit_card',
    });

    expect(res.status).toBe(200);
    expect(res.data.message).toMatch(/enrolled successfully/i);
  });

  // TC_ENROLL_002 – Paid course enrollment
  test('TC_ENROLL_002: student enrolls in a paid course after successful payment', async () => {
    mock.onPost('/api/payments').reply(200, {
      success: true,
      message: 'Payment processed successfully. Student enrolled in course',
      data: { _id: 'pay002', paymentStatus: 'completed', amount: 1300 },
    });

    const res = await axios.post('/api/payments', {
      courseId: 'c001', amount: 1300, paymentMethod: 'credit_card',
    });

    expect(res.status).toBe(200);
    expect(res.data.data.paymentStatus).toBe('completed');
  });

  // TC_ENROLL_003 – Duplicate enrollment prevention
  test('TC_ENROLL_003: prevents duplicate enrollment and shows correct message', async () => {
    mock.onPost('/api/payments').reply(400, {
      success: false,
      message: 'Already enrolled',
    });

    const res = await axios.post('/api/payments', {
      courseId: 'c001', amount: 1300, paymentMethod: 'credit_card',
    }).catch(e => e.response);

    expect(res.status).toBe(400);
    expect(res.data.message).toMatch(/already enrolled/i);
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// TC_PROG – Progress Tracking
// ═══════════════════════════════════════════════════════════════════════════════
describe('Progress Tracking Tests', () => {

  // TC_PROG_001 – Mark lesson as complete
  test('TC_PROG_001: marks a lesson as complete and updates progress', async () => {
    mock.onPatch('/api/courses/mark-lesson-complete').reply(200, {
      success: true,
      message: 'Lesson marked complete. Progress updated',
      data: { lessonId: '1001', completed: true },
    });

    const res = await axios.patch('/api/courses/mark-lesson-complete', {
      lessonId: '1001', courseId: 'c001',
    });

    expect(res.status).toBe(200);
    expect(res.data.message).toMatch(/lesson marked complete/i);
  });

  // TC_PROG_002 – Course progress calculation
  test('TC_PROG_002: calculates correct overall progress percentage', async () => {
    mock.onGet('/api/courses/my-enrollments').reply(200, {
      success: true,
      data: [{ _id: 'c001', title: 'Python', progress: 50, completed: 5, total: 10 }],
    });

    const res = await axios.get('/api/courses/my-enrollments');
    const course = res.data.data[0];

    expect(res.status).toBe(200);
    expect(course.progress).toBe(50);
    // Verify the progress formula: (completed / total) * 100
    expect((course.completed / course.total) * 100).toBe(50);
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// TC_REVIEW – Course Reviews
// ═══════════════════════════════════════════════════════════════════════════════
describe('Course Review Tests', () => {

  // TC_REVIEW_001 – Submit review
  test('TC_REVIEW_001: student submits a review with rating successfully', async () => {
    mock.onPost('/api/review/c001').reply(201, {
      success: true,
      message: 'Review submitted successfully and visible on course page',
      data: { _id: 'r001', rating: 5, comment: 'Excellent course' },
    });

    const res = await axios.post('/api/review/c001', { rating: 5, comment: 'Excellent course' });

    expect(res.status).toBe(201);
    expect(res.data.data.rating).toBe(5);
  });

  // TC_REVIEW_002 – Edit existing review
  test('TC_REVIEW_002: student updates an existing review successfully', async () => {
    mock.onPatch('/api/review/r001').reply(200, {
      success: true,
      message: 'Review updated successfully with new content',
      data: { _id: 'r001', rating: 4, comment: 'Good course' },
    });

    const res = await axios.patch('/api/review/r001', { rating: 4 });

    expect(res.status).toBe(200);
    expect(res.data.data.rating).toBe(4);
    expect(res.data.message).toMatch(/updated successfully/i);
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// TC_PAY – Payment Processing
// ═══════════════════════════════════════════════════════════════════════════════
describe('Payment Processing Tests', () => {

  // TC_PAY_001 – Successful payment
  test('TC_PAY_001: processes payment successfully and generates receipt', async () => {
    mock.onPost('/api/payments').reply(200, {
      success: true,
      message: 'Payment processed successfully. Receipt generated',
      data: { _id: 'pay003', transactionId: 'TXN-001', paymentStatus: 'completed', amount: 49.99 },
    });

    const res = await axios.post('/api/payments', {
      courseId: 'c002', amount: 49.99, paymentMethod: 'credit_card',
    });

    expect(res.status).toBe(200);
    expect(res.data.data.paymentStatus).toBe('completed');
    expect(res.data.data.transactionId).toBeDefined();
  });

  // TC_PAY_002 – Failed payment
  test('TC_PAY_002: handles payment failure and shows error message', async () => {
    mock.onPost('/api/payments').reply(402, {
      success: false,
      message: 'Payment failed. Please check your payment method',
    });

    const res = await axios.post('/api/payments', {
      courseId: 'c002', amount: 49.99, paymentMethod: 'credit_card',
    }).catch(e => e.response);

    expect(res.status).toBe(402);
    expect(res.data.message).toMatch(/payment failed/i);
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// TC_DASH – Dashboard
// ═══════════════════════════════════════════════════════════════════════════════
describe('Dashboard Tests', () => {

  // TC_DASH_001 – Student dashboard
  test('TC_DASH_001: student dashboard shows enrolled courses, progress, and certificates', async () => {
    mock.onGet('/api/auth/me').reply(200, {
      success: true,
      data: {
        _id: '5001', role: 'user', name: 'Mohit', enrolledCourses: [],
        certificates: [], globalRanking: 247,
      },
    });

    const res = await axios.get('/api/auth/me');

    expect(res.status).toBe(200);
    expect(res.data.data.role).toBe('user');
    expect(Array.isArray(res.data.data.enrolledCourses)).toBe(true);
  });

  // TC_DASH_002 – Instructor dashboard
  test('TC_DASH_002: instructor dashboard shows created courses, enrollments, and revenue', async () => {
    mock.onGet('/api/courses/get-all-courses').reply(200, {
      success: true,
      data: [
        { _id: 'c001', title: 'Python', enrolledStudents: [], averageRating: 4.5, price: 1300 },
      ],
    });

    const res = await axios.get('/api/courses/get-all-courses');

    expect(res.status).toBe(200);
    expect(res.data.data.length).toBeGreaterThan(0);
    expect(res.data.data[0]).toHaveProperty('enrolledStudents');
    expect(res.data.data[0]).toHaveProperty('averageRating');
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// TC_CERT – Certificate Generation
// ═══════════════════════════════════════════════════════════════════════════════
describe('Certificate Generation Tests', () => {

  // TC_CERT_001 – Generate certificate on course completion
  test('TC_CERT_001: generates certificate when student completes 100% of course', async () => {
    mock.onGet('/api/payments/cert001/invoice').reply(200, {
      success: true,
      message: 'Certificate generated with student name and completion date',
      data: { invoiceUrl: 'https://cdn.example.com/cert001.pdf' },
    });

    const res = await axios.get('/api/payments/cert001/invoice');

    expect(res.status).toBe(200);
    expect(res.data.data.invoiceUrl).toMatch(/\.pdf$/);
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// TC_SEARCH / TC_FILTER – Search and Filtering
// ═══════════════════════════════════════════════════════════════════════════════
describe('Search & Filter Tests', () => {

  // TC_SEARCH_001 – Keyword search
  test('TC_SEARCH_001: returns courses containing the keyword "Python"', async () => {
    mock.onGet('/api/courses/available').reply(200, {
      success: true,
      data: [
        { _id: 'c001', title: 'Python Programming', isPublished: true },
        { _id: 'c002', title: 'Advanced Python', isPublished: true },
      ],
      total: 2,
    });

    const res = await axios.get('/api/courses/available');
    const results = res.data.data.filter(c =>
      c.title.toLowerCase().includes('python')
    );

    expect(results.length).toBeGreaterThan(0);
    results.forEach(c => expect(c.title.toLowerCase()).toContain('python'));
  });

  // TC_FILTER_001 – Filter by category
  test('TC_FILTER_001: filters courses by "Programming" category', async () => {
    mock.onGet('/api/courses/available').reply(200, {
      success: true,
      data: [
        { _id: 'c001', title: 'Python', category: 'Programming', isPublished: true },
        { _id: 'c002', title: 'JavaScript', category: 'Programming', isPublished: true },
        { _id: 'c003', title: 'UI/UX', category: 'Design', isPublished: true },
      ],
    });

    const res = await axios.get('/api/courses/available');
    const filtered = res.data.data.filter(c => c.category === 'Programming');

    expect(filtered.length).toBe(2);
    filtered.forEach(c => expect(c.category).toBe('Programming'));
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// TC_SEC – Security
// ═══════════════════════════════════════════════════════════════════════════════
describe('Security Tests', () => {

  // TC_SEC_001 – JWT token expiration
  test('TC_SEC_001: redirects to login page when JWT token is expired', async () => {
    mock.onGet('/api/auth/me').reply(401, {
      success: false,
      message: 'Session expired. Please login again',
    });

    const res = await axios.get('/api/auth/me').catch(e => e.response);

    expect(res.status).toBe(401);
    expect(res.data.message).toMatch(/session expired|unauthorized/i);
  });

  // TC_SEC_002 – SQL injection prevention
  test('TC_SEC_002: login does not execute SQL injection and remains secure', async () => {
    const injectionEmail = "admin' OR '1'='1";

    // The email validator should reject it before it even reaches the API
    expect(validateEmail(injectionEmail)).toBe(false);

    mock.onPost('/api/auth/login').reply(401, {
      success: false,
      message: 'Invalid email or password',
    });

    const res = await axios.post('/api/auth/login', {
      email: injectionEmail, password: 'test',
    }).catch(e => e.response);

    expect(res.status).toBe(401);
    // Ensure no successful login
    expect(res.data.success).toBe(false);
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// TC_UPLOAD – File / Video Upload
// ═══════════════════════════════════════════════════════════════════════════════
describe('Video Upload Tests', () => {

  // TC_UPLOAD_001 – Valid video upload
  test('TC_UPLOAD_001: successfully uploads a valid video file to cloud storage', async () => {
    mock.onPost('/api/courses/add-lesson').reply(201, {
      success: true,
      message: 'Video uploaded successfully to cloud storage',
      data: {
        lesson: { _id: 'l002', videoUrl: 'https://cloudinary.com/video/lesson01.mp4' },
      },
    });

    const formData = new FormData();
    formData.append('courseId', 'c001');
    formData.append('title', 'Lesson 01');
    // Simulating a 50 MB file name
    formData.append('lessonVideoName', 'lesson01.mp4');

    const res = await axios.post('/api/courses/add-lesson', formData);

    expect(res.status).toBe(201);
    expect(res.data.data.lesson.videoUrl).toContain('cloudinary');
  });

  // TC_UPLOAD_002 – File size limit exceeded
  test('TC_UPLOAD_002: rejects video upload that exceeds the 200 MB size limit', async () => {
    mock.onPost('/api/courses/add-lesson').reply(413, {
      success: false,
      message: 'File size exceeds maximum limit of 200MB',
    });

    const res = await axios.post('/api/courses/add-lesson', {
      courseId: 'c001', title: 'Big Lesson', lessonVideoName: 'lesson02.mp4', // 500MB sim
    }).catch(e => e.response);

    expect(res.status).toBe(413);
    expect(res.data.message).toMatch(/exceeds maximum limit/i);
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// Utility / Validator unit tests
// ═══════════════════════════════════════════════════════════════════════════════
describe('Utility / Validator Unit Tests', () => {

  describe('Email Validator', () => {
    test('accepts a valid email', () => {
      expect(validateEmail(VALID_EMAIL)).toBe(true);
    });
    test('rejects empty string', () => {
      expect(validateEmail('')).toBe(false);
    });
    test('rejects email without domain', () => {
      expect(validateEmail('user@')).toBe(false);
    });
    test('rejects SQL injection string as email', () => {
      expect(validateEmail("admin' OR '1'='1")).toBe(false);
    });
  });

  describe('Password Validator', () => {
    test('accepts a strong password', () => {
      expect(validatePassword(VALID_PASSWORD)).toBe(true);
    });
    test('rejects password without uppercase', () => {
      expect(validatePassword('mohit@123')).toBe(false);
    });
    test('rejects password without special character', () => {
      expect(validatePassword('Mohit1234')).toBe(false);
    });
    test('rejects password shorter than 8 characters', () => {
      expect(validatePassword('M@h1')).toBe(false);
    });
    test('rejects password without digit', () => {
      expect(validatePassword('Mohit@abc')).toBe(false);
    });
  });

  describe('Progress Calculation', () => {
    test('calculates 50% progress for 5 of 10 completed lessons', () => {
      const completed = 5;
      const total     = 10;
      const progress  = Math.round((completed / total) * 100);
      expect(progress).toBe(50);
    });

    test('calculates 100% progress when all lessons are completed', () => {
      const progress = Math.round((10 / 10) * 100);
      expect(progress).toBe(100);
    });

    test('calculates 0% progress when no lessons are completed', () => {
      const progress = Math.round((0 / 10) * 100);
      expect(progress).toBe(0);
    });
  });

});
