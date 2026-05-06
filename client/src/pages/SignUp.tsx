//src/pages/SignUp.jsx
import { Link } from "react-router-dom";
import { useState } from "react";
import { FaEye, FaEyeSlash} from 'react-icons/fa';
import Button from "../components/Button.tsx";
import "./style/SignUp.css";

function SignUp() {
    const [showPassword, setShowPassword] = useState(false);
    return (
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
                    <div className="password-wrapper">
                        <input
                            autoComplete="new-password"
                            id="password-input"
                            minLength={8}
                            type={showPassword ? "text" : "password"}
                            name="userPassword"
                        />
                        <Button onClick={() => setShowPassword(!showPassword)} type="button">
                            {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                        </Button>
                    </div>
                </div>
                <div id="password-hint">
                    <p>Password must be at least 8 characters long.</p>
                </div>
                <Button type="submit">Sign Up</Button>
                <p>Already have an account?</p> <Link to="/signin">Sign In</Link>
                {/*
                <p>By signing up, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.</p>
                */}
            </form>
        </div>
    );
}

export default SignUp;