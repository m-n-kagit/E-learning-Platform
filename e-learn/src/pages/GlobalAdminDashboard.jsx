import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

/* ─────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────── */
const GADMIN = {
  name: "Vikram Nair",
  email: "vikram.nair@learnsphere.com",
  initials: "VN",
  role: "Global Administrator",
  joinDate: "March 2021",
  location: "Mumbai, Maharashtra",
  phone: "+91 98888 77777",
  bio: "Platform architect and global administrator of LearnSphere. Responsible for system integrity, security, and instructor management.",
  notifications: [
    { id: 1, text: "New course admin pending authentication: Dr. Rao", time: "15m ago", read: false },
    { id: 2, text: "Suspicious activity detected on account #4821", time: "1h ago", read: false },
    { id: 3, text: "System memory usage exceeded 85% threshold", time: "3h ago", read: false },
    { id: 4, text: "Security policy update deployed successfully", time: "1d ago", read: true },
    { id: 5, text: "Monthly platform report generated", time: "2d ago", read: true },
  ],
  courseAdmins: [
    { id: 1, name: "Prof. Meera Iyer", email: "meera.iyer@learnsphere.com", courses: 3, students: 2640, status: "Verified", joinDate: "Jun 2022" },
    { id: 2, name: "Dr. Suresh Rao", email: "suresh.rao@learnsphere.com", courses: 0, students: 0, status: "Pending", joinDate: "Mar 2024" },
    { id: 3, name: "Anita Desai", email: "anita.desai@learnsphere.com", courses: 2, students: 1100, status: "Verified", joinDate: "Sep 2023" },
    { id: 4, name: "Ramesh Kapoor", email: "ramesh@learnsphere.com", courses: 1, students: 420, status: "Suspended", joinDate: "Jan 2023" },
  ],
  systemMetrics: [
    { label: "CPU Usage", value: 42, color: "#3ecf8e", unit: "%" },
    { label: "Memory", value: 67, color: "#f59e0b", unit: "%" },
    { label: "Storage", value: 38, color: "#5468ff", unit: "%" },
    { label: "Network I/O", value: 55, color: "#a855f7", unit: "%" },
  ],
  platformStats: {
    totalUsers: 52000,
    totalCourses: 87,
    activeAdmins: 3,
    monthlyRevenue: 620000,
    openIssues: 12,
    resolvedIssues: 148,
  },
  issues: [
    { id: "ISS-041", title: "Payment gateway timeout on checkout", severity: "High", status: "Open", reported: "Mar 25, 2024" },
    { id: "ISS-042", title: "Video player not loading on mobile Safari", severity: "Medium", status: "In Progress", reported: "Mar 22, 2024" },
    { id: "ISS-043", title: "Course search showing incorrect results", severity: "Low", status: "Open", reported: "Mar 20, 2024" },
    { id: "ISS-044", title: "Email verification not being sent for new users", severity: "High", status: "Resolved", reported: "Mar 18, 2024" },
  ],
  suspiciousAccounts: [
    { id: "#4821", name: "user_zxc99", reason: "Multiple failed login attempts (47)", action: "Suspended", date: "Mar 26, 2024" },
    { id: "#3902", name: "promo_bot01", reason: "Automated spam in course reviews", action: "Banned", date: "Mar 24, 2024" },
    { id: "#5511", name: "test_acc44", reason: "Payment fraud attempt", action: "Under Review", date: "Mar 23, 2024" },
  ],
};

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "◻" },
  { id: "authenticate", label: "Authenticate Admins", icon: "◎" },
  { id: "manage-admins", label: "Add/Remove Admins", icon: "◈" },
  { id: "monitor", label: "Monitor System", icon: "⊕" },
  { id: "settings", label: "Platform Settings", icon: "⚙" },
  { id: "suspend", label: "Suspend / Abusers", icon: "⊘" },
  { id: "security", label: "Security Policies", icon: "◳" },
  { id: "issues", label: "View Issues", icon: "✦" },
];

/* ─────────────────────────────────────────────
   ROOT
───────────────────────────────────────────── */
export default function GlobalAdminDashboard() {
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
    el.id = "ga-styles";
    el.textContent = STYLES;
    document.head.appendChild(el);
    return () => document.getElementById("ga-styles")?.remove();
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
  const unread = GADMIN.notifications.filter((n) => !n.read).length;

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("hasSession");
      setProfileOpen(false);
      navigate("/login");
    }
  };

  const renderPage = () => {
    if (view === "profile") return <ViewProfile onBack={() => setView(null)} />;
    if (view === "edit-profile") return <EditProfile onBack={() => setView(null)} />;
    switch (activeNav) {
      case "dashboard":     return <DashboardHome go={go} />;
      case "authenticate":  return <AuthenticateAdmins />;
      case "manage-admins": return <ManageAdmins />;
      case "monitor":       return <MonitorSystem />;
      case "settings":      return <PlatformSettings />;
      case "suspend":       return <SuspendAbusers />;
      case "security":      return <SecurityPolicies />;
      case "issues":        return <ViewIssues />;
      default:              return <DashboardHome go={go} />;
    }
  };

  return (
    <div className="ga">
      {sidebarOpen && <div className="ga-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* SIDEBAR */}
      <aside className={`ga-sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="ga-sb-head">
          <span className="ga-logo">Learn<em>Sphere</em></span>
          <button className="ga-x" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>
        <div className="ga-sb-role">Global Admin Portal</div>
        <nav className="ga-nav">
          {NAV_ITEMS.map((n) => (
            <button key={n.id} className={`ga-nav-item${activeNav === n.id && !view ? " active" : ""}`} onClick={() => go(n.id)}>
              <span className="ga-nav-icon">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>
        <div className="ga-sb-footer">
          <div className="ga-sb-user">
            <span className="ga-ava sm">{GADMIN.initials}</span>
            <div>
              <div className="ga-sb-uname">{GADMIN.name}</div>
              <div className="ga-sb-uemail">Global Administrator</div>
            </div>
          </div>
        </div>
      </aside>

      {/* TOPBAR */}
      <header className="ga-topbar">
        <button className="ga-burger" onClick={() => setSidebarOpen(true)}>
          <span /><span /><span />
        </button>
        <span className="ga-topbar-logo">Learn<em>Sphere</em></span>
        <div className="ga-topbar-right">
          {/* Notifications */}
          <div ref={notifRef} className="ga-notif-wrap">
            <button className="ga-icon-btn" onClick={() => setNotifOpen((v) => !v)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {unread > 0 && <span className="ga-badge">{unread}</span>}
            </button>
            {notifOpen && (
              <div className="ga-dropdown notif">
                <div className="ga-dd-title">Notifications <span className="ga-dd-count">{unread} new</span></div>
                {GADMIN.notifications.map((n) => (
                  <div key={n.id} className={`ga-notif-row${!n.read ? " unread" : ""}`}>
                    <div className="ga-notif-dot" />
                    <div><p>{n.text}</p><span>{n.time}</span></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Profile */}
          <div ref={profileRef} className="ga-profile-wrap">
            <button className="ga-ava-btn" onClick={() => setProfileOpen((v) => !v)}>
              <span className="ga-ava">{GADMIN.initials}</span>
            </button>
            {profileOpen && (
              <div className="ga-dropdown profile">
                <div className="ga-dd-user">
                  <span className="ga-ava md">{GADMIN.initials}</span>
                  <div>
                    <div className="ga-dd-name">{GADMIN.name}</div>
                    <div className="ga-dd-email">{GADMIN.email}</div>
                  </div>
                </div>
                <div className="ga-dd-divider" />
                {[
                  { label: "View Profile", fn: () => { setView("profile"); setProfileOpen(false); } },
                  { label: "Edit Profile", fn: () => { setView("edit-profile"); setProfileOpen(false); } },
                ].map((item) => (
                  <button key={item.label} className="ga-dd-item" onClick={item.fn}>{item.label}</button>
                ))}
                <div className="ga-dd-divider" />
                <button className="ga-dd-item danger" onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="ga-main">{renderPage()}</main>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGES
───────────────────────────────────────────── */
function DashboardHome({ go }) {
  const p = GADMIN.platformStats;
  return (
    <div className="ga-page">
      <div className="ga-page-head">
        <div>
          <h1>Control Center <span className="acc">◈</span></h1>
          <p>Platform overview — {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
        </div>
        <button className="ga-cta-btn" onClick={() => go("monitor")}>View System Status</button>
      </div>

      <div className="ga-stat-row">
        {[
          { icon: "◎", label: "Total Users", value: p.totalUsers.toLocaleString() },
          { icon: "▤", label: "Total Courses", value: p.totalCourses },
          { icon: "◈", label: "Active Admins", value: p.activeAdmins },
          { icon: "₹", label: "Monthly Revenue", value: `₹${(p.monthlyRevenue / 100000).toFixed(1)}L` },
          { icon: "⚠", label: "Open Issues", value: p.openIssues },
          { icon: "✓", label: "Resolved Issues", value: p.resolvedIssues },
        ].map((s) => (
          <div key={s.label} className="ga-stat-card">
            <span className="ga-stat-ico">{s.icon}</span>
            <span className="ga-stat-val">{s.value}</span>
            <span className="ga-stat-lbl">{s.label}</span>
          </div>
        ))}
      </div>

      {/* System metrics mini-view */}
      <h2 className="ga-sec-title">System Health</h2>
      <div className="ga-metrics-grid">
        {GADMIN.systemMetrics.map((m) => (
          <div key={m.label} className="ga-metric-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span className="ga-bold">{m.label}</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: m.color }}>{m.value}{m.unit}</span>
            </div>
            <div className="ga-pbar">
              <div className="ga-pbar-fill" style={{ width: m.value + "%", background: m.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Pending Auth */}
      <h2 className="ga-sec-title" style={{ marginTop: 32 }}>Pending Admin Verifications</h2>
      {GADMIN.courseAdmins.filter((a) => a.status === "Pending").map((a) => (
        <div className="ga-alert-card" key={a.id}>
          <div className="ga-ava sm">{a.name[0]}</div>
          <div style={{ flex: 1 }}>
            <p className="ga-bold" style={{ margin: 0 }}>{a.name}</p>
            <span style={{ fontSize: 12, color: "#888" }}>{a.email} · Applied {a.joinDate}</span>
          </div>
          <button className="ga-approve-btn">Approve</button>
          <button className="ga-reject-btn">Reject</button>
        </div>
      ))}

      {/* Recent Issues */}
      <h2 className="ga-sec-title" style={{ marginTop: 32 }}>Recent Issues</h2>
      {GADMIN.issues.slice(0, 3).map((issue) => (
        <div className="ga-issue-row" key={issue.id}>
          <span className="ga-txn-id">{issue.id}</span>
          <span style={{ flex: 1, fontSize: 13.5 }}>{issue.title}</span>
          <span className={`ga-tag ${issue.severity === "High" ? "red" : issue.severity === "Medium" ? "orange" : "blue"}`}>{issue.severity}</span>
          <span className={`ga-tag ${issue.status === "Resolved" ? "green" : issue.status === "In Progress" ? "orange" : "red"}`}>{issue.status}</span>
        </div>
      ))}
    </div>
  );
}

function AuthenticateAdmins() {
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? GADMIN.courseAdmins : GADMIN.courseAdmins.filter((a) => a.status === filter);
  return (
    <div className="ga-page">
      <h1 className="ga-h1">Authenticate Course Admins</h1>
      <div className="ga-filter-row">
        {["All", "Pending", "Verified", "Suspended"].map((f) => (
          <button key={f} className={`ga-filter-btn${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>
      <div className="ga-table-wrap">
        <table className="ga-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Courses</th><th>Students</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id}>
                <td><div style={{ display: "flex", alignItems: "center", gap: 10 }}><div className="ga-ava sm" style={{ width: 30, height: 30, fontSize: 11 }}>{a.name[0]}</div><span className="ga-bold">{a.name}</span></div></td>
                <td style={{ color: "#888" }}>{a.email}</td>
                <td>{a.courses}</td>
                <td>{a.students.toLocaleString()}</td>
                <td>{a.joinDate}</td>
                <td><span className={`ga-tag ${a.status === "Verified" ? "green" : a.status === "Pending" ? "orange" : "red"}`}>{a.status}</span></td>
                <td>
                  <div style={{ display: "flex", gap: 6 }}>
                    {a.status === "Pending" && <><button className="ga-action-btn green">Approve</button><button className="ga-action-btn red">Reject</button></>}
                    {a.status === "Verified" && <button className="ga-action-btn red">Revoke</button>}
                    {a.status === "Suspended" && <button className="ga-action-btn green">Reinstate</button>}
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

function ManageAdmins() {
  const [showAdd, setShowAdd] = useState(false);
  return (
    <div className="ga-page">
      <div className="ga-page-head">
        <h1 className="ga-h1" style={{ margin: 0 }}>Add / Remove Course Admins</h1>
        <button className="ga-cta-btn" onClick={() => setShowAdd(!showAdd)}>+ Add New Admin</button>
      </div>
      {showAdd && (
        <div className="ga-add-form">
          <h3 style={{ margin: "0 0 16px" }}>Add New Course Admin</h3>
          <div className="ga-form-grid">
            {["Full Name", "Email Address", "Phone", "Specialization"].map((f) => (
              <div className="ga-fgroup" key={f}><label>{f}</label><input type="text" placeholder={f} /></div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button className="ga-cta-btn">Send Invitation</button>
            <button className="ga-btn-cancel" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}
      <div className="ga-table-wrap">
        <table className="ga-table">
          <thead>
            <tr><th>Admin</th><th>Email</th><th>Courses</th><th>Students</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {GADMIN.courseAdmins.map((a) => (
              <tr key={a.id}>
                <td className="ga-bold">{a.name}</td>
                <td style={{ color: "#888" }}>{a.email}</td>
                <td>{a.courses}</td>
                <td>{a.students.toLocaleString()}</td>
                <td><span className={`ga-tag ${a.status === "Verified" ? "green" : a.status === "Pending" ? "orange" : "red"}`}>{a.status}</span></td>
                <td>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="ga-action-btn">Edit</button>
                    <button className="ga-action-btn red">Remove</button>
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

function MonitorSystem() {
  return (
    <div className="ga-page">
      <h1 className="ga-h1">System Monitor</h1>
      <div className="ga-metrics-grid" style={{ marginBottom: 28 }}>
        {GADMIN.systemMetrics.map((m) => (
          <div key={m.label} className="ga-metric-card large">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span className="ga-bold">{m.label}</span>
              <span style={{ fontSize: 24, fontWeight: 800, color: m.color }}>{m.value}{m.unit}</span>
            </div>
            <div className="ga-pbar" style={{ height: 10 }}>
              <div className="ga-pbar-fill" style={{ width: m.value + "%", background: m.color }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12, color: "#666" }}>
              <span>Used: {m.value}%</span>
              <span>Free: {100 - m.value}%</span>
            </div>
          </div>
        ))}
      </div>
      <h2 className="ga-sec-title">Platform Activity (Live)</h2>
      <div className="ga-activity-grid">
        {[
          { label: "Active Sessions", value: "1,247", trend: "+12%" },
          { label: "API Requests/min", value: "8,320", trend: "+4%" },
          { label: "Video Streams", value: "342", trend: "-2%" },
          { label: "DB Queries/sec", value: "1,840", trend: "+8%" },
        ].map((s) => (
          <div className="ga-activity-card" key={s.label}>
            <span className="ga-bold">{s.label}</span>
            <span className="ga-activity-val">{s.value}</span>
            <span className={`ga-trend ${s.trend.startsWith("+") ? "up" : "down"}`}>{s.trend}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlatformSettings() {
  const settings = [
    { section: "General", items: [
      { label: "Platform Name", value: "LearnSphere", type: "text" },
      { label: "Support Email", value: "support@learnsphere.com", type: "email" },
      { label: "Max Course Price (₹)", value: "49999", type: "number" },
    ]},
    { section: "Registration", items: [
      { label: "Allow Guest Browsing", value: true, type: "toggle" },
      { label: "Email Verification Required", value: true, type: "toggle" },
      { label: "2-Step Verification for Admins", value: true, type: "toggle" },
    ]},
    { section: "Content Policy", items: [
      { label: "Auto-flag Spam Reviews", value: true, type: "toggle" },
      { label: "Require Admin Approval for Courses", value: false, type: "toggle" },
    ]},
  ];
  return (
    <div className="ga-page">
      <h1 className="ga-h1">Platform Settings</h1>
      {settings.map((section) => (
        <div className="ga-settings-section" key={section.section}>
          <h3 className="ga-sec-title">{section.section}</h3>
          {section.items.map((item) => (
            <div className="ga-setting-row" key={item.label}>
              <span className="ga-setting-label">{item.label}</span>
              {item.type === "toggle" ? (
                <label className="ga-toggle">
                  <input type="checkbox" defaultChecked={item.value} />
                  <span className="ga-toggle-track"><span className="ga-toggle-thumb" /></span>
                </label>
              ) : (
                <input className="ga-setting-input" type={item.type} defaultValue={item.value} />
              )}
            </div>
          ))}
        </div>
      ))}
      <button className="ga-cta-btn" style={{ marginTop: 16 }}>Save All Settings</button>
    </div>
  );
}

function SuspendAbusers() {
  return (
    <div className="ga-page">
      <h1 className="ga-h1">Suspicious Accounts & Abusers</h1>
      <div className="ga-table-wrap">
        <table className="ga-table">
          <thead>
            <tr><th>Account ID</th><th>Username</th><th>Reason</th><th>Action Taken</th><th>Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {GADMIN.suspiciousAccounts.map((acc) => (
              <tr key={acc.id}>
                <td className="ga-txn-id">{acc.id}</td>
                <td className="ga-bold">{acc.name}</td>
                <td style={{ color: "#aaa", fontSize: 13 }}>{acc.reason}</td>
                <td><span className={`ga-tag ${acc.action === "Banned" ? "red" : acc.action === "Suspended" ? "orange" : "blue"}`}>{acc.action}</span></td>
                <td>{acc.date}</td>
                <td>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="ga-action-btn">Review</button>
                    <button className="ga-action-btn red">Ban</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className="ga-sec-title" style={{ marginTop: 28 }}>Suspend Account Manually</h2>
      <div className="ga-add-form">
        <div className="ga-form-grid">
          <div className="ga-fgroup"><label>Account ID or Email</label><input type="text" placeholder="user@email.com or #ID" /></div>
          <div className="ga-fgroup"><label>Reason</label><input type="text" placeholder="Reason for suspension" /></div>
        </div>
        <div className="ga-fgroup" style={{ marginTop: 12 }}>
          <label>Action</label>
          <select><option>Temporary Suspension (7 days)</option><option>Permanent Ban</option><option>Under Review</option></select>
        </div>
        <button className="ga-cta-btn" style={{ marginTop: 14 }}>Apply Action</button>
      </div>
    </div>
  );
}

function SecurityPolicies() {
  const policies = [
    { id: "POL-01", name: "Password Policy", status: "Active", description: "Min 8 chars, 1 uppercase, 1 number, 1 special char", lastUpdated: "Mar 10, 2024" },
    { id: "POL-02", name: "Session Timeout", status: "Active", description: "Auto logout after 30 minutes of inactivity", lastUpdated: "Feb 28, 2024" },
    { id: "POL-03", name: "OTP Verification", status: "Active", description: "OTP required for sign-in from new device", lastUpdated: "Mar 1, 2024" },
    { id: "POL-04", name: "2-Step Admin Auth", status: "Active", description: "Mandatory 2FA for all course and global admins", lastUpdated: "Mar 15, 2024" },
    { id: "POL-05", name: "Rate Limiting", status: "Active", description: "Max 100 API requests per minute per IP", lastUpdated: "Jan 20, 2024" },
    { id: "POL-06", name: "IP Blacklist", status: "Draft", description: "Block known malicious IP ranges", lastUpdated: "Mar 18, 2024" },
  ];
  return (
    <div className="ga-page">
      <div className="ga-page-head">
        <h1 className="ga-h1" style={{ margin: 0 }}>Security Policies</h1>
        <button className="ga-cta-btn">+ New Policy</button>
      </div>
      <div className="ga-policy-grid">
        {policies.map((p) => (
          <div className="ga-policy-card" key={p.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <span className="ga-txn-id">{p.id}</span>
              <span className={`ga-tag ${p.status === "Active" ? "green" : "orange"}`}>{p.status}</span>
            </div>
            <p className="ga-bold" style={{ margin: "0 0 6px" }}>{p.name}</p>
            <p style={{ fontSize: 13, color: "#888", margin: "0 0 14px", lineHeight: 1.5 }}>{p.description}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#555" }}>Updated {p.lastUpdated}</span>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="ga-action-btn">Edit</button>
                {p.status === "Active" ? (
                  <button className="ga-action-btn red">Disable</button>
                ) : (
                  <button className="ga-action-btn green">Enable</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ViewIssues() {
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? GADMIN.issues : GADMIN.issues.filter((i) =>
    filter === "Open" ? i.status === "Open" : filter === "Resolved" ? i.status === "Resolved" : i.status === "In Progress"
  );
  return (
    <div className="ga-page">
      <div className="ga-page-head">
        <h1 className="ga-h1" style={{ margin: 0 }}>View Issues</h1>
        <button className="ga-cta-btn">+ Report Issue</button>
      </div>
      <div className="ga-filter-row">
        {["All", "Open", "In Progress", "Resolved"].map((f) => (
          <button key={f} className={`ga-filter-btn${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>
      <div className="ga-table-wrap">
        <table className="ga-table">
          <thead>
            <tr><th>ID</th><th>Title</th><th>Severity</th><th>Status</th><th>Reported</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map((issue) => (
              <tr key={issue.id}>
                <td className="ga-txn-id">{issue.id}</td>
                <td className="ga-bold">{issue.title}</td>
                <td><span className={`ga-tag ${issue.severity === "High" ? "red" : issue.severity === "Medium" ? "orange" : "blue"}`}>{issue.severity}</span></td>
                <td><span className={`ga-tag ${issue.status === "Resolved" ? "green" : issue.status === "In Progress" ? "orange" : "red"}`}>{issue.status}</span></td>
                <td>{issue.reported}</td>
                <td>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="ga-action-btn">Assign</button>
                    {issue.status !== "Resolved" && <button className="ga-action-btn green">Resolve</button>}
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

/* ─── Profile Views ─── */
function ViewProfile({ onBack }) {
  const p = GADMIN.platformStats;
  return (
    <div className="ga-page">
      <button className="ga-back" onClick={onBack}>← Back to Dashboard</button>
      <div className="ga-vp-banner">
        <div className="ga-vp-grad" />
        <div className="ga-vp-ava-wrap">
          <div className="ga-vp-ava">{GADMIN.initials}</div>
          <span className="ga-vp-role-tag">Global Administrator</span>
        </div>
      </div>
      <div className="ga-vp-body">
        <div>
          <h1 className="ga-vp-name">{GADMIN.name}</h1>
          <p className="ga-vp-bio">{GADMIN.bio}</p>
          <div className="ga-vp-meta">
            <span>📍 {GADMIN.location}</span>
            <span>📅 Joined {GADMIN.joinDate}</span>
            <span>✉ {GADMIN.email}</span>
          </div>
        </div>
      </div>
      <div className="ga-vp-stats">
        {[
          { val: p.totalUsers.toLocaleString(), lbl: "Total Users" },
          { val: p.totalCourses, lbl: "Active Courses" },
          { val: p.activeAdmins, lbl: "Course Admins" },
          { val: `₹${(p.monthlyRevenue / 100000).toFixed(1)}L`, lbl: "Monthly Revenue" },
        ].map((s) => (
          <div className="ga-vp-stat" key={s.lbl}>
            <span className="ga-vp-stat-val">{s.val}</span>
            <span className="ga-vp-stat-lbl">{s.lbl}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EditProfile({ onBack }) {
  return (
    <div className="ga-page">
      <button className="ga-back" onClick={onBack}>← Back</button>
      <h1 className="ga-h1">Edit Profile</h1>
      <div className="ga-edit-wrap">
        <div className="ga-edit-ava-col">
          <div className="ga-vp-ava" style={{ margin: "0 auto" }}>{GADMIN.initials}</div>
          <button className="ga-upload-photo-btn">Change Photo</button>
        </div>
        <div className="ga-edit-form">
          <div className="ga-form-grid">
            {[
              { label: "Full Name", value: GADMIN.name },
              { label: "Email", value: GADMIN.email },
              { label: "Phone", value: GADMIN.phone },
              { label: "Location", value: GADMIN.location },
            ].map((f) => (
              <div className="ga-fgroup" key={f.label}><label>{f.label}</label><input type="text" defaultValue={f.value} /></div>
            ))}
          </div>
          <div className="ga-fgroup"><label>Bio</label><textarea defaultValue={GADMIN.bio} rows={4} /></div>
          <div className="ga-form-actions">
            <button className="ga-btn-cancel" onClick={onBack}>Cancel</button>
            <button className="ga-btn-save">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

.ga { display:flex; flex-direction:column; min-height:100vh; background:#090912; color:#e2e2f0; font-family:'Sora',sans-serif; }
.ga-sidebar { position:fixed; top:0; left:0; height:100vh; width:265px; background:#0e0e1f; border-right:1px solid #ffffff0f; z-index:200; transform:translateX(-100%); transition:transform .3s cubic-bezier(.4,0,.2,1); display:flex; flex-direction:column; }
.ga-sidebar.open { transform:translateX(0); }
.ga-overlay { position:fixed; inset:0; background:#00000088; z-index:199; backdrop-filter:blur(2px); }
.ga-sb-head { display:flex; align-items:center; justify-content:space-between; padding:20px 20px 16px; border-bottom:1px solid #ffffff0a; }
.ga-logo { font-size:20px; font-weight:700; color:#fff; }
.ga-logo em { color:#a855f7; font-style:normal; }
.ga-x { background:none; border:none; color:#888; font-size:16px; cursor:pointer; }
.ga-sb-role { font-size:10px; letter-spacing:2px; color:#a855f7; text-transform:uppercase; padding:12px 20px 8px; font-weight:600; }
.ga-nav { display:flex; flex-direction:column; gap:2px; padding:0 12px; flex:1; }
.ga-nav-item { display:flex; align-items:center; gap:12px; padding:11px 14px; border:none; background:none; color:#8888aa; border-radius:10px; font-family:inherit; font-size:13.5px; cursor:pointer; text-align:left; transition:all .2s; }
.ga-nav-item:hover { background:#ffffff08; color:#e2e2f0; }
.ga-nav-item.active { background:#a855f722; color:#a855f7; font-weight:600; }
.ga-nav-icon { font-size:15px; width:20px; text-align:center; }
.ga-sb-footer { padding:16px; border-top:1px solid #ffffff0a; }
.ga-sb-user { display:flex; align-items:center; gap:10px; }
.ga-sb-uname { font-size:13px; font-weight:600; }
.ga-sb-uemail { font-size:11px; color:#666; }
.ga-topbar { position:sticky; top:0; z-index:100; height:60px; background:#0e0e1fcc; backdrop-filter:blur(12px); border-bottom:1px solid #ffffff0a; display:flex; align-items:center; padding:0 20px; gap:12px; }
.ga-burger { background:none; border:none; cursor:pointer; display:flex; flex-direction:column; gap:5px; padding:6px; }
.ga-burger span { display:block; width:22px; height:2px; background:#e2e2f0; border-radius:2px; }
.ga-topbar-logo { font-size:18px; font-weight:700; color:#fff; flex:1; }
.ga-topbar-logo em { color:#a855f7; font-style:normal; }
.ga-topbar-right { display:flex; align-items:center; gap:8px; }
.ga-icon-btn { position:relative; background:none; border:1px solid #ffffff10; color:#aaa; padding:8px; border-radius:10px; cursor:pointer; display:flex; transition:all .2s; }
.ga-icon-btn:hover { background:#ffffff08; color:#e2e2f0; }
.ga-badge { position:absolute; top:-5px; right:-5px; background:#ff4f4f; color:#fff; font-size:10px; font-weight:700; width:18px; height:18px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #0e0e1f; }
.ga-ava { display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#a855f7,#7c3aed); color:#fff; font-weight:700; border-radius:50%; }
.ga-ava.sm { width:34px; height:34px; font-size:12px; flex-shrink:0; }
.ga-ava.md { width:38px; height:38px; font-size:14px; }
.ga-ava-btn { background:none; border:none; cursor:pointer; padding:0; }
.ga-ava-btn .ga-ava { width:36px; height:36px; font-size:13px; }
.ga-notif-wrap,.ga-profile-wrap { position:relative; }
.ga-dropdown { position:absolute; right:0; top:calc(100% + 10px); background:#151528; border:1px solid #ffffff10; border-radius:14px; min-width:210px; z-index:300; box-shadow:0 20px 60px #00000090; overflow:hidden; animation:ga-pop .15s ease; }
.ga-dropdown.notif { min-width:310px; }
@keyframes ga-pop { from{opacity:0;transform:translateY(-8px) scale(.97)} to{opacity:1;transform:none} }
.ga-dd-title { padding:14px 16px 10px; font-size:13px; font-weight:700; border-bottom:1px solid #ffffff0a; display:flex; align-items:center; justify-content:space-between; }
.ga-dd-count { font-size:11px; background:#a855f722; color:#a855f7; padding:2px 8px; border-radius:20px; }
.ga-notif-row { display:flex; gap:10px; align-items:flex-start; padding:12px 14px; border-bottom:1px solid #ffffff08; }
.ga-notif-row.unread { background:#a855f708; }
.ga-notif-dot { width:8px; height:8px; border-radius:50%; background:#a855f7; margin-top:4px; flex-shrink:0; }
.ga-notif-row:not(.unread) .ga-notif-dot { background:#ffffff15; }
.ga-notif-row p { font-size:12.5px; color:#ccc; margin:0 0 3px; line-height:1.4; }
.ga-notif-row span { font-size:11px; color:#555; }
.ga-dd-user { display:flex; align-items:center; gap:12px; padding:14px 16px; }
.ga-dd-name { font-size:13px; font-weight:600; }
.ga-dd-email { font-size:11px; color:#666; }
.ga-dd-divider { height:1px; background:#ffffff0a; }
.ga-dd-item { display:block; width:100%; padding:11px 16px; background:none; border:none; color:#aaa; font-family:inherit; font-size:13.5px; text-align:left; cursor:pointer; transition:all .15s; }
.ga-dd-item:hover { background:#ffffff08; color:#e2e2f0; }
.ga-dd-item.danger { color:#ff5f5f; }
.ga-dd-item.danger:hover { background:#ff5f5f11; }
.ga-main { flex:1; overflow-y:auto; }
.ga-page { max-width:1100px; margin:0 auto; padding:32px 24px; }
.ga-page-head { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:28px; flex-wrap:wrap; gap:16px; }
.ga-page-head h1 { font-size:24px; font-weight:700; margin:0 0 4px; }
.ga-page-head p { font-size:14px; color:#666; margin:0; }
.ga-h1 { font-size:22px; font-weight:700; margin:0 0 24px; }
.acc { color:#a855f7; }
.ga-cta-btn { background:#a855f7; color:#fff; border:none; padding:10px 20px; border-radius:10px; font-family:inherit; font-size:13px; font-weight:600; cursor:pointer; white-space:nowrap; transition:opacity .2s; }
.ga-cta-btn:hover { opacity:.85; }
.ga-stat-row { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:14px; margin-bottom:28px; }
.ga-stat-card { background:#151528; border:1px solid #ffffff08; border-radius:14px; padding:18px; display:flex; flex-direction:column; gap:6px; }
.ga-stat-ico { font-size:18px; }
.ga-stat-val { font-size:22px; font-weight:700; }
.ga-stat-lbl { font-size:12px; color:#666; }
.ga-sec-title { font-size:17px; font-weight:700; margin:0 0 16px; }
.ga-bold { font-weight:600; color:#e2e2f0; }
.ga-pbar { background:#ffffff0a; border-radius:4px; height:6px; overflow:hidden; }
.ga-pbar-fill { height:100%; background:linear-gradient(90deg,#a855f7,#7c3aed); border-radius:4px; transition:width .5s; }
.ga-metrics-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:16px; }
.ga-metric-card { background:#151528; border:1px solid #ffffff08; border-radius:14px; padding:20px; }
.ga-metric-card.large { padding:22px; }
.ga-alert-card { display:flex; align-items:center; gap:12px; background:#151528; border:1px solid #a855f722; border-radius:12px; padding:14px 16px; margin-bottom:10px; }
.ga-approve-btn { background:#3ecf8e22; border:1px solid #3ecf8e44; color:#3ecf8e; font-family:inherit; font-size:12px; font-weight:600; padding:6px 14px; border-radius:8px; cursor:pointer; }
.ga-reject-btn { background:#ff5f5f11; border:1px solid #ff5f5f33; color:#ff5f5f; font-family:inherit; font-size:12px; font-weight:600; padding:6px 14px; border-radius:8px; cursor:pointer; }
.ga-issue-row { display:flex; align-items:center; gap:12px; background:#151528; border:1px solid #ffffff08; border-radius:12px; padding:14px 16px; margin-bottom:10px; flex-wrap:wrap; }
.ga-table-wrap { overflow-x:auto; }
.ga-table { width:100%; border-collapse:collapse; font-size:13.5px; }
.ga-table th { padding:12px 16px; text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#555; border-bottom:1px solid #ffffff0a; }
.ga-table td { padding:14px 16px; border-bottom:1px solid #ffffff06; color:#ccc; vertical-align:middle; }
.ga-table tr:hover td { background:#ffffff03; }
.ga-txn-id { font-family:'JetBrains Mono',monospace; font-size:12px; color:#a855f7; }
.ga-tag { font-size:11px; font-weight:600; padding:3px 10px; border-radius:20px; }
.ga-tag.green { background:#3ecf8e22; color:#3ecf8e; }
.ga-tag.orange { background:#f9731622; color:#f97316; }
.ga-tag.red { background:#ff5f5f22; color:#ff5f5f; }
.ga-tag.blue { background:#5468ff22; color:#5468ff; }
.ga-action-btn { background:none; border:1px solid #ffffff15; color:#ccc; font-family:inherit; font-size:12px; padding:5px 12px; border-radius:8px; cursor:pointer; transition:all .2s; }
.ga-action-btn:hover { background:#ffffff08; color:#fff; }
.ga-action-btn.red { border-color:#ff5f5f33; color:#ff5f5f; }
.ga-action-btn.red:hover { background:#ff5f5f11; }
.ga-action-btn.green { border-color:#3ecf8e44; color:#3ecf8e; }
.ga-action-btn.green:hover { background:#3ecf8e11; }
.ga-filter-row { display:flex; gap:8px; margin-bottom:20px; flex-wrap:wrap; }
.ga-filter-btn { background:none; border:1px solid #ffffff10; color:#888; font-family:inherit; font-size:13px; padding:7px 16px; border-radius:20px; cursor:pointer; transition:all .2s; }
.ga-filter-btn.active { background:#a855f722; border-color:#a855f7; color:#a855f7; font-weight:600; }
.ga-activity-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:14px; }
.ga-activity-card { background:#151528; border:1px solid #ffffff08; border-radius:14px; padding:18px; display:flex; flex-direction:column; gap:6px; }
.ga-activity-val { font-size:26px; font-weight:800; color:#e2e2f0; }
.ga-trend { font-size:13px; font-weight:600; }
.ga-trend.up { color:#3ecf8e; }
.ga-trend.down { color:#ff5f5f; }
.ga-settings-section { background:#151528; border:1px solid #ffffff08; border-radius:14px; padding:20px; margin-bottom:16px; }
.ga-setting-row { display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid #ffffff06; }
.ga-setting-row:last-child { border-bottom:none; }
.ga-setting-label { font-size:14px; color:#ccc; }
.ga-setting-input { background:#1e1e35; border:1px solid #ffffff10; color:#e2e2f0; font-family:inherit; font-size:13px; padding:7px 12px; border-radius:8px; outline:none; width:240px; }
.ga-toggle { position:relative; display:inline-flex; cursor:pointer; }
.ga-toggle input { opacity:0; width:0; height:0; position:absolute; }
.ga-toggle-track { width:44px; height:24px; background:#ffffff15; border-radius:24px; transition:background .2s; display:flex; align-items:center; padding:2px; }
.ga-toggle input:checked + .ga-toggle-track { background:#a855f7; }
.ga-toggle-thumb { width:20px; height:20px; background:#fff; border-radius:50%; transition:transform .2s; }
.ga-toggle input:checked + .ga-toggle-track .ga-toggle-thumb { transform:translateX(20px); }
.ga-add-form { background:#151528; border:1px solid #ffffff08; border-radius:14px; padding:20px; margin-bottom:20px; }
.ga-form-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:16px; }
.ga-fgroup { display:flex; flex-direction:column; gap:6px; }
.ga-fgroup label { font-size:12px; color:#888; font-weight:500; }
.ga-fgroup input,.ga-fgroup textarea,.ga-fgroup select { background:#1e1e35; border:1px solid #ffffff10; color:#e2e2f0; font-family:inherit; font-size:13.5px; padding:10px 14px; border-radius:10px; outline:none; resize:vertical; transition:border-color .2s; }
.ga-fgroup input:focus,.ga-fgroup textarea:focus,.ga-fgroup select:focus { border-color:#a855f766; }
.ga-policy-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:16px; }
.ga-policy-card { background:#151528; border:1px solid #ffffff08; border-radius:14px; padding:18px; }
.ga-back { background:none; border:none; color:#a855f7; font-family:inherit; font-size:13px; cursor:pointer; padding:0; margin-bottom:20px; }
.ga-vp-banner { height:180px; background:linear-gradient(135deg,#160d22,#0f0a1a); border-radius:16px; position:relative; margin-bottom:60px; }
.ga-vp-grad { position:absolute; inset:0; background:linear-gradient(135deg,#a855f722,#7c3aed22); border-radius:16px; }
.ga-vp-ava-wrap { position:absolute; bottom:-48px; left:28px; display:flex; align-items:flex-end; gap:12px; }
.ga-vp-ava { width:90px; height:90px; border-radius:50%; background:linear-gradient(135deg,#a855f7,#7c3aed); color:#fff; font-size:28px; font-weight:800; display:flex; align-items:center; justify-content:center; border:4px solid #090912; }
.ga-vp-role-tag { background:#a855f722; color:#a855f7; font-size:12px; font-weight:600; padding:5px 14px; border-radius:20px; border:1px solid #a855f733; margin-bottom:8px; }
.ga-vp-body { margin-bottom:24px; }
.ga-vp-name { font-size:24px; font-weight:800; margin:0 0 8px; }
.ga-vp-bio { font-size:14px; color:#888; margin:0 0 12px; line-height:1.6; }
.ga-vp-meta { display:flex; gap:16px; flex-wrap:wrap; }
.ga-vp-meta span { font-size:13px; color:#666; }
.ga-vp-stats { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:14px; background:#151528; border:1px solid #ffffff08; border-radius:14px; padding:20px; }
.ga-vp-stat { text-align:center; }
.ga-vp-stat-val { display:block; font-size:22px; font-weight:800; color:#a855f7; }
.ga-vp-stat-lbl { font-size:12px; color:#666; }
.ga-edit-wrap { display:flex; gap:32px; flex-wrap:wrap; }
.ga-edit-ava-col { display:flex; flex-direction:column; align-items:center; gap:12px; }
.ga-upload-photo-btn { background:none; border:1px solid #ffffff20; color:#ccc; font-family:inherit; font-size:12px; padding:8px 16px; border-radius:8px; cursor:pointer; }
.ga-edit-form { flex:1; min-width:280px; }
.ga-form-actions { display:flex; gap:12px; margin-top:24px; justify-content:flex-end; }
.ga-btn-cancel { background:none; border:1px solid #ffffff15; color:#888; font-family:inherit; font-size:13px; padding:10px 20px; border-radius:10px; cursor:pointer; }
.ga-btn-save { background:#a855f7; border:none; color:#fff; font-family:inherit; font-size:13px; font-weight:600; padding:10px 24px; border-radius:10px; cursor:pointer; }

/* Project theme overrides */
.ga, .ga * { font-family:'Inter',sans-serif; }
.ga { background:var(--bg); color:var(--text-primary); }
.ga-main { background:linear-gradient(155deg, #cfe09c 0%, var(--bg) 70%); }
.ga-sidebar, .ga-topbar { background:var(--header); border-color:rgba(0,0,0,0.12); }
.ga-overlay { background:rgba(0,0,0,0.18); backdrop-filter:blur(1px); }
.ga-logo, .ga-topbar-logo, .ga-sb-uname, .ga-dd-name, .ga-page-head h1, .ga-h1, .ga-sec-title, .ga-bold, .ga-vp-name, .ga-activity-val, .ga-stat-val { color:var(--text-primary); }
.ga-logo em, .ga-topbar-logo em, .ga-sb-role, .ga-nav-item.active, .ga-dd-count, .ga-back, .acc, .ga-vp-stat-val, .ga-txn-id { color:var(--accent); }
.ga-nav-item, .ga-page-head p, .ga-sb-uemail, .ga-dd-email, .ga-stat-lbl, .ga-vp-bio, .ga-vp-meta span, .ga-setting-label, .ga-trend, .ga-table td, .ga-notif-row p, .ga-notif-row span { color:var(--text-secondary); }
.ga-nav-item:hover, .ga-dd-item:hover, .ga-icon-btn:hover, .ga-action-btn:hover, .ga-filter-btn:hover { background:rgba(255,255,255,0.16); color:#fff; }
.ga-nav-item.active, .ga-dd-count, .ga-filter-btn.active { background:rgba(31,92,16,0.1); border-color:rgba(31,92,16,0.2); }
.ga-icon-btn, .ga-dropdown, .ga-stat-card, .ga-metric-card, .ga-alert-card, .ga-issue-row, .ga-activity-card, .ga-settings-section, .ga-add-form, .ga-policy-card, .ga-vp-stats, .ga-table-wrap, .ga-setting-input, .ga-fgroup input, .ga-fgroup textarea, .ga-fgroup select {
  background:var(--card);
  border-color:var(--border-med);
  color:var(--text-primary);
}
.ga-dropdown, .ga-stat-card, .ga-metric-card, .ga-alert-card, .ga-issue-row, .ga-activity-card, .ga-settings-section, .ga-add-form, .ga-policy-card, .ga-vp-stats { box-shadow:0 4px 24px rgba(0,0,0,0.08); }
.ga-burger span { background:#fff; }
.ga-icon-btn { color:rgba(255,255,255,0.85); border-color:rgba(255,255,255,0.35); }
.ga-badge { border-color:var(--header); }
.ga-ava, .ga-vp-ava { background:linear-gradient(135deg, var(--accent), var(--accent-lt)); }
.ga-cta-btn, .ga-btn-save { background:var(--accent); color:#fff; box-shadow:0 2px 12px rgba(31,92,16,0.25); }
.ga-cta-btn:hover, .ga-btn-save:hover { background:var(--accent-lt); opacity:1; }
.ga-action-btn, .ga-filter-btn, .ga-btn-cancel, .ga-upload-photo-btn, .ga-setting-input { background:transparent; border-color:rgba(31,92,16,0.25); color:var(--accent); }
.ga-pbar { background:rgba(0,0,0,0.08); }
.ga-pbar-fill { background:linear-gradient(90deg, var(--accent), var(--accent-lt)); }
.ga-table th, .ga-table td, .ga-dd-divider, .ga-setting-row { border-color:var(--border); }
.ga-table th { color:var(--text-muted); }
.ga-table tr:hover td, .ga-notif-row.unread { background:rgba(255,255,255,0.18); }
.ga-notif-dot { background:var(--accent); }
.ga-tag.green { background:rgba(112,171,93,0.16); color:var(--accent); }
.ga-tag.orange, .ga-tag.blue { background:rgba(31,92,16,0.1); color:var(--accent); }
.ga-vp-banner { background:linear-gradient(155deg, #b7d28d 0%, #dce9c6 100%); }
.ga-vp-grad { background:linear-gradient(135deg, rgba(31,92,16,0.1), rgba(126,181,107,0.18)); }
.ga-toggle-track { background:rgba(0,0,0,0.12); }
.ga-toggle input:checked + .ga-toggle-track { background:var(--accent); }
`;
