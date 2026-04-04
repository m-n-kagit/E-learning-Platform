import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useNavigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
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
import { ClipLoader } from "react-spinners";
import "./styles.css";




function ProtectedRoute({ allowedRoles }) {
  const location = useLocation(); //used for determining the current path and 
  // also for redirecting the user to the login page if they 
  // are not authenticated and also for redirecting the user to 
  // the appropriate dashboard based on their role after they log in 
  // successfully
  const [isChecking, setIsChecking] = useState(true);
  const [user, setUser] = useState(null);
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    let isActive = true;
    let loaderTimeout;

    const checkAuth = async () => {
      try {
        const res = await axios.get("/api/auth/me", {
          withCredentials: true,
          // withCredentials is used to include cookies in the request,
          //  which is necessary for authentication when using JWTs stored 
          // in cookies.
        });

        if (!isActive) return;
        setUser(res.data?.data || null);
      }
      catch (error) {
        if (!isActive) return;
        setUser(null);
      } finally {
        if (!isActive) return;
        loaderTimeout = setTimeout(() => {
          if (!isActive) return;
          setIsChecking(false);
        }, 500);
      }
    };

    checkAuth();

    return () => {
      isActive = false;
      clearTimeout(loaderTimeout);
    };
  }, [location.pathname]);

  if (isChecking) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ClipLoader size={48} color="#1f5c10" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role) ) {
    //this statement means that if the user is logged in but 
    // their role is not included in the allowedRoles array, 
    // then we will redirect them to their respective dashboard based on their role.
    const roleHomeRoute = {
      user: "/student-dashboard",
      course_admin: "/course-admin",
      admin: "/global-admin",
    };

    return <Navigate to={roleHomeRoute[user.role] || "/login"} replace />;
    //why replace is used ? ans. 
    //The replace prop in the Navigate component is used to replace the current
    //  entry in the history stack instead of adding a new one.
    // This is particularly useful in authentication scenarios.
    //  When a user tries to access a protected route without
    //  being authenticated, they are redirected to the login page. 
    // After successful login, you typically want to redirect them
    //  back to the original protected route they were trying to 
    // access. By using replace, you ensure that the navigation 
    // history is clean and doesn't include the intermediate login page, providing a smoother user experience.
  }

  return <Outlet />;
  // The Outlet component is a placeholder that renders the matched
  //  child route components.
}

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dashboardRoutes = ["/course-admin", "/global-admin", "/student-dashboard"];
  const showNavbar = !dashboardRoutes.includes(location.pathname);

  async function directTo() {
    if(localStorage.getItem("hasSession") === "true") {
    try {
      await axios.get("/api/auth/me", {
        withCredentials: true, //sending credentials from cookies with the request to check if the user is authenticated or not
      }).then((response) => {
        const userRole = response?.data?.data?.role;
        if (userRole === "user") {
          navigate("/student-dashboard");
        }
        else if (userRole === "course_admin") {
          navigate("/course-admin");
        }
        else if (userRole === "admin") {
          navigate("/global-admin");
        }
        else {
          return 
        }
      })

    }
    catch (error) {
      // console.error(error)
    }
  }}

  useEffect(() => {
    directTo();
  }, [location.pathname]);


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

        <Route element={<ProtectedRoute allowedRoles={["course_admin"]} />}>
          <Route path="/course-admin" element={<CourseAdminDashboard />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/global-admin" element={<GlobalAdminDashboard />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
          <Route path="/student-dashboard" element={<StudentDashboard />} />
        </Route>
      </Routes>
    </>
  );
}
