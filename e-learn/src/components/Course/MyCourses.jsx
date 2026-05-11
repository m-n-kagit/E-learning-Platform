import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setCourses } from "../../features/activeCoursesSlice";
import CourseCard from "../CourseCard";

function ViewCourses({ scope = "student" }) {
  const dispatch = useDispatch();
  const [courses, setLocalCourses] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const fetchCourses = async () => {
      try {
        setStatus("loading");
        setError("");

        const endpoint =
          scope === "instructor"
            ? "/api/courses/get-all-courses"
            : "/api/courses/my-courses";

        const response = await axios.get(endpoint, {
          withCredentials: true,
        });

        const fetchedCourses = Array.isArray(response?.data?.data)
          ? response.data.data
          : [];

        if (ignore) return;

        setLocalCourses(fetchedCourses);
        dispatch(setCourses(fetchedCourses));
        setStatus("success");
      } catch (fetchError) {
        if (ignore) return;
        console.error("Failed to fetch my courses:", fetchError);
        setError(fetchError?.response?.data?.message || "Unable to load your courses right now.");
        setStatus("error");
      }
    };

    fetchCourses();

    return () => {
      ignore = true;
    };
  }, [dispatch, scope]);

  const handleRemoveCourse = async (courseId) => {
    const confirmed = window.confirm("Remove this course from your enrollments?");
    if (!confirmed) return;
    try {
      await axios.delete("/api/courses/unenroll", {
        withCredentials: true,
        data: { courseId },
      });
      console.log("Course removed successfully");
      setLocalCourses((prev) => prev.filter((course) => String(course?._id || course?.id) !== String(courseId)));
    } catch (removeError) {
      console.error("Failed to remove course:", removeError);
      const message = removeError?.response?.data?.message || "Unable to remove this course right now.";
      window.alert(message);
    }
  };

  if (status === "loading") {
    return (
      <div className="sd-page">
        <p>Loading your courses...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="sd-page">
        <p>{error}</p>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="sd-page">
        <p>{scope === "instructor" ? "No courses created yet." : "No courses enrolled yet."}</p>
      </div>
    );
  }

  return (
    <div className="sd-page">
      <div className="sd-course-grid">
        {courses.map((course) => (
          <div key={course._id || course.id}>
            <CourseCard c={course} showBtn />
            {scope === "student" && (
              <button
                className="sd-cont-btn"
                style={{ marginTop: 8 }}
                onClick={() => handleRemoveCourse(course._id || course.id)}
                type="button"
              >
                Remove Course
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ViewCourses;
