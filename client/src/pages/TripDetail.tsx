import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout.tsx';

const API = 'http://localhost:3000';
const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

const formatDistance = (m: number) => m >= 1000 ? `${(m/1000).toFixed(1)} km` : `${Math.round(m)} m`;
const formatDuration = (s: number) => { const h = Math.floor(s/3600); const m = Math.floor((s%3600)/60); return h > 0 ? `${h}h ${m}m` : `${m}m`; };

export default function TripDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [plan, setPlan] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetch(`${API}/api/planning/${id}`, { headers: authHeaders() })
            .then(res => res.json())
            .then(data => {
                if (data.error) throw new Error(data.error);
                setPlan(data.plan);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this trip?')) return;
        setDeleting(true);
        try {
            const res = await fetch(`${API}/api/planning/${id}`, {
                method: 'DELETE',
                headers: authHeaders()
            });
            if (!res.ok) throw new Error('Failed to delete');
            navigate('/user/tripplanning');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Layout navChildren={
            <button
                onClick={() => navigate('/user/tripplanning')}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
            >
                ← Back to planning
            </button>
        }>
            <div style={{ maxWidth: 600, margin: '40px auto', padding: '0 24px' }}>
                {loading && <p style={{ color: 'var(--hint)' }}>Loading…</p>}
                {error && <p style={{ color: 'var(--invalid)' }}>{error}</p>}
                {plan && (
                    <>
                        <h1 style={{ margin: '0 0 4px', color: 'var(--text)' }}>{plan.name}</h1>
                        {plan.description && (
                            <p style={{ margin: '0 0 24px', color: 'var(--hint)', fontSize: 14 }}>{plan.description}</p>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
                            {[
                                { label: 'Distance', value: formatDistance(plan.route?.distance ?? 0) },
                                { label: 'Duration', value: formatDuration(plan.route?.duration ?? 0) },
                                { label: 'Ascent', value: `+${Math.round(plan.route?.ascent ?? 0)} m` },
                                { label: 'Descent', value: `-${Math.round(plan.route?.descent ?? 0)} m` },
                            ].map(({ label, value }) => (
                                <div key={label} style={{
                                    background: 'var(--input-bg)',
                                    border: '1px solid var(--input-border)',
                                    borderRadius: 10,
                                    padding: '14px 16px'
                                }}>
                                    <p style={{ margin: '0 0 4px', fontSize: 11, color: 'var(--hint)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
                                    <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{value}</p>
                                </div>
                            ))}
                        </div>

                        <p style={{ fontSize: 12, color: 'var(--hint)', marginBottom: 24 }}>
                            Saved on {new Date(plan.createdAt).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>

                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            style={{
                                padding: '10px 20px',
                                borderRadius: 10,
                                border: '1px solid var(--invalid)',
                                background: 'transparent',
                                color: 'var(--invalid)',
                                fontWeight: 700,
                                fontSize: 14,
                                cursor: 'pointer'
                            }}
                        >
                            {deleting ? 'Deleting…' : '🗑 Delete Trip'}
                        </button>
                    </>
                )}
            </div>
        </Layout>
    );
}