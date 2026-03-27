import Footer from "../components/Footer";
import About_image from "../images/About_image.jpg";

const features = [
  "Self-paced, flexible learning for busy schedules",
  "Industry-recognized certificates upon completion",
  "Live mentorship sessions with expert instructors",
  "Community forums with 50,000+ active peers",
  "Lifetime access to all enrolled course materials",
];

export default function About() {
  return (
    <>
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="hero-label">Our Story</div>
          <h1 className="page-title">Built for Learners,<br />By Learners</h1>
          <p className="page-sub">
            We started LearnSphere believing world-class education should be accessible to everyone, everywhere.
          </p>
        </div>
      </div>

      <div className="about-body">
        <div className="about-grid">
          <div className="about-box">
            <img src={About_image} alt="About LearnSphere" className="cc-image"/>
          </div>
          <div className="about-text">
            <h2>Our Mission</h2>
            <p>
              Founded in 2021, LearnSphere grew from a small team of educators and engineers who believed
              geography and resources shouldn't limit your potential to grow.
            </p>
            <p>
              Today we serve over 52,000 students across 120+ countries, offering courses in technology,
              design, and business — all taught by industry practitioners.
            </p>
            <div className="feat-list">
              {features.map((f) => (
                <div className="feat-item" key={f}>
                  <div className="feat-dot" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="section-label" style={{ marginBottom: "0.6rem" }}>Developed by Eng. Mohit Sharma</div>    
      </div>

      <Footer />
    </>
  );
}
