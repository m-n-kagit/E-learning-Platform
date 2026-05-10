import "./CourseDetail.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import ReactPlayer from "react-player";
const sampleCourse = {
  title: "Full Stack Web Development",
  description:
    "Learn frontend and backend development with real-world projects, API design, and deployment practices.",
  instructor: {
    _id: "660001a2b3c4d5e6f7000001",
    name: "Rahul Verma",
  },
  thumbnail:
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
  price: 2999,
  category: "Development",
  level: "intermediate",
  lessons: ["L001", "L002", "L003", "L004", "L005"],
  enrolledStudents: ["S001", "S002", "S003", "S004", "S005", "S006"],
  ratings: [
    { user: "U001", rating: 5, review: "Very practical and easy to follow." },
    { user: "U002", rating: 4, review: "Good pace and useful projects." },
  ],
  averageRating: 4.5,
  isPublished: true,
  createdAt: "2026-01-20T10:00:00.000Z",
  updatedAt: "2026-03-28T15:30:00.000Z",
  sampleVideoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
};

function formatDate(value) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function resolveInstructorName(instructor) {
  if (!instructor) return "N/A";
  if (typeof instructor === "string") return instructor;
  return instructor.name || instructor.fullName || instructor.email || "N/A";
}

function getLessonsCount(lessons) {
  return Array.isArray(lessons) ? lessons.length : 0;
}

function getEnrolledCount(students) {
  return Array.isArray(students) ? students.length : 0;
}

function getRatingsCount(ratings) {
  return Array.isArray(ratings) ? ratings.length : 0;
}

function normalizeVideoUrl(value) {
  const resolved = String(value || "").trim();
  if (!resolved || resolved === "null" || resolved === "undefined") return "";
  return resolved;
}
export default function CourseDetail({ course: courseProp }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { courseId } = useParams();//useParams returns an object of 
  // key-value pairs of URL parameters. 
  // In this case, we expect a parameter named courseId in the URL, 
  // which we can use to identify which course's details to display. 
  // If the URL is something like /courses/123, then courseId will be "123".
  const { courses, selectedCourseId } = useSelector((state) => state.activeCourses);
  const student = useSelector((state) => state.studentDetails.student);
  const enrolledCourses = Array.isArray(student?.enrolledCourses) ? student.enrolledCourses : [];
  const normalizedRouteCourseId = String(courseId || "").trim();
  const courseFromRoute = normalizedRouteCourseId
    ? courses.find((item) => String(item._id) === normalizedRouteCourseId) || null
    : null;
  const courseFromStore = courses.find((item) => item._id === selectedCourseId) || null;
  const [fetchedCourse, setFetchedCourse] = useState(null);
  const [fetchError, setFetchError] = useState("");
  let handleEnroll = () => {
    const targetCourseId = course?._id || courseId || "";
    if (student?._id) {
      navigate(
        targetCourseId
          ? (isAlreadyEnrolled ? `/course/${targetCourseId}` : `/enroll/${targetCourseId}`)
          : "/enroll"
      );
    } else {
      navigate("/login");
      alert("Please log in to enroll in this course.");
    }
  };
  useEffect(() => {
    if (!normalizedRouteCourseId) return;
    if (courseProp || courseFromRoute || courseFromStore) return;

    let isMounted = true;
    const fetchCourse = async () => {
      try {
        setFetchError("");
        const response = await axios.get(`/api/courses/available/${normalizedRouteCourseId}`);
        if (!isMounted) return;
        setFetchedCourse(response?.data?.data || null);
      } catch (error) {
        if (!isMounted) return;
        console.error("Failed to fetch course details:", error);
        setFetchError("Unable to load course details.");
      }
    };

    fetchCourse();
    return () => {
      isMounted = false;
    };
  }, [normalizedRouteCourseId, courseProp, courseFromRoute, courseFromStore]);

  const course = courseProp || courseFromRoute || courseFromStore || fetchedCourse || sampleCourse;
  const isAlreadyEnrolled = enrolledCourses.some(
    (enrolledCourse) => String(enrolledCourse?._id || enrolledCourse?.id || enrolledCourse) === String(course?._id || courseId || "")
  );

  const title = course?.title || "Untitled Course";
  const description = course?.description || "No description available.";
  const instructorName = resolveInstructorName(course?.instructor);
  const thumbnail = course?.thumbnail || "";
  const price = Number(course?.price || 0);
  const category = course?.category || "N/A";
  const level = course?.level || "N/A";
  const lessonCount = getLessonsCount(course?.lessons);
  const enrolledCount = getEnrolledCount(course?.enrolledStudents);
  const ratingsCount = getRatingsCount(course?.ratings);
  const averageRating = Number(course?.averageRating || 0);
  const isPublished = Boolean(course?.isPublished);
  const createdAt = formatDate(course?.createdAt);
  const updatedAt = formatDate(course?.updatedAt);
  const overviewVideoUrl =
    course?.overview_video ||
    course?.overviewVideoUrl ||
    
    "";
  console.log("CourseDetail Rendered with url:", overviewVideoUrl);
  return (
    <section className="course-detail">
      <div className="course-detail-video-wrap">
        {overviewVideoUrl ? (
          <ReactPlayer
            src={overviewVideoUrl}
            controls
            width="100%"
            height="100%"
            className="course-detail-video"
          />
        ) : (
          <div className="course-detail-video course-detail-video-empty">
            {fetchError || "No overview video available."}
          </div>
        )}
        
        <div className="course-detail-item course-detail-item-action">
            <button className="course-detail-enroll-btn" onClick={handleEnroll}>
              {isAlreadyEnrolled ? "View Course" : "Enroll Now"}
            </button>
          </div>
      </div>

      <div className="course-detail-body">
        <h2 className="course-detail-title">{title}</h2>
        <p className="course-detail-description">{description}</p>

        <div className="course-detail-grid">
          <div className="course-detail-item">
            <span className="course-detail-label">Instructor</span>
            <span className="course-detail-value">{instructorName}</span>
          </div>
          <div className="course-detail-item">
            <span className="course-detail-label">Price</span>
            <span className="course-detail-value">Rs. {price.toLocaleString("en-IN")}</span>
          </div>
          <div className="course-detail-item">
            <span className="course-detail-label">Category</span>
            <span className="course-detail-value">{category}</span>
          </div>
          <div className="course-detail-item">
            <span className="course-detail-label">Level</span>
            <span className="course-detail-value">{level}</span>
          </div>
          <div className="course-detail-item">
            <span className="course-detail-label">Lessons</span>
            <span className="course-detail-value">{lessonCount}</span>
          </div>
          <div className="course-detail-item">
            <span className="course-detail-label">Enrolled Students</span>
            <span className="course-detail-value">{enrolledCount}</span>
          </div>
          <div className="course-detail-item">
            <span className="course-detail-label">Average Rating</span>
            <span className="course-detail-value">{averageRating.toFixed(1)} / 5</span>
          </div>
          <div className="course-detail-item">
            <span className="course-detail-label">Ratings Count</span>
            <span className="course-detail-value">{ratingsCount}</span>
          </div>
          <div className="course-detail-item">
            <span className="course-detail-label">Published</span>
            <span className="course-detail-value">{isPublished ? "Yes" : "No"}</span>
          </div>
          <div className="course-detail-item">
            <span className="course-detail-label">Created On</span>
            <span className="course-detail-value">{createdAt}</span>
          </div>
          <div className="course-detail-item">
            <span className="course-detail-label">Updated On</span>
            <span className="course-detail-value">{updatedAt}</span>
          </div>
          
        </div>
      </div>
    </section>
  );
}
