import { FaStar, FaRegStar } from "react-icons/fa";

export default function DetailPanel({
  selected,
  onClose,
  isAuthenticated,
  favourites = [],
  onToggleFavourite,
}) {
  if (!selected)
    return (
      <div className="detail-panel">
        <p className="no-results">
          Click on a result or map marker to see details.
        </p>
      </div>
    );

  const isFavourite = favourites.some((f) => f._id === selected._id);
  return (
    <div className="detail-panel">
      <div className="detail-panel-header">
        <p className="panel-title">{selected.name}</p>
        {isAuthenticated && (
          <button
            className="detail-fav-btn"
            onClick={() => onToggleFavourite(selected)}
            title={isFavourite ? "Remove from favourites" : "Add to favourites"}
          >
            {
              isFavourite ? (
                <FaStar size={20} color="#f97316" /> // ← filled orange
              ) : (
                <FaRegStar size={20} color="#f97316" />
              ) // ← outlined orange
            }
          </button>
        )}
      </div>

      <p className="result-type">{selected.type}</p>

      {/* Structure fields */}
      {selected.coordinates && (
        <>
          <div className="detail-row">
            <span className="detail-label">Latitude</span>
            <span className="detail-value">
              {selected.coordinates.latitude}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Longitude</span>
            <span className="detail-value">
              {selected.coordinates.longitude}
            </span>
          </div>
        </>
      )}
      {selected.telephone && (
        <div className="detail-row">
          <span className="detail-label">Phone</span>
          <span className="detail-value">{selected.telephone}</span>
        </div>
      )}

      {/* Trail fields */}
      {selected.difficulty && (
        <div className="detail-row">
          <span className="detail-label">Difficulty</span>
          <span className="detail-value">{selected.difficulty}</span>
        </div>
      )}
      {selected.distance_km && (
        <div className="detail-row">
          <span className="detail-label">Distance</span>
          <span className="detail-value">{selected.distance_km} km</span>
        </div>
      )}
      {selected.ascent_m && (
        <div className="detail-row">
          <span className="detail-label">Ascent</span>
          <span className="detail-value">{selected.ascent_m} m</span>
        </div>
      )}
      {selected.descent_m && (
        <div className="detail-row">
          <span className="detail-label">Descent</span>
          <span className="detail-value">{selected.descent_m} m</span>
        </div>
      )}
      {selected.duration_forward && (
        <div className="detail-row">
          <span className="detail-label">Duration Forward</span>
          <span className="detail-value">{selected.duration_forward}</span>
        </div>
      )}
      {selected.duration_backward && (
        <div className="detail-row">
          <span className="detail-label">Duration Backward</span>
          <span className="detail-value">{selected.duration_backward}</span>
        </div>
      )}
      {selected.from && (
        <div className="detail-row">
          <span className="detail-label">From</span>
          <span className="detail-value">{selected.from}</span>
        </div>
      )}
      {selected.to && (
        <div className="detail-row">
          <span className="detail-label">To</span>
          <span className="detail-value">{selected.to}</span>
        </div>
      )}
      {selected.roundtrip && (
        <div className="detail-row">
          <span className="detail-label">Roundtrip</span>
          <span className="detail-value">
            {selected.roundtrip ? "Yes" : "No"}
          </span>
        </div>
      )}
      {/* PIs fields */}
      {selected.shelter_type && (
        <div className="detail-row">
          <span className="detail-label">Shelter Type</span>
          <span className="detail-value">{selected.shelter_type}</span>
        </div>
      )}
      <button onClick={onClose} className="close-btn">
        ✕ Close
      </button>
    </div>
  );
}
