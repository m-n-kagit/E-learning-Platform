import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { clearLessonName, getLessonName } from "../../features/lesson_detailSlice";

export default function CoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const enrolledCourses = useSelector((state) => state.studentDetails.student?.enrolledCourses || []);
  const lessonName = useSelector((state) => state.lessonDetail.lessonName);
  const [courseData, setCourseData] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [activeLessonId, setActiveLessonId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const courseFromStore = useMemo(
    () =>
      Array.isArray(enrolledCourses)
        ? enrolledCourses.find((course) => String(course?._id || course?.id) === String(courseId)) || null
        : null,
    [courseId, enrolledCourses]
  );

  useEffect(() => {
    let isMounted = true;

    const fetchEnrolledCourse = async () => {
      try {
        setIsLoading(true);
        setError("");

        let resolvedCourse = courseFromStore;

        if (!resolvedCourse) {
          const response = await axios.get("/api/courses/my-enrollments", {
            withCredentials: true,
          });
          if (!isMounted) return;

          const courses = Array.isArray(response?.data?.data) ? response.data.data : [];
          resolvedCourse =
            courses.find((course) => String(course?._id || course?.id) === String(courseId)) || null;
        }

        if (!resolvedCourse) {
          setError("You are not enrolled in this course yet.");
          setCourseData(null);
          setLessons([]);
          return;
        }

        setCourseData(resolvedCourse);

        const lessonsResponse = await axios.get(`/api/courses/course/${courseId}/lessons`, {
          withCredentials: true,
        });
        if (!isMounted) return;

        setLessons(Array.isArray(lessonsResponse?.data?.data) ? lessonsResponse.data.data : []);
      } catch (fetchError) {
        if (!isMounted) return;
        console.error("Failed to fetch enrolled course:", fetchError);
        setError(fetchError?.response?.data?.message || "Unable to load your course right now.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchEnrolledCourse();

    return () => {
      isMounted = false;
    };
  }, [courseFromStore, courseId]);

  useEffect(() => {
    let isMounted = true;

    const fetchReviews = async () => {
      try {
        setReviewLoading(true);
        setReviewError("");
        const response = await axios.get(`/api/reviews/${courseId}`, {
          withCredentials: true,
        });
        if (!isMounted) return;
        const data = Array.isArray(response?.data?.data) ? response.data.data : [];
        setReviews(data);
      } catch (fetchError) {
        if (!isMounted) return;
        setReviewError("Unable to load reviews right now.");
      } finally {
        if (isMounted) setReviewLoading(false);
      }
    };

    if (courseId) {
      fetchReviews();
    }

    return () => {
      isMounted = false;
    };
  }, [courseId]);

  useEffect(() => {
    if (!lessons.length) {
      setActiveLessonId("");
      return;
    }

    if (!activeLessonId || !lessons.some((lesson) => String(lesson?._id) === String(activeLessonId))) {
      setActiveLessonId(String(lessons[0]?._id || ""));
    }
  }, [activeLessonId, lessons]);

  const activeLesson =
    lessons.find((lesson) => String(lesson?._id) === String(activeLessonId)) || lessons[0] || null;

  const lessonDocuments = Array.isArray(activeLesson?.resources) ? activeLesson.resources : [];

  const handleSubmitReview = async () => {
    if (!reviewRating) {
      setReviewError("Please select a rating.");
      return;
    }

    setReviewSubmitting(true);
    setReviewError("");

    try {
      const response = await axios.post(
        `/api/review/${courseId}`,
        {
          rating: reviewRating,
          comment: reviewComment.trim(),
        },
        { withCredentials: true }
      );

      const created = response?.data?.data;
      if (created) {
        setReviews((prev) => [created, ...prev]);
        setReviewRating(0);
        setReviewComment("");
      }
    } catch (submitError) {
      console.error("Failed to submit review:", submitError);
      setReviewError(submitError?.response?.data?.message || "Unable to submit review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  useEffect(() => {
    if (activeLesson?.title) {
      dispatch(getLessonName(activeLesson.title));
      return;
    }
    dispatch(clearLessonName());
  }, [activeLesson, dispatch]);

  if (isLoading) {
    return (
      <div className="cd-loading">
        <div className="cd-spinner" />
        <p>Loading course content...</p>
        <style>{COURSE_STYLES}</style>
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="cd-error">
        <div className="cd-error-icon">!</div>
        <h2>Course unavailable</h2>
        <p>{error || "Unable to open this course."}</p>
        <div className="cd-actions">
          <button className="cd-retry-btn" onClick={() => navigate("/student-dashboard")}>
            Go to dashboard
          </button>
          <button className="cd-back-btn" onClick={() => navigate(`/enroll/${courseId}`)}>
            Open enroll page
          </button>
        </div>
        <style>{COURSE_STYLES}</style>
      </div>
    );
  }

  return (
    <div className="cd-shell">
      <header className="cd-header">
        <button className="cd-back-nav" onClick={() => navigate("/student-dashboard")}>
          Back to dashboard
        </button>
        <div className="cd-course-meta">
          <h1>{courseData?.title || "Course"}</h1>
          <p>
            by {courseData?.instructor?.name || "Instructor"} · {lessons.length} lessons
          </p>
        </div>
      </header>

      <div className="cd-layout">
        <aside className="cd-sidebar">
          <div className="cd-sidebar-title">Course Lessons</div>
          {lessons.length === 0 ? (
            <div className="cd-empty">Lessons will appear here soon.</div>
          ) : (
            lessons.map((lesson, index) => (
              <button
                key={lesson?._id || index}
                className={`cd-lesson-item ${String(activeLesson?._id) === String(lesson?._id) ? "active" : ""}`}
                onClick={() => setActiveLessonId(String(lesson?._id || ""))}
              >
                <span className="cd-lesson-index">{index + 1}</span>
                <span className="cd-lesson-copy">
                  <strong>{lesson?.title || `Lesson ${index + 1}`}</strong>
                  <small>{formatDuration(lesson?.duration)}</small>
                  {lesson?.description && (
                    <p className="cd-lesson-desc">{lesson.description}</p>
                  )}
                </span>
              </button>
            ))
          )}
        </aside>

        <main className="cd-content"> 
          <div className="cd-video-wrap">
            {activeLesson?.videoUrl ? (
              <video
                key={activeLesson?._id}
                className="cd-video"
                controls
                controlsList="nodownload"
                src={activeLesson.videoUrl}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="cd-empty-video">No lesson video available for this lesson.</div>
            )}
          </div>

          <section className="cd-panel">
            <h2>{lessonName || activeLesson?.title || "Select a lesson"}</h2>
            <p>{activeLesson?.description || "Lesson details will appear here."}</p>
          </section>

          <section className="cd-panel">
            <div className="cd-panel-head">
                
              <h3>Lesson Document</h3>
              <span>{lessonDocuments.length}</span>
            </div>
            {lessonDocuments.length === 0 ? (
              <div className="cd-empty">No lesson document attached to this lesson yet.</div>
            ) : (
              <div className="cd-resource-list">
                {lessonDocuments.map((resource, index) => (
                  <a
                    key={`${resource?.fileUrl || resource?.title || "resource"}-${index}`}
                    className="cd-resource-item"
                    href={resource?.fileUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>{resource?.title || `Lesson Document ${index + 1}`}</span>
                    <span>View</span>
                  </a>
                ))}
              </div>
            )}
          </section>

          <section className="cd-panel">
            <div className="cd-panel-head">
              <h3>Reviews</h3>
              <span>{reviews.length}</span>
            </div>
            <div className="cd-review-form">
              <div className="cd-stars">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`cd-star ${reviewRating >= value ? "active" : ""}`}
                    onClick={() => setReviewRating(value)}
                    aria-label={`Rate ${value} star${value === 1 ? "" : "s"}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                className="cd-review-input"
                rows={3}
                placeholder="Share your feedback..."
                value={reviewComment}
                onChange={(event) => setReviewComment(event.target.value)}
              />
              {reviewError && <div className="cd-review-error">{reviewError}</div>}
              <button
                className="cd-review-btn"
                type="button"
                onClick={handleSubmitReview}
                disabled={reviewSubmitting}
              >
                {reviewSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>

            {reviewLoading ? (
              <div className="cd-empty">Loading reviews...</div>
            ) : reviews.length === 0 ? (
              <div className="cd-empty">No reviews yet.</div>
            ) : (
              <div className="cd-review-list">
                {reviews.map((review) => (
                  <div className="cd-review-card" key={review._id || review.id}>
                    <div className="cd-review-top">
                      <div>
                        <strong>{review?.user?.name || "Student"}</strong>
                        <span>
                          {review?.createdAt
                            ? new Date(review.createdAt).toLocaleDateString("en-IN")
                            : ""}
                        </span>
                      </div>
                      <div className="cd-review-stars">
                        {"★".repeat(review?.rating || 0)}
                        {"☆".repeat(Math.max(0, 5 - Number(review?.rating || 0)))}
                      </div>
                    </div>
                    <p>{review?.comment || ""}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      <style>{COURSE_STYLES}</style>
    </div>
  );
}

function formatDuration(seconds) {
  const total = Number(seconds || 0);
  if (!total) return "0 min";
  const mins = Math.max(1, Math.round(total / 60));
  return `${mins} min`;
}

const COURSE_STYLES = `
.cd-shell {
  min-height: 100vh;
  background: linear-gradient(160deg, #d9e8bf 0%, var(--bg) 70%);
  color: var(--text-primary);
}
.cd-header {
  max-width: 1200px;
  margin: 0 auto;
  padding: 8px 24px 6px;
}
.cd-back-nav {
  background: none;
  border: none;
  color: var(--accent);
  font-size: 0.95rem;
  cursor: pointer;
  margin-bottom: 12px;
}
.cd-course-meta h1 {
  margin: 0 0 6px;
  font-size: 1.6rem;
}
.cd-course-meta p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.92rem;
}
.cd-layout {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 12px;
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 12px;
  align-items: start;
}
.cd-sidebar,
.cd-panel,
.cd-video-wrap {
  background: var(--card);
  border: 1px solid var(--border-med);
  border-radius: 18px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
}
.cd-sidebar {
  padding: 14px;
  align-self: start;
}
.cd-sidebar-title {
  font-weight: 700;
  margin-bottom: 10px;
  font-size: 0.95rem;
}
.cd-lesson-item {
  width: 100%;
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 10px;
  border: 1px solid transparent;
  border-radius: 12px;
  background: transparent;
  cursor: pointer;
  text-align: left;
  margin-bottom: 6px;
}
.cd-lesson-item.active {
  border-color: rgba(31,92,16,0.22);
  background: rgba(31,92,16,0.08);
}
.cd-lesson-index {
  width: 28px;
  height: 28px;
  border-radius: 10px;
  background: rgba(31,92,16,0.12);
  color: var(--accent);
  display: grid;
  place-items: center;
  font-weight: 700;
  flex-shrink: 0;
}
.cd-lesson-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.cd-lesson-copy strong {
  font-size: 0.88rem;
  color: var(--text-primary);
}
.cd-lesson-copy small {
  color: var(--text-secondary);
  font-size: 0.75rem;
}
.cd-lesson-desc {
  margin: 3px 0 0;
  font-size: 0.76rem;
  color: var(--text-secondary);
  line-height: 1.25;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}
.cd-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.cd-video-wrap {
  overflow: hidden;
  aspect-ratio: 16 / 7.6;
  background: #000;
  margin-top: -18px;
}
.cd-video {
  width: 100%;
  height: 100%;
}
.cd-empty-video,
.cd-empty {
  padding: 18px;
  color: var(--text-secondary);
}
.cd-panel {
  padding: 12px 16px;
}
.cd-panel h2,
.cd-panel h3 {
  margin: 0 0 8px;
  font-size: 0.95rem;
}
.cd-panel p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.35;
  font-size: 0.82rem;
}
.cd-review-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
}
.cd-stars {
  display: flex;
  gap: 6px;
}
.cd-star {
  border: none;
  background: none;
  font-size: 20px;
  color: #fffff;
  cursor: pointer;
  padding: 0;
}
.cd-star.active {
  color: #f5b301;
}
.cd-review-input {
  width: 100%;
  border-radius: 10px;
  border: 1px solid var(--border-med);
  padding: 10px;
  resize: vertical;
  font-family: inherit;
  background: rgba(255,255,255,0.55);
}
.cd-review-btn {
  align-self: flex-start;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 8px 14px;
  cursor: pointer;
  font-size: 0.85rem;
}
.cd-review-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.cd-review-error {
  color: #b42318;
  font-size: 0.82rem;
}
.cd-review-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.cd-review-card {
  border: 1px solid var(--border-med);
  border-radius: 12px;
  padding: 10px 12px;
  background: rgba(255,255,255,0.45);
}
.cd-review-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 0.85rem;
}
.cd-review-top span {
  display: block;
  color: var(--text-secondary);
  font-size: 0.75rem;
}
.cd-review-stars {
  color: #f5b301;
  font-size: 0.9rem;
}
.cd-review-card p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.82rem;
}
.cd-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.cd-resource-list {
  display: grid;
  gap: 8px;
}
.cd-resource-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border: 1px solid var(--border-med);
  border-radius: 12px;
  color: var(--text-primary);
  text-decoration: none;
  background: rgba(255,255,255,0.35);
  font-size: 0.85rem;
}
.cd-loading,
.cd-error {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 24px;
}
.cd-spinner {
  width: 42px;
  height: 42px;
  border: 4px solid rgba(0,0,0,0.08);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: cd-spin 0.8s linear infinite;
}
.cd-error-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(138,29,29,0.12);
  color: #8a1d1d;
  display: grid;
  place-items: center;
  font-weight: 700;
}
.cd-actions {
  display: flex;
  gap: 10px;
}
.cd-retry-btn,
.cd-back-btn {
  padding: 10px 16px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
}
.cd-retry-btn {
  border: none;
  background: var(--accent);
  color: #fff;
}
.cd-back-btn {
  border: 1px solid var(--border-med);
  background: transparent;
  color: var(--text-primary);
}
@keyframes cd-spin {
  to { transform: rotate(360deg); }
}
@media (max-width: 900px) {
  .cd-layout {
    grid-template-columns: 1fr;
  }
  .cd-video-wrap {
    margin-top: 0;
  }
}
`;
