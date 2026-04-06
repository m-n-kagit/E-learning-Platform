import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import  CourseCard from "../components/CourseCard"; 
import  Certificates  from "../components/Certificates";
import  MyCourses  from "../components/MyCourses";
import CoursesAvailable from "../components/CoursesAvailable";
import axios from "axios";
import { useDispatch,useSelector } from "react-redux";
import { setStudent, updateStudent } from "../features/student_detailsSlice";
/* ─────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────── */
const STUDENT = {
  name: "Mohit Sharma",
  email: "mohit.sharma@email.com",
  initials: "AS",
  joinDate: "January 2024",
  rank: 247,
  totalStudents: 52000,
  bio: "Passionate about web development and AI. Currently building full-stack projects and exploring machine learning.",
  location: "Jaipur, Rajasthan",
  website: "arjunsharma.dev",
  phone: "+91 98765 43210",
  courses: [
    { id: 1, name: "Full-Stack Web Dev Bootcamp", progress: 72, instructor: "John Smith", category: "Development", color: "#5468ff", completed: 36, total: 50, hoursSpent: 18 },
    { id: 2, name: "Machine Learning Fundamentals", progress: 35, instructor: "Dr. Sarah Lee", category: "AI & ML", color: "#ff6b5b", completed: 14, total: 40, hoursSpent: 12 },
    { id: 3, name: "UI/UX Design Mastery", progress: 90, instructor: "Alex Johnson", category: "Design", color: "#3ecf8e", completed: 27, total: 30, hoursSpent: 17 },
  ],
  transactions: [
    { id: "TXN-001", date: "Mar 15, 2024", course: "Full-Stack Web Dev Bootcamp", amount: "₹4,999", status: "Success" },
    { id: "TXN-002", date: "Feb 20, 2024", course: "Machine Learning Fundamentals", amount: "₹3,999", status: "Success" },
    { id: "TXN-003", date: "Jan 10, 2024", course: "UI/UX Design Mastery", amount: "₹2,999", status: "Refunded" },
  ],
  notifications: [
    { id: 1, text: "New lecture added to Full-Stack Web Dev Bootcamp", time: "2h ago", read: false },
    { id: 2, text: "Your quiz was graded: 92/100", time: "1d ago", read: false },
    { id: 3, text: "Certificate ready for UI/UX Design Mastery", time: "3d ago", read: true },
    { id: 4, text: "Weekly learning streak: 7 days!", time: "5d ago", read: true },
  ],
};

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "◻" },
  { id: "courses-available", label: "Courses Available", icon: "◦" },
  { id: "my-courses", label: "My Courses", icon: "▤" },
  { id: "progress", label: "My Progress", icon: "◎" },
  { id: "certificates", label: "Certificates", icon: "◈" },
  { id: "transactions", label: "Transactions", icon: "◳" },
];

/* ─────────────────────────────────────────────
   ROOT COMPONENT
───────────────────────────────────────────── */
export default function StudentDashboard() {
  const navigate = useNavigate();
  // const [student , setStudent_detail] = useState(null); //no requirement of 
  // local state as we are using redux to manage the student data
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [view, setView] = useState(null);
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.studentDetails.student);

  
  const getStudentData = async () => {
    try { 
      const response = await axios.get("/api/auth/me", { withCredentials: true });
      const studentData = response?.data?.data;
      if (studentData) {
        dispatch(setStudent(studentData)); // Update Redux store with student data
      }
    } catch (error) {
      console.error("Failed to fetch student data:", error);
    }
  };


  useEffect(() => {
    const el = document.createElement("style");
    el.id = "sd-styles";
    el.textContent = STYLES;
    document.head.appendChild(el);
    return () => document.getElementById("sd-styles")?.remove();
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
    getStudentData();
  }, []);

  const go = (id) => { setActiveNav(id); setView(null); setSidebarOpen(false); };
  const unread = STUDENT.notifications.filter((n) => !n.read).length;

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
    switch (activeNav) {
      case "dashboard":    return <DashboardHome setView={setView} go={go} />;
      case "courses-available": return <CoursesAvailable />;
      case "my-courses":   return <MyCourses />;
      case "progress":     return <MyProgress />;
      case "certificates": return <Certificates />;
      case "transactions": return <Transactions />;
      default:             return <DashboardHome setView={setView} go={go} />;
    }
  };


  

  return (
    <div className="sd">
      {sidebarOpen && <div className="sd-overlay" onClick={() => setSidebarOpen(false)} />}

      {/*SIDEBAR */}
      <aside className={`sd-sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="sd-sb-head">
          <span className="sd-logo">Learn<em>Sphere</em></span>
          <button className="sd-x" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>
        <div className="sd-sb-role">Student Portal</div>
        <nav className="sd-nav">
          {NAV_ITEMS.map((n) => (
            <button key={n.id} className={`sd-nav-item${activeNav === n.id && !view ? " active" : ""}`} onClick={() => go(n.id)}>
              <span className="sd-nav-icon">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>
        <div className="sd-sb-footer">
          <div className="sd-sb-user">
            <span className="sd-ava sm">{STUDENT.initials}</span>
            <div>
              <div className="sd-sb-uname">{STUDENT.name}</div>
              <div className="sd-sb-uemail">{STUDENT.email}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── TOPBAR ── */}
      <header className="sd-topbar">
        <button className="sd-burger" onClick={() => setSidebarOpen(true)}>
          <span /><span /><span />
        </button>
        <span className="sd-topbar-logo">Learn<em>Sphere</em></span>

        <div className="sd-topbar-right">
          {/* Notifications */}
          <div ref={notifRef} className="sd-notif-wrap">
            <button className="sd-icon-btn" onClick={() => setNotifOpen((v) => !v)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {unread > 0 && <span className="sd-badge">{unread}</span>}
            </button>
            {notifOpen && (
              <div className="sd-dropdown notif">
                <div className="sd-dd-title">Notifications <span className="sd-dd-count">{unread} new</span></div>
                {STUDENT.notifications.map((n) => (
                  <div key={n.id} className={`sd-notif-row${!n.read ? " unread" : ""}`}>
                    <div className="sd-notif-dot" />
                    <div>
                      <p>{n.text}</p>
                      <span>{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Profile */}
          <div ref={profileRef} className="sd-profile-wrap">
            <button className="sd-ava-btn" onClick={() => setProfileOpen((v) => !v)}>
              <span className="sd-ava">{STUDENT.initials}</span>
            </button>
            {profileOpen && (
              <div className="sd-dropdown profile">
                <div className="sd-dd-user">
                  <span className="sd-ava md">{STUDENT.initials}</span>
                  <div>
                    <div className="sd-dd-name">{STUDENT.name}</div>
                    <div className="sd-dd-email">{STUDENT.email}</div>
                  </div>
                </div>
                <div className="sd-dd-divider" />
                {[
                  { label: "My Courses", fn: () => { go("my-courses"); setProfileOpen(false); } },
                  { label: "View Profile", fn: () => { setView("profile"); setProfileOpen(false); } },
                  { label: "Transaction History", fn: () => { go("transactions"); setProfileOpen(false); } },
                  { label: "Edit Profile", fn: () => { setView("edit-profile"); setProfileOpen(false); } },
                ].map((item) => (
                  <button key={item.label} className="sd-dd-item" onClick={item.fn}>{item.label}</button>
                ))}
                <div className="sd-dd-divider" />
                <button className="sd-dd-item danger" onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="sd-main">{renderPage()}</main>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE COMPONENTS
───────────────────────────────────────────── */
function DashboardHome({ setView, go }) {
  return (
    <div className="sd-page">
      <div className="sd-page-head">
        <div>
          <h1>Welcome back, <span className="acc">Mohit</span> </h1>
          <p>Continue your learning journey. You're on a 7-day streak!</p>
        </div>
      </div>

      <div className="sd-stat-row">
        {[
          { icon: "▤", label: "Enrolled", value: "3 Courses" },
          { icon: "⏱", label: "Learned", value: "47 Hours" },
          { icon: "🏅", label: "Global Rank", value: `#${STUDENT.rank}` },
          { icon: "◈", label: "Certificates", value: "1 Earned" },
        ].map((s) => (
          <div key={s.label} className="sd-stat-card">
            <span className="sd-stat-ico">{s.icon}</span>
            <span className="sd-stat-val">{s.value}</span>
            <span className="sd-stat-lbl">{s.label}</span>
          </div>
        ))}
      </div>

      <h2 className="sd-sec-title">Continue Learning</h2>
      <div className="sd-course-grid">
        <MyCourses />
      </div>
    </div>
  );
}



function MyProgress() {
  return (
    <div className="sd-page">
      <h1 className="sd-h1">My Progress</h1>
      <div className="sd-progress-list">
        {user.progress.map((c) => (
          <div className="sd-prog-card" key={c.id}>
            <div className="sd-prog-top">
              <div className="sd-prog-icon" style={{ background: c.color + "22" }}>📖</div>
              <div className="sd-prog-info">
                <p className="sd-prog-name">{c.name}</p>
                <span className="sd-prog-inst">{c.instructor} · {c.category}</span>
              </div>
              <span className="sd-prog-pct" style={{ background: c.color + "22", color: c.color }}>{c.progress}%</span>
            </div>
            <div className="sd-pbar">
              <div className="sd-pbar-fill" style={{ width: c.progress + "%", background: c.color }} />
            </div>
            <div className="sd-prog-foot">
              <span>{c.completed} / {c.total} lessons</span>
              <span>{c.hoursSpent}h spent</span>
              {c.progress >= 100 && <span className="sd-tag green">✓ Completed</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



function Transactions() {
  return (
    <div className="sd-page">
      <h1 className="sd-h1">Transaction History</h1>
      <div className="sd-table-wrap">
        <table className="sd-table">
          <thead>
            <tr><th>Transaction ID</th><th>Date</th><th>Course</th><th>Amount</th><th>Status</th></tr>
          </thead>
          <tbody>
            {user.transactions.map((t) => (
              <tr key={t.id}>
                <td className="sd-txn-id">{t.id}</td>
                <td>{t.date}</td>
                <td>{t.course}</td>
                <td className="sd-txn-amt">{t.amount}</td>
                <td><span className={`sd-tag ${t.status === "Success" ? "green" : "red"}`}>{t.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Udemy-style View Profile ─── */
function ViewProfile({ onBack }) {
  const user = useSelector((state) => state.studentDetails.student);
  const course = useSelector((state) => state.activeCourses.student);

  const rank = Number(user?.rank ?? 0);
  const totalStudents = Number(course?.enrolledStudents.length ?? 0);
  const topPercent = totalStudents > 0 ? Math.round((rank / totalStudents) * 100) : 0;
  
  return (
    <div className="sd-page">
      <button className="sd-back" onClick={onBack}>← Back to Dashboard</button>

      {/* Banner + Avatar */}
      <div className="sd-vp-banner">
        <div className="sd-vp-gradient" />
        <div className="sd-vp-ava-wrap">
          <div className="sd-vp-ava">{user.initials}</div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="sd-vp-body">
        <div className="sd-vp-left">
          <h1 className="sd-vp-name">{user.name}</h1>
          <p className="sd-vp-bio">{user.bio}</p>
          <div className="sd-vp-meta">
            <span>📍 {user.location}</span>
            <span>🌐 {user.website}</span>
            <span>📅 Joined {user.joinDate}</span>
          </div>
        </div>
        <div className="sd-rank-card">
          <span className="sd-rank-ico">🏅</span>
          <span className="sd-rank-num">#{user.rank}</span>
          <span className="sd-rank-lbl">Global Rank</span>
          <span className="sd-rank-sub">Top {topPercent}% of all students</span>
        </div>
      </div>

      {/* Stats strip */}
      <div className="sd-vp-stats">
        {[
          { val: user.enrolledCourses.length, lbl: "Courses Enrolled" },
          { val: user.certificates.length, lbl: "Certificates Earned" },
          { val: `Top ${topPercent}%`, lbl: "Percentile Rank" },
        ].map((s) => (
          <div className="sd-vp-stat" key={s.lbl}>
            <span className="sd-vp-stat-val">{s.val}</span>
            <span className="sd-vp-stat-lbl">{s.lbl}</span>
          </div>
        ))}
      </div>

      {/* Course Progress */}
      <h2 className="sd-sec-title" style={{ marginTop: 32 }}>Course Progress</h2>
      <div className="sd-progress-list">
        {user.enrolledCourses.map((c) => (
          <div className="sd-prog-card" key={c.id}>
            <div className="sd-prog-top">
              <div className="sd-prog-icon" style={{ background: c.color + "22", fontSize: 22 }}>📖</div>
              <div className="sd-prog-info">
                <p className="sd-prog-name">{c.name}</p>
                <span className="sd-prog-inst">{c.instructor} · {c.category}</span>
              </div>
              <span className="sd-prog-pct" style={{ background: c.color + "22", color: c.color, border: `1px solid ${c.color}44` }}>{c.progress}%</span>
            </div>
            <div className="sd-pbar">
              <div className="sd-pbar-fill" style={{ width: c.progress + "%", background: c.color }} />
            </div>
            <div className="sd-prog-foot">
              <span>{c.completed} of {c.total} lessons done</span>
              <span>{c.hoursSpent} hours spent</span>
              {c.progress >= 90 && <span className="sd-tag green">✓ Certificate Earned</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EditProfile({ onBack }) {
  const user = useSelector((state) => state.studentDetails.student);
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    bio: "",
  });

  useEffect(() => {
    setForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      location: user?.location || "",
      website: user?.website || "",
      bio: user?.bio || "",
    });
  }, [user]);

  const initials = String(form.name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "S";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    dispatch(updateStudent(form));
    onBack();
  };

  return (
    <div className="sd-page">
      <button className="sd-back" onClick={onBack}>Back</button>
      <h1 className="sd-h1">Edit Profile</h1>
      <div className="sd-edit-wrap">
        <div className="sd-edit-ava-col">
          <div className="sd-vp-ava" style={{ margin: "0 auto" }}>{initials}</div>
          <button className="sd-upload-btn">Change Photo</button>
          <p className="sd-edit-hint">JPG, PNG or GIF - Max 2MB</p>
        </div>
        <form className="sd-edit-form" onSubmit={handleSave}>
          <div className="sd-form-grid">
            {[
              { label: "Full Name", key: "name", type: "text" },
              { label: "Email Address", key: "email", type: "email" },
              { label: "Phone", key: "phone", type: "tel" },
              { label: "Location", key: "location", type: "text" },
              { label: "Website", key: "website", type: "text" },
            ].map((f) => (
              <div className="sd-fgroup" key={f.label}>
                <label>{f.label}</label>
                <input
                  type={f.type}
                  name={f.key}
                  value={form[f.key]}
                  onChange={handleChange}
                />
              </div>
            ))}
          </div>
          <div className="sd-fgroup">
            <label>Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={4}
            />
          </div>
          <div className="sd-form-actions">
            <button type="button" className="sd-btn-cancel" onClick={onBack}>Cancel</button>
            <button type="submit" className="sd-btn-save" onClick = {() => alert("Changes saved!")}>Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}
/* Shared Card */


/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

.sd { display:flex; flex-direction:column; min-height:100vh; background:#0b0b18; color:#e2e2f0; font-family:'Sora',sans-serif; }

/* SIDEBAR */
.sd-sidebar { position:fixed; top:0; left:0; height:100vh; width:260px; background:#10101f; border-right:1px solid #ffffff0f; z-index:200; transform:translateX(-100%); transition:transform .3s cubic-bezier(.4,0,.2,1); display:flex; flex-direction:column; }
.sd-sidebar.open { transform:translateX(0); }
.sd-overlay { position:fixed; inset:0; background:#00000080; z-index:199; backdrop-filter:blur(2px); }
.sd-sb-head { display:flex; align-items:center; justify-content:space-between; padding:20px 20px 16px; border-bottom:1px solid #ffffff0a; }
.sd-logo { font-size:20px; font-weight:700; color:#fff; letter-spacing:-0.5px; }
.sd-logo em { color:#5468ff; font-style:normal; }
.sd-x { background:none; border:none; color:#888; font-size:16px; cursor:pointer; padding:4px; }
.sd-sb-role { font-size:10px; letter-spacing:2px; color:#5468ff; text-transform:uppercase; padding:12px 20px 8px; font-weight:600; }
.sd-nav { display:flex; flex-direction:column; gap:2px; padding:0 12px; flex:1; }
.sd-nav-item { display:flex; align-items:center; gap:12px; padding:11px 14px; border:none; background:none; color:#8888aa; border-radius:10px; font-family:inherit; font-size:14px; cursor:pointer; text-align:left; transition:all .2s; }
.sd-nav-item:hover { background:#ffffff08; color:#e2e2f0; }
.sd-nav-item.active { background:#5468ff18; color:#5468ff; font-weight:600; }
.sd-nav-icon { font-size:16px; width:20px; text-align:center; }
.sd-sb-footer { padding:16px; border-top:1px solid #ffffff0a; }
.sd-sb-user { display:flex; align-items:center; gap:10px; }
.sd-sb-uname { font-size:13px; font-weight:600; color:#e2e2f0; }
.sd-sb-uemail { font-size:11px; color:#666; }

/* TOPBAR */
.sd-topbar { position:sticky; top:0; z-index:100; height:60px; background:#10101fcc; backdrop-filter:blur(12px); border-bottom:1px solid #ffffff; display:flex; align-items:center; padding:0 20px; gap:12px; }
.sd-burger { background:none; border:none; cursor:pointer; display:flex; flex-direction:column; gap:5px; padding:6px; }
.sd-burger span { display:block; width:22px; height:2px; background:#e2e2f0; border-radius:2px; }
.sd-topbar-logo { font-size:18px; font-weight:700; color:#fff; letter-spacing:-0.5px; flex:1; }
.sd-topbar-logo em { color:#5468ff; font-style:normal; }
.sd-topbar-right { display:flex; align-items:center; gap:8px; }

/* ICON BUTTONS */
.sd-icon-btn { position:relative; background:none; border:1px solid #ffffff10; color:#aaa; padding:8px; border-radius:10px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .2s; }
.sd-icon-btn:hover { background:#ffffff08; color:#e2e2f0; }
.sd-badge { position:absolute; top:-5px; right:-5px; background:#ff4f4f; color:#fff; font-size:10px; font-weight:700; width:18px; height:18px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #10101f; }

/* AVATAR */
.sd-ava { display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#5468ff,#8b5cf6); color:#fff; font-weight:700; font-size:13px; border-radius:50%; }
.sd-ava.sm { width:34px; height:34px; font-size:12px; }
.sd-ava.md { width:38px; height:38px; font-size:14px; }
.sd-ava-btn { background:none; border:none; cursor:pointer; padding:0; }
.sd-ava-btn .sd-ava { width:36px; height:36px; }
.sd-notif-wrap, .sd-profile-wrap { position:relative; }

/* DROPDOWNS */
.sd-dropdown { position:absolute; right:0; top:calc(100% + 10px); background:#16162a; border:1px solid #ffffff10; border-radius:14px; min-width:220px; z-index:300; box-shadow:0 20px 60px #00000080; overflow:hidden; animation:sd-pop .15s ease; }
.sd-dropdown.notif { min-width:300px; }
@keyframes sd-pop { from { opacity:0; transform:translateY(-8px) scale(.97); } to { opacity:1; transform:translateY(0) scale(1); } }
.sd-dd-title { padding:14px 16px 10px; font-size:13px; font-weight:700; color:#e2e2f0; border-bottom:1px solid #ffffff; display:flex; align-items:center; justify-content:space-between; }
.sd-dd-count { font-size:11px; font-weight:500; background:#5468ff22; color:#5468ff; padding:2px 8px; border-radius:20px; }
.sd-notif-row { display:flex; gap:10px; align-items:flex-start; padding:12px 14px; border-bottom:1px solid #ffffff; transition:background .15s; }
.sd-notif-row:hover { background:#ffffff05; }
.sd-notif-row.unread { background:#5468ff08; }
.sd-notif-dot { width:8px; height:8px; border-radius:50%; background:#5468ff; margin-top:4px; flex-shrink:0; }
.sd-notif-row:not(.unread) .sd-notif-dot { background:#ffffff20; }
.sd-notif-row p { font-size:12.5px; color:#ccc; margin:0 0 3px; line-height:1.4; }
.sd-notif-row span { font-size:11px; color:#555; }
.sd-dd-user { display:flex; align-items:center; gap:12px; padding:14px 16px; }
.sd-dd-name { font-size:13px; font-weight:600; color:#e2e2f0; }
.sd-dd-email { font-size:11px; color:#666; }
.sd-dd-divider { height:1px; background:#ffffff0a; }
.sd-dd-item { display:block; width:100%; padding:11px 16px; background:none; border:none; color:#000000; font-family:inherit; font-size:13.5px; text-align:left; cursor:pointer; transition:all .15s; }
.sd-dd-item:hover { background:#ffffff; color:#000000; }
.sd-dd-item.danger { color:#ff5f5f; }
.sd-dd-item.danger:hover { background:#ff5f5f11; }

/* MAIN */
.sd-main { flex:1; overflow-y:auto; }
.sd-page { max-width:1100px; margin:0 auto; padding:32px 24px; }
.sd-page-head { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:28px; flex-wrap:wrap; gap:16px; }
.sd-page-head h1 { font-size:24px; font-weight:700; margin:0 0 4px; }
.sd-page-head p { font-size:14px; color:#666; margin:0; }
.acc { color:#5468ff; }
.sd-cta-btn { background:#5468ff; color:#fff; border:none; padding:10px 20px; border-radius:10px; font-family:inherit; font-size:13px; font-weight:600; cursor:pointer; white-space:nowrap; transition:opacity .2s; }
.sd-cta-btn:hover { opacity:.85; }
.sd-h1 { font-size:22px; font-weight:700; margin:0 0 24px; display:flex; align-items:center; gap:10px; }
.sd-count { background:#5468ff22; color:#5468ff; font-size:14px; padding:2px 10px; border-radius:20px; }

/* STATS */
.sd-stat-row { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:16px; margin-bottom:36px; }
.sd-stat-card { background:#13132a; border:1px solid #ffffff08; border-radius:14px; padding:20px 18px; display:flex; flex-direction:column; gap:6px; transition:border-color .2s; }
.sd-stat-card:hover { border-color:#5468ff33; }
.sd-stat-ico { font-size:20px; }
.sd-stat-val { font-size:22px; font-weight:700; color:#0c3b0f; }
.sd-stat-lbl { font-size:12px; color:#666; }

/* COURSE GRID */
.sd-course-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:20px; }
.sd-ccard { background:#13132a; border:1px solid #ffffff08; border-radius:16px; overflow:hidden; transition:transform .2s,border-color .2s; }
.sd-ccard:hover { transform:translateY(-3px); border-color:#5468ff33; }
.sd-ccard-thumb { height:140px; display:flex; align-items:center; justify-content:center; position:relative; }
.sd-ccard-cat { position:absolute; top:10px; left:10px; font-size:11px; font-weight:600; padding:3px 10px; border-radius:20px; color:#fff; }
.sd-ccard-body { padding:16px; }
.sd-ccard-name { font-size:14px; font-weight:600; color:#e2e2f0; margin:0 0 4px; line-height:1.4; }
.sd-ccard-inst { font-size:12px; color:#666; }
.sd-ccard-foot { display:flex; align-items:center; justify-content:space-between; margin-top:4px; }
.sd-cont-btn { font-size:12px; font-family:inherit; background:none; border:1px solid; padding:5px 12px; border-radius:8px; cursor:pointer; transition:all .2s; }
.sd-cont-btn:hover { opacity:.75; }

/* COURSES AVAILABLE */
.sd-avail-search-wrap { max-width:760px; margin:0 auto 18px; display:flex; align-items:center; gap:10px; }
.sd-avail-input { flex:1; min-width:160px; background:var(--card); border:1px solid var(--border-med); color:var(--text-primary); font-family:inherit; font-size:13.5px; padding:10px 14px; border-radius:10px; outline:none; }
.sd-avail-input::placeholder { color:var(--text-secondary); }
.sd-avail-input:focus { border-color:var(--header); box-shadow:0 0 0 2px rgba(126,181,107,0.22); }
.sd-avail-search-btn, .sd-avail-filter-btn { border:1px solid rgba(0,0,0,0.12); background:var(--header); color:#fff; font-family:inherit; border-radius:10px; cursor:pointer; transition:opacity .2s, transform .2s; }
.sd-avail-search-btn { padding:10px 16px; font-size:13px; font-weight:600; }
.sd-avail-filter-btn { width:40px; height:40px; display:grid; place-items:center; background:var(--header); }
.sd-avail-search-btn:hover, .sd-avail-filter-btn:hover { opacity:.95; transform:translateY(-1px); }
.sd-avail-filters { max-width:760px; margin:0 auto 20px; display:flex; gap:10px; }
.sd-avail-select { flex:1; min-width:150px; background:var(--card); border:1px solid var(--border-med); color:var(--text-primary); font-family:inherit; font-size:13px; border-radius:10px; padding:10px 12px; outline:none; }
.sd-avail-select:focus { border-color:var(--header); box-shadow:0 0 0 2px rgba(126,181,107,0.2); }
.sd-avail-results { margin-top:8px; }
.sd-avail-empty { color:#666; margin:12px 0 18px; font-size:13px; text-align:center; }
.sd-avail-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:20px; }
.sd-avail-card { background:var(--card); border:1px solid var(--border-med); border-radius:16px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.08); transition:transform .2s, background-color .2s, border-color .2s; }
.sd-avail-card:hover { transform:translateY(-3px); background:var(--card-hover); border-color:rgba(0,0,0,0.18); }
.sd-avail-top { position:relative; height:155px; }
.sd-avail-image { width:100%; height:100%; object-fit:cover; display:block; }
.sd-avail-level { position:absolute; right:10px; top:10px; font-size:11px; font-weight:600; padding:4px 10px; border-radius:20px; color:#fff; background:#00000088; }
.sd-avail-cat { margin:14px 16px 8px; color:var(--accent); font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; }
.sd-avail-name { margin:0 16px; font-size:15px; font-weight:700; color:var(--text-primary); line-height:1.4; }
.sd-avail-desc { margin:10px 16px 12px; font-size:12.5px; color:var(--text-secondary); line-height:1.5; min-height:56px; }
.sd-avail-foot { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:0 16px 16px; }
.sd-avail-stu { font-size:12px; color:var(--text-secondary); }
.sd-avail-enroll { font-size:12px; font-family:inherit; background:transparent; border:1px solid rgba(31,92,16,0.35); color:var(--accent); padding:6px 14px; border-radius:8px; cursor:pointer; transition:all .2s; }
.sd-avail-enroll:hover { background:var(--accent-glow); }

/* PROGRESS */
.sd-pbar { background:#ffffff0a; border-radius:4px; height:6px; overflow:hidden; }
.sd-pbar-fill { height:100%; border-radius:4px; transition:width .5s ease; }
.sd-progress-list { display:flex; flex-direction:column; gap:16px; }
.sd-prog-card { background:#13132a; border:1px solid #ffffff08; border-radius:14px; padding:20px; }
.sd-prog-top { display:flex; align-items:center; gap:14px; margin-bottom:14px; }
.sd-prog-icon { width:48px; height:48px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:22px; flex-shrink:0; }
.sd-prog-name { font-size:14.5px; font-weight:600; color:#e2e2f0; margin:0 0 3px; }
.sd-prog-inst { font-size:12px; color:#666; }
.sd-prog-pct { margin-left:auto; font-size:13px; font-weight:700; padding:4px 12px; border-radius:20px; flex-shrink:0; }
.sd-prog-foot { display:flex; gap:16px; margin-top:10px; font-size:12px; color:#666; flex-wrap:wrap; }
.sd-sec-title { font-size:17px; font-weight:700; margin:0 0 16px; color:#e2e2f0; }

/* TAGS */
.sd-tag { font-size:11px; font-weight:600; padding:3px 10px; border-radius:20px; }
.sd-tag.green { background:#3ecf8e22; color:#3ecf8e; }
.sd-tag.red { background:#ff5f5f22; color:#ff5f5f; }

/* TABLE */
.sd-table-wrap { overflow-x:auto; }
.sd-table { width:100%; border-collapse:collapse; font-size:13.5px; }
.sd-table th { padding:12px 16px; text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#555; border-bottom:1px solid #ffffff0a; }
.sd-table td { padding:14px 16px; border-bottom:1px solid #ffffff06; color:#ccc; }
.sd-table tr:hover td { background:#ffffff04; }
.sd-txn-id { font-family:'JetBrains Mono',monospace; font-size:12px; color:#5468ff; }
.sd-txn-amt { font-weight:600; color:#3ecf8e; }

/* VIEW PROFILE */
.sd-back { background:none; border:none; color:#5468ff; font-family:inherit; font-size:13px; cursor:pointer; padding:0; margin-bottom:20px; }
.sd-vp-banner { height:180px; background:linear-gradient(135deg,#1a1a35,#0f0f28); border-radius:16px; position:relative; margin-bottom:60px; overflow:visible; }
.sd-vp-gradient { position:absolute; inset:0; background:linear-gradient(135deg,#5468ff22,#8b5cf622); border-radius:16px; }
.sd-vp-ava-wrap { position:absolute; bottom:-48px; left:28px; }
.sd-vp-ava { width:90px; height:90px; border-radius:50%; background:linear-gradient(135deg,#5468ff,#8b5cf6); color:#fff; font-size:28px; font-weight:800; display:flex; align-items:center; justify-content:center; border:4px solid #0b0b18; }
.sd-vp-body { display:flex; gap:20px; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; margin-bottom:24px; }
.sd-vp-left { flex:1; min-width:260px; }
.sd-vp-name { font-size:24px; font-weight:800; margin:0 0 8px; }
.sd-vp-bio { font-size:14px; color:#888; margin:0 0 12px; line-height:1.6; }
.sd-vp-meta { display:flex; gap:16px; flex-wrap:wrap; }
.sd-vp-meta span { font-size:13px; color:#666; }
.sd-rank-card { background:#13132a; border:1px solid #5468ff33; border-radius:14px; padding:20px 24px; text-align:center; min-width:160px; }
.sd-rank-ico { font-size:32px; display:block; margin-bottom:8px; }
.sd-rank-num { display:block; font-size:28px; font-weight:800; color:#5468ff; }
.sd-rank-lbl { display:block; font-size:13px; color:#888; margin-bottom:4px; }
.sd-rank-sub { display:block; font-size:11px; color:#5468ff99; }
.sd-vp-stats { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:14px; background:#13132a; border:1px solid #ffffff08; border-radius:14px; padding:20px; margin-bottom:8px; }
.sd-vp-stat { text-align:center; }
.sd-vp-stat-val { display:block; font-size:22px; font-weight:800; color:#5468ff; }
.sd-vp-stat-lbl { font-size:12px; color:#666; }

/* CERTIFICATES */
.sd-cert-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:20px; }
.sd-cert-card { background:#13132a; border:1px solid #ffffff08; border-radius:16px; overflow:hidden; }
.sd-cert-card.locked { opacity:.6; }
.sd-cert-banner { height:120px; display:flex; align-items:center; justify-content:center; }
.sd-cert-body { padding:16px; }
.sd-dl-btn { margin-top:12px; font-family:inherit; font-size:12px; background:none; border:1px solid; padding:7px 16px; border-radius:8px; cursor:pointer; transition:opacity .2s; }
.sd-dl-btn:hover { opacity:.7; }

/* EDIT PROFILE */
.sd-edit-wrap { display:flex; gap:32px; flex-wrap:wrap; }
.sd-edit-ava-col { display:flex; flex-direction:column; align-items:center; gap:12px; min-width:150px; }
.sd-upload-btn { background:none; border:1px solid #ffffff20; color:#ccc; font-family:inherit; font-size:12px; padding:8px 16px; border-radius:8px; cursor:pointer; }
.sd-edit-hint { font-size:11px; color:#555; text-align:center; }
.sd-edit-form { flex:1; min-width:280px; }
.sd-form-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:16px; margin-bottom:16px; }
.sd-fgroup { display:flex; flex-direction:column; gap:6px; }
.sd-fgroup label { font-size:12px; color:#888; font-weight:500; }
.sd-fgroup input,.sd-fgroup textarea { background:#1a1a30; border:1px solid #ffffff10; color:#e2e2f0; font-family:inherit; font-size:13.5px; padding:10px 14px; border-radius:10px; outline:none; resize:vertical; transition:border-color .2s; }
.sd-fgroup input:focus,.sd-fgroup textarea:focus { border-color:#5468ff66; }
.sd-form-actions { display:flex; gap:12px; margin-top:24px; justify-content:flex-end; }
.sd-btn-cancel { background:none; border:1px solid #ffffff15; color:#888; font-family:inherit; font-size:13px; padding:10px 20px; border-radius:10px; cursor:pointer; }
.sd-btn-save { background:#5468ff; border:none; color:#fff; font-family:inherit; font-size:13px; font-weight:600; padding:10px 24px; border-radius:10px; cursor:pointer; transition:opacity .2s; }
.sd-btn-save:hover { opacity:.85; }

@media(max-width:600px){
  .sd-page { padding:20px 14px; }
  .sd-stat-row { grid-template-columns:1fr 1fr; }
  .sd-course-grid { grid-template-columns:1fr; }
  .sd-vp-stats { grid-template-columns:1fr 1fr; }
  .sd-avail-search-wrap { flex-wrap:wrap; }
  .sd-avail-search-btn { flex:1; }
  .sd-avail-filter-btn { width:46px; }
  .sd-avail-filters { flex-direction:column; }
}

/* Project theme overrides */
.sd, .sd * { font-family:'Inter',sans-serif; }
.sd { background:var(--bg); color:var(--text-primary); }
.sd-main { background:linear-gradient(155deg, #cfe09c 0%, var(--bg) 70%); }
.sd-sidebar, .sd-topbar { background:var(--header); border-color:rgba(0,0,0,0.12); }
.sd-overlay { background:rgba(0,0,0,0.18); backdrop-filter:blur(1px); }
.sd-logo, .sd-topbar-logo, .sd-sb-uname, .sd-dd-name, .sd-page-head h1, .sd-h1, .sd-sec-title, .sd-prog-name, .sd-vp-name, .sd-ccard-name { color:var(--text-primary); }
.sd-logo em, .sd-topbar-logo em, .sd-sb-role, .sd-nav-item.active, .sd-dd-count, .sd-back, .acc, .sd-count, .sd-rank-num, .sd-vp-stat-val { color:var(--accent); }
.sd-nav-item, .sd-page-head p, .sd-sb-uemail, .sd-dd-email, .sd-prog-inst, .sd-prog-foot, .sd-vp-bio, .sd-vp-meta span, .sd-rank-lbl, .sd-rank-sub, .sd-stat-lbl, .sd-edit-hint { color:var(--text-secondary); }
.sd-nav-item:hover, .sd-dd-item:hover, .sd-icon-btn:hover { background:rgba(255,255,255,0.16); color:#fff; }
.sd-nav-item.active, .sd-notif-row.unread, .sd-dd-count, .sd-count { background:rgba(31,92,16,0.1); border-color:rgba(31,92,16,0.2); }
.sd-icon-btn, .sd-dropdown, .sd-stat-card, .sd-ccard, .sd-prog-card, .sd-vp-stats, .sd-rank-card, .sd-cert-card, .sd-table-wrap, .sd-edit-form, .sd-fgroup input, .sd-fgroup textarea {
  background:var(--card);
  border-color:var(--border-med);
  color:var(--text-primary);
}
.sd-dropdown, .sd-rank-card, .sd-prog-card, .sd-stat-card, .sd-ccard, .sd-cert-card, .sd-vp-stats { box-shadow:0 4px 24px rgba(0,0,0,0.08); }
.sd-dd-title, .sd-txn-amt { color:var(--text-primary); }
.sd-dd-divider, .sd-table th, .sd-table td { border-color:var(--border); }
.sd-table th { color:var(--text-muted); }
.sd-table td, .sd-notif-row p { color:var(--text-secondary); }
.sd-table tr:hover td, .sd-notif-row:hover { background:rgba(255,255,255,0.2); }
.sd-burger span { background:#fff; }
.sd-icon-btn { color:rgba(255,255,255,0.85); border-color:rgba(255,255,255,0.35); }
.sd-badge { border-color:var(--header); }
.sd-ava, .sd-vp-ava { background:linear-gradient(135deg, var(--accent), var(--accent-lt)); }
.sd-cta-btn, .sd-btn-save { background:var(--accent); color:#fff; box-shadow:0 2px 12px rgba(31,92,16,0.25); }
.sd-cta-btn:hover, .sd-btn-save:hover { background:var(--accent-lt); opacity:1; }
.sd-cont-btn, .sd-dl-btn, .sd-upload-btn, .sd-btn-cancel { color:var(--accent); border-color:rgba(31,92,16,0.3); background:transparent; }
.sd-cont-btn:hover, .sd-dl-btn:hover, .sd-upload-btn:hover, .sd-btn-cancel:hover { background:var(--accent-glow); opacity:1; }
.sd-pbar, .sd-pbar-fill { background-color:rgba(0,0,0,0.08); }
.sd-vp-banner { background:linear-gradient(155deg, #b7d28d 0%, #dce9c6 100%); }
.sd-vp-gradient { background:linear-gradient(135deg, rgba(31,92,16,0.1), rgba(126,181,107,0.18)); }
.sd-rank-card { border-color:rgba(31,92,16,0.2); }
.sd-txn-id { color:var(--accent); }
.sd-tag.green { background:rgba(112,171,93,0.16); color:var(--accent); }
.sd-tag.red { background:rgba(186,58,58,0.1); color:#ba3a3a; }
`;

