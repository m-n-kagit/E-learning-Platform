import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { enrollStudent, selectCourse, setCourses } from "../features/activeCoursesSlice";
import devImage from "../images/1687.jpg";

const resolveInstructorName = (instructor) => {
  if (!instructor) return "Course Admin";
  if (typeof instructor === "string") return instructor;
  return instructor.name || instructor.fullName || instructor.email || "Course Admin";
};

const formatLevel = (level) => {
  const normalizedLevel = String(level || "").trim().toLowerCase();
  if (!normalizedLevel) return "Beginner";
  return normalizedLevel.charAt(0).toUpperCase() + normalizedLevel.slice(1);
};

export default function CoursesAvailable() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const student = useSelector((state) => state.studentDetails.student);
  const { courses, selectedCourseId } = useSelector((state) => state.activeCourses);
  const [queryDraft, setQueryDraft] = useState("");
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const fetchCourses = async () => {
      try {
        setStatus("loading");
        setError("");
        const response = await axios.get("/api/courses/available", {
          withCredentials: true,
        });
        const fetchedCourses = Array.isArray(response?.data?.data) ? response.data.data : [];
        if (ignore) return;
        dispatch(setCourses(fetchedCourses));
        setStatus("success");
      } catch (fetchError) {
        if (ignore) return;
        console.error("Failed to fetch available courses:", fetchError);
        setError(fetchError?.response?.data?.message || "Unable to load available courses right now.");
        setStatus("error");
      }
    };

    fetchCourses();

    return () => {
      ignore = true;
    };
  }, [dispatch]);

  const availableCourses = useMemo( //useMemo 
    () => courses.filter((course) => course.isPublished),
    [courses]
  );

  const categories = useMemo(
    () => ["All", ...new Set(availableCourses.map((course) => course.category).filter(Boolean))],
    [availableCourses]
  );

  const levels = useMemo(
    () => ["All", ...new Set(availableCourses.map((course) => formatLevel(course.level)).filter(Boolean))],
    [availableCourses]
  );

  const filteredCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return availableCourses.filter((course) => {
      const title = String(course.title || "").toLowerCase();
      const description = String(course.description || "").toLowerCase();
      const courseCategory = String(course.category || "").toLowerCase();
      const instructorName = resolveInstructorName(course.instructor).toLowerCase();
      const courseLevel = formatLevel(course.level);

      const textMatch =
        !normalizedQuery ||
        title.includes(normalizedQuery) ||
        description.includes(normalizedQuery) ||
        courseCategory.includes(normalizedQuery) ||
        instructorName.includes(normalizedQuery);
      const categoryMatch = category === "All" || course.category === category;
      const levelMatch = level === "All" || courseLevel === level;

      return textMatch && categoryMatch && levelMatch;
    });
  }, [availableCourses, category, level, query]);

  const handleSearch = () => setQuery(queryDraft);

  const handleOpenCourse = (course) => {
    const studentId = student?._id || "local-student";
    dispatch(enrollStudent({ courseId: course._id, studentId }));
    dispatch(selectCourse(course._id));

    navigate(`/course/${course._id}`, {
      state: { backgroundLocation: location },
    });
  };

  return (
    <div className="sd-page">
      <h1 className="sd-h1">Courses Available</h1>

      <div className="sd-avail-search-wrap">
        <input
          className="sd-avail-input"
          type="text"
          placeholder="Search courses, category, or topic..."
          value={queryDraft}
          onChange={(e) => setQueryDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
        />
        <button className="sd-avail-search-btn" onClick={handleSearch}>
          Search
        </button>
        <button
          className="sd-avail-filter-btn"
          onClick={() => setShowFilters((value) => !value)}
          aria-label="Toggle filters"
          title="Toggle filters"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="7" y1="12" x2="17" y2="12" />
            <line x1="10" y1="18" x2="14" y2="18" />
          </svg>
        </button>
      </div>

      {showFilters && (
        <div className="sd-avail-filters">
          <select
            className="sd-avail-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            className="sd-avail-select"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            {levels.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="sd-avail-results">
        {status === "loading" && (
          <p className="sd-avail-empty">Loading available courses...</p>
        )}
        {status === "error" && (
          <p className="sd-avail-empty">{error}</p>
        )}
        {status !== "loading" && !error && filteredCourses.length === 0 && (
          <p className="sd-avail-empty">No courses found for this search.</p>
        )}

        <div className="sd-avail-grid">
          {filteredCourses.map((course) => {
            const levelLabel = formatLevel(course.level);
            const studentsLabel = Number(course.studentsCount || course.enrolledStudents?.length || 0).toLocaleString("en-IN");
            const thumbnail = course.thumbnail || devImage;
            const instructorName = resolveInstructorName(course.instructor);
            const lessonsCount = Array.isArray(course.lessons) ? course.lessons.length : 0;

            return (
              <div className="sd-avail-card" key={course._id}>
                <div className="sd-avail-top">
                  <img src={thumbnail} alt={course.title} className="sd-avail-image" />
                  <div className="sd-avail-level">{levelLabel}</div>
                </div>
                <div className="sd-avail-cat">{course.category || "General"}</div>
                <div className="sd-avail-name">{course.title}</div>
                <p className="sd-avail-desc">
                  {course.description || `${lessonsCount} lessons by ${instructorName}`}
                </p>
                <div className="sd-avail-foot">
                  <span className="sd-avail-stu">
                    {studentsLabel} students · {lessonsCount} lessons
                  </span>
                  <button className="sd-avail-enroll" onClick={() => handleOpenCourse(course)}>
                    {selectedCourseId === String(course._id) ? "View Details" : "Open Course"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
