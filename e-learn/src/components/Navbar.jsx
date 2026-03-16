import { NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const links = [
    { label: "Home",       to: "/"        },
    { label: "About Us",   to: "/about"   },
    { label: "Explore",    to: "/explore" },
    { label: "Contact Us", to: "/contact" },
  ];

  return (
    <nav className="navbar">
      <div className="nav-logo" onClick={() => navigate("/")}>Learn<span>Sphere</span></div>

      <ul className="nav-links">
        {links.map((l) => (
          <li key={l.to}>
            <NavLink to={l.to} end={l.to === "/"}>
              {({ isActive }) => (
                <button className={isActive ? "active" : ""}>{l.label}</button>
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="nav-auth">
        <button className="btn-ghost" onClick={() => navigate("/login")}>Login</button>
        <button className="btn-fill"  onClick={() => navigate("/signup")}>Sign Up</button>
      </div>
    </nav>
  );
}
