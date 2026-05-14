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

function Home() {
  const { query, setQuery, results, handleSearch } = useSearch();
  const [selected, setSelected] = useState(null);
  const [structures, setStructures] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

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

    if (!token) {
      setIsAuthenticated(false);
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
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
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
          onSelect={setSelected}
          selected={selected}
        />
        <div className="home-map">
          <MapView structures={structures} onSelect={setSelected} />
        </div>
        <DetailPanel selected={selected} onClose={() => setSelected(null)} />
      </div>
    </Layout>
  );
}

export default Home;
