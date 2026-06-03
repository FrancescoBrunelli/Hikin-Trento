import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import UserDropdown from "../components/UserDropDown";
import {
  FaArrowLeft,
  FaSignOutAlt,
  FaMountain,
  FaHome,
  FaStar,
  FaMapMarkerAlt,
  FaRuler,
  FaClock,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import "../styles/Favourites.css";


type FavItem = {
  _id: string;
  name: string;
  type: "structure" | "trail";
  coordinates?: { latitude: number; longitude: number; altitude?: number };
  telephone?: string;
  difficulty?: string;
  distance_km?: number;
  duration_forward?: string;
  ascent_m?: number;
  descent_m?: number;
  from?: string;
  to?: string;
  image: string;
};

type Filter = "all" | "structure" | "trail";

export default function FavouritesPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; surname: string } | null>(
    null,
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [favourites, setFavourites] = useState<FavItem[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);


  // ── fetch user + favourites ──────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }


    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch("/api/user/basicInfo", { method: "GET", headers }).then((r) =>
        r.json(),
      ),
      fetch("/api/favourites/structures", { headers }).then((r) => r.json()),
      fetch("/api/favourites/trails", { headers }).then((r) => r.json()),
    ])
      .then(([userData, structuresData, trailsData]) => {
        setUser(userData);
        const structures = (structuresData.fav_structures ?? []).map(
          (s: any) => ({ ...s, type: "structure" }),
        );
        const trails = (trailsData.fav_trails ?? []).map((t: any) => ({
          ...t,
          type: "trail",
        }));
        setFavourites([...structures, ...trails]);
      })
      .catch(() => {
        navigate("/");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleShowOnMap = (item: FavItem) => {
    // navigate to home with the selected item in state
    navigate("/", { state: { selectedItem: item } });
  };

  const handleRemoveFavourite = async (item: FavItem) => {
    const endpoint =
      item.type === "trail"
        ? "/api/favourites/trails"
        : "/api/favourites/structures";

    await fetch(endpoint, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ _id: item._id }),
    });

    setFavourites((prev) => prev.filter((f) => f._id !== item._id));
  };

  const filtered = favourites.filter(
    (f) => filter === "all" || f.type === filter,
  );
  const structureCount = favourites.filter(
    (f) => f.type === "structure",
  ).length;
  const trailCount = favourites.filter((f) => f.type === "trail").length;

  const difficultyColor = (d?: string) => {
    if (!d) return "var(--hint)";
    if (d.toLowerCase() === "easy") return "var(--valid)";
    if (d.toLowerCase() === "hard") return "var(--invalid)";
    return "#f97316";
  };

  const API_URL = "http://localhost:3000";
  const imageSrc = (item: FavItem) =>
   item.type === "structure"
      ? `${API_URL}/assets/structures${item.image}`
      : `${API_URL}/assets/trails${item.image}`;



  return (
    <Layout
      navChildren={
        <UserDropdown
          name={user?.name}
          surname={user?.surname}
          showDropdown={showDropdown}
          onToggle={() => setShowDropdown(!showDropdown)}
          items={[
            {
              label: "Back",
              icon: <FaArrowLeft size={14} />,
              onClick: () => navigate(-1),
            },
          ]}
        />
      }
    >

      <div className="fav-page">
        {/* ── Header ───────────────────────────────────────── */}
        <div className="fav-header">
          <div className="fav-header-left">
            <h1 className="fav-title">Favourites</h1>
            <p className="fav-subtitle">
              All your favourite trails and structures in one place.
            </p>
          </div>
        </div>

        {/* ── Filter tabs ──────────────────────────────────── */}
        <div className="fav-filters">
          <button
            className={`fav-filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({favourites.length})
          </button>
          <button
            className={`fav-filter-btn ${filter === "trail" ? "active" : ""}`}
            onClick={() => setFilter("trail")}
          >
            <FaMountain size={13} /> Trails ({trailCount})
          </button>
          <button
            className={`fav-filter-btn ${filter === "structure" ? "active" : ""}`}
            onClick={() => setFilter("structure")}
          >
            <FaHome size={13} /> Structures ({structureCount})
          </button>
        </div>

        {/* ── Grid ─────────────────────────────────────────── */}
        {loading ? (
          <p className="fav-empty">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="fav-empty">No favourites yet. Start exploring!</p>
        ) : (
          <div className="fav-grid">
            {filtered.map((item) => (
              <div key={item._id} className="fav-card">
                {/* type badge + remove star */}
                <div className="fav-card-top">
                  <span
                    className={`fav-type-badge fav-type-badge--${item.type}`}
                  >
                    {item.type === "trail" ? (
                      <FaMountain size={11} />
                    ) : (
                      <FaHome size={11} />
                    )}
                    {item.type === "trail" ? "Trail" : "Structure"}
                  </span>
                  <button
                    className="fav-remove-btn"
                    onClick={() => handleRemoveFavourite(item)}
                    title="Remove from favourites"
                  >
                    <FaStar size={16} color="#f97316" />
                  </button>
                </div>

                {/* name */}
                <h3 className="fav-card-name">{item.name}</h3>

                <img
                  src={imageSrc(item)}
                  alt={item.name}
                  className="fav-card-image"
                />

                {/* info rows */}
                <div className="fav-card-info">
                  {item.coordinates && (
                    <div className="fav-info-row">
                      <FaMapMarkerAlt size={12} className="fav-info-icon" />
                      <span>
                        {item.coordinates.latitude.toFixed(4)}°,{" "}
                        {item.coordinates.longitude.toFixed(4)}°
                        {item.coordinates.altitude
                          ? ` · ${item.coordinates.altitude}m`
                          : ""}
                      </span>
                    </div>
                  )}
                  {item.telephone && (
                    <div className="fav-info-row">
                      <span className="fav-info-label">📞</span>
                      <span>{item.telephone}</span>
                    </div>
                  )}
                  {item.difficulty && (
                    <div className="fav-info-row">
                      <span className="fav-info-label">Difficulty</span>
                      <span
                        style={{
                          color: difficultyColor(item.difficulty),
                          fontWeight: 600,
                        }}
                      >
                        {item.difficulty}
                      </span>
                    </div>
                  )}
                  {item.distance_km && (
                    <div className="fav-info-row">
                      <FaRuler size={12} className="fav-info-icon" />
                      <span>{item.distance_km} km</span>
                    </div>
                  )}
                  {item.duration_forward && (
                    <div className="fav-info-row">
                      <FaClock size={12} className="fav-info-icon" />
                      <span>{item.duration_forward}</span>
                    </div>
                  )}
                  {item.ascent_m && (
                    <div className="fav-info-row">
                      <FaArrowUp size={12} className="fav-info-icon" />
                      <span>{item.ascent_m}m</span>
                      {item.descent_m && (
                        <>
                          <FaArrowDown
                            size={12}
                            className="fav-info-icon"
                            style={{ marginLeft: 8 }}
                          />
                          <span>{item.descent_m}m</span>
                        </>
                      )}
                    </div>
                  )}
                  {(item.from || item.to) && (
                    <div className="fav-info-row">
                      <span className="fav-info-label">
                        {item.from} {item.from && item.to ? "→" : ""} {item.to}
                      </span>
                    </div>
                  )}
                </div>

                {/* show on map button */}
                <button
                  className="fav-map-btn"
                  onClick={() => handleShowOnMap(item)}
                >
                  <FaMapMarkerAlt size={13} /> Show on map
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
