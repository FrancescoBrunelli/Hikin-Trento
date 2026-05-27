import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout.tsx";
import Button from "../components/Button.tsx";
import { managedStructureBasicInfo } from "../services/managedStructureService";
import UserDropdown from "../components/UserDropDown.tsx";
import { FaArrowLeft, FaSignOutAlt } from "react-icons/fa";
import "../styles/UserSettings.css";
import { updateStructureInfo, updateStructurePassword } from "../services/managedStructureService";

interface ManagedStructure {
  name_owner: string;
  surname_owner: string;
  telephone: string;
}

function StructureSettings() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [managedStructure, setmanagedStructure] =
    useState<ManagedStructure | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // ── editable form ────────────────────────────────────────────────
  const [form, setForm] = useState<ManagedStructure>({
    name_owner: "",
    surname_owner: "",
    telephone: "",
  });
  const [original, setOriginal] = useState<ManagedStructure>({
    name_owner: "",
    surname_owner: "",
    telephone: "",
  });

  // ── password fields ──────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [saveInfoStatus, setSaveInfoStatus] = useState<
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
    form.name_owner !== original.name_owner ||
    form.surname_owner !== original.surname_owner ||
    form.telephone !== original.telephone;

  const canSave = infoChanged;
  const canPassSave = passwordFilled && passwordValid;

  // ── fetch user on mount ──────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    managedStructureBasicInfo(token)
      .then((data) => {
        setmanagedStructure(data);
        setIsAuthenticated(true);
        // populate form with real user data

        const structureData = {
          name_owner: data.name_owner ?? "",
          surname_owner: data.surname_owner ?? "",
          telephone: data.telephone ?? "",
        };
        setForm(structureData);
        setOriginal(structureData);
      })
      .catch(() => {
        setIsAuthenticated(false);
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/");
      });
  }, []);

  // ── handlers ────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsAuthenticated(false);
    setmanagedStructure(null);
    navigate("/");
  };

  const handleChange = (field: keyof ManagedStructure, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaveInfoStatus("saving");

    try {
      const token = localStorage.getItem("token");

      const response = await updateStructureInfo(token!, {
        name_owner: form.name_owner,
        surname_owner: form.surname_owner,
        telephone: form.telephone,
      });

      setmanagedStructure(response.managedStructure);

      setOriginal({ ...form });

      setSaveInfoStatus("saved");

      setTimeout(() => setSaveInfoStatus("idle"), 2500);
    } catch (err) {
      console.log(err);
      setSaveInfoStatus("error");

      setTimeout(() => setSaveInfoStatus("idle"), 2500);
    }
  };

  const handlePassSave = async () => {
    setSaveStatus("saving");

    try {
      const token = localStorage.getItem("token");
      await updateStructurePassword(token!, {
        curr_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setOriginal({ ...form });

      setSaveStatus("saved");

      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch (err) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 2500);
    }
  };

  return (
    <Layout
      navChildren={
        <UserDropdown
          name={managedStructure?.name_owner}
          surname={managedStructure?.surname_owner}
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
      <div className="settings-body">
        {/* ── Header ───────────────────────────── */}
        <div className="settings-header">
          <h1 className="settings-title">Settings</h1>
        </div>

        <div className="settings-sections-grid">
          <section className="settings-section">
            <h2 className="settings-section-title">Personal Owner Info</h2>
            <p className="settings-section-subtitle">
              Update your name and telephone.
            </p>

            <div className="settings-fields">
              <div className="settings-row">
                <div className="settings-field">
                  <label className="settings-label">First name</label>
                  <input
                    className="settings-input"
                    type="text"
                    value={form.name_owner}
                    onChange={(e) => handleChange("name_owner", e.target.value)}
                  />
                </div>
                <div className="settings-field">
                  <label className="settings-label">Last name</label>
                  <input
                    className="settings-input"
                    type="text"
                    value={form.surname_owner}
                    onChange={(e) =>
                      handleChange("surname_owner", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="settings-field">
                <label className="settings-label">Telephone</label>
                <input
                  className="settings-input"
                  type="text"
                  value={form.telephone}
                  onChange={(e) => handleChange("telephone", e.target.value)}
                />
              </div>
            </div>
            <Button
              disabled={!canSave || saveInfoStatus === "saving"}
              onClick={handleSave}
            >
              {saveInfoStatus === "saving" ? "Saving..." : "Save changes"}
            </Button>
            <div className="settings-footer">
              {saveInfoStatus === "saved" && (
                <span className="settings-saved-msg">
                  ✓ Changes saved successfully
                </span>
              )}
              {saveInfoStatus === "error" && (
                <span className="settings-error-msg">
                  ✗ Something went wrong. Try again.
                </span>
              )}
            </div>
          </section>

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
            <Button
              disabled={!canPassSave || saveStatus === "saving"}
              onClick={handlePassSave}
            >
              {saveStatus === "saving" ? "Saving..." : "Save changes"}
            </Button>
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
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}

export default StructureSettings;
