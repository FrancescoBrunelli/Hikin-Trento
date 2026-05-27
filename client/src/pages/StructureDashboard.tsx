import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaStar,
  FaChartBar,
  FaMapMarkerAlt,
  FaUserCircle,
  FaSignOutAlt,
  FaCog,
  FaPhone,
} from "react-icons/fa";
import Button from "../components/Button.tsx";
import Tabs from "../components/Tabs.tsx";
import ThemeToggle from "../components/ThemeToggle.tsx";
import "../styles/StructureDashboard.css";
import "../styles/Tabs.css";

function StructureDashboard() {
  const navigate = useNavigate();
  const [manager, setManager] = useState<any>(null);
  const [structure, setStructure] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "structure_manager") {
      navigate("/structuresignin");
      return;
    }

    const managerData =
      JSON.parse(localStorage.getItem("manager") || "null") || {};
    const structureData =
      JSON.parse(localStorage.getItem("structure") || "null") || {};
    setManager(managerData);
    setStructure(structureData);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("manager");
    localStorage.removeItem("structure");
    navigate("/");
  };

  const handleSettings = () => {
    navigate("/structure/settings");
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-topbar">
        <div className="dashboard-topbar-left">
          <h1 className="dashboard-structure-name">{structure?.name}</h1>
          <p className="dashboard-structure-location">
            {structure?.coordinates?.latitude},{" "}
            {structure?.coordinates?.longitude} ·{" "}
            {structure?.coordinates?.altitude}m
          </p>
        </div>
        <div className="dashboard-topbar-right">
          <div className="dashboard-manager-info">
            <span className="dashboard-manager-name">
              {manager?.name_owner} {manager?.surname_owner}
            </span>
            <span className="dashboard-manager-role">Structure Manager</span>
          </div>
          <div className="dashboard-dropdown-wrapper">
            <button
              className="dashboard-account-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
            >
              <FaUserCircle size={22} />
            </button>
            {showDropdown && (
              <div
                className="dashboard-account-dropdown"
                onClick={(e) => e.stopPropagation()}
              >
                <button className="dashboard-dropdown-item" onClick={handleSettings}>
                  <FaCog size={16} /> Settings
                </button>
                <button className="dashboard-dropdown-item danger" onClick={handleLogout}>
                  <FaSignOutAlt size={16} /> Logout
                </button>
              </div>
            )}
          </div>
          <ThemeToggle />
        </div>
      </div>

      <Tabs
        storageKey="structure_dashboard_tab"
        tabs={[
          {
            id: "bookings",
            label: "Bookings",
            icon: <FaCalendarAlt />,
            content: (
              <div className="dashboard-card">
                <h2><FaCalendarAlt /> Bookings</h2>
                <p className="dashboard-empty">No bookings yet</p>
              </div>
            ),
          },
          {
            id: "reviews",
            label: "Reviews",
            icon: <FaStar />,
            content: (
              <div className="dashboard-card">
                <h2><FaStar /> Reviews</h2>
                <p className="dashboard-empty">No reviews yet</p>
              </div>
            ),
          },
          {
            id: "stats",
            label: "Statistics",
            icon: <FaChartBar />,
            content: (
              <div className="dashboard-card">
                <h2><FaChartBar /> Statistics</h2>
                <p className="dashboard-empty">No data yet</p>
              </div>
            ),
          },
          {
            id: "info",
            label: "Structure Info",
            icon: <FaMapMarkerAlt />,
            content: (
              <div className="dashboard-card">
                <h2><FaMapMarkerAlt /> Structure Information</h2>
                <div className="dashboard-info-grid">
                  <div className="dashboard-info-item">
                    <span className="dashboard-info-label">Structure Name</span>
                    <span className="dashboard-info-value">{structure?.name}</span>
                  </div>
                  <div className="dashboard-info-item">
                    <span className="dashboard-info-label">Altitude</span>
                    <span className="dashboard-info-value">{structure?.coordinates?.altitude}m</span>
                  </div>
                  <div className="dashboard-info-item">
                    <span className="dashboard-info-label">Latitude</span>
                    <span className="dashboard-info-value">{structure?.coordinates?.latitude}</span>
                  </div>
                  <div className="dashboard-info-item">
                    <span className="dashboard-info-label">Longitude</span>
                    <span className="dashboard-info-value">{structure?.coordinates?.longitude}</span>
                  </div>
                  <div className="dashboard-info-item">
                    <span className="dashboard-info-label">Manager</span>
                    <span className="dashboard-info-value">
                      {manager?.name_owner} {manager?.surname_owner}
                    </span>
                  </div>
                  <div className="dashboard-info-item">
                    <span className="dashboard-info-label">Telephone</span>
                    <span className="dashboard-info-value">{manager?.telephone}</span>
                  </div>
                </div>
                <div style={{ marginTop: "16px" }}>
                  <Button>Edit Information</Button>
                </div>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}

export default StructureDashboard;