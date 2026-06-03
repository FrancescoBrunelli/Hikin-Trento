import { NavLink } from "react-router-dom";
import ThemeToggle from "./ThemeToggle.tsx";
import logo from "../assets/HikinTrentoLogo_noBackground.png";
import "../styles/NavBar.css";
import Button from "./Button.tsx";
import SideBar from "./SideBar.tsx";
import { useState, useEffect } from "react";

export default function NavBar({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <div className="logo">
            <Button className="logo-button" onClick={() => setOpen(true)}>
              <img src={logo} alt="Hikin'Trento Logo" />
            </Button>
          </div>
          <div className="navbar-title">
            <h1>
              <NavLink to="/">HikinTrento</NavLink>
            </h1>
            <p>Your one-stop destination for hiking adventures.</p>
          </div>
        </div>
        <div className="navbar-right">
          {children} {/* ← buttons go here */}
          <ThemeToggle />
        </div>
      </nav>

      <SideBar open={open} setOpen={setOpen} />
    </>
  );
}
