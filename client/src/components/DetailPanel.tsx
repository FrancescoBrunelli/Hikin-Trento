export default function DetailPanel({ selected, onClose }) {
  if (!selected) return (
    <div className="detail-panel">
      <p className="no-results">Click on a result or map marker to see details.</p>
    </div>
  );

  return (
    <div className="detail-panel">
      <p className="panel-title">{selected.name}</p>
      <p className="result-type">{selected.type}</p>
      {selected.coordinates && (
        <>
          <div className="detail-row">
            <span className="detail-label">Latitude</span>
            <span className="detail-value">{selected.coordinates.latitude}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Longitude</span>
            <span className="detail-value">{selected.coordinates.longitude}</span>
          </div>
        </>
      )}
      {selected.telephone && (
        <div className="detail-row">
          <span className="detail-label">Phone</span>
          <span className="detail-value">{selected.telephone}</span>
        </div>
      )}
      <button onClick={onClose} className="close-btn">✕ Close</button>
    </div>
  );
}