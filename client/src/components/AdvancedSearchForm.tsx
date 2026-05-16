import type {StructureFilters, TrailFilters} from "../hooks/useSearch.tsx";

type Props = {
    mode: "trails" | "structures",
    trailFilters: TrailFilters,
    setTrailFilters: (filters: TrailFilters) => void,
    structureFilters: StructureFilters,
    setStructureFilters: (filters: StructureFilters) => void
}

export default function AdvancedSearchForm ({
    mode,
    trailFilters,
    setTrailFilters,
    structureFilters,
    setStructureFilters
}: Props) {
    if (mode === "structures") {
        return (
            <div className="advanced-search-form">
                <label className="filter-label">
                    <input
                        type="checkbox"
                        checked={structureFilters.managed ?? true}
                        onChange={(e) => setStructureFilters({...structureFilters, managed: e.target.checked})}
                    />
                    Managed Only
                </label>
            </div>
        );
    }

    return (
        <div className="advanced-search-form">
            {/*
            <div className="filter-row">
                <label className="filter-label">Difficulty</label>
                <select
                className="search-input"
                value={trailFilters.difficulty}
                onChange={(e) => setTrailFilters({...trailFilters, difficulty: e.target.value})}
                >

                    <option value="">Any</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>


                </select>
            </div>
            */}
            <div className="filter-row">
                <label className="filter-label">Min distance (km)</label>
                <input
                    type="number"
                    className="search-input"
                    value={trailFilters.distance_km ?? ''}
                    onChange={(e) => setTrailFilters({...trailFilters, distance_km: e.target.value ? parseInt(e.target.value) : undefined})}
                />
            </div>
            <div className="filter-row">
                <label className="filter-label">Min ascent (m)</label>
                <input
                    type="number"
                    className="search-input"
                    value={trailFilters.ascent_m ?? ''}
                    onChange={(e) => setTrailFilters({...trailFilters, ascent_m: e.target.value ? parseInt(e.target.value) : undefined})}
                />
            </div>
            <div className="filter-row">
                <label className="filter-label">Min descent (m)</label>
                <input
                    type="number"
                    className="search-input"
                    value={trailFilters.descent_m ?? ''}
                    onChange={(e) => setTrailFilters({...trailFilters, descent_m: e.target.value ? parseInt(e.target.value) : undefined})}
                />
            </div>
            <div className="filter-row">
                <label className="filter-label">Min duration</label>
                <input
                    type="number"
                    className="search-input"
                    value={trailFilters.duration_h ?? ''}
                    onChange={(e) => setTrailFilters({...trailFilters, duration_h: e.target.value ? parseInt(e.target.value) : undefined})}
                />
            </div>
            <div className="filter-row">
                <label className="filter-label">From</label>
                <input
                    type="text"
                    className="search-input"
                    value={trailFilters.from ?? ''}
                    onChange={(e) => setTrailFilters({...trailFilters, from: e.target.value})}
                />
            </div>
            <div className="filter-row">
                <label className="filter-label">To</label>
                <input
                    type="text"
                    className="search-input"
                    value={trailFilters.to ?? ''}
                    onChange={(e) => setTrailFilters({...trailFilters, to: e.target.value})}
                />
            </div>
            <div className="filter-row">
                <label className="filter-label">Roundtrip</label>
                <select
                    className="search-input"
                    value={trailFilters.roundtrip === undefined ? '' : String(trailFilters.roundtrip)}
                    onChange={(e) => setTrailFilters({...trailFilters, roundtrip: e.target.value === '' ? undefined : e.target.value === 'true'})}
                >
                    <option value="">Any</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                </select>
            </div>
        </div>
    )
}

