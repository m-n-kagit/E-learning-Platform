import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Explore from "./pages/Explore";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Validate_otp from "./pages/Validate_otp";
import './styles.css'

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/"        element={<Home />}    />
        <Route path="/about"   element={<About />}   />
        <Route path="/explore" element={<Explore />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login"   element={<Login />}   />
        <Route path="/signup"  element={<Signup />}  />
        <Route path="/validate-otp" element={<Validate_otp />} />
      </Routes>
    </Router>
  );
}
