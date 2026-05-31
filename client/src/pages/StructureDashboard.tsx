import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EventsPanel from "./Events.tsx";
import {
  FaCalendarAlt,
  FaStar,
  FaChartBar,
  FaMapMarkerAlt,
  FaUserCircle,
  FaSignOutAlt,
  FaCog,
  FaPhone,
  FaRegCalendarPlus,
  FaRegBell,
  FaExclamationTriangle
} from "react-icons/fa";
import Button from "../components/Button.tsx";
import Tabs from "../components/Tabs.tsx";
import ThemeToggle from "../components/ThemeToggle.tsx";
import AnnouncementsPanel from "./Announcements.tsx";
import { reportService, type Report } from "../services/reportService";
import "../styles/StructureDashboard.css";
import "../styles/Tabs.css";

function StructureDashboard() {
  const navigate = useNavigate();
  const [manager, setManager] = useState<any>(null);
  const [structure, setStructure] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [activeTab, setActiveTab] = useState('bookings');
  useEffect(() => {
    if (activeTab === "reports") {
      reportService.getReports().then(setReports).catch(console.error);
    }
  }, [activeTab]);

  const handleStatusUpdate = async (reportId: string, newStatus: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await reportService.updateReportStatus(token, reportId, newStatus);
      // Refresh reports
      const updatedReports = await reportService.getReports();
      setReports(updatedReports);
    } catch (err: any) {
      alert(err.message);
    }
  };


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

  // Tab content renderer
  const renderContent = () => {
    switch (activeTab) {
      case "bookings":
        return (
          <div className="dashboard-card">
            <h2>
              <FaCalendarAlt /> Bookings
            </h2>
            <p className="dashboard-empty">No bookings yet</p>
          </div>
        );
      case "reviews":
        return (
          <div className="dashboard-card">
            <h2>
              <FaStar /> Reviews
            </h2>
            <p className="dashboard-empty">No reviews yet</p>
          </div>
        );
      case "stats":
        return (
          <div className="dashboard-card">
            <h2>
              <FaChartBar /> Statistics
            </h2>
            <p className="dashboard-empty">No data yet</p>
          </div>
        );
      case "info":
        return (
          <div className="dashboard-card">
            <h2>
              <FaMapMarkerAlt /> Structure Information
            </h2>
            <div className="dashboard-info-grid">
              <div className="dashboard-info-item">
                <span className="dashboard-info-label">Structure Name</span>
                <span className="dashboard-info-value">{structure?.name}</span>
              </div>
              <div className="dashboard-info-item">
                <span className="dashboard-info-label">Altitude</span>
                <span className="dashboard-info-value">
                  {structure?.coordinates?.altitude}m
                </span>
              </div>
              <div className="dashboard-info-item">
                <span className="dashboard-info-label">Latitude</span>
                <span className="dashboard-info-value">
                  {structure?.coordinates?.latitude}
                </span>
              </div>
              <div className="dashboard-info-item">
                <span className="dashboard-info-label">Longitude</span>
                <span className="dashboard-info-value">
                  {structure?.coordinates?.longitude}
                </span>
              </div>
              <div className="dashboard-info-item">
                <span className="dashboard-info-label">Manager</span>
                <span className="dashboard-info-value">
                  {manager?.name_owner} {manager?.surname_owner}
                </span>
              </div>
              <div className="dashboard-info-item">
                <span className="dashboard-info-label">Telephone</span>
                <span className="dashboard-info-value">
                  {manager?.telephone}
                </span>
              </div>
            </div>
            <div style={{ marginTop: "16px" }}>
              <Button>Edit Information</Button>
            </div>
          </div>
        );
      case "events":
        return (
            <div className="dashboard-card">
              <h2>
                <FaRegCalendarPlus /> Events
              </h2>
              <EventsPanel />
            </div>
        );
      case "announcements":
        return (
            <div className="dashboard-card">
              <h2>
                <FaRegBell /> Announcements
              </h2>
              <AnnouncementsPanel />
            </div>
        );
      case "reports":
        return (
          <div className="dashboard-card">
            <h2>
              <FaExclamationTriangle /> User Reports
            </h2>
            <div className="dashboard-reports-list">
              {reports.length > 0 ? (
                reports.map((report) => (
                  <div key={report._id} className="dashboard-report-item">
                    <div className="report-info">
                      <h3>{report.title}</h3>
                      <p>{report.description}</p>
                      <small>
                        Coords: {report.coordinates.latitude}, {report.coordinates.longitude}
                      </small>
                    </div>
                    <div className="report-actions">
                      <select
                        value={report.status}
                        onChange={(e) => handleStatusUpdate(report._id, e.target.value)}
                        className={`status-select status-${report.status}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                  </div>
                ))
              ) : (
                <p className="dashboard-empty">No reports found</p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="dashboard-page">
      {/* TOP BAR */}
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

      {/* TABS */}
      <div className="dashboard-tabs">
        <button
          className={`dashboard-tab ${activeTab === "bookings" ? "active" : ""}`}
          onClick={() => setActiveTab("bookings")}
        >
          <FaCalendarAlt /> Bookings
        </button>
        <button
          className={`dashboard-tab ${activeTab === "reviews" ? "active" : ""}`}
          onClick={() => setActiveTab("reviews")}
        >
          <FaStar /> Reviews
        </button>
        <button
          className={`dashboard-tab ${activeTab === "stats" ? "active" : ""}`}
          onClick={() => setActiveTab("stats")}
        >
          <FaChartBar /> Statistics
        </button>
        <button
          className={`dashboard-tab ${activeTab === "info" ? "active" : ""}`}
          onClick={() => setActiveTab("info")}
        >
          <FaMapMarkerAlt /> Structure Info
        </button>
        <button
            className={`dashboard-tab ${activeTab === "events" ? "active" : ""}`}
            onClick={() => setActiveTab("events")}
        >
          <FaRegCalendarPlus /> Events
        </button>
        <button
            className={`dashboard-tab ${activeTab === "announcements" ? "active" : ""}`}
            onClick={() => setActiveTab("announcements")}
        >
          <FaRegBell /> Announcements
        </button>
        <button
            className={`dashboard-tab ${activeTab === "reports" ? "active" : ""}`}
            onClick={() => setActiveTab("reports")}
        >
          <FaExclamationTriangle /> Reports
        </button>
      </div>

      {/* CONTENT */}
      <div className="dashboard-content">{renderContent()}</div>
    </div>
  );
}

export default StructureDashboard;