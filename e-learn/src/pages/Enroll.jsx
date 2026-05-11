import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { updateStudent } from "../features/student_detailsSlice";
import { enrollStudent } from "../features/activeCoursesSlice";

const sampleCourse = {
  title: "Full Stack Web Development",
  description:
    "Learn frontend and backend development with real-world projects, API design, and deployment practices.",
  instructor: {
    _id: "660001a2b3c4d5e6f7000001",
    name: "Rahul Verma",
  },
  price: 2999,
  category: "Development",
  level: "intermediate",
  lessons: [
    { _id: "L001", title: "Intro to the Program", order: 1, duration: 420, isPreview: true },
    { _id: "L002", title: "Frontend Foundations", order: 2, duration: 820, isPreview: false },
    { _id: "L003", title: "API Design & Auth", order: 3, duration: 760, isPreview: false },
    { _id: "L004", title: "Deployment Workflow", order: 4, duration: 540, isPreview: false },
  ],
  enrolledStudents: [],
  averageRating: 4.5,
  isPublished: true,
};

const formatDuration = (seconds) => {
  const total = Number(seconds || 0);
  if (!total) return "-";
  const mins = Math.round(total / 60);
  return `${mins} min`;
};

const resolveLessonType = (lesson = {}) => {
  if (lesson.videoUrl) return "Video";
  if (Array.isArray(lesson.resources) && lesson.resources.length > 0) return "Document";
  return "Article";
};

export default function Enroll() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { courses } = useSelector((state) => state.activeCourses);
  const student = useSelector((state) => state.studentDetails.student);
  const enrolledCourses = Array.isArray(student?.enrolledCourses) ? student.enrolledCourses : [];
  const [fetchedCourse, setFetchedCourse] = useState(null);
  const [fetchError, setFetchError] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [slipError, setSlipError] = useState("");
  const [lastPaymentId, setLastPaymentId] = useState("");
  const [lastPaymentStatus, setLastPaymentStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("credit_card");

  const courseFromStore = useMemo(() => {
    if (!courseId) return null;
    return courses.find((course) => String(course?._id) === String(courseId)) || null;
  }, [courses, courseId]);

  useEffect(() => {
    if (!courseId || courseFromStore) return;
    let isMounted = true;

    const fetchCourse = async () => {
      try {
        setFetchError("");
        const response = await axios.get(`/api/courses/available/${courseId}`);
        if (!isMounted) return;
        setFetchedCourse(response?.data?.data || null);
      } catch (error) {
        if (!isMounted) return;
        console.error("Failed to fetch course for enroll page:", error);
        setFetchError("Unable to load course right now.");
      }
    };

    fetchCourse();

    return () => {
      isMounted = false;
    };
  }, [courseFromStore, courseId]);

  const course = courseFromStore || fetchedCourse || sampleCourse;
  const lessons = Array.isArray(course?.lessons) ? course.lessons : [];
  const price = Number(course?.price || 0);
  const isAlreadyEnrolled = enrolledCourses.some(
    (enrolledCourse) => String(enrolledCourse?._id || enrolledCourse?.id || enrolledCourse) === String(courseId)
  );
  const paymentOptions = [
    { value: "bank_transfer", label: "UPI / Netbanking", meta: "Instant" },
    { value: "credit_card", label: "Credit / Debit", meta: "Secure" },
    { value: "paypal", label: "PayPal", meta: "Global" },
  ];

  const downloadSlip = async (paymentId) => {
    const response = await axios.get(`/api/payments/${paymentId}/invoice`, {
      withCredentials: true,
    });
    const invoiceUrl = response?.data?.data?.invoiceUrl;
    if (!invoiceUrl) {
      throw new Error("Invoice URL missing");
    }
    const link = document.createElement("a");
    link.href = invoiceUrl;
    link.target = "_blank";
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handlePayNow = async () => {
    if (!courseId) {
      setPayError("Select a course before paying.");
      return;
    }
    if (isAlreadyEnrolled) {
      setPayError("Enrolled already.");
      return;
    }

    setIsPaying(true);
    setPayError("");
    setSlipError("");

    try {
      const response = await axios.post(
        "/api/payments",
        {
          courseId,
          amount: price,
          paymentMethod,
          instructorId: course?.instructor?._id || course?.instructor,
        },
        { withCredentials: true }
      );
      const paymentId = response?.data?.data?._id;
      const paymentStatus = response?.data?.data?.paymentStatus || "";
      if (!paymentId) {
        throw new Error("Payment ID missing");
      }
      setLastPaymentId(paymentId);
      setLastPaymentStatus(paymentStatus);
      dispatch(updateStudent({
        enrolledCourses: enrolledCourses.some(
          (enrolledCourse) => String(enrolledCourse?._id || enrolledCourse?.id || enrolledCourse) === String(courseId)
        )
          ? enrolledCourses
          : [...enrolledCourses, course],
      }));
      if (student?._id) {
        dispatch(enrollStudent({ courseId, studentId: student._id }));
      }
      if (paymentStatus === "completed") {
        try {
          await downloadSlip(paymentId);
        } catch (downloadError) {
          console.error("Invoice download failed:", downloadError);
          setSlipError(downloadError?.message || "Payment succeeded, but the slip could not be downloaded.");
        } finally {
          navigate(`/course/${courseId}`);
        }
      }
    } catch (error) {
      console.error("Payment failed:", error);
      setPayError(error?.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="enroll-page">
      <div className="enroll-hero">
        <button className="enroll-back" onClick={() => navigate(-1)}>
          Back to course
        </button>
        <div className="enroll-hero-main">
          <div>
            <span className="enroll-eyebrow">Course Enrollment</span>
            <h1 className="enroll-title">{course?.title || "Course Enrollment"}</h1>
            <p className="enroll-subtitle">{course?.description || "Review lessons and enroll."}</p>
          </div>
          <div className="enroll-price-card">
            <div className="enroll-price-label">Price</div>
            <div className="enroll-price">Rs. {price.toLocaleString("en-IN")}</div>
            <div className="pay-options">
              <h3>Pay Now Options</h3>
              {paymentOptions.map((option) => (
                <label key={option.value} className="pay-option-row">
                  <span>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={option.value}
                      checked={paymentMethod === option.value}
                      onChange={(event) => setPaymentMethod(event.target.value)}
                    />
                    {option.label}
                  </span>
                  <span>{option.meta}</span>
                </label>
              ))}
            </div>
            {isAlreadyEnrolled ? (
              <>
                <button
                  className="enroll-pay-btn"
                  onClick={() => navigate(`/course/${courseId}`)}
                >
                  View Course
                </button>
                <div className="enroll-status-note">Enrolled already.</div>
              </>
            ) : (
              <button className="enroll-pay-btn" onClick={handlePayNow} disabled={isPaying}>
                {isPaying ? "Processing..." : "Pay Now"}
              </button>
            )}
            {lastPaymentId && lastPaymentStatus === "completed" && (
              <button
                className="enroll-pay-outline"
                onClick={() => downloadSlip(lastPaymentId)}
              >
                Download Slip
              </button>
            )}
          </div>
        </div>
        {fetchError && <div className="enroll-error">{fetchError}</div>}
        {payError && <div className="enroll-error">{payError}</div>}
        {slipError && <div className="enroll-error">{slipError}</div>}
      </div>

      <div className="enroll-grid">
        <section className="enroll-card">
          <div className="enroll-card-head">
            <h2>Lessons Matrix</h2>
            <span>{lessons.length} lessons</span>
          </div>
          <div className="lesson-matrix">
            {lessons.length === 0 ? (
              <div className="lesson-empty">Lessons will appear here once published.</div>
            ) : (
              lessons.map((lesson, index) => (
                <div key={lesson._id || index} className="lesson-tile">
                  <div className="lesson-meta">
                    <span className="lesson-order">#{lesson.order || index + 1}</span>
                    {lesson.isPreview && <span className="lesson-preview">Preview</span>}
                  </div>
                  <div className="lesson-title">{lesson.title || `Lesson ${index + 1}`}</div>
                  <div className="lesson-info">
                    <span>{resolveLessonType(lesson)}</span>
                    <span>{formatDuration(lesson.duration)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <aside className="enroll-card enroll-card-alt">
          <div className="enroll-card-head">
            <h2>Future Uploads</h2>
            <span>Coming soon</span>
          </div>
          <div className="future-list">
            {["Advanced projects drop", "Capstone review session", "New assignments"].map((item) => (
              <div className="future-item" key={item}>
                <span className="future-dot" />
                <div>
                  <div className="future-title">{item}</div>
                  <div className="future-meta">Scheduled update</div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
