import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout.tsx';
import Button from '../components/Button.tsx';
import '../styles/Auth.css';

function StructureDashboard() {
    const navigate = useNavigate();
    const [manager, setManager] = useState<any>(null);
    const [structure, setStructure] = useState<any>(null);

    // Auth check + load data
    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        
        if (!token || role !== 'structure_manager') {
            navigate('/structuresignin');
            return;
        }

        const managerData = JSON.parse(localStorage.getItem('manager') || 'null') || {};
        const structureData = JSON.parse(localStorage.getItem('structure') || 'null') || {};    
        setManager(managerData);
        setStructure(structureData);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('manager');
        localStorage.removeItem('structure');
        navigate('/');
    };

    return (
        <Layout navChildren={
            <>
                <Button onClick={handleLogout}>Logout</Button>
            </>
        }>
            <div style={{ padding: '2rem' }}>
                {/* TOP BAR */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1>Structure Dashboard</h1>
                        <p>Welcome back, {manager?.name_owner} {manager?.surname_owner}!</p>
                    </div>
                </div>

                {/* CARDS ROW */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ padding: '1.5rem', borderRadius: '8px', border: '1px solid #ccc' }}>
                        <h3> Bookings</h3>
                        <p>No bookings yet</p>
                    </div>
                    <div style={{ padding: '1.5rem', borderRadius: '8px', border: '1px solid #ccc' }}>
                        <h3> Reviews</h3>
                        <p>No reviews yet</p>
                    </div>
                    <div style={{ padding: '1.5rem', borderRadius: '8px', border: '1px solid #ccc' }}>
                        <h3> Statistics</h3>
                        <p>No data yet</p>
                    </div>
                </div>

                {/* STRUCTURE INFO */}
                <div style={{ padding: '1.5rem', borderRadius: '8px', border: '1px solid #ccc' }}>
                    <h3> Structure Information</h3>
                    <p><strong>Name:</strong> {structure?.name}</p>
                    <p><strong>Telephone:</strong> {manager?.telephone}</p>
                    <Button>Edit Information</Button>
                </div>
            </div>
        </Layout>
    );
}

export default StructureDashboard;