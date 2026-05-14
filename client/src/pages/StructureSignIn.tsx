import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash} from 'react-icons/fa';
import Button from '../components/Button.tsx';
import Layout from '../components/Layout.tsx';
import '../styles/Auth.css';

function StructureSignIn() {
    const [telephone, setTelephone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3000/api/auth/login_structure', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telephone, password })
            });
            const data = await response.json();
            if (!response.ok) {
                setError(true);
                return;
            }
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', 'structure_manager');
            navigate('/structure/dashboard');
        } catch (err) {
            setError(true);
        }
    };

    return (
        <Layout>
            <div className="signup-card">
                <h1>Structure Sign In</h1>
                <form className="signup-form" onSubmit={handleLogin}>
                    <div className="input-group">
                        <label htmlFor="telephone-input">Telephone</label>
                        <input
                            id="telephone-input"
                            type="tel"
                            name="telephone"
                            value={telephone}
                            onChange={(e) => setTelephone(e.target.value)}
                        />
                    </div>
                        <div className="input-group">
                        <label htmlFor="password-input">Password</label>
                        <div className={`password-wrapper ${error ? "invalid" : ""}`}>
                            <input
                                id="password-input"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <Button onClick={() => setShowPassword(!showPassword)} type="button">
                                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                            </Button>
                        </div>
                    </div>
                    {error && <p style={{ color: 'red' }}>Invalid telephone or password</p>}
                    <Button type="submit">Sign In</Button>
                    <p>Don't have an account? <Link to="/structuresignup">Structure Sign Up</Link></p>
                </form>
            </div>
        </Layout>
    );
}

export default StructureSignIn;