//src/pages/SignUp.jsx
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash, FaSun, FaMoon} from 'react-icons/fa';
import Button from "../components/Button.tsx";
import "../styles/Auth.css";

function SignUp() {
    const [showPassword, setShowPassword] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const hasMinLength = (value: string) => value.length >= 8;
    const hasSpecialChar = (value: string) => /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const isValid = (value: string) => hasMinLength(value) && hasSpecialChar(value);
    const [password, setPassword] = useState("");
    useEffect(()=> {
        document.documentElement.classList.toggle("dark-mode", darkMode);
    }, [darkMode])
    return (
        <div className="page">
            <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
            </button>
            <div className="signup-card">
                <h1>Sign Up</h1>
                <form action="/api/signup" method="POST" className="signup-form">
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
                        <label htmlFor="name-input">First name</label>
                        <input
                            autoComplete="name"
                            id="name-input"
                            type="text"
                            name="userName"
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="surname-input">Last name</label>
                        <input
                            autoComplete="surname"
                            id="surname-input"
                            type="text"
                            name="userSurname"
                        />
                    </div>
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
                        <label htmlFor="date-of-birth-input">Date of birth</label>
                        <input
                            autoComplete="date-of-birth"
                            id="date-of-birth-input"
                            type="date"
                            name="userDOB"
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password-input">Password</label>
                        <div className={`password-wrapper ${password.length > 0? (isValid(password) ? "valid" : "invalid") : ""}`}>
                            <input
                                id="password-input"
                                type={showPassword ? "text" : "password"}
                                onChange={(e) => setPassword(e.target.value)}
                                name="userPassword"
                            />
                            <Button onClick={() => setShowPassword(!showPassword)} type="button">
                                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                            </Button>
                        </div>
                    </div>
                    {password.length > 0 && (
                        <div id="password-hint">
                            <p className={hasMinLength(password)? "hint-valid" : "hint-invalid"}>
                                At least 8 characters
                            </p>
                            <p className={hasSpecialChar(password)? "hint-valid" : "hint-invalid"}>
                                At least one special character
                            </p>
                        </div>
                    )}
                    <Button type="submit" disabled={!(isValid(password))}>Sign Up</Button>
                    <p>Already have an account? <Link to="/signin">Sign In</Link></p>
                    {/*
                    <p>By signing up, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.</p>
                    */}
                </form>
            </div>
        </div>
    )
}

export default SignUp;
