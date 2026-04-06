import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import aiImage from "../images/Ai_image.jpg";
import uiImage from "../images/UI_image.jpg";
import cyberImage from "../images/Cyber_image.jpg";
import devImage from "../images/1687.jpg";
import dataAnalyticsImage from "../images/DA_image.jfif";

const HOME_COURSES = [
  {
    id: 1,
    icon: devImage,
    cat: "Development",
    lvl: "Beginner",
    name: "Full-Stack Web Dev Bootcamp",
    desc: "Build real-world apps from HTML to deployment with React & Node.js.",
    stu: "12,400",
  },
  {
    id: 2,
    icon: aiImage,
    cat: "AI & ML",
    lvl: "Intermediate",
    name: "Machine Learning Fundamentals",
    desc: "Understand algorithms, neural networks, and build intelligent models.",
    stu: "8,900",
  },
  {
    id: 3,
    icon: uiImage,
    cat: "Design",
    lvl: "All Levels",
    name: "UI/UX Design Mastery",
    desc: "Learn to craft beautiful, user-centered digital products from scratch.",
    stu: "6,200",
  },
  {
    id: 4,
    icon: cyberImage,
    cat: "Data Science",
    lvl: "Intermediate",
    name: "Data Analytics with Python",
    desc: "Analyze, visualize, and derive insights from complex datasets.",
    stu: "9,700",
  },
  {
    id: 5,
    icon: dataAnalyticsImage,
    cat: "Cloud",
    lvl: "Advanced",
    name: "AWS Cloud Architecture",
    desc: "Design scalable, secure cloud infrastructure on Amazon Web Services.",
    stu: "4,500",
  },
  {
    id: 6,
    icon: cyberImage,
    cat: "Security",
    lvl: "Intermediate",
    name: "Ethical Hacking & Cybersecurity",
    desc: "Protect systems and networks with ethical hacking techniques.",
    stu: "7,800",
  },
];

export default function CoursesAvailable() {
  const navigate = useNavigate();
  const [queryDraft, setQueryDraft] = useState("");
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");

  const categories = useMemo(
    () => ["All", ...new Set(HOME_COURSES.map((c) => c.cat))],
    []
  );
  const levels = useMemo(
    () => ["All", ...new Set(HOME_COURSES.map((c) => c.lvl))],
    []
  );

  const courses = useMemo(() => {
    const q = query.trim().toLowerCase();
    return HOME_COURSES.filter((c) => {
      const textMatch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.cat.toLowerCase().includes(q) ||
        c.desc.toLowerCase().includes(q);
      const categoryMatch = category === "All" || c.cat === category;
      const levelMatch = level === "All" || c.lvl === level;
      return textMatch && categoryMatch && levelMatch;
    });
  }, [query, category, level]);

  const handleSearch = () => setQuery(queryDraft);

  return (
    <div className="sd-page">
      <h1 className="sd-h1">Courses Available</h1>

      <div className="sd-avail-search-wrap">
        <input
          className="sd-avail-input"
          type="text"
          placeholder="Search courses, category, or topic..."
          value={queryDraft}
          onChange={(e) => setQueryDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
        />
        <button className="sd-avail-search-btn" onClick={handleSearch}>
          Search
        </button>
        <button
          className="sd-avail-filter-btn"
          onClick={() => setShowFilters((v) => !v)}
          aria-label="Toggle filters"
          title="Toggle filters"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="7" y1="12" x2="17" y2="12" />
            <line x1="10" y1="18" x2="14" y2="18" />
          </svg>
        </button>
      </div>

      {showFilters && (
        <div className="sd-avail-filters">
          <select
            className="sd-avail-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            className="sd-avail-select"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            {levels.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="sd-avail-results">
        {courses.length === 0 && (
          <p className="sd-avail-empty">No courses found for this search.</p>
        )}
        <div className="sd-avail-grid">
          {courses.map((c) => (
            <div className="sd-avail-card" key={c.id}>
              <div className="sd-avail-top">
                <img src={c.icon} alt={c.cat} className="sd-avail-image" />
                <div className="sd-avail-level">{c.lvl}</div>
              </div>
              <div className="sd-avail-cat">{c.cat}</div>
              <div className="sd-avail-name">{c.name}</div>
              <p className="sd-avail-desc">{c.desc}</p>
              <div className="sd-avail-foot">
                <span className="sd-avail-stu">{c.stu} students</span>
                <button className="sd-avail-enroll" onClick={() => navigate("/explore")}>
                  Enroll
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
