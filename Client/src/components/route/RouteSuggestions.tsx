import { demoLocations } from '../../data/demo-locations';
import type { DemoLocation } from '../../types/route';
import './RouteSuggestions.css';

interface RouteSuggestionsProps {
  query: string;
  onSelect: (loc: DemoLocation) => void;
}

export function RouteSuggestions({ query, onSelect }: RouteSuggestionsProps) {
  const filtered = query.length === 0
    ? demoLocations
    : demoLocations.filter((loc) =>
        loc.name.toLowerCase().includes(query.toLowerCase())
      );

  if (filtered.length === 0) return null;

  return (
    <div className="route-suggestions">
      {filtered.map((loc) => ( 
        <button
          key={loc.id}
          className="route-suggestion-item"
          onClick={() => onSelect(loc)}
        >
          <span className="suggestion-pin icon">location_on</span>
          <span>{loc.name}</span>
        </button>
      ))}
    </div>
  );
}
