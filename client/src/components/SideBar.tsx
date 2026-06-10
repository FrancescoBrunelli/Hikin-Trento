import { NavLink } from "react-router-dom";
import "../styles/SideBar.css";
import { FaHeart, FaRoute, FaHome, FaExclamationTriangle } from "react-icons/fa";

import { FaMap } from "react-icons/fa";
type SidebarProps = {
  open: boolean;
  setOpen: (v: boolean) => void;
};

const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const items = [
    { label: "Home", path: "/", icon: <FaHome />  },
    { label: "Favourites", path: "/user/favourites", icon: <FaHeart /> },
    { label: "Trip Planning", path: "/user/tripplanning", icon: <FaRoute /> },
    { label: "Reports", path: "/user/reports", icon: <FaExclamationTriangle /> },
    { label: "My Trips", path: "/user/mytrips", icon: <FaMap /> },
  ];

  return (
    <>
      {/* OVERLAY */}
      <div
        className={`sidebar-overlay ${open ? "show" : ""}`}
        onClick={() => setOpen(false)}
      />

      {/* SIDEBAR */}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        {/* HEADER */}
        <div className="sidebar-header">
          <h2>Menu</h2>

          <button className="sidebar-close-btn" onClick={() => setOpen(false)}>
            ✕
          </button>
        </div>

        {/* LINKS */}
        <nav className="sidebar-nav">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span>{item.label}</span>
              
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
