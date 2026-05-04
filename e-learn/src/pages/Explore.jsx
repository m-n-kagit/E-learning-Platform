import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { enrollStudent, selectCourse } from "../features/activeCoursesSlice";
import Footer from "../components/Footer";
import devImage from "../images/1687.jpg";
import useAvailablePublicCourses from "../hooks/useAvailablePublicCourses";
import {
  formatCourseLevel,
  getCourseStudentCount,
  resolveInstructorName,
} from "../utils/publicCourseCatalog";

export default function Explore() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const student = useSelector((state) => state.studentDetails.student);
  const { publicCourses, status, error } = useAvailablePublicCourses();
  const [q, setQ] = useState("");
  const filtered = publicCourses.filter((course) =>
    `${course.title} ${course.category} ${course.description} ${resolveInstructorName(course.instructor)}`
      .toLowerCase()
      .includes(q.toLowerCase())
  );

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
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="hero-label">Browse All</div>
          <h1 className="page-title">Explore Every Discipline</h1>
          <p className="page-sub">
            Discover published and newly uploaded courses from across the platform.
          </p>
        </div>
      </div>

      <div className="explore-body">
        <div className="sd-avail-search-wrap" style={{ marginBottom: "2rem" }}>
          <input
            className="sd-avail-input"
            placeholder="Search courses..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="sd-avail-grid">
          {status === "loading" && (
            <div
              style={{
                gridColumn: "1/-1",
                padding: "3rem",
                textAlign: "center",
                color: "var(--muted)",
                fontSize: "0.88rem",
              }}
            >
              Loading courses...
            </div>
          )}

          {status === "error" && (
            <div
              style={{
                gridColumn: "1/-1",
                padding: "3rem",
                textAlign: "center",
                color: "var(--muted)",
                fontSize: "0.88rem",
              }}
            >
              {error}
            </div>
          )}

          {filtered.map((course) => (
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
              <p className="sd-avail-desc">
                {course.description || `Learn with ${resolveInstructorName(course.instructor)}.`}
              </p>

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

          {status !== "loading" && filtered.length === 0 && (
            <div
              style={{
                gridColumn: "1/-1",
                padding: "3rem",
                textAlign: "center",
                color: "var(--muted)",
                fontSize: "0.88rem",
              }}
            >
              No courses found.
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
