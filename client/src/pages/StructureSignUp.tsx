//src/pages/UserSignUp.jsx
import { Link } from "react-router-dom";
import { useState } from "react";
import { FaEye, FaEyeSlash} from 'react-icons/fa';
import PhoneInput from 'react-phone-number-input'
import Button from "../components/Button.tsx";
import "../styles/Auth.css";
import 'react-phone-number-input/style.css'
import Layout from "../components/Layout.tsx";
import StepperBar from "../components/StepperBar.tsx";

function StructureUserSignUp() {
    const [showPassword, setShowPassword] = useState(false);
    const hasMinLength = (value: string) => value.length >= 8;
    const hasSpecialChar = (value: string) => /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const isValid = (value: string) => hasMinLength(value) && hasSpecialChar(value);
    const [password, setPassword] = useState("");
    const [value, setValue] = useState<string | undefined>(undefined);
    const [coordinates, setCoordinates] = useState<{ lat: number | string, lng: number | string, alt: number | string }>({ lat: "", lng: "", alt: "" });
    const [currentStep, setCurrentStep] = useState(0);
    const getLocation = () => {
        navigator.geolocation.getCurrentPosition((position) => {
            setCoordinates({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                alt: position.coords.altitude ?? ""
            });
        });
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        {/* To implement... */}
    }

    return (
        <Layout>
            <div className="signup-card">
                <h1>Structure Sign Up</h1>
                <StepperBar steps={["Structure Info", "Confirm Location", "Contact Info", "Password"]} currentStep={currentStep} />
                <form action="/api/signup" method="POST" className="signup-form" onSubmit={handleSubmit}>
                    {currentStep === 0 && (
                        <>
                            <div className="input-group">
                                <label htmlFor="structure-name-input">Structure name</label>
                                <input
                                    autoComplete="structure-name"
                                    id="structure-name-input"
                                    type="text"
                                    name="structureName"
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="owner-name-input">Owner first name</label>
                                <input
                                    autoComplete="name"
                                    id="owner-name-input"
                                    type="text"
                                    name="ownerName"
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="owner-surname-input">Owner last name</label>
                                <input
                                    autoComplete="surname"
                                    id="owner-surname-input"
                                    type="text"
                                    name="ownerSurname"
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="structure-position-input">Structure location</label>
                                {/*<input
                                    autoComplete="position"
                                    id="structure-position-input"
                                    type="coordinates"
                                    name="structurePosition"
                                />*/}
                                <Button type="button" onClick={getLocation} className="btn-secondary">Use my location</Button>
                                <div className="coord-input-wrapper">
                                    <input type="number" value={coordinates.lat} onChange={(e) => setCoordinates({...coordinates, lat: e.target.value})} name="latitude" placeholder="Latitude" />
                                    <span className="coord-unit">°</span>
                                </div>
                                <div className="coord-input-wrapper">
                                    <input type="number" value={coordinates.lng} onChange={(e) => setCoordinates({...coordinates, lng: e.target.value})} name="longitude" placeholder="Longitude" />
                                    <span className="coord-unit">°</span>
                                </div>
                                <div className="coord-input-wrapper">
                                    <input type="number" value={coordinates.alt} onChange={(e) => setCoordinates({...coordinates, alt: e.target.value})} name="altitude" placeholder="Altitude" />
                                    <span className="coord-unit">m</span>
                                </div>
                            </div>
                            <Button type="button" onClick={() => setCurrentStep(currentStep + 1)}>Next</Button>
                        </>
                    )}

                    {currentStep === 1 && (
                        <>

                            <Button type="button" onClick={() => setCurrentStep(currentStep - 1)}>Back</Button>
                            <Button type="button" onClick={() => setCurrentStep(currentStep + 1)}>Next</Button>
                        </>
                    )}

                    {currentStep === 2 && (
                        <>
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
                                <label htmlFor="phone-input">Phone number</label>
                                {/*
                                <input
                                    autoComplete="phone"
                                    id="phone-input"
                                    type="phone"
                                    name="structure-phone"
                                />
                                */}
                                <PhoneInput
                                    defaultCountry="IT"
                                    id="phone-input"
                                    value={value}
                                    onChange={setValue}
                                />
                            </div>
                            <Button type="button" onClick={() => setCurrentStep(currentStep - 1)}>Back</Button>
                            <Button type="button" onClick={() => setCurrentStep(currentStep + 1)}>Next</Button>
                        </>
                    )}

                    {currentStep === 3 && (
                        <>
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
                            <Button type="button" onClick={() => setCurrentStep(currentStep - 1)}>Back</Button>
                            <Button type="submit" disabled={!(isValid(password))}>Sign Up</Button>
                        </>
                    )}

                    <p>Already have an account? <Link to="/signin">Sign In</Link></p>
                    {/*
                    <p>By signing up, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.</p>
                    */}
                </form>
            </div>
        </Layout>
    )
}

export default StructureUserSignUp;
