import { useState } from "react";
import Footer from "../components/Footer";

const categories = [
  { i: "💻", n: "Web Development",      c: "180+ courses" },
  { i: "🤖", n: "AI & Machine Learning", c: "95+ courses"  },
  { i: "🎨", n: "UI/UX Design",          c: "120+ courses" },
  { i: "📊", n: "Data Science",          c: "110+ courses" },
  { i: "☁️", n: "Cloud & DevOps",        c: "75+ courses"  },
  { i: "🔐", n: "Cybersecurity",          c: "60+ courses"  },
  { i: "📱", n: "Mobile Development",    c: "88+ courses"  },
  { i: "💰", n: "Business & Finance",    c: "140+ courses" },
  { i: "🎬", n: "Video & Photography",   c: "55+ courses"  },
];

export default function Explore() {
  const [q, setQ] = useState("");
  const filtered = categories.filter((c) =>
    c.n.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <>
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="hero-label">Browse All</div>
          <h1 className="page-title">Explore Every Discipline</h1>
          <p className="page-sub">
            From foundational skills to advanced specializations — find exactly what you want to master.
          </p>
        </div>
      </div>

      <div className="explore-body">
        <input
          className="search-input"
          placeholder="Search categories..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="cat-grid">
          {filtered.map((c, i) => (
            <div className="cat-card" key={i}>
              <div className="cat-emoji">{c.i}</div>
              <div className="cat-name">{c.n}</div>
              <div className="cat-count">{c.c}</div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: "1/-1", padding: "3rem", textAlign: "center", color: "var(--muted)", fontSize: "0.88rem" }}>
              No categories found.
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
