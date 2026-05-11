// src/pages/Home.jsx

import Button from "../components/Button.tsx";
import Layout from "../components/Layout.tsx";
import MapView from "../components/Map/MapView.tsx";
import SearchPanel from '../components/SearchPanel';
import DetailPanel from '../components/DetailPanel';
import { useSearch } from '../hooks/useSearch';
import { useState, useEffect } from 'react';
import '../styles/HomePage.css';
import { getBasicInfo } from '../services/structureService';



function Home() {
  const { query, setQuery, results, handleSearch } = useSearch();
  const [selected, setSelected] = useState(null);
  const [structures, setStructures] = useState([]);

  useEffect(() => {
    getBasicInfo({
      radius: 0,           // 0 = all structures
      show_managed: true,
      show_unmanaged: true
    })
      .then(data => {
        console.log('structures:', data);
        setStructures(data)
      })
      
      .catch(err => console.error(err));
  }, []);
  
    return (
      <Layout navChildren={
        <>
          <Button to="/signup" onClick={() => console.log("Clicked SingUp")}>Sign Up</Button>

          <Button to="/signin" onClick={() => console.log("Clicked SingIn")}>Sign In</Button>
        </>
      }>
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
            <MapView structures={structures} onSelect={setSelected}/>
          </div>
          <DetailPanel
            selected={selected}
            onClose={() => setSelected(null)}
          />
        </div>  
      </Layout>
    );
}

export default Home;





