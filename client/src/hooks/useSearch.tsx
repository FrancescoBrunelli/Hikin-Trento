import { useState } from 'react';
import { searchStructures } from '../services/structureService.tsx';
import { searchTrails } from '../services/trailService'

type SearchMode = 'all' | 'structures' | 'trails';

export type StructureFilters = {
  managed?: boolean;
}

export type TrailFilters = {
  difficulty?: string;
  distance_km?: number;
  ascent_m?: number;
  descent_m?: number;
  duration_h?: number;
  roundtrip?: boolean;
  from?: string;
  to?: string;
  operator?: string;
}

export function useSearch() {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<SearchMode>('all');
  const [structureFilters, setStructureFilters] = useState<StructureFilters>({});
  const [trailFilters, setTrailFilters] = useState<TrailFilters>({});
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async () => {
    if (mode === 'all') {
      const [structures, trails] = await Promise.all([
        searchStructures(query, {}),
        searchTrails({name : query}),
      ]);
      setResults([
        ...structures.map((s: any) => ({ ...s, type: 'structure' })),
        ...trails.map((t: any) => ({ ...t, type: 'trail' })),
      ]);
    } else if (mode === 'structures') {
      const structures = await searchStructures(query, structureFilters);
      setResults(structures.map((s: any) => ({ ...s, type: 'structure' })));
    } else if (mode === 'trails') {
      const trails = await searchTrails({name : query, ...trailFilters});
      setResults(trails.map((t: any) => ({ ...t, type: 'trail' })));
    }
  };
  return {
    query, setQuery,
    mode, setMode,
    structureFilters, setStructureFilters,
    trailFilters, setTrailFilters,
    handleSearch, results
  };
}





/*
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
 */