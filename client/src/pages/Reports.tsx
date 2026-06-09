import React, { useState, useEffect, useCallback } from "react";
import Layout from "../components/Layout";
import UserDropdown from "../components/UserDropDown";
import { reportService } from "../services/reportService";
import { userBasicInfo } from "../services/userService";
import { useNavigate } from "react-router-dom";
import { FaCog, FaEdit, FaTrash } from "react-icons/fa";
import "../styles/Reports.css";

const Reports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");
  const [isCreating, setIsCreating] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<{ name: string; surname?: string } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  // Form state
  const [newReport, setNewReport] = useState({
    title: "",
    description: "",
    latitude: 46.0667, // Trento Default
    longitude: 11.1217,
    altitude: 194,
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/signin");
      return;
    }
    userBasicInfo(token)
      .then((data) => setUser(data))
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/signin");
      });
  }, [token, navigate]);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      let data: Report[];
      if (activeTab === "all") {
        data = await reportService.getReports();
      } else {
        if (token) {
          data = await reportService.getMyReports(token);
        } else {
          data = [];
        }
      }
      setReports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, token]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const reportData = {
        title: newReport.title,
        description: newReport.description,
        coordinates: {
          latitude: Number(newReport.latitude),
          longitude: Number(newReport.longitude),
          altitude: Number(newReport.altitude),
        },
      };
      await reportService.createReport(token, reportData);
      setIsCreating(false);
      setNewReport({
        title: "",
        description: "",
        latitude: 46.0667,
        longitude: 11.1217,
        altitude: 194,
      });
      fetchReports();
    } catch (err) {
      console.error(err);
      alert("Failed to create report");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingReport) return;
    try {
      const reportData = {
        title: editingReport.title,
        description: editingReport.description,
        coordinates: editingReport.coordinates,
      };
      await reportService.updateReport(token, editingReport._id, reportData);
      setEditingReport(null);
      fetchReports();
    } catch (err) {
      console.error(err);
      alert("Failed to update report");
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!token || !window.confirm("Are you sure you want to delete this report?")) return;
    try {
      await reportService.deleteReport(token, reportId);
      fetchReports();
    } catch (err) {
      console.error(err);
      alert("Failed to delete report");
    }
  };

  return (
    <Layout
      navChildren={
        <UserDropdown
          name={user?.name}
          surname={user?.surname}
          showDropdown={showDropdown}
          onToggle={() => setShowDropdown(!showDropdown)}
          items={[
            {
              label: "Settings",
              icon: <FaCog size={16} />,
              onClick: () => navigate("/user/settings"),
            },
          ]}
        />
      }
    >
      <div className="reports-container">
        <div className="reports-header">
          <div className="reports-tabs">
            <button
              className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All Reports
            </button>
            <button
              className={`tab-btn ${activeTab === "my" ? "active" : ""}`}
              onClick={() => setActiveTab("my")}
            >
              My Reports
            </button>
          </div>
          <button
            className="create-report-btn"
            onClick={() => setIsCreating(true)}
          >
            Create Report
          </button>
        </div>

        {loading ? (
          <p className="loading-text">Loading reports...</p>
        ) : (
          <div className="reports-list">
            {reports.length > 0 ? (
              reports.map((report) => (
                <div key={report._id} className="report-card">
                  <div className="report-card-header">
                    <div className="report-card-header-top">
                      <h3>{report.title}</h3>
                      <span className={`report-status status-${report.status}`}>
                        {report.status}
                      </span>
                    </div>
                  </div>
                  <p className="report-desc">{report.description}</p>
                  
                  {activeTab === "my" && (
                    <div className="report-card-actions">
                      <button 
                        className="action-btn edit-btn" 
                        onClick={() => setEditingReport(report)}
                        title="Edit report"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="action-btn delete-btn" 
                        onClick={() => handleDelete(report._id)}
                        title="Delete report"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  )}

                  <div className="report-meta">
                    <div className="report-meta-item">
                      <strong>Coords:</strong> {report.coordinates.latitude.toFixed(4)},{" "}
                      {report.coordinates.longitude.toFixed(4)}
                    </div>
                    <div className="report-meta-item">
                      <strong>Date:</strong> {new Date(report.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-reports">No reports found.</p>
            )}
          </div>
        )}

        {isCreating && (
          <div className="modal-overlay" onClick={() => setIsCreating(false)}>
            <div className="creation-box" onClick={(e) => e.stopPropagation()}>
              <h2>Create New Report</h2>
              <form onSubmit={handleCreate} className="report-form">
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    placeholder="Brief summary of the issue"
                    required
                    value={newReport.title}
                    onChange={(e) =>
                      setNewReport({ ...newReport, title: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    placeholder="Detailed explanation"
                    required
                    value={newReport.description}
                    onChange={(e) =>
                      setNewReport({ ...newReport, description: e.target.value })
                    }
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Latitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={newReport.latitude}
                      onChange={(e) =>
                        setNewReport({ ...newReport, latitude: e.target.value as any })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Longitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={newReport.longitude}
                      onChange={(e) =>
                        setNewReport({ ...newReport, longitude: e.target.value as any })
                      }
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Altitude (m)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newReport.altitude}
                    onChange={(e) =>
                      setNewReport({ ...newReport, altitude: e.target.value as any })
                    }
                  />
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setIsCreating(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    Submit Report
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {editingReport && (
          <div className="modal-overlay" onClick={() => setEditingReport(null)}>
            <div className="creation-box" onClick={(e) => e.stopPropagation()}>
              <h2>Modify Report</h2>
              <form onSubmit={handleUpdate} className="report-form">
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    required
                    value={editingReport.title}
                    onChange={(e) =>
                      setEditingReport({ ...editingReport, title: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    required
                    value={editingReport.description}
                    onChange={(e) =>
                      setEditingReport({ ...editingReport, description: e.target.value })
                    }
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Latitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={editingReport.coordinates.latitude}
                      onChange={(e) =>
                        setEditingReport({
                          ...editingReport,
                          coordinates: {
                            ...editingReport.coordinates,
                            latitude: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Longitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={editingReport.coordinates.longitude}
                      onChange={(e) =>
                        setEditingReport({
                          ...editingReport,
                          coordinates: {
                            ...editingReport.coordinates,
                            longitude: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Altitude (m)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editingReport.coordinates.altitude}
                    onChange={(e) =>
                      setEditingReport({
                        ...editingReport,
                        coordinates: {
                          ...editingReport.coordinates,
                          altitude: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setEditingReport(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Reports;
