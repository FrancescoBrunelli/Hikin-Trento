import { FaUserCircle } from 'react-icons/fa';
import '../styles/UserDropDown.css';

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
  items: DropdownItem[];   // ← configurable items
}


export default function UserDropdown({ 
  name, 
  surname, 
  showDropdown, 
  onToggle,
  items
}: UserDropdownProps) {
  return (
    <div className="dashboard-user-wrapper">
      <div className="dashboard-manager-info">
        <span className="dashboard-manager-name">{name} {surname}</span>
      </div>
      <button className="dashboard-account-btn" onClick={onToggle}>
        <FaUserCircle size={22} />
      </button>
      {showDropdown && (
        <div className="dashboard-account-dropdown">
          {items.map((item, index) => (
            <button
              key={index}
              className={`dashboard-dropdown-item ${item.danger ? 'danger' : ''}`}
              onClick={item.onClick}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}