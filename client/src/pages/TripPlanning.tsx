import Layout from "../components/Layout.tsx";
import MapView from "../components/Map/TripMapView.tsx";
import SearchPanel from "../components/SearchPanel";
import DetailPanel from "../components/DetailPanel";
import { useSearch } from "../hooks/useSearch";
import { useState } from "react";
import TripMapView from "../components/Map/TripMapView.tsx";

type TripPoint = {
    _id: string;
    name: string;
    coordinates: { latitude: number; longitude: number };
    type: 'structure' | 'pi';
}

function TripPlanning() {
    const { query, setQuery, results, handleSearch, mode, setMode, structureFilters, setStructureFilters, piFilters, setPIFilters, trailFilters, setTrailFilters } = useSearch(['structures', 'pis']);
    const [selected, setSelected] = useState<any>(null);
    const [tripPoints, setTripPoints] = useState<TripPoint[]>([]);

    const addToTrip = (point: any) => {
        if (tripPoints.find(p => p._id === point._id)) return;
        setTripPoints(prev => [...prev, { _id: point._id, name: point.name, coordinates: point.coordinates, type: point.type }]);
    };

    const isInTrip = (id: string) => tripPoints.some(p => p._id === id);

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
                <DetailPanel
                    selected={selected}
                    onClose={() => setSelected(null)}
                    onAddToTrip={addToTrip}
                    isInTrip={isInTrip}
                />
            </div>
        </Layout>
    );
}

export default TripPlanning;