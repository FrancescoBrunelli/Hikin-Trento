import { useState } from 'react';
import { searchStructures } from '../services/structureService';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    const data = await searchStructures(query);
    setResults(data);
  };

  return { query, setQuery, results, handleSearch };
}