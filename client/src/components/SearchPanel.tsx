import { useState } from 'react';
import ResultCard from './ResultCard';
import AdvancedSearchForm from './AdvancedSearchForm';
import type {StructureFilters, TrailFilters, PIFilters} from "../hooks/useSearch.tsx";

type Props = {
    query: string;
    setQuery: (q: string) => void;
    results: any[];
    onSearch: () => void;
    onSelect: (r: any) => void;
    selected: any;
    mode: 'all' | 'trails' | 'structures' | 'pis';
    setMode: (m: 'all' | 'trails' | 'structures' | 'pis') => void;
    trailFilters: TrailFilters;
    setTrailFilters: (f: TrailFilters) => void;
    piFilters: PIFilters;
    setPIFilters: (f: PIFilters) => void;
    structureFilters: StructureFilters;
    setStructureFilters: (f: StructureFilters) => void;
}

export default function SearchPanel({ query, setQuery, results, onSearch, onSelect, selected, mode, setMode, trailFilters, piFilters, setPIFilters, setTrailFilters, structureFilters, setStructureFilters }: Props) {
    const [showAdvanced, setShowAdvanced] = useState(false);
    return (
        <div className="search-panel">
            <div className="search-box">
                <p className="panel-title">Search</p>
                <input
                    type="text"
                    placeholder="Search trails, structures, POIs..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                    className="search-input"
                />
                <button onClick={onSearch} className="search-btn">Search</button>
                <button onClick={() => setShowAdvanced(!showAdvanced)} className="advanced-toggle-btn">{showAdvanced ? '▲ Hide filters' : '▼ Advanced filters'}</button>
                {showAdvanced && (
                    <>
                        <div className="mode-toggle">
                            <button className={`mode-btn ${mode === 'all' ? 'mode-btn--active' : ''}`} onClick={() => setMode('all')}>All</button>
                            <button className={`mode-btn ${mode === 'trails' ? 'mode-btn--active' : ''}`} onClick={() => setMode('trails')}>Trails</button>
                            <button className={`mode-btn ${mode === 'structures' ? 'mode-btn--active' : ''}`} onClick={() => setMode('structures')}>Structures</button>
                            <button className={`mode-btn ${mode === 'pis' ? 'mode-btn--active' : ''}`} onClick={() => setMode('pis')}>POIs</button>
                        </div>
                        {mode !== 'all' && (
                            <AdvancedSearchForm
                                mode = {mode}
                                trailFilters = {trailFilters}
                                setTrailFilters = {setTrailFilters}
                                piFilters = {piFilters}
                                setPIFilters = {setPIFilters}
                                structureFilters = {structureFilters}
                                setStructureFilters = {setStructureFilters}
                            />
                        )}
                    </>
                )}
            </div>
            <div className="results-list">
                {results.length === 0 ? (
                    <p className="no-results">No results yet. Try searching something!</p>
                ) : (
                    results.map((r) => (
                        <ResultCard
                            key={r._id}
                            result={r}
                            isSelected={selected?._id === r._id}
                            onClick={() => onSelect(r)}
                        />
                    ))
                )}
            </div>
        </div>
    );
}