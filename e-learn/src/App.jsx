import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";
//useLocation is a hook that returns the current location 
// object, which represents the current URL in the app. 
// It can be used to access the pathname, search parameters, and hash of the URL, allowing components to react to changes in the URL and render accordingly.
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Explore from "./pages/Explore";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Validate_otp from "./pages/Validate_otp";
import Forget_Password from "./pages/Forget_Password";
import CourseAdminDashboard from "./pages/CourseAdminDashboard";
import GlobalAdminDashboard from "./pages/GlobalAdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import './styles.css'

function UseAuthCheck() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("/api/auth/me", {
          withCredentials: true,
        });

        const user = res.data.data;

        if (user.role === "user") navigate("/student-dashboard");
        else if (user.role === "course_admin") navigate("/course-admin");
        else if (user.role === "admin") navigate("/global-admin");
      } catch (error) {
        // navigate("/");
      }
    };

    checkAuth();
  }, [navigate]);
}

export default function App() {
  return (
    <Router>
      <AppLayout />
      <UseAuthCheck />
    </Router>
  );
}

function AppLayout() {
  const location = useLocation();
  //location is an object that represents the current 
  // URL in the app.
  const dashboardRoutes = ["/course-admin", "/global-admin", "/student-dashboard"];
  const showNavbar = !dashboardRoutes.includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forget-password" element={<Forget_Password />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/validate-otp" element={<Validate_otp />} />
        <Route path="/course-admin" element={<CourseAdminDashboard />} />
        <Route path="/global-admin" element={<GlobalAdminDashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
      </Routes>
    </>
  );
}
