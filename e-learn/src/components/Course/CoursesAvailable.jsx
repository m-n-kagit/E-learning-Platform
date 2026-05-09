import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { enrollStudent, selectCourse } from "../../features/activeCoursesSlice";
import useAvailablePublicCourses from "../../hooks/useAvailablePublicCourses";
import devImage from "../../images/1687.jpg";
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

export default function CoursesAvailable({
  title = "Courses Available",
  showTitle = true,
  wrapperClassName = "sd-page",
}) { 
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const student = useSelector((state) => state.studentDetails.student);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const offset = (currentPage - 1) * pageSize;
  const { publicCourses, status, error, pagination } = useAvailablePublicCourses({
    offset,
    limit: pageSize,
    usePagination: true,
  });
  const [queryDraft, setQueryDraft] = useState("");
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const availableCourses = useMemo( //useMemo is a React hook that allows you to optimize the performance of your components by memoizing the result of a function.
  // Memoising means that React will remember the result of the function and only recompute it when its dependencies change. 
    () => publicCourses.filter((course) => course.isPublished),
    [publicCourses]
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
  const hasActiveFilters = Boolean(query.trim() || category !== "All" || level !== "All");
  const totalCourses = Number.isFinite(Number(pagination?.total))
    ? Number(pagination.total)
    : availableCourses.length;
  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(totalCourses / pageSize)) : 1;
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);
  const pageNumbers = useMemo(() => {
    if (totalPages <= 1) return [];
    return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
  }, [endPage, startPage, totalPages]);

  const handleResetFilters = () => {
    setQueryDraft("");
    setQuery("");
    setCategory("All");
    setLevel("All");
    setShowFilters(false);
    setCurrentPage(1);
  };

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setCurrentPage(nextPage);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [query, category, level, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleOpenCourse = (course) => {
    const studentId = student?._id || "local-student";
    dispatch(enrollStudent({ courseId: course._id, studentId }));
    dispatch(selectCourse(course._id));

    navigate(`/course/${course._id}`, {
      state: { backgroundLocation: location },
    });
  };

  return (
    <div className={wrapperClassName || undefined}>
      {showTitle && <h1 className="sd-h1">{title}</h1>}

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
          <button
            type="button"
            className="sd-avail-reset-btn"
            onClick={handleResetFilters}
            disabled={!hasActiveFilters}
          >
            Reset
          </button>
        </div>
      )}

      <div className="sd-avail-results">
        {status === "success" && !error && (
          <p className="sd-avail-meta">
            Showing {filteredCourses.length} of {totalCourses} courses
          </p>
        )}
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
            const studentsLabel = Number( course.enrolledStudents?.length || 0).toLocaleString("en-IN");
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
                     View Details 
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {status === "success" && !error && totalPages > 1 && (
          <div className="sd-avail-pagination">
            <button
              className="sd-avail-page-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            <div className="sd-avail-page-list">
              {startPage > 1 && (
                <button
                  className={`sd-avail-page-number ${currentPage === 1 ? "active" : ""}`}
                  onClick={() => handlePageChange(1)}
                >
                  1
                </button>
              )}
              {startPage > 2 && <span className="sd-avail-page-ellipsis">...</span>}
              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  className={`sd-avail-page-number ${currentPage === pageNumber ? "active" : ""}`}
                  onClick={() => handlePageChange(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}
              {endPage < totalPages - 1 && <span className="sd-avail-page-ellipsis">...</span>}
              {endPage < totalPages && (
                <button
                  className={`sd-avail-page-number ${currentPage === totalPages ? "active" : ""}`}
                  onClick={() => handlePageChange(totalPages)}
                >
                  {totalPages}
                </button>
              )}
            </div>

            <button
              className="sd-avail-page-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>

            <div className="sd-avail-page-size">
              <label htmlFor="course-page-size" className="sd-avail-page-label">
                Per page
              </label>
              <select
                id="course-page-size"
                className="sd-avail-page-select"
                value={pageSize}
                onChange={(event) => setPageSize(Number(event.target.value))}
              >
                {[6, 9, 12, 18].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
