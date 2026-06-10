import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout.tsx';
import '../styles/MyTrips.css';

const API = 'http://localhost:3000';
const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

const formatDistance = (m: number) => m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
const formatDuration = (s: number) => { const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); return h > 0 ? `${h}h ${m}m` : `${m}m`; };

export default function MyTrips() {
    const navigate = useNavigate();
    const [myPlans, setMyPlans] = useState<any[]>([]);
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'mine' | 'saved'>('mine');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/signin');
            return;
        }

        Promise.all([
            fetch(`${API}/api/planning/`, { headers: authHeaders() }).then(r => r.json()),
            fetch(`${API}/api/planning/favorites/me`, { headers: authHeaders() }).then(r => r.json())
        ])
            .then(([myData, favData]) => {
                setMyPlans(myData.plans ?? []);
                setFavorites(favData.plans ?? []);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this trip?')) return;
        try {
            const res = await fetch(`${API}/api/planning/${id}`, {
                method: 'DELETE',
                headers: authHeaders()
            });
            if (!res.ok) throw new Error('Failed to delete');
            setMyPlans(prev => prev.filter(p => p._id !== id));
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleRemoveFavorite = async (id: string) => {
        if (!confirm('Remove from saved trips?')) return;
        try {
            const res = await fetch(`${API}/api/planning/${id}/favorite`, {
                method: 'DELETE',
                headers: authHeaders()
            });
            if (!res.ok) throw new Error('Failed to remove');
            setFavorites(prev => prev.filter(p => p._id !== id));
        } catch (err: any) {
            setError(err.message);
        }
    };

    const PlanCard = ({ plan, isMine }: { plan: any; isMine: boolean }) => (
        <div className="mytrips-card">
            <div className="mytrips-card-header">
                <h3 className="mytrips-card-name">{plan.name}</h3>
                {!isMine && plan.user?.username && (
                    <span className="mytrips-card-author">by @{plan.user.username}</span>
                )}
            </div>
            <div className="mytrips-card-stats">
                <div className="mytrips-stat">
                    <span className="mytrips-stat-icon">📏</span>
                    <span className="mytrips-stat-value">{formatDistance(plan.route?.distance ?? 0)}</span>
                    <span className="mytrips-stat-label">Distance</span>
                </div>
                <div className="mytrips-stat">
                    <span className="mytrips-stat-icon">⏱</span>
                    <span className="mytrips-stat-value">{formatDuration(plan.route?.duration ?? 0)}</span>
                    <span className="mytrips-stat-label">Duration</span>
                </div>
                <div className="mytrips-stat">
                    <span className="mytrips-stat-icon">⬆️</span>
                    <span className="mytrips-stat-value">+{Math.round(plan.route?.ascent ?? 0)}m</span>
                    <span className="mytrips-stat-label">Ascent</span>
                </div>
                <div className="mytrips-stat">
                    <span className="mytrips-stat-icon">⬇️</span>
                    <span className="mytrips-stat-value">-{Math.round(plan.route?.descent ?? 0)}m</span>
                    <span className="mytrips-stat-label">Descent</span>
                </div>
            </div>
            <p className="mytrips-card-date">
                {new Date(plan.createdAt).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <div className="mytrips-card-actions">
                <button
                    className="mytrips-btn mytrips-btn--view"
                    onClick={() => navigate(`/user/trip/${plan._id}`)}
                >
                    View
                </button>
                {isMine ? (
                    <button
                        className="mytrips-btn mytrips-btn--edit"
                        onClick={() => navigate(`/user/trip/${plan._id}/edit`)}
                    >
                        Edit
                    </button>
                ) : null}
                {isMine ? (
                    <button
                        className="mytrips-btn mytrips-btn--delete"
                        onClick={() => handleDelete(plan._id)}
                    >
                        Delete
                    </button>
                ) : (
                    <button
                        className="mytrips-btn mytrips-btn--remove"
                        onClick={() => handleRemoveFavorite(plan._id)}
                    >
                        Remove
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <Layout>
            <div className="mytrips-page">
                <div className="mytrips-header">
                    <h1 className="mytrips-title">My Trips</h1>
                    <button
                        className="mytrips-plan-btn"
                        onClick={() => navigate('/user/tripplanning')}
                    >
                        + Plan a new trip
                    </button>
                </div>

                <div className="mytrips-tabs">
                    <button
                        className={`mytrips-tab ${activeTab === 'mine' ? 'active' : ''}`}
                        onClick={() => setActiveTab('mine')}
                    >
                        My Routes
                        {myPlans.length > 0 && <span className="mytrips-tab-badge">{myPlans.length}</span>}
                    </button>
                    <button
                        className={`mytrips-tab ${activeTab === 'saved' ? 'active' : ''}`}
                        onClick={() => setActiveTab('saved')}
                    >
                        Saved Routes
                        {favorites.length > 0 && <span className="mytrips-tab-badge">{favorites.length}</span>}
                    </button>
                </div>

                {error && <p className="mytrips-error">{error}</p>}

                {loading ? (
                    <p className="mytrips-hint">Loading…</p>
                ) : (
                    <div className="mytrips-grid">
                        {activeTab === 'mine' && (
                            myPlans.length === 0 ? (
                                <p className="mytrips-hint">No trips yet. <span className="mytrips-link" onClick={() => navigate('/user/tripplanning')}>Plan your first one!</span></p>
                            ) : (
                                myPlans.map(plan => <PlanCard key={plan._id} plan={plan} isMine={true} />)
                            )
                        )}
                        {activeTab === 'saved' && (
                            favorites.length === 0 ? (
                                <p className="mytrips-hint">No saved routes yet.</p>
                            ) : (
                                favorites.map(plan => <PlanCard key={plan._id} plan={plan} isMine={false} />)
                            )
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
}