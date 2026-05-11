import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { clearCourseAdmin, setCourseAdmin, updateCourseAdmin } from "../features/course_admin_details";
import { setCourses, updateCourse } from "../features/activeCoursesSlice";
import CourseUpload from "../components/Course/Course_build";
import { ClipLoader } from "react-spinners";
import devImage from "../images/1687.jpg";

/* ─────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────── */
const ADMIN = {
  name: "Prof. Meera Iyer",
  email: "meera.iyer@learnsphere.com",
  initials: "MI",
  joinDate: "June 2022",
  bio: "Senior instructor in Full-Stack Development & AI. 8+ years of industry experience at Google and startups.",
  location: "Bengaluru, Karnataka",
  phone: "+91 90000 11111",
  courses: [
    { id: 1, name: "Full-Stack Web Dev Bootcamp", students: 1240, rating: 4.8, revenue: 620000, color: "#5468ff", category: "Development", status: "Live" },
    { id: 2, name: "Node.js Masterclass", students: 870, rating: 4.6, revenue: 348000, color: "#f97316", category: "Backend", status: "Live" },
    { id: 3, name: "React Advanced Patterns", students: 530, rating: 4.9, revenue: 265000, color: "#3ecf8e", category: "Frontend", status: "Draft" },
  ],
  monthlyIncome: [
    { month: "Sep", amount: 48000 },
    { month: "Oct", amount: 62000 },
    { month: "Nov", amount: 55000 },
    { month: "Dec", amount: 71000 },
    { month: "Jan", amount: 84000 },
    { month: "Feb", amount: 96000 },
    { month: "Mar", amount: 112000 },
  ],
  reviews: [
    { id: 1, student: "Rahul K.", rating: 5, text: "Best web dev course I have taken. Prof. Meera explains everything from scratch.", course: "Full-Stack Web Dev Bootcamp", date: "Mar 20, 2024" },
    { id: 2, student: "Anjali S.", rating: 4, text: "Great content, though more real-world projects would be helpful.", course: "Node.js Masterclass", date: "Mar 14, 2024" },
    { id: 3, student: "Karthik M.", rating: 5, text: "React patterns explained brilliantly. Highly recommend for intermediate devs.", course: "React Advanced Patterns", date: "Mar 9, 2024" },
  ],
  notifications: [
    { id: 1, text: "New student enrolled in Full-Stack Bootcamp", time: "30m ago", read: false },
    { id: 2, text: "Your quiz was flagged for review by 2 students", time: "2h ago", read: false },
    { id: 3, text: "Monthly income report for March is ready", time: "1d ago", read: false },
    { id: 4, text: "New review posted on Node.js Masterclass", time: "2d ago", read: true },
  ],
  studentPerformance: [
    { name: "Arjun Sharma", course: "Full-Stack Web Dev", score: 92, progress: 72, status: "Active" },
    { name: "Priya Patel", course: "Node.js Masterclass", score: 78, progress: 60, status: "Active" },
    { name: "Ravi Kumar", course: "React Advanced", score: 85, progress: 45, status: "Inactive" },
    { name: "Sneha Reddy", course: "Full-Stack Web Dev", score: 95, progress: 90, status: "Active" },
  ],
};

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "◻" },
  { id: "courses", label: "My Courses", icon: "▤" },
  { id: "course-upload", label: "Course Upload", icon: "↑" },
  // { id: "performance", label: "Student Performance", icon: "◈" },
  // { id: "analysis", label: "Course Analysis", icon: "⊕" },
  { id: "feedback", label: "Feedback", icon: "✦" },
  // { id: "transactions", label: "Transactions", icon: "₿" },
];

/* ─────────────────────────────────────────────
   ROOT
───────────────────────────────────────────── */
const deriveInitials = (name = "") => {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);//Boolean is used to filter out any empty strings that may result from extra spaces in the name. For example, if the name is "  John   Doe  ", after splitting by whitespace, we would get ["", "", "John", "", "", "Doe", "", ""]. The filter(Boolean) will remove all the empty strings, leaving us with ["John", "Doe"].
  if (!parts.length) return "";
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return parts[0][0].toUpperCase();
};

const normalizeCourseAdminState = (admin = {}) => ({
  ...admin,
  initial: String(admin?.initial || admin?.initials || deriveInitials(admin?.name)).trim(),
  initials: String(admin?.initials || admin?.initial || deriveInitials(admin?.name)).trim(),
});

const toDashboardCourse = (course = {}) => {
  const students = Number(course.studentsCount || course.enrolledStudents?.length || 0);
  const rating = Number(course.averageRating || 0);
  const price = Number(course.price || 0);

  return {
    id: course._id || course.id,
    _id: course._id || course.id,
    name: course.name || course.title || "Untitled Course",
    title: course.title || course.name || "Untitled Course",
    thumbnail: course.thumbnail || "",
    students,
    rating: Number(rating.toFixed(1)),
    revenue: price * students,
    color: course.color || "#5468ff",
    category: course.category || "General",
    status: course.isPublished ? "Live" : "Draft",
    lessonsCount: Array.isArray(course.lessons) ? course.lessons.length : 0,
    price,
  };
};

export default function CourseAdminDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cAdmin = useSelector((state) => state.courseAdminDetails.c_admin);
  const allCourses = useSelector((state) => state.activeCourses.courses);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [view, setView] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [coursesLoaded, setCoursesLoaded] = useState(false);
  const profileRef = useRef(null); //used to detect clicks outside profile dropdown
  const notifRef = useRef(null);
  const instructorCourses = useMemo(() => {
    if (!cAdmin?._id) return [];

    return allCourses
      .filter((course) => String(course?.instructor?._id || "") === String(cAdmin._id))
      .map(toDashboardCourse);
  }, [allCourses, cAdmin?._id]);
  const currentAdmin = useMemo(() => ({
    ...ADMIN,
    ...cAdmin,
    name: cAdmin?.name || ADMIN.name,
    email: cAdmin?.email || ADMIN.email,
    initial: cAdmin?.initial || cAdmin?.initials || deriveInitials(cAdmin?.name) || ADMIN.initials,
    bio: cAdmin?.bio || ADMIN.bio,
    location: cAdmin?.location || ADMIN.location,
    phone: cAdmin?.phone || ADMIN.phone,
    joinDate: cAdmin?.joinDate || ADMIN.joinDate,
    coursesManaged: Array.isArray(cAdmin?.coursesManaged) ? cAdmin.coursesManaged : [],
    courses: instructorCourses,
    notifications: Array.isArray(cAdmin?.notifications) && cAdmin.notifications.length
      ? cAdmin.notifications
      : ADMIN.notifications,
  }), [cAdmin, instructorCourses]);

  const getCourseAdminData = async () => {
    try {
      const response = await axios.get("/api/auth/me", { withCredentials: true });
      const adminData = response?.data?.data;
      if (adminData) {
        dispatch(setCourseAdmin(normalizeCourseAdminState(adminData)));
      }
    } catch (error) {
      console.error("Failed to fetch course admin data:", error);
    }
  };

  const getInstructorCourses = async () => {
    try {
      const response = await axios.get("/api/courses/get-all-courses", { withCredentials: true });
      const fetchedCourses = Array.isArray(response?.data?.data) ? response.data.data : [];
      dispatch(setCourses(fetchedCourses));
      dispatch(updateCourseAdmin({
        coursesManaged: fetchedCourses.map((course) => course?._id).filter(Boolean),
      }));
    } catch (error) {
      console.error("Failed to fetch instructor courses:", error);
    } finally {
      setCoursesLoaded(true);
    }
  };

  useEffect(() => {
    const el = document.createElement("style");
    el.id = "ca-styles";
    el.textContent = STYLES;
    document.head.appendChild(el);
    return () => document.getElementById("ca-styles")?.remove();
  }, []);

  useEffect(() => {
    const fn = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => {
    if (!cAdmin?._id) {
      getCourseAdminData();
    }
  }, [cAdmin?._id]);

  useEffect(() => {
    if (!cAdmin?._id || coursesLoaded) return;
    getInstructorCourses();
  }, [cAdmin?._id, coursesLoaded]);

  const go = (id) => { setActiveNav(id); setView(null); setSidebarOpen(false); };
  const resolveCourseFromStore = (course) => {
    if (!course?._id) return course || null;
    return allCourses.find((item) => String(item?._id) === String(course._id)) || course || null;
  };

  const openCourseEdit = (course) => {
    setSelectedCourse(resolveCourseFromStore(course));
    setActiveNav("course-edit");
    setView(null);
    setSidebarOpen(false);
  };
  const openLessonEdit = (course) => {
    setSelectedCourse(resolveCourseFromStore(course));
    setActiveNav("lesson-edit");
    setView(null);
    setSidebarOpen(false);
  };
  const adminNotifications = Array.isArray(currentAdmin?.notifications) ? currentAdmin.notifications : [];
  const unread = adminNotifications.filter((n) => !n.read).length;

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("hasSession");
      dispatch(clearCourseAdmin());
      setProfileOpen(false);
      navigate("/login");
    }
  };

  const renderPage = () => {
    if (view === "profile") return <ViewProfile onBack={() => setView(null)} admin={currentAdmin} />;
    if (view === "edit-profile") return <EditProfile onBack={() => setView(null)} admin={currentAdmin} />;
    if (view === "income") return <MonthlyIncome onBack={() => setView(null)} admin={currentAdmin} />;
    if (view === "reviews") return <TeachingReviews onBack={() => setView(null)} admin={currentAdmin} />;
    switch (activeNav) {
      case "dashboard":   return <DashboardHome setView={setView} go={go} admin={currentAdmin} coursesLoaded={coursesLoaded} onEditCourse={openCourseEdit} />;
      case "courses":     return <MyCourses admin={currentAdmin} coursesLoaded={coursesLoaded} onEditCourse={openCourseEdit} />;
      case "course-upload":      return <CourseUpload />;
      
      // case "performance": return <StudentPerformance admin={currentAdmin} />;
      // case "analysis":    return <CourseAnalysis admin={currentAdmin} onEditCourse={openCourseEdit} />;
      case "feedback":    return <Feedback admin={currentAdmin} />;
      // case "transactions":return <Transactions admin={currentAdmin} />;
      case "course-edit":   return <AdminCourseEdit course={selectedCourse || currentAdmin.courses[0]} onBack={() => go("courses")} onEditLessons={openLessonEdit} />;
      case "lesson-edit":   return <AdminLessonsEdit course={selectedCourse || currentAdmin.courses[0]} onBack={() => go("course-edit")} />;
      default:            return <DashboardHome setView={setView} go={go} admin={currentAdmin} />;
    } //setView is used to switch on the profile dropdown options that require a different view than the main nav items
  };

  return (
    <div className="ca">
      {sidebarOpen && <div className="ca-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* SIDEBAR */}
      <aside className={`ca-sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="ca-sb-head">
          <span className="ca-logo">Learn<em>Sphere</em></span>
          <button className="ca-x" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>
        <div className="ca-sb-role">Course Admin Portal</div>
        <nav className="ca-nav">
          {NAV_ITEMS.map((n) => (
            <button key={n.id} className={`ca-nav-item${activeNav === n.id && !view ? " active" : ""}`} onClick={() => go(n.id)}>
              <span className="ca-nav-icon">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>
        <div className="ca-sb-footer">
          <div className="ca-sb-user">
            <span className="ca-ava sm">{currentAdmin.initials}</span>
            <div>
              <div className="ca-sb-uname">{currentAdmin.name}</div>
              <div className="ca-sb-uemail">{currentAdmin.email || "Course Instructor"}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* TOPBAR */}
      <header className="ca-topbar">
        <button className="ca-burger" onClick={() => setSidebarOpen(true)}>
          <span /><span /><span />
        </button>
        <span className="ca-topbar-logo">Learn<em>Sphere</em></span>
        <div className="ca-topbar-right">
          {/* Notifications */}
          <div ref={notifRef} className="ca-notif-wrap">
            <button className="ca-icon-btn" onClick={() => setNotifOpen((v) => !v)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {unread > 0 && <span className="ca-badge">{unread}</span>}
            </button>
            {notifOpen && (
              <div className="ca-dropdown notif">
                <div className="ca-dd-title">Notifications <span className="ca-dd-count">{unread} new</span></div>
                {adminNotifications.map((n) => (
                  <div key={n.id} className={`ca-notif-row${!n.read ? " unread" : ""}`}>
                    <div className="ca-notif-dot" />
                    <div><p>{n.text}</p><span>{n.time}</span></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Profile */}
          <div ref={profileRef} className="ca-profile-wrap">
            <button className="ca-ava-btn" onClick={() => setProfileOpen((v) => !v)}>
              <span className="ca-ava">{currentAdmin.initials}</span>
            </button>
            {profileOpen && (
              <div className="ca-dropdown profile">
                <div className="ca-dd-user">
                  <span className="ca-ava md">{currentAdmin.initials}</span>
                  <div>
                    <div className="ca-dd-name">{currentAdmin.name}</div>
                    <div className="ca-dd-email">{currentAdmin.email}</div>
                  </div>
                </div>
                <div className="ca-dd-divider" />
                {[
                  { label: "My Courses", fn: () => { go("courses"); setProfileOpen(false); } },
                  { label: "View Profile", fn: () => { setView("profile"); setProfileOpen(false); } },
                  { label: "View Monthly Income", fn: () => { setView("income"); setProfileOpen(false); } },
                  { label: "Your Teaching Reviews", fn: () => { setView("reviews"); setProfileOpen(false); } },
                  { label: "Edit Profile", fn: () => { setView("edit-profile"); setProfileOpen(false); } },
                ].map((item) => (
                  <button key={item.label} className="ca-dd-item" onClick={item.fn}>{item.label}</button>
                ))}
                <div className="ca-dd-divider" />
                <button className="ca-dd-item danger" onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="ca-main">{renderPage()}</main>
    </div>
  );
}

function CenteredLoader({ minHeight = "240px" }) {
  return (
    <div
      style={{
        minHeight,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ClipLoader size={48} color="#1f5c10" />
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE COMPONENTS
───────────────────────────────────────────── */
function DashboardHome({ go, admin, coursesLoaded, onEditCourse }) {
  const courses = Array.isArray(admin?.courses) ? admin.courses : [];
  const totalStudents = courses.enrolledStudents ? courses.reduce((a, c) => a + c.enrolledStudents, 0) : 0 ;
  const totalRevenue = totalStudents ? courses.reduce((a, c) => a + (c.price * (c.enrolledStudents || 0)), 0) : 0;
  const avgRating = courses.averageRating !== undefined ? courses.length ? (courses.reduce((a, c) => a + c.averageRating, 0) / courses.length).toFixed(1) : 0 : 0;

  return (
    <div className="ca-page">
      <div className="ca-page-head">
        <div>
          <h1>Instructor Dashboard</h1>
          <p>Welcome back, {(admin?.name || ADMIN.name).split(" ")[0]}. Your courses are performing well.</p>
        </div>
        <button className="ca-cta-btn" onClick={() => go("course-upload")}>+ Upload Course</button>
      </div>


      <div className="ca-stat-row">
        {[
          { icon: "▤", label: "Active Courses", value: courses.filter((c) => c.status === "Live").length },
          { icon: "👥", label: "Total Students", value: totalStudents.toLocaleString() },
          { icon: "★", label: "Avg Rating", value: avgRating },
          { icon: "₹", label: "Total Revenue", value: `₹${(totalRevenue / 1000).toFixed(1)}k` },
        ].map((s) => (
          <div key={s.label} className="ca-stat-card">
            <span className="ca-stat-ico">{s.icon}</span>
            <span className="ca-stat-val">{s.value}</span>
            <span className="ca-stat-lbl">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Income mini bar chart */}

      <h2 className="ca-sec-title" style={{ marginTop: 32 }}>Your Courses</h2>
      {!coursesLoaded ? (
        <CenteredLoader />
      ) : courses.length === 0 ? (
        <div className="ca-empty-state">No active courses yet. Upload your first course to see it here.</div>
      ) : (
        <div className="ca-course-grid">
          {courses.map((c) => (
            <AdminCourseCard key={c.id} c={c} onEdit={() => onEditCourse?.(c)} />
          ))}
        </div>
      )}
    </div>
  );
}

function AdminCourseEdit({ course, onBack, onEditLessons }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [overviewVideoFile, setOverviewVideoFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!course) return;
    setForm({
      title: course.title || course.name || "",
      description: course.description || course.summary || "",
      price: Number.isFinite(course.price) ? String(course.price) : String(course.price || ""),
      category: course.category || "",
    });
    setThumbnailPreview(course.thumbnail || "");
    setThumbnailFile(null);
    setOverviewVideoFile(null);
  }, [course]);

  useEffect(() => {
    if (!thumbnailFile) return undefined;
    const objectUrl = URL.createObjectURL(thumbnailFile);
    setThumbnailPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [thumbnailFile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    if (!course?._id) return;
    const payload = new FormData();
    payload.append("_id", course._id);
    payload.append("title", form.title.trim());
    payload.append("description", form.description.trim());
    payload.append("price", form.price);
    payload.append("category", form.category.trim());
    if (thumbnailFile) payload.append("thumbnail", thumbnailFile);
    if (overviewVideoFile) payload.append("overviewVideo", overviewVideoFile);

    try {
      setSaving(true);
      await axios.patch("/api/courses/update-course", payload, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Changes saved successfully");
      onBack();
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (!course) {
    return (
      <section className="ca-page">
        <button className="ca-back" onClick={onBack}>Back to Dashboard</button>
        <div className="ca-empty-state">Course details are not available.</div>
      </section>
    );
  }

  return (
    <section className="ca-page">
      <button className="ca-back" onClick={onBack}>Back to Dashboard</button>
      <h1 className="ca-h1">Edit Course</h1>
      <div className="ca-edit-wrap" style={{ alignItems: "flex-start" }}>
        <div className="ca-edit-ava-col" style={{ minWidth: 220 }}>
          <div className="ca-ccard" style={{ width: 220, overflow: "hidden" }}>
            <div className="ca-ccard-top" style={{ height: 160 }}>
              <img
                src={thumbnailPreview || devImage}
                alt={form.title || "Course thumbnail"}
                className="ca-ccard-image"
              />
            </div>
          </div>
          <label className="ca-upload-photo-btn" htmlFor="course-thumb">
            Change Thumbnail
          </label>
          <input
            id="course-thumb"
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
            style={{ display: "none" }}
          />
        </div>

        <div className="ca-edit-form" style={{ minWidth: 300 }}>
          <div className="ca-form-grid">
            <div className="ca-fgroup">
              <label>Course Title</label>
              <input name="title" type="text" value={form.title} onChange={handleChange} />
            </div>
            <div className="ca-fgroup">
              <label>Category</label>
              <input name="category" type="text" value={form.category} onChange={handleChange} />
            </div>
            <div className="ca-fgroup">
              <label>Price (INR)</label>
              <input name="price" type="number" min="0" value={form.price} onChange={handleChange} />
            </div>
            <div className="ca-fgroup">
              <label>Overview Video</label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setOverviewVideoFile(e.target.files?.[0] || null)}
              />
              {course.overview_video && (
                <span style={{ fontSize: 12, color: "#666" }}>Current: {course.overview_video}</span>
              )}
            </div>
          </div>
          <div className="ca-fgroup">
            <label>Description</label>
            <textarea
              name="description"
              rows={5}
              value={form.description}
              onChange={handleChange}
            />
          </div>
          <div className="ca-form-actions">
            <button className="ca-btn-cancel" type="button" onClick={onBack}>Cancel</button>
            <button className="ca-btn-cancel" type="button" onClick={() => onEditLessons?.(course)}>
              Edit Lessons
            </button>
            <button className="ca-btn-save" type="button" onClick={handleSaveChanges} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function AdminLessonsEdit({ course, onBack }) {
  const dispatch = useDispatch();
  const [lessons, setLessons] = useState([]);
  const [lessonEdits, setLessonEdits] = useState({});
  const [newLesson, setNewLesson] = useState({
    title: "",
    module: "",
    description: "",
    order: "",
    isPreview: false,
    type: "video",
    lessonVideo: null,
    lessonDocument: null,
  });
  const [busyLessonId, setBusyLessonId] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const courseLessons = Array.isArray(course?.lessons) ? course.lessons : [];
    setLessons(courseLessons);
    setLessonEdits(
      courseLessons.reduce((acc, lesson) => {
        acc[lesson._id] = {
          title: lesson.title || "",
          description: lesson.description || "",
          order: Number.isFinite(Number(lesson.order)) ? String(lesson.order) : "",
          isPreview: Boolean(lesson.isPreview),
          lessonVideo: null,
          lessonDocument: null,
        };
        return acc;
      }, {})
    );
  }, [course]);

  const updateLessonEdit = (lessonId, key, value) => {
    setLessonEdits((prev) => ({
      ...prev,
      [lessonId]: {
        ...prev[lessonId],
        [key]: value,
      },
    }));
  };

  const handleCreateLesson = async () => {
    if (!course?._id) return;
    setStatusMessage("");
    setErrorMessage("");

    const resolvedTitle = newLesson.title.trim() || newLesson.module.trim();
    if (!resolvedTitle) {
      setErrorMessage("Lesson title is required.");
      return;
    }

    const formData = new FormData();
    formData.append("courseId", course._id);
    formData.append("title", resolvedTitle);
    formData.append("lessonName", newLesson.module.trim() || resolvedTitle);
    formData.append("description", newLesson.description.trim());
    if (Number.isFinite(Number(newLesson.order))) {
      formData.append("order", String(Number(newLesson.order)));
    }
    formData.append("isPreview", String(Boolean(newLesson.isPreview)));

    if (newLesson.lessonVideo) {
      formData.append("lessonVideo", newLesson.lessonVideo);
    }
    if (newLesson.lessonDocument) {
      formData.append("lessonDocument", newLesson.lessonDocument);
    }

    try {
      setBusyLessonId("new");
      const response = await axios.post("/api/courses/add-lesson", formData, {
        withCredentials: true,
      });
      const createdLesson = response?.data?.data?.lesson;
      if (createdLesson) {
        const nextLessons = [...lessons, createdLesson];
        setLessons(nextLessons);
        dispatch(updateCourse({ _id: course._id, updates: { lessons: nextLessons } }));
      }

      setNewLesson({
        title: "",
        module: "",
        description: "",
        order: "",
        isPreview: false,
        type: "video",
        lessonVideo: null,
        lessonDocument: null,
      });
      setStatusMessage("Lesson added successfully.");
    } catch (error) {
      console.error("Failed to add lesson:", error);
      setErrorMessage(error?.response?.data?.message || "Unable to add lesson right now.");
    } finally {
      setBusyLessonId(null);
    }
  };

  const handleUpdateLesson = async (lessonId) => {
    if (!course?._id || !lessonId) return;
    setStatusMessage("");
    setErrorMessage("");
    const edit = lessonEdits[lessonId];
    if (!edit?.title?.trim()) {
      setErrorMessage("Lesson title is required.");
      return;
    }

    const formData = new FormData();
    formData.append("courseId", course._id);
    formData.append("lessonId", lessonId);
    formData.append("title", edit.title.trim());
    formData.append("description", edit.description.trim());
    if (Number.isFinite(Number(edit.order))) {
      formData.append("order", String(Number(edit.order)));
    }
    formData.append("isPreview", String(Boolean(edit.isPreview)));
    if (edit.lessonVideo instanceof File || edit.lessonVideo instanceof Blob) {
      formData.append("lessonVideo", edit.lessonVideo);
    }
    if (edit.lessonDocument instanceof File || edit.lessonDocument instanceof Blob) {
      formData.append("lessonDocument", edit.lessonDocument);
    }

    try {
      setBusyLessonId(lessonId);
      const response = await axios.patch("/api/courses/update-lesson", formData, {
        withCredentials: true,
      });
      const updatedLesson = response?.data?.data;
      if (updatedLesson) {
        const nextLessons = lessons.map((lesson) =>
          String(lesson._id) === String(lessonId) ? updatedLesson : lesson
        );
        setLessons(nextLessons);
        dispatch(updateCourse({ _id: course._id, updates: { lessons: nextLessons } }));
        setLessonEdits((prev) => ({
          ...prev,
          [lessonId]: {
            ...prev[lessonId],
            lessonVideo: null,
            lessonDocument: null,
          },
        }));
        setStatusMessage("Lesson updated successfully.");
      }
    } catch (error) {
      console.error("Failed to update lesson:", error);
      setErrorMessage(error?.response?.data?.message || "Unable to update lesson right now.");
    } finally {
      setBusyLessonId(null);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!course?._id || !lessonId) return;
    setStatusMessage("");
    setErrorMessage("");
    try {
      setBusyLessonId(lessonId);
      await axios.delete("/api/courses/remove-lesson", {
        withCredentials: true,
        data: { courseId: course._id, lessonId },
      });
      const nextLessons = lessons.filter((lesson) => String(lesson._id) !== String(lessonId));
      setLessons(nextLessons);
      dispatch(updateCourse({ _id: course._id, updates: { lessons: nextLessons } }));
      setStatusMessage("Lesson deleted successfully.");
    } catch (error) {
      console.error("Failed to delete lesson:", error);
      setErrorMessage(error?.response?.data?.message || "Unable to delete lesson right now.");
    } finally {
      setBusyLessonId(null);
    }
  };

  if (!course) {
    return (
      <section className="ca-page">
        <button className="ca-back" onClick={onBack}>Back to Course</button>
        <div className="ca-empty-state">Course details are not available.</div>
      </section>
    );
  }

  return (
    <section className="ca-page">
      <button className="ca-back" onClick={onBack}>Back to Course</button>
      <h1 className="ca-h1">Edit Lessons</h1>
      <p style={{ color: "#9aa3b2", marginBottom: 18 }}>
        Manage lessons for <strong style={{ color: "#e2e2f0" }}>{course.title || course.name}</strong>
      </p>

      {(statusMessage || errorMessage) && (
        <div className="ca-alert" style={{ marginBottom: 16, color: errorMessage ? "#fda4af" : "#c7f9b8" }}>
          {errorMessage || statusMessage}
        </div>
      )}

      <div className="ca-edit-wrap" style={{ alignItems: "flex-start", marginBottom: 24 }}>
        <div className="ca-edit-form" style={{ minWidth: 300 }}>
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>Add New Lesson</h3>
          <div className="ca-form-grid">
            <div className="ca-fgroup">
              <label>Lesson Title</label>
              <input
                type="text"
                value={newLesson.title}
                onChange={(e) => setNewLesson((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="ca-fgroup">
              <label>Module / Week</label>
              <input
                type="text"
                value={newLesson.module}
                onChange={(e) => setNewLesson((prev) => ({ ...prev, module: e.target.value }))}
              />
            </div>
            <div className="ca-fgroup">
              <label>Order</label>
              <input
                type="number"
                min="1"
                value={newLesson.order}
                onChange={(e) => setNewLesson((prev) => ({ ...prev, order: e.target.value }))}
              />
            </div>
            <div className="ca-fgroup">
              <label>Type</label>
              <select
                value={newLesson.type}
                onChange={(e) => setNewLesson((prev) => ({ ...prev, type: e.target.value }))}
              >
                <option value="video">Video</option>
                <option value="document">Document</option>
                <option value="article">Article / Notes</option>
              </select>
            </div>
          </div>
          <div className="ca-fgroup">
            <label>Description</label>
            <textarea
              rows={4}
              value={newLesson.description}
              onChange={(e) => setNewLesson((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>
          {(newLesson.type === "video" || newLesson.type === "document" || newLesson.type === "article") && (
            <div className="ca-fgroup">
              <label>Lesson Video</label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setNewLesson((prev) => ({ ...prev, lessonVideo: e.target.files?.[0] || null }))}
              />
            </div>
          )}
          <div className="ca-fgroup">
            <label>{newLesson.type === "article" ? "Article File" : "Lesson Document"}</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.md,.html,.txt"
              onChange={(e) => setNewLesson((prev) => ({ ...prev, lessonDocument: e.target.files?.[0] || null }))}
            />
          </div>
          <div className="ca-fgroup" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input
              id="new-lesson-preview"
              type="checkbox"
              checked={newLesson.isPreview}
              onChange={(e) => setNewLesson((prev) => ({ ...prev, isPreview: e.target.checked }))}
            />
            <label htmlFor="new-lesson-preview" className="ca-checkbox-label">Allow preview</label>
          </div>
          <button
            className="ca-btn-save"
            type="button"
            onClick={handleCreateLesson}
            disabled={busyLessonId === "new"}
          >
            {busyLessonId === "new" ? "Adding..." : "Add Lesson"}
          </button>
        </div>
      </div>

      <div className="ca-course-grid">
        {lessons.length === 0 && (
          <div className="ca-empty-state">No lessons yet. Add the first lesson above.</div>
        )}
        {lessons.map((lesson) => {
          const edit = lessonEdits[lesson._id] || {};
          return (
            <div key={lesson._id} className="ca-ccard" style={{ padding: 18 }}>
              <div className="ca-ccard-body" style={{ padding: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <p className="ca-ccard-name" style={{ marginBottom: 0 }}>{lesson.title}</p>
                  <span className="ca-tag">Order {lesson.order}</span>
                </div>
                <div className="ca-form-grid">
                  <div className="ca-fgroup">
                    <label>Lesson Title</label>
                    <input
                      type="text"
                      value={edit.title || ""}
                      onChange={(e) => updateLessonEdit(lesson._id, "title", e.target.value)}
                    />
                  </div>
                  <div className="ca-fgroup">
                    <label>Order</label>
                    <input
                      type="number"
                      min="1"
                      value={edit.order || ""}
                      onChange={(e) => updateLessonEdit(lesson._id, "order", e.target.value)}
                    />
                  </div>
                </div>
                <div className="ca-fgroup">
                  <label>Description</label>
                  <textarea
                    rows={3}
                    value={edit.description || ""}
                    onChange={(e) => updateLessonEdit(lesson._id, "description", e.target.value)}
                  />
                </div>
                <div className="ca-form-grid">
                  <div className="ca-fgroup">
                    <label>Replace Video</label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => updateLessonEdit(lesson._id, "lessonVideo", e.target.files?.[0] || null)}
                    />
                  </div>
                  <div className="ca-fgroup">
                    <label>Replace Document</label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.md,.html,.txt"
                      onChange={(e) => updateLessonEdit(lesson._id, "lessonDocument", e.target.files?.[0] || null)}
                    />
                  </div>
                </div>
                <div className="ca-fgroup" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <input
                    id={`lesson-preview-${lesson._id}`}
                    type="checkbox"
                    checked={Boolean(edit.isPreview)}
                    onChange={(e) => updateLessonEdit(lesson._id, "isPreview", e.target.checked)}
                  />
                  <label htmlFor={`lesson-preview-${lesson._id}`}>Allow preview</label>
                </div>
                <div className="ca-form-actions" style={{ justifyContent: "space-between" }}>
                  <button
                    className="ca-btn-cancel"
                    type="button"
                    onClick={() => handleDeleteLesson(lesson._id)}
                    disabled={busyLessonId === lesson._id}
                  >
                    {busyLessonId === lesson._id ? "Working..." : "Delete"}
                  </button>
                  <button
                    className="ca-btn-save"
                    type="button"
                    onClick={() => handleUpdateLesson(lesson._id)}
                    disabled={busyLessonId === lesson._id}
                  >
                    {busyLessonId === lesson._id ? "Saving..." : "Save Lesson"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function MyCourses({ admin, coursesLoaded, onEditCourse }) {
  const courses = Array.isArray(admin?.courses) ? admin.courses : [];

  return (
    <div className="ca-page">
      <h1 className="ca-h1">My Courses</h1>
      {!coursesLoaded ? (
        <CenteredLoader />
      ) : courses.length === 0 ? (
        <div className="ca-empty-state">You have not created any courses yet.</div>
      ) : (
        <div className="ca-course-grid">
          {courses.map((c) => (
            <AdminCourseCard key={c.id} c={c} showActions onEdit={() => onEditCourse?.(c)} />
          ))}
        </div>
      )}
    </div>
  );
}


function StudentPerformance({ admin }) {
  const studentPerformance = Array.isArray(admin?.studentPerformance) && admin.studentPerformance.length
    ? admin.studentPerformance
    : ADMIN.studentPerformance;

  return (
    <div className="ca-page">
      <h1 className="ca-h1">Student Performance</h1>
      <div className="ca-table-wrap">
        <table className="ca-table">
          <thead>
            <tr><th>Student</th><th>Course</th><th>Quiz Score</th><th>Progress</th><th>Status</th></tr>
          </thead>
          <tbody>
            {studentPerformance.map((s, i) => (
              <tr key={i}>
                <td className="ca-bold">{s.name}</td>
                <td>{s.course}</td>
                <td><span className={`ca-tag ${s.score >= 90 ? "green" : s.score >= 75 ? "blue" : "orange"}`}>{s.score}/100</span></td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="ca-pbar"><div className="ca-pbar-fill" style={{ width: s.progress + "%" }} /></div>
                    <span style={{ fontSize: 12, color: "#888" }}>{s.progress}%</span>
                  </div>
                </td>
                <td><span className={`ca-tag ${s.status === "Active" ? "green" : "red"}`}>{s.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CourseAnalysis({ admin, onEditCourse }) {
  const courses = Array.isArray(admin?.courses) ? admin.courses : [];

  return (
    <div className="ca-page">
      <h1 className="ca-h1">Course Analysis</h1>
      <div className="ca-analysis-grid">
        {courses.map((c) => (
          <div className="ca-analysis-card" key={c.id}>
            <div className="ca-analysis-top" style={{ borderLeft: `4px solid ${c.color}` }}>
              <div>
                <p className="ca-bold">{c.name}</p>
                <span className="ca-tag" style={{ background: c.color + "22", color: c.color }}>{c.category}</span>
              </div>
              <span className={`ca-tag ${c.status === "Live" ? "green" : "orange"}`}>{c.status}</span>
            </div>
            <div className="ca-analysis-stats">
              <div className="ca-astat"><span className="ca-astat-val">{c.students.toLocaleString()}</span><span className="ca-astat-lbl">Students</span></div>
              <div className="ca-astat"><span className="ca-astat-val">⭐ {c.rating}</span><span className="ca-astat-lbl">Rating</span></div>
              <div className="ca-astat"><span className="ca-astat-val">₹{(c.revenue / 1000).toFixed(0)}k</span><span className="ca-astat-lbl">Revenue</span></div>
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>Enrollment rate</div>
              <div className="ca-pbar" style={{ height: 8 }}>
                <div className="ca-pbar-fill" style={{ width: Math.min((c.students / 1500) * 100, 100) + "%", background: c.color }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button className="ca-action-btn" style={{ flex: 1 }} onClick={() => onEditCourse?.(c)}>Edit Course</button>
              <button className="ca-action-btn red">Delete</button>
            </div>
          </div>
        ))}
      </div>
      <div className="ca-upload-zone" style={{ marginTop: 24, cursor: "pointer" }}>
        <span className="ca-upload-ico">📋</span>
        <p>Upload Verification Documents</p>
        <span className="ca-upload-hint">PDF, JPG – Certificates, Credentials, ID proof</span>
      </div>
    </div>
  );
}
// function CheckStatus({admin,courseId}) {
//   const courses = Array.isArray(admin?.courses) ? admin.courses : [];
//   const course = courses.find((c) => String(c.id) === String(courseId));
//   if (!course) return null;
//   return (
//     <div className="ca-status-card" style={{ borderLeft: `4px solid ${course.color}` }}>
//       <div>
//         <p className="ca-bold">{course.name}</p>
//         <span className="ca-tag" style={{ background: course.color + "22", color: course.color }}>{course.category}</span>
//       </div>
//     </div>
//   )

// }

function Feedback({ admin }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchReviews = async () => {
      try {
        const courses = Array.isArray(admin?.courses) ? admin.courses : [];
        if (!courses.length) {
          setReviews(ADMIN.reviews);
          return;
        }

        const responses = await Promise.all(
          courses.map((course) =>
            axios.get(`/api/reviews/${course._id || course.id}`, { withCredentials: true })
          )
        );

        if (!isMounted) return;
        const merged = responses.flatMap((response) => response?.data?.data || []);
        const normalized = merged.map((review) => ({
          id: review._id,
          student: review?.user?.name || "Student",
          rating: Number(review?.rating || 0),
          text: review?.comment || "",
          course: review?.course?.title || "Course",
          date: review?.createdAt
            ? new Date(review.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "",
        }));
        setReviews(normalized.length ? normalized : ADMIN.reviews);
      } catch (error) {
        if (!isMounted) return;
        setReviews(ADMIN.reviews);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchReviews();

    return () => {
      isMounted = false;
    };
  }, [admin]);

  return (
    <div className="ca-page">
      <h1 className="ca-h1">Student Feedback</h1>
      <div className="ca-reviews-list">
        {loading ? (
          <div className="ca-review-card">Loading reviews...</div>
        ) : (
          reviews.map((r) => (
          <div className="ca-review-card" key={r.id}>
            <div className="ca-review-top">
              <div className="ca-reviewer-ava">{r.student[0]}</div>
              <div>
                <p className="ca-bold">{r.student}</p>
                <span style={{ fontSize: 12, color: "#666" }}>{r.course} · {r.date}</span>
              </div>
              <div className="ca-stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
            </div>
            <p className="ca-review-text">{r.text}</p>
          </div>
          ))
        )}
      </div>
    </div>
  );
}

// function Transactions({ admin }) {
//   const courses = Array.isArray(admin?.courses) ? admin.courses : [];
//   const txns = [
//     { id: "TXN-401", date: "Mar 22, 2024", course: "Full-Stack Web Dev Bootcamp", students: 3, amount: "₹14,997", status: "Paid" },
//     { id: "TXN-402", date: "Mar 15, 2024", course: "Node.js Masterclass", students: 5, amount: "₹19,995", status: "Paid" },
//     { id: "TXN-403", date: "Mar 10, 2024", course: "Full-Stack Web Dev Bootcamp", students: 2, amount: "₹9,998", status: "Pending" },
//   ];
//   return (
//     <div className="ca-page">
//       <h1 className="ca-h1">Transaction History</h1>
//       <div className="ca-table-wrap">
//         <table className="ca-table">
//           <thead>
//             <tr><th>ID</th><th>Date</th><th>Course</th><th>New Students</th><th>Revenue</th><th>Status</th></tr>
//           </thead>
//           <tbody>
//             {txns.map((t) => (
//               <tr key={t.id}>
//                 <td className="ca-txn-id">{t.id}</td>
//                 <td>{t.date}</td>
//                 <td>{t.course}</td>
//                 <td>{t.students}</td>
//                 <td className="ca-txn-amt">{t.amount}</td>
//                 <td><span className={`ca-tag ${t.status === "Paid" ? "green" : "orange"}`}>{t.status}</span></td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

/* ─── Profile Views ─── */
function ViewProfile({ onBack, admin }) { //onBack is used to return to the previous view (dashboard home) when viewing profile details
  const profile = admin ;
  const courses = Array.isArray(profile.courses) ? profile.courses : [];
  const totalStudents = courses.reduce((a, c) => a + c.students, 0);
  const avgRating = (courses.reduce((a, c) => a + c.rating, 0) / Math.max(courses.length, 1)).toFixed(1);
  const totalRevenue = courses.reduce((a, c) => a + c.revenue, 0);

  return (
    <div className="ca-page">
      <button className="ca-back" onClick={onBack}>Back to Dashboard</button>
      <div className="ca-vp-banner">
        <div className="ca-vp-grad" />
        <div className="ca-vp-ava-wrap">
          <div className="ca-vp-ava">{profile.initials || ADMIN.initials}</div>
          <span className="ca-vp-role-tag">Course Instructor</span>
        </div>
      </div>
      <div className="ca-vp-body">
        <div>
          <h1 className="ca-vp-name">{profile.name || ADMIN.name}</h1>
          <p className="ca-vp-bio">{profile.bio }</p>
          <div className="ca-vp-meta">
            <span>Location {profile.location || ""}</span>
            <span>Joined {profile.joinDate || ADMIN.joinDate}</span>
            <span>Email {profile.email || ADMIN.email}</span>
          </div>
        </div>
      </div>
      <div className="ca-vp-stats">
        {[
          { val: courses.length, lbl: "Courses Created" },
          { val: totalStudents.toLocaleString(), lbl: "Total Students" },
          { val: avgRating, lbl: "Avg Rating" },
          { val: `Rs ${(totalRevenue / 100000).toFixed(1)}L`, lbl: "Total Revenue" },
        ].map((s) => (
          <div className="ca-vp-stat" key={s.lbl}>
            <span className="ca-vp-stat-val">{s.val}</span>
            <span className="ca-vp-stat-lbl">{s.lbl}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
function MonthlyIncome({ onBack , admin  }) {
  const profile = admin || ADMIN;
  const monthlyIncome = Array.isArray(profile?.monthlyIncome) && profile.monthlyIncome.length
    ? profile.monthlyIncome
    : ADMIN.monthlyIncome;
  const courses = Array.isArray(profile?.courses) ? profile.courses : [];
  const max = Math.max(...monthlyIncome.map((m) => m.amount));
  const totalRevenue = courses.reduce((a, x) => a + x.revenue, 0) || 1;
  return (
    <div className="ca-page">
      <button className="ca-back" onClick={onBack}>← Back</button>
      <h1 className="ca-h1">Monthly Income</h1>
      <div className="ca-stat-row" style={{ marginBottom: 28 }}>
        <div className="ca-stat-card"><span className="ca-stat-ico">↑</span><span className="ca-stat-val">₹1.12L</span><span className="ca-stat-lbl">This Month</span></div>
        <div className="ca-stat-card"><span className="ca-stat-ico">◎</span><span className="ca-stat-val">+17%</span><span className="ca-stat-lbl">vs Last Month</span></div>
        <div className="ca-stat-card"><span className="ca-stat-ico">₹</span><span className="ca-stat-val">₹5.28L</span><span className="ca-stat-lbl">YTD Total</span></div>
      </div>
      <div className="ca-income-chart large">
        {monthlyIncome.map((m) => {
          const pct = (m.amount / max) * 100;
          return (
            <div key={m.month} className="ca-bar-col">
              <span className="ca-bar-val">₹{Math.round(m.amount / 1000)}k</span>
              <div className="ca-bar-wrap">
                <div className="ca-bar-fill" style={{ height: pct + "%" }} />
              </div>
              <span className="ca-bar-lbl">{m.month}</span>
            </div>
          );
        })}
      </div>
      <h2 className="ca-sec-title" style={{ marginTop: 32 }}>Income by Course</h2>
      {courses.map((c) => (
        <div className="ca-prog-card" key={c.id}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <p className="ca-bold" style={{ margin: 0 }}>{c.name}</p>
            <span className="ca-txn-amt">₹{(c.revenue / 1000).toFixed(0)}k</span>
          </div>
          <div className="ca-pbar" style={{ height: 8 }}>
            <div className="ca-pbar-fill" style={{ width: (c.revenue / totalRevenue) * 100 + "%", background: c.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function TeachingReviews({ onBack, admin }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchReviews = async () => {
      try {
        const courses = Array.isArray(admin?.courses) ? admin.courses : [];
        if (!courses.length) {
          setReviews(ADMIN.reviews);
          return;
        }

        const responses = await Promise.all(
          courses.map((course) =>
            axios.get(`/api/reviews/${course._id || course.id}`, { withCredentials: true })
          )
        );

        if (!isMounted) return;
        const merged = responses.flatMap((response) => response?.data?.data || []);
        const normalized = merged.map((review) => ({
          id: review._id,
          student: review?.user?.name || "Student",
          rating: Number(review?.rating || 0),
          text: review?.comment || "",
          course: review?.course?.title || "Course",
          date: review?.createdAt
            ? new Date(review.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "",
        }));
        setReviews(normalized.length ? normalized : ADMIN.reviews);
      } catch (error) {
        if (!isMounted) return;
        setReviews(ADMIN.reviews);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchReviews();

    return () => {
      isMounted = false;
    };
  }, [admin]);

  const avgRating = reviews.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";
  return (
    <div className="ca-page">
      <button className="ca-back" onClick={onBack}>← Back</button>
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
        <div className="ca-big-rating">
          <span className="ca-big-rating-num">{avgRating}</span>
          <div className="ca-stars" style={{ fontSize: 18 }}>{"★".repeat(Math.round(avgRating))}</div>
          <span style={{ fontSize: 12, color: "#666" }}>{reviews.length} reviews</span>
        </div>
        <div style={{ flex: 1 }}>
          {[5, 4, 3, 2, 1].map((r) => {
            const count = reviews.filter((x) => x.rating === r).length;
            const pct = (count / reviews.length) * 100;
            return (
              <div key={r} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "#888", width: 16 }}>{r}★</span>
                <div className="ca-pbar" style={{ flex: 1, height: 8 }}>
                  <div className="ca-pbar-fill" style={{ width: pct + "%", background: "#f59e0b" }} />
                </div>
                <span style={{ fontSize: 12, color: "#666", width: 20 }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="ca-reviews-list">
        {loading ? (
          <div className="ca-review-card">Loading reviews...</div>
        ) : (
          reviews.map((r) => (
            <div className="ca-review-card" key={r.id}>
              <div className="ca-review-top">
                <div className="ca-reviewer-ava">{r.student[0]}</div>
                <div>
                  <p className="ca-bold">{r.student}</p>
                  <span style={{ fontSize: 12, color: "#666" }}>{r.course} · {r.date}</span>
                </div>
                <div className="ca-stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
              </div>
              <div style={{ fontSize: 12, color: "#3f5f2f", fontWeight: 600, marginBottom: 6 }}>
                Course: {r.course}
              </div>
              <div style={{ fontSize: 12, color: "#3f5f2f", fontWeight: 600, marginBottom: 6 }}>
                Course: {r.course}
              </div>
              <p className="ca-review-text">{r.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
function EditProfile({ onBack, admin }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
  });

  useEffect(() => {
    setForm({
      name: admin?.name || ADMIN.name,
      email: admin?.email || ADMIN.email,
      phone: admin?.phone || ADMIN.phone,
      location: admin?.location || ADMIN.location,
      bio: admin?.bio || "",
    });
  }, [admin]);

  const initials = (admin?.initials || deriveInitials(form.name) || ADMIN.initials).slice(0, 2);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    dispatch(updateCourseAdmin({
      name: form.name,
      email: form.email,
      phone: form.phone,
      location: form.location,
      bio: form.bio,
      initials: deriveInitials(form.name),
      initial: deriveInitials(form.name),
    }));

    try {
      await axios.patch("/api/auth/update-profile", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        location: form.location,
        bio: form.bio,
      }, { withCredentials: true });
    } catch (error) {
      console.error("Failed to sync profile update:", error);
    }

    onBack();
  };

  return (
    <div className="ca-page">
      <button className="ca-back" onClick={onBack}>Back</button>
      <h1 className="ca-h1">Edit Profile</h1>
      <div className="ca-edit-wrap">
        <div className="ca-edit-ava-col">
          <div className="ca-vp-ava" style={{ margin: "0 auto" }}>{initials}</div>
          <button className="ca-upload-photo-btn" type="button">Change Photo</button>
        </div>
        <form className="ca-edit-form" onSubmit={handleSave}>
          <div className="ca-form-grid">
            {[
              { label: "Full Name", key: "name", type: "text" },
              { label: "Email", key: "email", type: "email" },
              { label: "Phone", key: "phone", type: "text" },
              { label: "Location", key: "location", type: "text" },
            ].map((f) => (
              <div className="ca-fgroup" key={f.label}>
                <label>{f.label}</label>
                <input type={f.type} name={f.key} value={form[f.key]} onChange={handleChange} />
              </div>
            ))}
          </div>
          <div className="ca-fgroup">
            <label>Bio</label>
            <textarea name="bio" value={form.bio} onChange={handleChange} rows={4} />
          </div>
          <div className="ca-form-actions">
            <button className="ca-btn-cancel" type="button" onClick={onBack}>Cancel</button>
            <button className="ca-btn-save" type="submit" onClick={handleSave}>Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}
function AdminCourseCardLegacy({ c, showActions }) {
  return (
    <div className="ca-ccard">
      <div className="ca-ccard-thumb" style={{ background: `linear-gradient(135deg, ${c.color}33, ${c.color}11)` }}>
        <span className={`ca-ccard-status ${c.status === "Published" ? "ca-tag green" : "ca-tag orange"}`}>{c.status}</span>
        <span style={{ fontSize: 36 }}>📖</span>
      </div>
      <div className="ca-ccard-body">
        <p className="ca-ccard-name">{c.name}</p>
        <div className="ca-ccard-stats">
          <span>👥 {c.students.toLocaleString()}</span>
          <span>⭐ {c.rating}</span>
          <span>₹{(c.revenue / 1000).toFixed(0)}k</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 12, color: "#666" }}>
          <span>{c.lessonsCount} lesson{c.lessonsCount === 1 ? "" : "s"}</span>
          <button className="ca-action-btn">Check Status</button>
        </div>
        {showActions && (
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button className="ca-action-btn" style={{ flex: 1 }}>Edit</button>
            <button className="ca-action-btn red">Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminCourseCard({ c, showActions, onEdit }) {
  const thumbnail = c.thumbnail || devImage;
  const revenueLabel = c.enrolledStudents ? `₹${(c.enrolledStudents * c.price / 1000).toFixed(0)}k`: `₹0`;
  const onDelete = () => {
    // Implementation for delete action
  };
  return (
    <div className="ca-ccard">
      <div className="ca-ccard-top">
        <img src={thumbnail} alt={c.name} className="ca-ccard-image" />
      </div>
      <div className="ca-ccard-body">
        <div className="ca-ccard-cat">{c.category}</div>
        <p className="ca-ccard-name">{c.name}</p>
        <div className="ca-ccard-stats">
          <span>{c.enrolledStudents?.toLocaleString() || 0} students</span>
          <span>{c.lessonsCount} lesson{c.lessonsCount === 1 ? "" : "s"}</span>
        </div>
        <div className="ca-ccard-meta">
          <span>Rating {c.averageRating?.toFixed(1) || 0}</span>
          <span>Revenue {revenueLabel}</span>
        </div>
        <div className="ca-ccard-foot">
          
            <div className="ca-ccard-actions">
              <button className="ca-action-btn ca-action-btn-grow" onClick={() => onEdit?.()}>Edit</button>
              <button className="ca-action-btn red" onClick={onDelete}>Delete</button>
            </div>
          
        </div>
      </div>
    </div>
  );
}

function AdminProgCard({ c }) {
  return (
    <div className="ca-prog-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <p className="ca-bold" style={{ margin: 0 }}>{c.name}</p>
        <span className="ca-txn-amt">₹{(c.enrolledStudents * c.price / 1000).toFixed(0)}k</span>
      </div>
      <div className="ca-pbar">
        <div className="ca-pbar-fill" style={{ width: Math.min((c.enrolledStudents / 1500) * 100, 100) + "%", background: c.color }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12, color: "#666" }}>
        <span>{c.enrolledStudents?.toLocaleString() || 0} students</span>
        <span>⭐ {c.averageRating?.toFixed(1) || 0}</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

.ca { display:flex; flex-direction:column; min-height:100vh; background:#0c0c1a; color:#e2e2f0; font-family:'Sora',sans-serif; }

.ca-sidebar { position:fixed; top:0; left:0; height:100vh; width:260px; background:#111120; border-right:1px solid #ffffff0f; z-index:200; transform:translateX(-100%); transition:transform .3s cubic-bezier(.4,0,.2,1); display:flex; flex-direction:column; }
.ca-sidebar.open { transform:translateX(0); }
.ca-overlay { position:fixed; inset:0; background:#00000080; z-index:199; backdrop-filter:blur(2px); }
.ca-sb-head { display:flex; align-items:center; justify-content:space-between; padding:20px 20px 16px; border-bottom:1px solid #ffffff0a; }
.ca-logo { font-size:20px; font-weight:700; color:#fff; }
.ca-logo em { color:#f97316; font-style:normal; }
.ca-x { background:none; border:none; color:#888; font-size:16px; cursor:pointer; }
.ca-sb-role { font-size:10px; letter-spacing:2px; color:#f97316; text-transform:uppercase; padding:12px 20px 8px; font-weight:600; }
.ca-nav { display:flex; flex-direction:column; gap:2px; padding:0 12px; flex:1; }
.ca-nav-item { display:flex; align-items:center; gap:12px; padding:11px 14px; border:none; background:none; color:#8888aa; border-radius:10px; font-family:inherit; font-size:14px; cursor:pointer; text-align:left; transition:all .2s; }
.ca-nav-item:hover { background:#ffffff08; color:#e2e2f0; }
.ca-nav-item.active { background:#f9731622; color:#f97316; font-weight:600; }
.ca-nav-icon { font-size:15px; width:20px; text-align:center; }
.ca-sb-footer { padding:16px; border-top:1px solid #ffffff0a; }
.ca-sb-user { display:flex; align-items:center; gap:10px; }
.ca-sb-uname { font-size:13px; font-weight:600; }
.ca-sb-uemail { font-size:11px; color:#666; }

.ca-topbar { position:sticky; top:0; z-index:100; height:60px; background:#111120cc; backdrop-filter:blur(12px); border-bottom:1px solid #ffffff0a; display:flex; align-items:center; padding:0 20px; gap:12px; }
.ca-burger { background:none; border:none; cursor:pointer; display:flex; flex-direction:column; gap:5px; padding:6px; }
.ca-burger span { display:block; width:22px; height:2px; background:#e2e2f0; border-radius:2px; }
.ca-topbar-logo { font-size:18px; font-weight:700; color:#fff; flex:1; }
.ca-topbar-logo em { color:#f97316; font-style:normal; }
.ca-topbar-right { display:flex; align-items:center; gap:8px; }
.ca-icon-btn { position:relative; background:none; border:1px solid #ffffff10; color:#aaa; padding:8px; border-radius:10px; cursor:pointer; display:flex; transition:all .2s; }
.ca-icon-btn:hover { background:#ffffff08; color:#e2e2f0; }
.ca-badge { position:absolute; top:-5px; right:-5px; background:#ff4f4f; color:#fff; font-size:10px; font-weight:700; width:18px; height:18px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #111120; }
.ca-ava { display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#f97316,#ef4444); color:#fff; font-weight:700; border-radius:50%; }
.ca-ava.sm { width:34px; height:34px; font-size:12px; }
.ca-ava.md { width:38px; height:38px; font-size:14px; }
.ca-ava-btn { background:none; border:none; cursor:pointer; padding:0; }
.ca-ava-btn .ca-ava { width:36px; height:36px; font-size:13px; }
.ca-notif-wrap,.ca-profile-wrap { position:relative; }
.ca-dropdown { position:absolute; right:0; top:calc(100% + 10px); background:#17172a; border:1px solid #ffffff10; border-radius:14px; min-width:230px; z-index:300; box-shadow:0 20px 60px #00000080; overflow:hidden; animation:ca-pop .15s ease; }
.ca-dropdown.notif { min-width:300px; }
@keyframes ca-pop { from{opacity:0;transform:translateY(-8px) scale(.97)} to{opacity:1;transform:none} }
.ca-dd-title { padding:14px 16px 10px; font-size:13px; font-weight:700; border-bottom:1px solid #ffffff0a; display:flex; align-items:center; justify-content:space-between; }
.ca-dd-count { font-size:11px; background:#f9731622; color:#f97316; padding:2px 8px; border-radius:20px; }
.ca-notif-row { display:flex; gap:10px; align-items:flex-start; padding:12px 14px; border-bottom:1px solid #ffffff08; }
.ca-notif-row.unread { background:#f9731608; }
.ca-notif-dot { width:8px; height:8px; border-radius:50%; background:#f97316; margin-top:4px; flex-shrink:0; }
.ca-notif-row:not(.unread) .ca-notif-dot { background:#ffffff15; }
.ca-notif-row p { font-size:12.5px; color:#ccc; margin:0 0 3px; line-height:1.4; }
.ca-notif-row span { font-size:11px; color:#555; }
.ca-dd-user { display:flex; align-items:center; gap:12px; padding:14px 16px; }
.ca-dd-name { font-size:13px; font-weight:600; }
.ca-dd-email { font-size:11px; color:#666; }
.ca-dd-divider { height:1px; background:#ffffff0a; }
.ca-dd-item { display:block; width:100%; padding:11px 16px; background:none; border:none; color:#011402; font-family:inherit; font-size:13.5px; text-align:left; cursor:pointer; transition:all .15s; }
.ca-dd-item:hover { background:#ffffff08; color:#e2e2f0; }
.ca-dd-item.danger { color:#ff5f5f; }
.ca-dd-item.danger:hover { background:#ff5f5f11; }

.ca-main { flex:1; overflow-y:auto; }
.ca-page { max-width:1100px; margin:0 auto; padding:32px 24px; }
.ca-page-head { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:28px; flex-wrap:wrap; gap:16px; }
.ca-page-head h1 { font-size:24px; font-weight:700; margin:0 0 4px; }
.ca-page-head p { font-size:14px; color:#666; margin:0; }
.ca-h1 { font-size:22px; font-weight:700; margin:0 0 24px; }
.acc { color:#f97316; }
.ca-cta-btn { background:#f97316; color:#fff; border:none; padding:10px 20px; border-radius:10px; font-family:inherit; font-size:13px; font-weight:600; cursor:pointer; white-space:nowrap; transition:opacity .2s; }
.ca-cta-btn:hover { opacity:.85; }

.ca-stat-row { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:16px; margin-bottom:28px; }
.ca-stat-card { background:#161626; border:1px solid #ffffff08; border-radius:14px; padding:20px 18px; display:flex; flex-direction:column; gap:6px; }
.ca-stat-ico { font-size:20px; }
.ca-stat-val { font-size:22px; font-weight:700; }
.ca-stat-lbl { font-size:12px; color:#666; }
.ca-sec-title { font-size:17px; font-weight:700; margin:0 0 16px; }

.ca-income-chart { display:flex; align-items:flex-end; gap:12px; height:160px; background:#161626; border:1px solid #ffffff08; border-radius:14px; padding:20px; }
.ca-income-chart.large { height:220px; }
.ca-empty-state { padding:24px; border:1px dashed #ffffff18; border-radius:14px; color:#666; background:#161626; }
.ca-bar-col { display:flex; flex-direction:column; align-items:center; flex:1; height:100%; gap:6px; }
.ca-bar-val { font-size:10px; color:#888; }
.ca-bar-wrap { flex:1; width:100%; background:#ffffff08; border-radius:6px; overflow:hidden; display:flex; align-items:flex-end; }
.ca-bar-fill { width:100%; background:linear-gradient(to top,#f97316,#fb923c); border-radius:6px 6px 0 0; transition:height .5s ease; }
.ca-bar-lbl { font-size:11px; color:#666; }

.ca-course-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:20px; }
.ca-ccard { background:#161626; border:1px solid #ffffff08; border-radius:10px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.08); transition:transform .2s, background-color .2s, border-color .2s; }
.ca-ccard:hover { transform:translateY(-3px); background:var(--card-hover); border-color:rgba(0,0,0,0.18); }
.ca-ccard:hover .ca-ccard-name,
.ca-ccard:hover .ca-ccard-meta,
.ca-ccard:hover .ca-ccard-meta span { color:#fff; }
.ca-ccard:hover .ca-ccard-stats { color:rgba(255,255,255,0.82); }
.ca-ccard:hover .ca-ccard-cat { color:rgba(255,255,255,0.88); }
.ca-ccard-top { position:relative; height:155px; background:linear-gradient(135deg, #f9731622, #f973160a); display:flex; align-items:center; justify-content:center; }
.ca-ccard-image { width:100%; height:100%; display:contain; display:block; }
.ca-ccard-status { position:absolute; top:10px; right:10px; font-size:11px; font-weight:600; padding:4px 10px; border-radius:20px; }
.ca-ccard-body { padding:16px; }
.ca-ccard-cat { margin:0 0 8px; color:#f97316; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; }
.ca-ccard-name { font-size:15px; font-weight:700; margin:0 0 10px; line-height:1.4; text-align:center; }
.ca-ccard-stats { display:flex; align-items:center; justify-content:space-between; gap:10px; font-size:12px; color:#888; }
.ca-ccard-meta { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-top:10px; font-size:12px; color:#666; }
.ca-ccard-meta span { flex:1; }
.ca-ccard-meta span:last-child { text-align:right; }
.ca-ccard-foot { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top:14px; }
.ca-ccard-actions { display:flex; gap:8px; }
.ca-action-btn-grow { flex:1; }
.ca-bold { font-weight:600; color:#e2e2f0; }

.ca-pbar { background:#ffffff0a; border-radius:4px; height:6px; overflow:hidden; }
.ca-pbar-fill { height:100%; background:linear-gradient(90deg,#f97316,#fb923c); border-radius:4px; transition:width .5s; }
.ca-prog-card { background:#161626; border:1px solid #ffffff08; border-radius:14px; padding:18px; margin-bottom:14px; }

.ca-table-wrap { overflow-x:auto; }
.ca-table { width:100%; border-collapse:collapse; font-size:13.5px; }
.ca-table th { padding:12px 16px; text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#555; border-bottom:1px solid #ffffff0a; }
.ca-table td { padding:14px 16px; border-bottom:1px solid #ffffff06; color:#ccc; }
.ca-table tr:hover td { background:#ffffff04; }
.ca-txn-id { font-family:'JetBrains Mono',monospace; font-size:12px; color:#f97316; }
.ca-txn-amt { font-weight:600; color:#3ecf8e; }
.ca-tag { font-size:11px; font-weight:600; padding:3px 10px; border-radius:20px; }
.ca-tag.green { background:#3ecf8e22; color:#3ecf8e; }
.ca-tag.blue { background:#5468ff22; color:#5468ff; }
.ca-tag.orange { background:#f9731622; color:#f97316; }
.ca-tag.red { background:#ff5f5f22; color:#ff5f5f; }
.ca-action-btn { background:none; border:1px solid #ffffff15; color:#ccc; font-family:inherit; font-size:12px; padding:5px 12px; border-radius:8px; cursor:pointer; transition:all .2s; }
.ca-action-btn:hover { background:var(--accent-glow); border-color:rgba(31,92,16,0.3); color:var(--accent); }
.ca-action-btn.red { border-color:#ff5f5f33; color:#ff5f5f; }
.ca-action-btn.red:hover { background:#ff5f5f11; }

.ca-tabs { display:flex; gap:8px; margin-bottom:20px; }
.ca-tab { background:none; border:1px solid #ffffff10; color:#888; font-family:inherit; font-size:13px; padding:8px 18px; border-radius:20px; cursor:pointer; transition:all .2s; }
.ca-tab.active { background:#f9731622; border-color:#f97316; color:#f97316; font-weight:600; }
.ca-upload-form { max-width:600px; display:flex; flex-direction:column; gap:16px; }
.ca-fgroup { display:flex; flex-direction:column; gap:6px; }
.ca-fgroup label { font-size:12px; color:#888; font-weight:500; }
.ca-checkbox-label { font-size:12px; color:var(--text-secondary); font-weight:600; letter-spacing:0.02em; }
.ca-fgroup input,.ca-fgroup textarea,.ca-fgroup select { background:#1c1c2e; border:1px solid #ffffff10; color:#e2e2f0; font-family:inherit; font-size:13.5px; padding:10px 14px; border-radius:10px; outline:none; resize:vertical; transition:border-color .2s; }
.ca-fgroup input:focus,.ca-fgroup textarea:focus,.ca-fgroup select:focus { border-color:#f9731666; }
.ca-upload-zone { border:2px dashed #ffffff15; border-radius:14px; padding:40px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:8px; transition:border-color .2s; }
.ca-upload-zone:hover { border-color:#f97316; }
.ca-upload-ico { font-size:36px; }
.ca-upload-zone p { font-size:14px; color:#888; margin:0; }
.ca-upload-hint { font-size:12px; color:#555; }

.ca-analysis-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:20px; }
.ca-analysis-card { background:#161626; border:1px solid #ffffff08; border-radius:14px; padding:20px; }
.ca-analysis-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:16px; padding-left:12px; }
.ca-analysis-stats { display:flex; gap:20px; }
.ca-astat { display:flex; flex-direction:column; gap:4px; }
.ca-astat-val { font-size:18px; font-weight:700; color:#e2e2f0; }
.ca-astat-lbl { font-size:11px; color:#666; }

.ca-reviews-list { display:flex; flex-direction:column; gap:16px; }
.ca-review-card { background:#aedc9f; border:1px solid #ffffff08; border-radius:14px; padding:20px; }
.ca-review-top { display:flex; align-items:center; gap:12px; margin-bottom:12px; }
.ca-reviewer-ava { width:38px; height:38px; border-radius:50%; background:linear-gradient(135deg,#5468ff,#8b5cf6); color:#fff; font-weight:700; display:flex; align-items:center; justify-content:center; font-size:15px; }
.ca-stars { color:#1f5c10; background-color:transparent; font-size:14px; margin-left:auto; letter-spacing:1px; font-weight:600; }
.ca-review-text { font-size:13.5px; color:#999; line-height:1.6; margin:0; }
.ca-big-rating { display:flex; flex-direction:column; align-items:center; gap:6px; background:#161626; border:1px solid #ffffff08; border-radius:14px; padding:24px 32px; }
.ca-big-rating-num { font-size:48px; font-weight:800; color:#f59e0b; line-height:1; }

.ca-back { background:none; border:none; color:#f97316; font-family:inherit; font-size:13px; cursor:pointer; padding:0; margin-bottom:20px; }
.ca-vp-banner { height:180px; background:linear-gradient(135deg,#1c1620,#120d18); border-radius:16px; position:relative; margin-bottom:60px; }
.ca-vp-grad { position:absolute; inset:0; background:linear-gradient(135deg,#f9731622,#ef444422); border-radius:16px; }
.ca-vp-ava-wrap { position:absolute; bottom:-48px; left:28px; display:flex; align-items:flex-end; gap:12px; }
.ca-vp-ava { width:90px; height:90px; border-radius:50%; background:linear-gradient(135deg,#f97316,#ef4444); color:#fff; font-size:28px; font-weight:800; display:flex; align-items:center; justify-content:center; border:4px solid #0c0c1a; }
.ca-vp-role-tag { background:#f9731622; color:#f97316; font-size:12px; font-weight:600; padding:5px 14px; border-radius:20px; border:1px solid #f9731633; margin-bottom:8px; }
.ca-vp-body { display:flex; gap:20px; justify-content:space-between; flex-wrap:wrap; margin-bottom:24px; }
.ca-vp-name { font-size:24px; font-weight:800; margin:0 0 8px; }
.ca-vp-bio { font-size:14px; color:#888; margin:0 0 12px; line-height:1.6; }
.ca-vp-meta { display:flex; gap:16px; flex-wrap:wrap; }
.ca-vp-meta span { font-size:13px; color:#666; }
.ca-vp-stats { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:14px; background:#161626; border:1px solid #ffffff08; border-radius:14px; padding:20px; }
.ca-vp-stat { text-align:center; }
.ca-vp-stat-val { display:block; font-size:22px; font-weight:800; color:#f97316; }
.ca-vp-stat-lbl { font-size:12px; color:#666; }
.ca-edit-wrap { display:flex; gap:32px; flex-wrap:wrap; }
.ca-edit-ava-col { display:flex; flex-direction:column; align-items:center; gap:12px; }
.ca-upload-photo-btn { background:none; border:1px solid #ffffff20; color:#ccc; font-family:inherit; font-size:12px; padding:8px 16px; border-radius:8px; cursor:pointer; }
.ca-edit-form { flex:1; min-width:280px; }
.ca-form-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:16px; margin-bottom:16px; }
.ca-form-actions { display:flex; gap:12px; margin-top:24px; justify-content:flex-end; }
.ca-btn-cancel { background:none; border:1px solid #ffffff15; color:#888; font-family:inherit; font-size:13px; padding:10px 20px; border-radius:10px; cursor:pointer; }
.ca-btn-save { background:#f97316; border:none; color:#fff; font-family:inherit; font-size:13px; font-weight:600; padding:10px 24px; border-radius:10px; cursor:pointer; }

/* Project theme overrides */
.ca, .ca * { font-family:'Inter',sans-serif; }
.ca { background:var(--bg); color:var(--text-primary); }
.ca-main { background:linear-gradient(155deg, #cfe09c 0%, var(--bg) 70%); }
.ca-sidebar, .ca-topbar { background:var(--header); border-color:rgba(0,0,0,0.12); }
.ca-overlay { background:rgba(0,0,0,0.18); backdrop-filter:blur(1px); }
.ca-logo, .ca-topbar-logo, .ca-sb-uname, .ca-dd-name, .ca-page-head h1, .ca-h1, .ca-sec-title, .ca-bold, .ca-ccard-name, .ca-vp-name { color:var(--text-primary); }
.ca-logo em, .ca-topbar-logo em, .ca-sb-role, .ca-nav-item.active, .ca-dd-count, .ca-back, .acc, .ca-vp-stat-val { color:var(--accent); }
.ca-nav-item, .ca-page-head p, .ca-sb-uemail, .ca-dd-email, .ca-stat-lbl, .ca-bar-lbl, .ca-bar-val, .ca-ccard-stats, .ca-astat-lbl, .ca-vp-bio, .ca-vp-meta span, .ca-review-text { color:var(--text-secondary); }
.ca-nav-item:hover, .ca-dd-item:hover, .ca-icon-btn:hover, .ca-action-btn:hover, .ca-filter-btn:hover, .ca-tab:hover { background:rgba(255,255,255,0.16); color:#fff; }
.ca-nav-item.active, .ca-dd-count, .ca-filter-btn.active, .ca-tab.active { background:rgba(31,92,16,0.1); border-color:rgba(31,92,16,0.2); }
.ca-icon-btn, .ca-dropdown, .ca-stat-card, .ca-income-chart, .ca-ccard, .ca-prog-card, .ca-analysis-card, .ca-review-card, .ca-big-rating, .ca-vp-stats, .ca-add-form, .ca-upload-form, .ca-upload-zone, .ca-upload-zone:hover, .ca-fgroup input, .ca-fgroup textarea, .ca-fgroup select, .ca-table-wrap {
  background:var(--card);
  border-color:var(--border-med);
  color:var(--text-primary);
}
.ca-review-card { background:#aedc9f; }
.ca-dropdown, .ca-stat-card, .ca-income-chart, .ca-ccard, .ca-prog-card, .ca-analysis-card, .ca-review-card, .ca-big-rating, .ca-vp-stats, .ca-add-form { box-shadow:0 4px 24px rgba(0,0,0,0.08); }
.ca-burger span { background:#fff; }
.ca-icon-btn { color:rgba(255,255,255,0.85); border-color:rgba(255,255,255,0.35); }
.ca-badge { border-color:var(--header); }
.ca-ava, .ca-vp-ava { background:linear-gradient(135deg, var(--accent), var(--accent-lt)); }
.ca-cta-btn, .ca-btn-save { background:var(--accent); color:#fff; box-shadow:0 2px 12px rgba(31,92,16,0.25); }
.ca-cta-btn:hover, .ca-btn-save:hover { background:var(--accent-lt); opacity:1; }
.ca-action-btn, .ca-filter-btn, .ca-tab, .ca-btn-cancel, .ca-upload-photo-btn { background:transparent; border-color:rgba(31,92,16,0.25); color:var(--accent); }
.ca-pbar, .ca-bar-wrap { background:rgba(0,0,0,0.08); }
.ca-pbar-fill, .ca-bar-fill { background:linear-gradient(90deg, var(--accent), var(--accent-lt)); }
.ca-table th, .ca-table td, .ca-dd-divider { border-color:var(--border); }
.ca-table th { color:var(--text-muted); }
.ca-table td, .ca-notif-row p, .ca-notif-row span { color:var(--text-secondary); }
.ca-table tr:hover td, .ca-notif-row.unread { background:rgba(255,255,255,0.18); }
.ca-notif-dot, .ca-big-rating-num, .ca-txn-id { color:var(--accent); background-color:var(--accent); }
.ca-stars { color:var(--accent); background:transparent; }
.ca-notif-dot { background:var(--accent); }
.ca-tag.green { background:rgba(112,171,93,0.16); color:var(--accent); }
.ca-tag.orange, .ca-tag.blue { background:rgba(31,92,16,0.1); color:var(--accent); }
.ca-vp-banner { background:linear-gradient(155deg, #b7d28d 0%, #dce9c6 100%); }
.ca-vp-grad { background:linear-gradient(135deg, rgba(31,92,16,0.1), rgba(126,181,107,0.18)); }
`;

