import CoursesAvailable from "../components/Course/CoursesAvailable";
import Footer from "../components/Footer";

export default function Explore() {
  return (
    <>
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="hero-label">Browse All</div>
          <h1 className="page-title">Explore Every Discipline</h1>
          <p className="page-sub">
            Discover published and newly uploaded courses from across the platform.
          </p>
        </div>
      </div>

      <div className="explore-body">
        <CoursesAvailable showTitle={false} wrapperClassName="" />
      </div>

      <Footer />
    </>
  );
}
