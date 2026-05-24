import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout.tsx";
import Button from "../components/Button.tsx";
import { userBasicInfo } from "../services/userService";
import UserDropdown from "../components/UserDropDown.tsx";
import { FaArrowLeft, FaSignOutAlt } from "react-icons/fa";
import "../styles/UserSettings.css";

interface User {
  name: string;
  surname: string;
  username: string;
  dateOfBirth: string;
}

function UserSettings() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // ── editable form ────────────────────────────────────────────────
  const [form, setForm] = useState<User>({
    name: "",
    surname: "",
    username: "",
    dateOfBirth: "",
  });
  const [original, setOriginal] = useState<User>({
    name: "",
    surname: "",
    username: "",
    dateOfBirth: "",
  });

  // ── password fields ──────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  // ── password validation ──────────────────────────────────────────
  const hasMinLength = newPassword.length >= 8;
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword;
  const passwordFilled =
    currentPassword.length > 0 &&
    newPassword.length > 0 &&
    confirmPassword.length > 0;
  const passwordValid = hasMinLength && hasSpecialChar && passwordsMatch;

  // ── has anything changed? ────────────────────────────────────────
  const infoChanged =
    form.name !== original.name ||
    form.surname !== original.surname ||
    form.username !== original.username;

  const canSave = infoChanged || (passwordFilled && passwordValid);

  // ── fetch user on mount ──────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    userBasicInfo(token)
      .then((data) => {
        setUser(data);
        setIsAuthenticated(true);
        // populate form with real user data
        const date = new Date(data.date_of_birth).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
        console.log(date);
        const userData = {
          name: data.name ?? "",
          surname: data.surname ?? "",
          username: data.username ?? "",
          dateOfBirth: date ?? "",
        };
        setForm(userData);
        setOriginal(userData);
      })
      .catch(() => {
        setIsAuthenticated(false);
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/");
      });
  }, []); // ← add empty array so it only runs once on mount

  // ── handlers ────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsAuthenticated(false);
    setUser(null);
    navigate("/");
  };

  const handleChange = (field: keyof User, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      // TODO: replace with real API call
      // await updateUser({ ...form, currentPassword, newPassword });
      await new Promise((r) => setTimeout(r, 800));

      setOriginal({ ...form });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 2500);
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
              label: "Back",
              icon: <FaArrowLeft size={16} />,
              onClick: () => navigate(-1),
            },
            {
              label: "Logout",
              icon: <FaSignOutAlt size={16} />,
              onClick: handleLogout,
              danger: true,
            },
          ]}
        />
      }
    >
      <div className="settings-page">
        {/* ── Header ───────────────────────────── */}
        <div className="settings-header">
          <h1 className="settings-title">Settings</h1>
        </div>

        <div className="settings-body">
          {/* ── Personal Info ────────────────────── */}
          <section className="settings-section">
            <h2 className="settings-section-title">Personal Info</h2>
            <p className="settings-section-subtitle">
              Update your name and username. Date of birth cannot be changed.
            </p>

            <div className="settings-fields">
              <div className="settings-row">
                <div className="settings-field">
                  <label className="settings-label">First name</label>
                  <input
                    className="settings-input"
                    type="text"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                </div>
                <div className="settings-field">
                  <label className="settings-label">Last name</label>
                  <input
                    className="settings-input"
                    type="text"
                    value={form.surname}
                    onChange={(e) => handleChange("surname", e.target.value)}
                  />
                </div>
              </div>

              <div className="settings-field">
                <label className="settings-label">Username</label>
                <input
                  className="settings-input"
                  type="text"
                  value={form.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                />
              </div>

              <div className="settings-field">
                <label className="settings-label">Date of birth</label>
                <input
                  className="settings-input settings-input--disabled"
                  type="text"
                  value={form.dateOfBirth}
                  disabled
                />
                <span className="settings-hint">
                  Date of birth cannot be modified
                </span>
              </div>
            </div>
          </section>

          {/* ── Password ─────────────────────────── */}
          <section className="settings-section">
            <h2 className="settings-section-title">Change Password</h2>
            <p className="settings-section-subtitle">
              Leave these fields empty if you don't want to change your
              password.
            </p>

            <div className="settings-fields">
              <div className="settings-field">
                <label className="settings-label">Current password</label>
                <input
                  className="settings-input"
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div className="settings-field">
                <label className="settings-label">New password</label>
                <input
                  className={`settings-input ${
                    newPassword.length > 0
                      ? hasMinLength && hasSpecialChar
                        ? "settings-input--valid"
                        : "settings-input--invalid"
                      : ""
                  }`}
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                {newPassword.length > 0 && (
                  <div className="settings-password-hints">
                    <span
                      className={hasMinLength ? "hint-valid" : "hint-invalid"}
                    >
                      At least 8 characters
                    </span>
                    <span
                      className={hasSpecialChar ? "hint-valid" : "hint-invalid"}
                    >
                      At least one special character
                    </span>
                  </div>
                )}
              </div>

              <div className="settings-field">
                <label className="settings-label">Confirm new password</label>
                <input
                  className={`settings-input ${
                    confirmPassword.length > 0
                      ? passwordsMatch
                        ? "settings-input--valid"
                        : "settings-input--invalid"
                      : ""
                  }`}
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <span className="hint-invalid">Passwords do not match</span>
                )}
              </div>
            </div>
          </section>

          {/* ── Footer ───────────────────────────── */}
          <div className="settings-footer">
            {saveStatus === "saved" && (
              <span className="settings-saved-msg">
                ✓ Changes saved successfully
              </span>
            )}
            {saveStatus === "error" && (
              <span className="settings-error-msg">
                ✗ Something went wrong. Try again.
              </span>
            )}
            <Button
              disabled={!canSave || saveStatus === "saving"}
              onClick={handleSave}
            >
              {saveStatus === "saving" ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default UserSettings;
