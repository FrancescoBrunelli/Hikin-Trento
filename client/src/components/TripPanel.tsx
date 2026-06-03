type TripPoint = {
    _id: string;
    name: string;
    coordinates: {
        lat: number;
        lng: number;
    }
    type: 'structure' | 'pi';
}

type Props = {
    tripName: string;
    setTripName: (name: string) => void;
    tripPoints: TripPoint[];
    onRemove: (id: string) => void;
    onMoveUp: (index: number) => void;
    onMoveDown: (index: number) => void;
    roundtrip: boolean;
    setRoundtrip: (roundTrip: boolean) => void;
    onConfirm: () => void;
}

const getLabel = (index: number, total: number) => {
    if (total === 1) return 'Start';
    if (index === 0) return 'Start';
    if (index === total - 1) return 'End';
    return `Stop ${index + 1}`;
}

export default function TripPanel({ tripPoints, onRemove, onMoveUp, onMoveDown, roundtrip, setRoundtrip, onConfirm, tripName, setTripName }: Props) {
    return (
        <div className="detail-panel">
            <p className="panel-title">Trip Plan</p>
            <input
                type="text"
                placeholder="Add here the name of your trip..."
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                className="search-input"
            />
            {tripPoints.length === 0 ? (
                <p className="no-results">Search and add points to start planning your trip.</p>
            ) : (
                <div className="trip-summary">
                    {tripPoints.map((p, i) => (
                        <div key={p._id} className="trip-summary-item">
                            <div className="trip-summary-label">{getLabel(i, tripPoints.length)}</div>
                            <div className="trip-summary-name">{p.name}</div>
                            <div className="trip-summary-actions">
                                <button
                                    onClick={() => onMoveUp(i)}
                                    disabled={i === 0}
                                    className="trip-order-btn"
                                >▲</button>
                                <button
                                    onClick={() => onMoveDown(i)}
                                    disabled={i === tripPoints.length - 1}
                                    className="trip-order-btn"
                                >▼</button>
                                <button
                                    onClick={() => onRemove(p._id)}
                                    className="trip-remove-btn"
                                >✕</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {tripPoints.length >= 2 && (
                <>
                    <label className="trip-roundtrip-label">
                        <input
                            type="checkbox"
                            checked={roundtrip}
                            onChange={(e) => setRoundtrip(e.target.checked)}
                            className="trip-roundtrip-checkbox"
                        />
                        Roundtrip
                    </label>
                    <button onClick={onConfirm} className="confirm-trip-btn" disabled={!tripName?.trim()}>
                        ✓ Confirm Trip
                    </button>
                </>
            )}
        </div>
    );
}
