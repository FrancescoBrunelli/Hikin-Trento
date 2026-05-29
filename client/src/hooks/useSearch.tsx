import { useState } from 'react';
import { searchStructures } from '../services/structureService.tsx';
import { searchTrails } from '../services/trailService'
import { searchPIs } from '../services/piService.tsx'

type SearchMode = 'all' | 'structures' | 'trails' | 'pis';

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

export type PIFilters = {
  shelter_type?: string;
  lat?: number;
  lng?: number;
  radius?: number;
}

export function useSearch(allowedModes?: SearchMode[]) {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<SearchMode>(
      allowedModes ? allowedModes[0] : 'all'
  );
  const [structureFilters, setStructureFilters] = useState<StructureFilters>({});
  const [trailFilters, setTrailFilters] = useState<TrailFilters>({});
  const [piFilters, setPIFilters] = useState<PIFilters>({});
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async () => {
    if (mode === 'all') {
      const fetches = [];
      if (!allowedModes || allowedModes.includes('structures'))
        fetches.push(searchStructures(query, {}).then((r: any[]) => r.map(s => ({ ...s, type: 'structure' }))));
      if (!allowedModes || allowedModes.includes('trails'))
        fetches.push(searchTrails({ name: query }).then((r: any[]) => r.map(t => ({ ...t, type: 'trail' }))));
      if (!allowedModes || allowedModes.includes('pis'))
        fetches.push(searchPIs({ name: query }).then((r: any[]) => r.map(t => ({ ...t, type: 'pi' }))));
      const settled = await Promise.all(fetches);
      setResults(settled.flat());
    } else if (mode === 'structures') {
      const structures = await searchStructures(query, structureFilters);
      setResults(structures.map((s: any) => ({ ...s, type: 'structure' })));
    } else if (mode === 'trails') {
      const trails = await searchTrails({ name: query, ...trailFilters });
      setResults(trails.map((t: any) => ({ ...t, type: 'trail' })));
    } else if (mode === 'pis') {
      const PIs = await searchPIs({ name: query, ...piFilters });
      setResults(PIs.map((t: any) => ({ ...t, type: 'pi' })));
    }
  };
  return {
    query, setQuery,
    mode, setMode,
    structureFilters, setStructureFilters,
    trailFilters, setTrailFilters,
    piFilters, setPIFilters,
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