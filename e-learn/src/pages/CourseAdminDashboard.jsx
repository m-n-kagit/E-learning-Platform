import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
  { id: "upload", label: "Upload Content", icon: "↑" },
  { id: "quiz", label: "Quiz Manager", icon: "◎" },
  { id: "performance", label: "Student Performance", icon: "◈" },
  { id: "analysis", label: "Course Analysis", icon: "⊕" },
  { id: "feedback", label: "Feedback", icon: "✦" },
  { id: "transactions", label: "Transactions", icon: "◳" },
];

/* ─────────────────────────────────────────────
   ROOT
───────────────────────────────────────────── */
export default function CourseAdminDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [view, setView] = useState(null);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

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

  const go = (id) => { setActiveNav(id); setView(null); setSidebarOpen(false); };
  const unread = ADMIN.notifications.filter((n) => !n.read).length;

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setProfileOpen(false);
      navigate("/login");
    }
  };

  const renderPage = () => {
    if (view === "profile") return <ViewProfile onBack={() => setView(null)} />;
    if (view === "edit-profile") return <EditProfile onBack={() => setView(null)} />;
    if (view === "income") return <MonthlyIncome onBack={() => setView(null)} />;
    if (view === "reviews") return <TeachingReviews onBack={() => setView(null)} />;
    switch (activeNav) {
      case "dashboard":   return <DashboardHome setView={setView} go={go} />;
      case "courses":     return <MyCourses />;
      case "upload":      return <UploadContent />;
      case "quiz":        return <QuizManager />;
      case "performance": return <StudentPerformance />;
      case "analysis":    return <CourseAnalysis />;
      case "feedback":    return <Feedback />;
      case "transactions":return <Transactions />;
      default:            return <DashboardHome setView={setView} go={go} />;
    }
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
            <span className="ca-ava sm">{ADMIN.initials}</span>
            <div>
              <div className="ca-sb-uname">{ADMIN.name}</div>
              <div className="ca-sb-uemail">Course Instructor</div>
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
                {ADMIN.notifications.map((n) => (
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
              <span className="ca-ava">{ADMIN.initials}</span>
            </button>
            {profileOpen && (
              <div className="ca-dropdown profile">
                <div className="ca-dd-user">
                  <span className="ca-ava md">{ADMIN.initials}</span>
                  <div>
                    <div className="ca-dd-name">{ADMIN.name}</div>
                    <div className="ca-dd-email">{ADMIN.email}</div>
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

/* ─────────────────────────────────────────────
   PAGE COMPONENTS
───────────────────────────────────────────── */
function DashboardHome({ setView, go }) {
  const totalStudents = ADMIN.courses.reduce((a, c) => a + c.students, 0);
  const totalRevenue = ADMIN.courses.reduce((a, c) => a + c.revenue, 0);
  const avgRating = (ADMIN.courses.reduce((a, c) => a + c.rating, 0) / ADMIN.courses.length).toFixed(1);

  return (
    <div className="ca-page">
      <div className="ca-page-head">
        <div>
          <h1>Instructor Dashboard <span className="acc">✦</span></h1>
          <p>Welcome back, {ADMIN.name.split(" ")[1]}. Your courses are performing well.</p>
        </div>
        <button className="ca-cta-btn" onClick={() => go("upload")}>+ Upload Content</button>
      </div>

      <div className="ca-stat-row">
        {[
          { icon: "▤", label: "Active Courses", value: ADMIN.courses.filter(c => c.status === "Live").length },
          { icon: "◎", label: "Total Students", value: totalStudents.toLocaleString() },
          { icon: "★", label: "Avg Rating", value: avgRating },
          { icon: "₹", label: "Total Earnings", value: `₹${(totalRevenue/100000).toFixed(1)}L` },
        ].map((s) => (
          <div key={s.label} className="ca-stat-card">
            <span className="ca-stat-ico">{s.icon}</span>
            <span className="ca-stat-val">{s.value}</span>
            <span className="ca-stat-lbl">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Income mini bar chart */}
      <h2 className="ca-sec-title">Revenue – Last 7 Months</h2>
      <div className="ca-income-chart">
        {ADMIN.monthlyIncome.map((m) => {
          const max = Math.max(...ADMIN.monthlyIncome.map((x) => x.amount));
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

      <h2 className="ca-sec-title" style={{ marginTop: 32 }}>Your Courses</h2>
      <div className="ca-course-grid">
        {ADMIN.courses.map((c) => <AdminCourseCard key={c.id} c={c} />)}
      </div>
    </div>
  );
}

function MyCourses() {
  return (
    <div className="ca-page">
      <h1 className="ca-h1">My Courses</h1>
      <div className="ca-course-grid">
        {ADMIN.courses.map((c) => <AdminCourseCard key={c.id} c={c} showActions />)}
      </div>
    </div>
  );
}

function UploadContent() {
  const [tab, setTab] = useState("video");
  return (
    <div className="ca-page">
      <h1 className="ca-h1">Upload Content</h1>
      <div className="ca-tabs">
        {["video", "article", "document"].map((t) => (
          <button key={t} className={`ca-tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
            {t === "video" ? "📹 Video" : t === "article" ? "📝 Article" : "📄 Document"}
          </button>
        ))}
      </div>
      <div className="ca-upload-form">
        <div className="ca-fgroup">
          <label>Select Course</label>
          <select>
            {ADMIN.courses.map((c) => <option key={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="ca-fgroup">
          <label>Content Title</label>
          <input type="text" placeholder={`Enter ${tab} title`} />
        </div>
        <div className="ca-fgroup">
          <label>Description</label>
          <textarea rows={3} placeholder="Brief description of this content..." />
        </div>
        <div className="ca-upload-zone">
          <span className="ca-upload-ico">{tab === "video" ? "📹" : tab === "article" ? "📝" : "📄"}</span>
          <p>Drag & drop or <span className="acc">browse files</span></p>
          <span className="ca-upload-hint">{tab === "video" ? "MP4, MOV – Max 2GB" : "PDF, DOCX – Max 50MB"}</span>
        </div>
        <button className="ca-cta-btn" style={{ marginTop: 16 }}>Upload {tab.charAt(0).toUpperCase() + tab.slice(1)}</button>
      </div>
    </div>
  );
}

function QuizManager() {
  const quizzes = [
    { id: 1, title: "Week 1 – HTML & CSS Basics", course: "Full-Stack Web Dev", questions: 15, submissions: 420, avgScore: 78 },
    { id: 2, title: "Module 3 – REST APIs", course: "Node.js Masterclass", questions: 12, submissions: 300, avgScore: 72 },
    { id: 3, title: "React Hooks Deep Dive", course: "React Advanced Patterns", questions: 20, submissions: 180, avgScore: 85 },
  ];
  return (
    <div className="ca-page">
      <div className="ca-page-head">
        <h1 className="ca-h1" style={{ margin: 0 }}>Quiz Manager</h1>
        <button className="ca-cta-btn">+ New Quiz</button>
      </div>
      <div className="ca-table-wrap">
        <table className="ca-table">
          <thead>
            <tr><th>Quiz Title</th><th>Course</th><th>Questions</th><th>Submissions</th><th>Avg Score</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {quizzes.map((q) => (
              <tr key={q.id}>
                <td className="ca-bold">{q.title}</td>
                <td><span className="ca-tag blue">{q.course}</span></td>
                <td>{q.questions}</td>
                <td>{q.submissions}</td>
                <td><span className={`ca-tag ${q.avgScore >= 80 ? "green" : "orange"}`}>{q.avgScore}%</span></td>
                <td>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="ca-action-btn">Edit</button>
                    <button className="ca-action-btn red">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StudentPerformance() {
  return (
    <div className="ca-page">
      <h1 className="ca-h1">Student Performance</h1>
      <div className="ca-table-wrap">
        <table className="ca-table">
          <thead>
            <tr><th>Student</th><th>Course</th><th>Quiz Score</th><th>Progress</th><th>Status</th></tr>
          </thead>
          <tbody>
            {ADMIN.studentPerformance.map((s, i) => (
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

function CourseAnalysis() {
  return (
    <div className="ca-page">
      <h1 className="ca-h1">Course Analysis</h1>
      <div className="ca-analysis-grid">
        {ADMIN.courses.map((c) => (
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
              <button className="ca-action-btn" style={{ flex: 1 }}>Edit Course</button>
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

function Feedback() {
  return (
    <div className="ca-page">
      <h1 className="ca-h1">Student Feedback</h1>
      <div className="ca-reviews-list">
        {ADMIN.reviews.map((r) => (
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
        ))}
      </div>
    </div>
  );
}

function Transactions() {
  const txns = [
    { id: "TXN-401", date: "Mar 22, 2024", course: "Full-Stack Web Dev Bootcamp", students: 3, amount: "₹14,997", status: "Paid" },
    { id: "TXN-402", date: "Mar 15, 2024", course: "Node.js Masterclass", students: 5, amount: "₹19,995", status: "Paid" },
    { id: "TXN-403", date: "Mar 10, 2024", course: "Full-Stack Web Dev Bootcamp", students: 2, amount: "₹9,998", status: "Pending" },
  ];
  return (
    <div className="ca-page">
      <h1 className="ca-h1">Transaction History</h1>
      <div className="ca-table-wrap">
        <table className="ca-table">
          <thead>
            <tr><th>ID</th><th>Date</th><th>Course</th><th>New Students</th><th>Revenue</th><th>Status</th></tr>
          </thead>
          <tbody>
            {txns.map((t) => (
              <tr key={t.id}>
                <td className="ca-txn-id">{t.id}</td>
                <td>{t.date}</td>
                <td>{t.course}</td>
                <td>{t.students}</td>
                <td className="ca-txn-amt">{t.amount}</td>
                <td><span className={`ca-tag ${t.status === "Paid" ? "green" : "orange"}`}>{t.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Profile Views ─── */
function ViewProfile({ onBack }) {
  return (
    <div className="ca-page">
      <button className="ca-back" onClick={onBack}>← Back to Dashboard</button>
      <div className="ca-vp-banner">
        <div className="ca-vp-grad" />
        <div className="ca-vp-ava-wrap">
          <div className="ca-vp-ava">{ADMIN.initials}</div>
          <span className="ca-vp-role-tag">Course Instructor</span>
        </div>
      </div>
      <div className="ca-vp-body">
        <div>
          <h1 className="ca-vp-name">{ADMIN.name}</h1>
          <p className="ca-vp-bio">{ADMIN.bio}</p>
          <div className="ca-vp-meta">
            <span>📍 {ADMIN.location}</span>
            <span>📅 Joined {ADMIN.joinDate}</span>
            <span>✉ {ADMIN.email}</span>
          </div>
        </div>
      </div>
      <div className="ca-vp-stats">
        {[
          { val: ADMIN.courses.length, lbl: "Courses Created" },
          { val: ADMIN.courses.reduce((a, c) => a + c.students, 0).toLocaleString(), lbl: "Total Students" },
          { val: (ADMIN.courses.reduce((a, c) => a + c.rating, 0) / ADMIN.courses.length).toFixed(1), lbl: "Avg Rating" },
          { val: `₹${(ADMIN.courses.reduce((a, c) => a + c.revenue, 0) / 100000).toFixed(1)}L`, lbl: "Total Revenue" },
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

function MonthlyIncome({ onBack }) {
  const max = Math.max(...ADMIN.monthlyIncome.map((m) => m.amount));
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
        {ADMIN.monthlyIncome.map((m) => {
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
      {ADMIN.courses.map((c) => (
        <div className="ca-prog-card" key={c.id}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <p className="ca-bold" style={{ margin: 0 }}>{c.name}</p>
            <span className="ca-txn-amt">₹{(c.revenue / 1000).toFixed(0)}k</span>
          </div>
          <div className="ca-pbar" style={{ height: 8 }}>
            <div className="ca-pbar-fill" style={{ width: (c.revenue / ADMIN.courses.reduce((a, x) => a + x.revenue, 0)) * 100 + "%", background: c.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function TeachingReviews({ onBack }) {
  const avgRating = (ADMIN.reviews.reduce((a, r) => a + r.rating, 0) / ADMIN.reviews.length).toFixed(1);
  return (
    <div className="ca-page">
      <button className="ca-back" onClick={onBack}>← Back</button>
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
        <div className="ca-big-rating">
          <span className="ca-big-rating-num">{avgRating}</span>
          <div className="ca-stars" style={{ fontSize: 18 }}>{"★".repeat(Math.round(avgRating))}</div>
          <span style={{ fontSize: 12, color: "#666" }}>{ADMIN.reviews.length} reviews</span>
        </div>
        <div style={{ flex: 1 }}>
          {[5, 4, 3, 2, 1].map((r) => {
            const count = ADMIN.reviews.filter((x) => x.rating === r).length;
            const pct = (count / ADMIN.reviews.length) * 100;
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
        {ADMIN.reviews.map((r) => (
          <div className="ca-review-card" key={r.id}>
            <div className="ca-review-top">
              <div className="ca-reviewer-ava">{r.student[0]}</div>
              <div><p className="ca-bold">{r.student}</p><span style={{ fontSize: 12, color: "#666" }}>{r.course} · {r.date}</span></div>
              <div className="ca-stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
            </div>
            <p className="ca-review-text">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function EditProfile({ onBack }) {
  return (
    <div className="ca-page">
      <button className="ca-back" onClick={onBack}>← Back</button>
      <h1 className="ca-h1">Edit Profile</h1>
      <div className="ca-edit-wrap">
        <div className="ca-edit-ava-col">
          <div className="ca-vp-ava" style={{ margin: "0 auto" }}>{ADMIN.initials}</div>
          <button className="ca-upload-photo-btn">Change Photo</button>
        </div>
        <div className="ca-edit-form">
          <div className="ca-form-grid">
            {[
              { label: "Full Name", value: ADMIN.name },
              { label: "Email", value: ADMIN.email },
              { label: "Phone", value: ADMIN.phone },
              { label: "Location", value: ADMIN.location },
            ].map((f) => (
              <div className="ca-fgroup" key={f.label}>
                <label>{f.label}</label>
                <input type="text" defaultValue={f.value} />
              </div>
            ))}
          </div>
          <div className="ca-fgroup">
            <label>Bio</label>
            <textarea defaultValue={ADMIN.bio} rows={4} />
          </div>
          <div className="ca-form-actions">
            <button className="ca-btn-cancel" onClick={onBack}>Cancel</button>
            <button className="ca-btn-save">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Admin Course Card ─── */
function AdminCourseCard({ c, showActions }) {
  return (
    <div className="ca-ccard">
      <div className="ca-ccard-thumb" style={{ background: `linear-gradient(135deg, ${c.color}33, ${c.color}11)` }}>
        <span style={{ fontSize: 36 }}>📖</span>
        <span className={`ca-ccard-status ${c.status === "Live" ? "green" : "orange"}`}>{c.status}</span>
      </div>
      <div className="ca-ccard-body">
        <p className="ca-ccard-name">{c.name}</p>
        <div className="ca-ccard-stats">
          <span>👥 {c.students.toLocaleString()}</span>
          <span>⭐ {c.rating}</span>
          <span>₹{(c.revenue / 1000).toFixed(0)}k</span>
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

function AdminProgCard({ c }) {
  return (
    <div className="ca-prog-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <p className="ca-bold" style={{ margin: 0 }}>{c.name}</p>
        <span className="ca-txn-amt">₹{(c.revenue / 1000).toFixed(0)}k</span>
      </div>
      <div className="ca-pbar">
        <div className="ca-pbar-fill" style={{ width: Math.min((c.students / 1500) * 100, 100) + "%", background: c.color }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12, color: "#666" }}>
        <span>{c.students} students</span>
        <span>⭐ {c.rating}</span>
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
.ca-dd-item { display:block; width:100%; padding:11px 16px; background:none; border:none; color:#aaa; font-family:inherit; font-size:13.5px; text-align:left; cursor:pointer; transition:all .15s; }
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
.ca-bar-col { display:flex; flex-direction:column; align-items:center; flex:1; height:100%; gap:6px; }
.ca-bar-val { font-size:10px; color:#888; }
.ca-bar-wrap { flex:1; width:100%; background:#ffffff08; border-radius:6px; overflow:hidden; display:flex; align-items:flex-end; }
.ca-bar-fill { width:100%; background:linear-gradient(to top,#f97316,#fb923c); border-radius:6px 6px 0 0; transition:height .5s ease; }
.ca-bar-lbl { font-size:11px; color:#666; }

.ca-course-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:20px; }
.ca-ccard { background:#161626; border:1px solid #ffffff08; border-radius:16px; overflow:hidden; transition:transform .2s; }
.ca-ccard:hover { transform:translateY(-3px); }
.ca-ccard-thumb { height:130px; display:flex; align-items:center; justify-content:center; position:relative; }
.ca-ccard-status { position:absolute; top:10px; right:10px; font-size:11px; font-weight:600; padding:3px 10px; border-radius:20px; }
.ca-ccard-body { padding:16px; }
.ca-ccard-name { font-size:14px; font-weight:600; margin:0 0 10px; line-height:1.4; }
.ca-ccard-stats { display:flex; gap:14px; font-size:12px; color:#888; }
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
.ca-action-btn:hover { background:#ffffff08; color:#fff; }
.ca-action-btn.red { border-color:#ff5f5f33; color:#ff5f5f; }
.ca-action-btn.red:hover { background:#ff5f5f11; }

.ca-tabs { display:flex; gap:8px; margin-bottom:20px; }
.ca-tab { background:none; border:1px solid #ffffff10; color:#888; font-family:inherit; font-size:13px; padding:8px 18px; border-radius:20px; cursor:pointer; transition:all .2s; }
.ca-tab.active { background:#f9731622; border-color:#f97316; color:#f97316; font-weight:600; }
.ca-upload-form { max-width:600px; display:flex; flex-direction:column; gap:16px; }
.ca-fgroup { display:flex; flex-direction:column; gap:6px; }
.ca-fgroup label { font-size:12px; color:#888; font-weight:500; }
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
.ca-review-card { background:#161626; border:1px solid #ffffff08; border-radius:14px; padding:20px; }
.ca-review-top { display:flex; align-items:center; gap:12px; margin-bottom:12px; }
.ca-reviewer-ava { width:38px; height:38px; border-radius:50%; background:linear-gradient(135deg,#5468ff,#8b5cf6); color:#fff; font-weight:700; display:flex; align-items:center; justify-content:center; font-size:15px; }
.ca-stars { color:#f59e0b; font-size:14px; margin-left:auto; }
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
.ca-notif-dot, .ca-stars, .ca-big-rating-num, .ca-txn-id { color:var(--accent); background-color:var(--accent); }
.ca-notif-dot { background:var(--accent); }
.ca-tag.green { background:rgba(112,171,93,0.16); color:var(--accent); }
.ca-tag.orange, .ca-tag.blue { background:rgba(31,92,16,0.1); color:var(--accent); }
.ca-vp-banner { background:linear-gradient(155deg, #b7d28d 0%, #dce9c6 100%); }
.ca-vp-grad { background:linear-gradient(135deg, rgba(31,92,16,0.1), rgba(126,181,107,0.18)); }
`;
