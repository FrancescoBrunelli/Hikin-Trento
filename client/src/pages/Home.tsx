// src/pages/Home.jsx

import Button from "../components/Button.tsx";
import Layout from "../components/Layout.tsx";
import MapView from "../components/Map/MapView.tsx";
import SearchPanel from "../components/SearchPanel";
import DetailPanel from "../components/DetailPanel";
import { useSearch } from "../hooks/useSearch";
import { useState, useEffect } from "react";
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
import "../styles/HomePage.css";
import { getBasicInfo } from "../services/structureService";
import { userBasicInfo } from "../services/userService";
import { useNavigate } from "react-router-dom";
import UserDropdown from "../components/UserDropDown";
function Home() {
  const {
    query,
    setQuery,
    results,
    handleSearch,
    mode,
    setMode,
    trailFilters,
    setTrailFilters,
    structureFilters,
    setStructureFilters,
  } = useSearch();
  const [selected, setSelected] = useState<any>(null);
  const [selectedTrail, setSelectedTrail] = useState<any>(null);
  const [structures, setStructures] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name: string; surname: string } | null>(
    null,
  );
  const [showDropdown, setShowDropdown] = useState(false);

  //const [user, setUser] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    getBasicInfo({
      radius: 0, // 0 = all structures
      show_managed: true,
      show_unmanaged: true,
    })
      .then((data) => {
        console.log("structures:", data);
        setStructures(data);
      })

      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      setIsAuthenticated(false);
      localStorage.removeItem("role"); // clean up role if no token
      return;
    }

    if (role === "structure_manager") {
      setIsAuthenticated(true);
      setUser({ name: "Manager" });
      return;
    }

    userBasicInfo(token)
      .then((data) => {
        setUser(data);
        setIsAuthenticated(true);
      })
      .catch(() => {
        setIsAuthenticated(false);
        localStorage.removeItem("token");
        localStorage.removeItem("role"); // clean up role on token failure
      });
  }, []);
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role === "structure_manager") {
      navigate("/structure/dashboard");
    }
  }, []);

  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsAuthenticated(false);
    setUser(null);
  };

  const handleSettings = () => {
    navigate("/user/settings");
  };

  return (
    <Layout
      navChildren={
        <>
          {!isAuthenticated ? (
            <>
              <Button to="/signup">Sign Up</Button>

              <Button to="/chooselogin">Sign In</Button>
            </>
          ) : (
            <>
              <UserDropdown
                name={user?.name}
                surname={user?.surname}
                showDropdown={showDropdown}
                onToggle={() => setShowDropdown(!showDropdown)}
                items={[
                  {
                    label: 'Settings',
                    icon: <FaCog size={16} />,
                    onClick: handleSettings
                  },
                  {
                    label: 'Logout',
                    icon: <FaSignOutAlt size={16} />,
                    onClick: handleLogout,
                    danger: true
                  }
                ]}
              />
            </>
          )}
        </>
      }
    >
      <div className="home-container">
        <SearchPanel
          query={query}
          setQuery={setQuery}
          results={results}
          onSearch={handleSearch}
          onSelect={setSelected}
          selected={selected}
          mode={mode}
          setMode={setMode}
          trailFilters={trailFilters}
          setTrailFilters={setTrailFilters}
          structureFilters={structureFilters}
          setStructureFilters={setStructureFilters}
        />
        <div className="home-map">
          <MapView
            structures={structures}
            onSelectStructure={setSelected}
            onSelectTrail={(t) => {
              setSelected(t);
              setSelectedTrail(t);
            }}
            selectedTrail={selectedTrail}
            selected={selected}
          />
        </div>
        <DetailPanel
          selected={selected}
          onClose={() => {
            setSelected(null);
            setSelectedTrail(null);
          }}
        />
      </div>
    </Layout>
  );
}

export default Home;
