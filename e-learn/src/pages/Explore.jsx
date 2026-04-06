import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import aiImage from "../images/Ai_image.jpg";
import uiImage from "../images/UI_image.jpg";
import cyberImage from "../images/Cyber_image.jpg";
import devImage from "../images/1687.jpg";
import dataAnalyticsImage from "../images/DA_image.jfif";

const courses = [
  {
    icon: devImage,
    cat: "Development",
    lvl: "Beginner",
    name: "Full-Stack Web Dev Bootcamp",
    desc: "Build real-world apps from HTML to deployment with React & Node.js.",
    stu: "12,400",
  },
  {
    icon: aiImage,
    cat: "AI & ML",
    lvl: "Intermediate",
    name: "Machine Learning Fundamentals",
    desc: "Understand algorithms, neural networks, and build intelligent models.",
    stu: "8,900",
  },
  {
    icon: uiImage,
    cat: "Design",
    lvl: "All Levels",
    name: "UI/UX Design Mastery",
    desc: "Learn to craft beautiful, user-centered digital products from scratch.",
    stu: "6,200",
  },
  {
    icon: cyberImage,
    cat: "Data Science",
    lvl: "Intermediate",
    name: "Data Analytics with Python",
    desc: "Analyze, visualize, and derive insights from complex datasets.",
    stu: "9,700",
  },
  {
    icon: dataAnalyticsImage,
    cat: "Cloud",
    lvl: "Advanced",
    name: "AWS Cloud Architecture",
    desc: "Design scalable, secure cloud infrastructure on Amazon Web Services.",
    stu: "4,500",
  },
  {
    icon: cyberImage,
    cat: "Security",
    lvl: "Intermediate",
    name: "Ethical Hacking & Cybersecurity",
    desc: "Protect systems and networks with ethical hacking techniques.",
    stu: "7,800",
  },
];

export default function Explore() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const filtered = courses.filter((c) =>
    `${c.name} ${c.cat} ${c.desc}`.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <>
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="hero-label">Browse All</div>
          <h1 className="page-title">Explore Every Discipline</h1>
          <p className="page-sub">
            From foundational skills to advanced specializations, find exactly what you want to master.
          </p>
        </div>
      </div>

      <div className="explore-body">
        <div className="sd-avail-search-wrap" style={{ marginBottom: "2rem" }}>
          <input
            className="sd-avail-input"
            placeholder="Search courses..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="sd-avail-grid">
          {filtered.map((c, i) => (
            <div className="sd-avail-card" key={i}>
              <div className="sd-avail-top">
                <img src={c.icon} alt={c.cat} className="sd-avail-image" />
                <div className="sd-avail-level">{c.lvl}</div>
              </div>

              <div className="sd-avail-cat">{c.cat}</div>
              <div className="sd-avail-name">{c.name}</div>
              <p className="sd-avail-desc">{c.desc}</p>

              <div className="sd-avail-foot">
                <span className="sd-avail-stu">{c.stu} students</span>
                <button className="sd-avail-enroll" onClick={() => navigate("/signup")}>
                  Enroll
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div
              style={{
                gridColumn: "1/-1",
                padding: "3rem",
                textAlign: "center",
                color: "var(--muted)",
                fontSize: "0.88rem",
              }}
            >
              No courses found.
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
