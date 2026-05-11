// src/pages/Home.jsx

import Button from "../components/Button.tsx";
import Layout from "../components/Layout.tsx";
import MapView from "../components/Map/MapView.tsx";
import SearchPanel from '../components/SearchPanel';
import DetailPanel from '../components/DetailPanel';
import { useSearch } from '../hooks/useSearch';
import { useState } from 'react';
import '../styles/HomePage.css';

function Home() {
  const { query, setQuery, results, handleSearch } = useSearch();
  const [selected, setSelected] = useState<any>(null);
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
            <MapView />
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





