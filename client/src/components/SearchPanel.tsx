import ResultCard from './ResultCard';

export default function SearchPanel({ query, setQuery, results, onSearch, onSelect, selected }) {
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