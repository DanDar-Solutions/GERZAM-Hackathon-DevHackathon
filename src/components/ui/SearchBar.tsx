import './SearchBar.css';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onFocus?: () => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, onFocus, placeholder = 'Хаашаа явах вэ?' }: SearchBarProps) {
  return (
    <div className="search-bar">
      <span className="search-icon icon">search</span>
      <input
        className="search-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        placeholder={placeholder}
      />
      {value && (
        <button className="search-clear" onClick={() => onChange('')}>
          <span className="icon">close</span>
        </button>
      )}
    </div>
  );
}
