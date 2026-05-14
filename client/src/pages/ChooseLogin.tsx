import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout.tsx';
import Button from '../components/Button.tsx';
import '../styles/Auth.css';

function ChooseLogin() {
    const navigate = useNavigate();

    return (
        <Layout>
            <div className="signup-card">
                <h1>Who are you?</h1>
                <p>Select your account type to sign in</p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                    <Button onClick={() => navigate('/signin')}>
                        I'm a user
                    </Button>
                    <Button onClick={() => navigate('/structuresignin')}>
                        I'm a structure manager
                    </Button>
                </div>
            </div>
        </Layout>
    );
}

export default ChooseLogin;