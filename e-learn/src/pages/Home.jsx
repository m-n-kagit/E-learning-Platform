import { useNavigate } from "react-router-dom";
import StatsSection from "../components/StatsSection";
import Footer from "../components/Footer";
import aiImage from "../images/Ai_image.jpg";
import uiImage from "../images/UI_image.jpg";
import cyberImage from "../images/Cyber_image.jpg";
import devImage from "../images/1687.jpg";
import Data_analytics_image from "../images/DA_image.jfif";
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
    icon: Data_analytics_image,
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

export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div>
            <div className="hero-label">E-Learning Platform</div>
            <h1 className="hero-title">
              Learn Skills That
              <br />
              <span className="accent">Actually Matter</span>
            </h1>
            <p className="hero-desc">
              Access 1,200+ expert-crafted courses in tech, design, and business.
              Learn at your own pace, earn certificates, and grow your career.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={() => navigate("/explore")}>
                Browse Courses
              </button>
              <button className="btn-outline" onClick={() => navigate("/signup")}>
                Get Started Free
              </button>
            </div>
          </div>
        </div>
      </section>

      <StatsSection />

      <section className="section">
        <div className="section-label">Popular Courses</div>
        <h2 className="section-title">Start Learning Today</h2>
        <p className="section-sub">
          Hand-picked by our experts to boost your skills in the most in-demand fields.
        </p>

        <div className="sd-avail-grid">
          {courses.map((c, i) => (
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
                <button className="sd-avail-enroll" onClick={() => navigate("/explore")}>
                  Enroll
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

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
