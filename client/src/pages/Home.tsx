// src/pages/Home.jsx

import Button from "../components/Button.tsx";
import Layout from "../components/Layout.tsx";

function Home() {
    return (
        <Layout>
            <div>
                <h1>Welcome to HikinTrento</h1>
                <p>Your one-stop destination for hiking adventures.</p>
                <Button to="/signup" onClick={() => console.log("Clicked SingUp")}>Sign Up</Button>

                <Button to="/signin" onClick={() => console.log("Clicked SingIn")}>Sign In</Button>
            </div>
        </Layout>
    );
}

export default Home;
