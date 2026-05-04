import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { enrollStudent, selectCourse } from "../features/activeCoursesSlice";
import StatsSection from "../components/StatsSection";
import Footer from "../components/Footer";
import devImage from "../images/1687.jpg";
import useAvailablePublicCourses from "../hooks/useAvailablePublicCourses";
import {
  formatCourseLevel,
  getCourseStudentCount,
} from "../utils/publicCourseCatalog";

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const student = useSelector((state) => state.studentDetails.student);
  const { publicCourses, status, error } = useAvailablePublicCourses();

  const handleEnroll = (course) => {
    const studentId = student?._id || "local-student";
    dispatch(enrollStudent({ courseId: course._id, studentId }));
    dispatch(selectCourse(course._id));
    navigate(`/course/${course._id}`, {
      state: { backgroundLocation: location },
    });
  };

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div>
            <div className="hero-label">E-Learning Platform</div>
            <h1 className="hero-title">
              Learn Skills That
              <br />
              <span className="accent">Actually Matter</span>
            </h1>
            <p className="hero-desc">
              Access 1,200+ expert-crafted courses in tech, design, and business.
              Learn at your own pace, earn certificates, and grow your career.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={() => navigate("/explore")}>
                Browse Courses
              </button>
              <button className="btn-outline" onClick={() => navigate("/signup")}>
                Get Started Free
              </button>
            </div>
          </div>
        </div>
      </section>

      <StatsSection />

      <section className="section">
        <div className="section-label">Popular Courses</div>
        <h2 className="section-title">Start Learning Today</h2>
        <p className="section-sub">
          Browse published courses from our instructors, including the latest uploads.
        </p>

        {status === "loading" && (
          <p className="section-sub">Loading courses...</p>
        )}
        {status === "error" && (
          <p className="section-sub">{error}</p>
        )}

        <div className="sd-avail-grid">
          {publicCourses.slice(0, 6).map((course) => (
            <div className="sd-avail-card" key={course._id}>
              <div className="sd-avail-top">
                <img
                  src={course.thumbnail || devImage}
                  alt={course.category || course.title}
                  className="sd-avail-image"
                />
                <div className="sd-avail-level">{formatCourseLevel(course.level)}</div>
              </div>

              <div className="sd-avail-cat">{course.category || "General"}</div>
              <div className="sd-avail-name">{course.title}</div>
              <p className="sd-avail-desc">{course.description || "Explore this newly published course."}</p>

              <div className="sd-avail-foot">
                <span className="sd-avail-stu">
                  {getCourseStudentCount(course).toLocaleString("en-IN")} students
                </span>
                <button className="sd-avail-enroll" onClick={() => handleEnroll(course)}>
                  Open Course
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="cta-strip">
        <div>
          <h3>Ready to start learning?</h3>
          <p>Join 52,000+ students already growing their skills on LearnSphere.</p>
        </div>
        <button className="btn-primary" onClick={() => navigate("/signup")}>
          Create Free Account
        </button>
      </div>

      <Footer />
    </>
  );
}
