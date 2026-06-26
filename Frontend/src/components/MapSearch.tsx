import { useState, useCallback } from 'react';
import { Search, MapPin } from 'lucide-react';

interface StationSearchResult {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
}

interface MapSearchProps {
  stations: StationSearchResult[];
  onSelectStation: (station: StationSearchResult) => void;
  searchPlaceholder?: string;
}

export default function MapSearch({
  stations,
  onSelectStation,
  searchPlaceholder = 'Search',
}: MapSearchProps) {
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? stations.filter((s) => {
        const q = query.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.location.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q)
        );
      })
    : stations;

  const handleSelect = useCallback(
    (station: StationSearchResult) => {
      onSelectStation(station);
      setQuery('');
    },
    [onSelectStation]
  );

  return (
    <div>
      <div className="stationListSearchBar" style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: '1px 15px',
        gap: 25,
        width: '100%',
        height: 35,
        background: 'rgba(255,255,255,0.5)',
        border: '1px solid #070F29',
        borderRadius: 100,
        boxSizing: 'border-box',
      }}>
        <Search size={16} style={{ color: 'rgba(0,0,0,0.5)', flexShrink: 0 }} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            font: '400 14px/20px Inter, sans-serif',
            color: 'rgba(0,0,0,0.5)',
            width: '100%',
          }}
        />
      </div>

      {query.trim() && (
        <div style={{
          marginTop: 8,
          maxHeight: 240,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}>
          {filtered.length === 0 ? (
            <div style={{
              padding: '8px 13px',
              color: 'rgba(255,255,255,0.5)',
              fontSize: 14,
              fontFamily: 'Inter, sans-serif',
            }}>
              ไม่พบสถานี
            </div>
          ) : (
            filtered.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSelect(s)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '4px 13px',
                  height: 30,
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: 100,
                  border: 'none',
                  cursor: 'pointer',
                  font: '400 14px/20px Inter, sans-serif',
                  color: '#FFFFFF',
                  textAlign: 'left',
                  boxSizing: 'border-box',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.2)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)';
                }}
              >
                <MapPin size={14} style={{ flexShrink: 0, opacity: 0.7 }} />
                <span style={{ minWidth: 47 }}>{s.name}</span>
                <span style={{
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  opacity: 0.7,
                }}>
                  {s.location}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
