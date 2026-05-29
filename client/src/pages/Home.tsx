// src/pages/Home.jsx

import Button from "../components/Button.tsx";
import Layout from "../components/Layout.tsx";
import MapView from "../components/Map/MapView.tsx";
import SearchPanel from "../components/SearchPanel";
import DetailPanel from "../components/DetailPanel";
import { useSearch } from "../hooks/useSearch";
import { useState, useEffect } from "react";
import "../styles/HomePage.css";
import { getBasicInfo } from "../services/structureService";
import { userBasicInfo } from "../services/userService";
import { useNavigate } from 'react-router-dom';
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
    piFilters,
    setPIFilters,
    structureFilters,
    setStructureFilters,
  } = useSearch();
  const [selected, setSelected] = useState<any>(null);
  const [selectedTrail, setSelectedTrail] = useState<any>(null);
  const [selectedPI, setSelectedPI] = useState<any>(null);
  const [structures, setStructures] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name : string } | null>(null);

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

    if (role === 'structure_manager') {
        setIsAuthenticated(true);
        setUser({ name: 'Manager' });
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
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (token && role === 'structure_manager') {
        navigate('/structure/dashboard');
    }
    
}, []);

  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsAuthenticated(false);
    setUser(null);
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
                    <div>
                        <Button className="button-welcome">Welcome {user?.name}</Button>
                    </div>

                    <div>
                        <Button to="/tripplanning">Trip Planning</Button>
                    </div>

                    <Button onClick={handleLogout}>Logout</Button>
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
          onSelect={(r) => {
              setSelected(r);
              if (r.type === "pi") {
                  setSelectedPI(r);
                  setSelectedTrail(null);
              } else if (r.type === "trail") {
                  setSelectedTrail(r);
                  setSelectedPI(null);
              } else {
                  setSelectedTrail(null);
                  setSelectedPI(null);
              }
          }}
          selected={selected}
          mode={mode}
          setMode={setMode}
          trailFilters={trailFilters}
          setTrailFilters={setTrailFilters}
          structureFilters={structureFilters}
          setStructureFilters={setStructureFilters}
          piFilters={piFilters}
          setPIFilters={setPIFilters}
        />
        <div className="home-map">
            <MapView
                structures={structures}
                onSelectStructure={(s) => {
                    setSelected(s);
                    setSelectedTrail(null);
                    setSelectedPI(null);
                }}
                onSelectTrail={(t) => {
                    setSelected(t);
                    setSelectedTrail(t);
                    setSelectedPI(null);
                }}
                onSelectPI={(pi) => {
                    setSelected(pi);
                    setSelectedPI(pi);
                    setSelectedTrail(null);
                }}
                selectedTrail={selectedTrail}
                selectedPI={selectedPI}
                selected={selected}
            />
        </div>
        <DetailPanel selected={selected} onClose={() => {
            setSelected(null)
            setSelectedTrail(null)
            setSelectedPI(null)
        }} />
      </div>
    </Layout>
  );
}

export default Home;
