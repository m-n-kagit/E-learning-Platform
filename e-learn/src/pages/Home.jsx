import { useNavigate } from "react-router-dom";
import StatsSection from "../components/StatsSection";
import Footer from "../components/Footer";

const courses = [
  { icon:"💻", cat:"Development", lvl:"Beginner",     name:"Full-Stack Web Dev Bootcamp",     desc:"Build real-world apps from HTML to deployment with React & Node.js.", stu:"12,400" },
  { icon:"🤖", cat:"AI & ML",     lvl:"Intermediate", name:"Machine Learning Fundamentals",    desc:"Understand algorithms, neural networks, and build intelligent models.",  stu:"8,900"  },
  { icon:"🎨", cat:"Design",      lvl:"All Levels",   name:"UI/UX Design Mastery",            desc:"Learn to craft beautiful, user-centered digital products from scratch.", stu:"6,200"  },
  { icon:"📊", cat:"Data Science",lvl:"Intermediate", name:"Data Analytics with Python",      desc:"Analyze, visualize, and derive insights from complex datasets.",          stu:"9,700"  },
  { icon:"☁️", cat:"Cloud",       lvl:"Advanced",     name:"AWS Cloud Architecture",           desc:"Design scalable, secure cloud infrastructure on Amazon Web Services.",   stu:"4,500"  },
  { icon:"🔐", cat:"Security",    lvl:"Intermediate", name:"Ethical Hacking & Cybersecurity", desc:"Protect systems and networks with ethical hacking techniques.",           stu:"7,800"  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div>
            <div className="hero-label">E-Learning Platform</div>
            <h1 className="hero-title">
              Learn Skills That<br />
              <span className="accent">Actually Matter</span>
            </h1>
            <p className="hero-desc">
              Access 1,200+ expert-crafted courses in tech, design, and business.
              Learn at your own pace, earn certificates, and grow your career.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={() => navigate("/explore")}>Browse Courses</button>
              <button className="btn-outline" onClick={() => navigate("/signup")}>Get Started Free</button>
            </div>
          </div>

          <div className="hero-card">
            <div className="hc-title">Course Progress Overview</div>
            {[
              { name: "Web Development",  pct: 82 },
              { name: "Machine Learning", pct: 67 },
              { name: "UI/UX Design",     pct: 54 },
              { name: "Data Science",     pct: 71 },
            ].map((c) => (
              <div className="prog-item" key={c.name}>
                <div className="prog-row">
                  <span>{c.name}</span>
                  <span className="prog-pct">{c.pct}%</span>
                </div>
                <div className="prog-bar">
                  <div className="prog-fill" style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
            <div className="hc-footer">
              <span>Active learners this month</span>
              <strong>52,000+</strong>
            </div>
          </div>
        </div>
      </section>

      {/* ANIMATED STATS */}
      <StatsSection />

      {/* COURSES */}
      <section className="section">
        <div className="section-label">Popular Courses</div>
        <h2 className="section-title">Start Learning Today</h2>
        <p className="section-sub">Hand-picked by our experts to boost your skills in the most in-demand fields.</p>
        <div className="courses-grid">
          {courses.map((c, i) => (
            <div className="course-card" key={i}>
              <div className="cc-top">
                <div className="cc-icon">{c.icon}</div>
                <div className="cc-level">{c.lvl}</div>
              </div>
              <div className="cc-cat">{c.cat}</div>
              <div className="cc-name">{c.name}</div>
              <p className="cc-desc">{c.desc}</p>
              <div className="cc-footer">
                <span className="cc-stu">👥 {c.stu} students</span>
                <button className="cc-btn" onClick={() => navigate("/explore")}>Enroll</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="cta-strip">
        <div>
          <h3>Ready to start learning?</h3>
          <p>Join 52,000+ students already growing their skills on LearnSphere.</p>
        </div>
        <button className="btn-primary" onClick={() => navigate("/signup")}>
          Create Free Account
        </button>
      </div>

      <Footer />
    </>
  );
}
