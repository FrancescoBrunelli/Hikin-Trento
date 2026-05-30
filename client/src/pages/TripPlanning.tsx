import Layout from "../components/Layout.tsx";
import TripMapView from "../components/Map/TripMapView.tsx";
import SearchPanel from "../components/SearchPanel";
import DetailPanel from "../components/DetailPanel";
import TripPanel from "../components/TripPanel";
import { useSearch } from "../hooks/useSearch";
import { useState } from "react";
import {useNavigate} from 'react-router-dom';
import "../styles/TripPlanning.css"

type TripPoint = {
    _id: string;
    name: string;
    coordinates: { lat: number; lng: number };
    type: 'structure' | 'pi';
}

function TripPlanning() {
    const { query, setQuery, results, handleSearch, mode, setMode, structureFilters, setStructureFilters, piFilters, setPIFilters, trailFilters, setTrailFilters } = useSearch(['structures', 'pis']);
    const [selected, setSelected] = useState<any>(null);
    const [tripPoints, setTripPoints] = useState<TripPoint[]>([]);
    const navigate = useNavigate();
    const addToTrip = (point: any) => {
        if (tripPoints.find(p => p._id === point._id)) return;
        setTripPoints(prev => [...prev, {
            _id: point._id,
            name: point.name,
            coordinates: point.coordinates,
            type: point.type
        }]);
        setSelected(null); // close detail panel, show trip summary
    };

    const removeFromTrip = (id: string) => {
        setTripPoints(prev => prev.filter(p => p._id !== id));
    }

    const moveUp = (index: number) => {
        if (index === 0) return;
        setTripPoints(prev => {
            const updated = [...prev];
            [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
            return updated;
        });
    }

    const moveDown = (index: number) => {
        if (index === tripPoints.length - 1) return;
        setTripPoints(prev => {
            const updated = [...prev];
            [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
            return updated;
        });
    }

    const isInTrip = (id: string) => tripPoints.some(p => p._id === id);

    const handleConfirm = async () => {
        // 1. save to DB
        // 2. navigate to trip detail page
        navigate('/trip/:id');
    };

    return (
        <Layout>
            <div className="home-container">
                <SearchPanel
                    query={query}
                    setQuery={setQuery}
                    results={results}
                    onSearch={handleSearch}
                    onSelect={(r) => setSelected(r)}
                    selected={selected}
                    mode={mode}
                    setMode={setMode}
                    trailFilters={trailFilters}
                    setTrailFilters={setTrailFilters}
                    piFilters={piFilters}
                    setPIFilters={setPIFilters}
                    structureFilters={structureFilters}
                    setStructureFilters={setStructureFilters}
                    hideModes={['trails']}
                />
                <div className="home-map">
                    <TripMapView
                        selected={selected}
                        tripPoints={tripPoints}
                    />
                </div>
                {/* Switch between detail view and trip summary */}
                {selected ? (
                    <DetailPanel
                        selected={selected}
                        onClose={() => setSelected(null)}
                        onAddToTrip={addToTrip}
                        isInTrip={isInTrip}
                    />
                ) : (
                    <TripPanel
                        tripPoints={tripPoints}
                        onRemove={removeFromTrip}
                        onMoveUp={moveUp}
                        onMoveDown={moveDown}
                        onConfirm={handleConfirm}
                    />
                )}
            </div>
        </Layout>
    );
}

export default TripPlanning;
