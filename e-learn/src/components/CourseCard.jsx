import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import devImage from "../images/1687.jpg";

export default function CourseCard({ c, showBtn }) {
  const navigate = useNavigate();
  const courses = useSelector((state) => state.activeCourses.courses);
  const courseId = String(c?._id || c?.id || "").trim();
  const storedCourse = courseId
    ? courses.find((course) => String(course?._id || course?.id || "").trim() === courseId)
    : null;
  const course = storedCourse ? { ...c, ...storedCourse } : c;

  const courseName = course?.name || course?.title || "Untitled Course";
  const instructorName =
    course?.instructorName ||
    course?.instructor?.name ||
    course?.instructor?.email ||
    (typeof course?.instructor === "string" ? course.instructor : "Course Admin");
  const category = course?.category || "General";
  const accentColor = course?.color || "#5468ff";
  const progress = Number(course?.progress || 0);
  const completed = Number(course?.completed || 0);
  const total = Number(course?.total || course?.lessons?.length || 0);
  const thumbnail = course?.thumbnail || devImage;

  return (
    <div className="sd-ccard">
      <div
        className="sd-ccard-thumb"
        style={{ background: `linear-gradient(135deg, ${accentColor}33, ${accentColor}11)` }}
      >
        <img
          src={thumbnail}
          alt={courseName}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <span className="sd-ccard-cat" style={{ background: accentColor }}>
          {category}
        </span>
      </div>
      <div className="sd-ccard-body">
        <p className="sd-ccard-name">{courseName}</p>
        <span className="sd-ccard-inst">{instructorName}</span>
        <div className="sd-pbar" style={{ margin: "10px 0 4px" }}>
          <div className="sd-pbar-fill" style={{ width: `${progress}%`, background: accentColor }} />
        </div>
        <div className="sd-ccard-foot">
          <span className="sd-prog-inst">{completed}/{total} lessons   {progress}%</span>
          {showBtn && (
            <button
              className="sd-cont-btn"
              style={{ borderColor: accentColor, color: accentColor }}
              onClick={() => navigate(`/course/${courseId}`)}
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
