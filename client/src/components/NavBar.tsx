import { NavLink } from "react-router-dom";
import ThemeToggle from "./ThemeToggle.tsx";
import logo from "../assets/HikinTrentoLogo_noBackground.png"
import "../styles/NavBar.css"

export default function NavBar({ children }: { children?: React.ReactNode }) {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="logo">
          <img src={logo} alt="Hikin'Trento Logo" />
        </div>
        <div className="navbar-title">
          <h1>
            <NavLink to="/">HikinTrento</NavLink>
          </h1>
          <p>Your one-stop destination for hiking adventures.</p>
        </div>
      </div>
      <div className="navbar-right">
        
        {children}  {/* ← buttons go here */}
        <ThemeToggle/>
      </div>
    </nav>
  );
}
