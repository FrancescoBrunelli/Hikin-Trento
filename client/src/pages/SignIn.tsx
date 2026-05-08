//src/pages/SignIn.jsx
import {Link, useNavigate} from "react-router-dom";
import { useState } from "react";
import { FaEye, FaEyeSlash} from 'react-icons/fa';
import Button from "../components/Button.tsx";
import "../styles/Auth.css";
import Layout from "../components/Layout.tsx";

function SignIn() {
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(false);
    const navigate = useNavigate();
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const response = await fetch("/api/signin", {
            method: "POST",
            body: new FormData(e.target as HTMLFormElement),
        })

        if (!response.ok) {
            setError(true)
        } else {
            setError(false)
            navigate("/home")
        }
    }

    return (
        <Layout>
            <div className="signin-card">
                <h1>Sign In</h1>
                <form action="/api/signin" method="POST" className="signin-form" onSubmit={handleSubmit}>
                    {/*
                    <label htmlFor="email-input">Email</label>
                    <input
                        autoComplete="email"
                        id="email-input"
                        type="email"
                        name="userEmail"
                    />
                    */}
                    <div className="input-group">
                        <label htmlFor="username-input">Username</label>
                        <input
                            autoComplete="username"
                            id="username-input"
                            type="text"
                            name="userUsername"
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password-input">Password</label>
                        <div className={`password-wrapper ${error ? "invalid" : ""}`}>
                            <input
                                id="password-input"
                                type={showPassword ? "text" : "password"}
                                name="userPassword"
                            />
                            <Button onClick={() => setShowPassword(!showPassword)} type="button">
                                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                            </Button>
                        </div>
                        {error && <p className="error-message">Invalid username or password</p>}
                    </div>
                    <Button type="submit">Sign In</Button>
                    <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
                </form>
            </div>
        </Layout>
    )
}

export default SignIn;