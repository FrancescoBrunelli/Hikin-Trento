import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout.tsx';


const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export default function TripEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [multiDay, setMultiDay] = useState(false);
    const [days, setDays] = useState(1);

    useEffect(() => {
        fetch(`/api/planning/${id}`, { headers: authHeaders() })
            .then(res => res.json())
            .then(data => {
                if (data.error) throw new Error(data.error);
                setName(data.plan.name);
                setDescription(data.plan.description || '');
                setMultiDay(data.plan.multiDay || false);
                setDays(data.plan.days || 1);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    const handleSave = async () => {
        if (!name.trim()) return;
        setSaving(true);
        setError(null);
        try {
            const res = await fetch(`/api/planning/${id}`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({ name, description, multiDay, days })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update');
            navigate(`/user/trip/${id}`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Layout navChildren={
            <button
                onClick={() => navigate(`/user/trip/${id}`)}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
            >
                ← Back to trip
            </button>
        }>
            <div style={{ maxWidth: 500, margin: '40px auto', padding: '0 24px' }}>
                <h1 style={{ margin: '0 0 24px', color: 'var(--text)', fontSize: 22, fontWeight: 700 }}>
                    Edit Trip
                </h1>

                {loading && <p style={{ color: 'var(--hint)' }}>Loading…</p>}
                {error && <p style={{ color: 'var(--invalid)', fontSize: 13 }}>{error}</p>}

                {!loading && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--hint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Trip name *
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                style={{
                                    padding: '10px 14px',
                                    borderRadius: 10,
                                    border: '1px solid var(--input-border)',
                                    background: 'var(--input-bg)',
                                    color: 'var(--text)',
                                    fontSize: 14,
                                    outline: 'none'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--hint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={3}
                                style={{
                                    padding: '10px 14px',
                                    borderRadius: 10,
                                    border: '1px solid var(--input-border)',
                                    background: 'var(--input-bg)',
                                    color: 'var(--text)',
                                    fontSize: 14,
                                    outline: 'none',
                                    resize: 'vertical',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, color: 'var(--text)' }}>
                            <input
                                type="checkbox"
                                checked={multiDay}
                                onChange={e => setMultiDay(e.target.checked)}
                                style={{ width: 16, height: 16, accentColor: 'var(--primary)', cursor: 'pointer' }}
                            />
                            Multi-day trip
                        </label>

                        {multiDay && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--hint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Number of days
                                </label>
                                <input
                                    type="number"
                                    min={2}
                                    value={days}
                                    onChange={e => setDays(parseInt(e.target.value))}
                                    style={{
                                        padding: '10px 14px',
                                        borderRadius: 10,
                                        border: '1px solid var(--input-border)',
                                        background: 'var(--input-bg)',
                                        color: 'var(--text)',
                                        fontSize: 14,
                                        outline: 'none',
                                        width: 100
                                    }}
                                />
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                            <button
                                onClick={handleSave}
                                disabled={saving || !name.trim()}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: 10,
                                    border: 'none',
                                    background: 'var(--primary)',
                                    color: '#fff',
                                    fontSize: 14,
                                    fontWeight: 700,
                                    cursor: saving || !name.trim() ? 'not-allowed' : 'pointer',
                                    opacity: saving || !name.trim() ? 0.4 : 1,
                                    transition: 'background 0.15s'
                                }}
                            >
                                {saving ? 'Saving…' : 'Save changes'}
                            </button>
                            <button
                                onClick={() => navigate(`/user/trip/${id}`)}
                                style={{
                                    padding: '12px 20px',
                                    borderRadius: 10,
                                    border: '1px solid var(--input-border)',
                                    background: 'transparent',
                                    color: 'var(--hint)',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}