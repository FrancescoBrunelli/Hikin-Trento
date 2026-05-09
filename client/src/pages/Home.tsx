// src/pages/Home.jsx

import Button from "../components/Button.tsx";
import Layout from "../components/Layout.tsx";
import MapView from "../components/Map/MapView.tsx";

function Home() {
    return (
      <Layout navChildren={
        <>
          <Button to="/signup" onClick={() => console.log("Clicked SingUp")}>Sign Up</Button>

          <Button to="/signin" onClick={() => console.log("Clicked SingIn")}>Sign In</Button>
        </>
      }>
        <div style={{ height: '600px', width:'50%'  }}>
                <MapView />
        </div>  
      </Layout>
    );
}

export default Home;
