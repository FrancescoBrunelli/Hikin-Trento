export default function ResultCard({ result, isSelected, onClick }) {
  return (
    <div
      className={`result-card ${isSelected ? 'result-card--selected' : ''}`}
      onClick={onClick}
    >
      <p className="result-name">{result.name}</p>
      <p className="result-type">{result.type}</p>
    </div>
  );
}