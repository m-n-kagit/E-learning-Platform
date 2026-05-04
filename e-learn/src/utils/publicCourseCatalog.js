import aiImage from "../images/Ai_image.jpg";
import uiImage from "../images/UI_image.jpg";
import cyberImage from "../images/Cyber_image.jpg";
import devImage from "../images/1687.jpg";
import dataAnalyticsImage from "../images/DA_image.jfif";

const fallbackCourses = [
  {
    _id: "fallback-1",
    title: "Full-Stack Web Dev Bootcamp",
    description: "Build real-world apps from HTML to deployment with React & Node.js.",
    instructor: "Course Admin",
    thumbnail: devImage,
    price: 0,
    category: "Development",
    level: "beginner",
    lessons: [],
    enrolledStudents: [],
    ratings: [],
    averageRating: 0,
    studentsCount: 12400,
    isPublished: true,
  },
  {
    _id: "fallback-2",
    title: "Machine Learning Fundamentals",
    description: "Understand algorithms, neural networks, and build intelligent models.",
    instructor: "Course Admin",
    thumbnail: aiImage,
    price: 0,
    category: "AI & ML",
    level: "intermediate",
    lessons: [],
    enrolledStudents: [],
    ratings: [],
    averageRating: 0,
    studentsCount: 8900,
    isPublished: true,
  },
  {
    _id: "fallback-3",
    title: "UI/UX Design Mastery",
    description: "Learn to craft beautiful, user-centered digital products from scratch.",
    instructor: "Course Admin",
    thumbnail: uiImage,
    price: 0,
    category: "Design",
    level: "beginner",
    lessons: [],
    enrolledStudents: [],
    ratings: [],
    averageRating: 0,
    studentsCount: 6200,
    isPublished: true,
  },
  {
    _id: "fallback-4",
    title: "Data Analytics with Python",
    description: "Analyze, visualize, and derive insights from complex datasets.",
    instructor: "Course Admin",
    thumbnail: cyberImage,
    price: 0,
    category: "Data Science",
    level: "intermediate",
    lessons: [],
    enrolledStudents: [],
    ratings: [],
    averageRating: 0,
    studentsCount: 9700,
    isPublished: true,
  },
  {
    _id: "fallback-5",
    title: "AWS Cloud Architecture",
    description: "Design scalable, secure cloud infrastructure on Amazon Web Services.",
    instructor: "Course Admin",
    thumbnail: dataAnalyticsImage,
    price: 0,
    category: "Cloud",
    level: "advanced",
    lessons: [],
    enrolledStudents: [],
    ratings: [],
    averageRating: 0,
    studentsCount: 4500,
    isPublished: true,
  },
  {
    _id: "fallback-6",
    title: "Ethical Hacking & Cybersecurity",
    description: "Protect systems and networks with ethical hacking techniques.",
    instructor: "Course Admin",
    thumbnail: cyberImage,
    price: 0,
    category: "Security",
    level: "intermediate",
    lessons: [],
    enrolledStudents: [],
    ratings: [],
    averageRating: 0,
    studentsCount: 7800,
    isPublished: true,
  },
];

export function getPublishedPublicCourses(courses = []) {
  const publishedCourses = Array.isArray(courses)
    ? courses.filter((course) => course?.isPublished)
    : [];

  return publishedCourses.length > 0 ? publishedCourses : fallbackCourses;
}

export function formatCourseLevel(level) {
  const normalizedLevel = String(level || "").trim().toLowerCase();
  if (!normalizedLevel) return "Beginner";
  return normalizedLevel.charAt(0).toUpperCase() + normalizedLevel.slice(1);
}

export function resolveInstructorName(instructor) {
  if (!instructor) return "Course Admin";
  if (typeof instructor === "string") return instructor;
  return instructor.name || instructor.fullName || instructor.email || "Course Admin";
}

export function getCourseStudentCount(course) {
  return Number(course?.studentsCount || course?.enrolledStudents?.length || 0);
}
