import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import "../styles/UserDropDown.css";

interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}

interface UserDropdownProps {
  name?: string;
  surname?: string;
  showDropdown: boolean;
  onToggle: () => void;
  items: DropdownItem[];
}

export default function UserDropdown({
  name,
  surname,
  showDropdown,
  onToggle,
  items,
}: UserDropdownProps) {

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    navigate("/");
    window.location.reload();
  };

  return (
    <div className="dashboard-user-wrapper">

      <div className="dashboard-manager-info">
        <span className="dashboard-manager-name">
          {name} {surname}
        </span>
      </div>

      <button
        className="dashboard-account-btn"
        onClick={onToggle}
      >
        <FaUserCircle size={22} />
      </button>

      {showDropdown && (
        <div className="dashboard-account-dropdown">

          {items.map((item, index) => (
            <button
              key={index}
              className={`dashboard-dropdown-item ${
                item.danger ? "danger" : ""
              }`}
              onClick={item.onClick}
            >
              {item.icon} {item.label}
            </button>
          ))}

          {/* fixed logout button */}
          <button
            className="dashboard-dropdown-item danger"
            onClick={handleLogout}
          >
            <FaSignOutAlt size={16} /> Logout
          </button>

        </div>
      )}
    </div>
  );
}