import { useSelector } from "react-redux";
import CourseCard from "./CourseCard";

function ViewCourses() {
  const courses = useSelector((state) => state.activeCourses.courses);

  if (courses.length === 0) {
    return (
      <div className="sd-page">
        <p>No courses enrolled yet.</p>
      </div>
    );
  }

  return (
    <div className="sd-page">
      <div className="sd-course-grid">
        {courses.map((course) => (
          <CourseCard key={course._id || course.id} c={course} showBtn />
        ))}
      </div>
    </div>
  );
}

export default ViewCourses;
