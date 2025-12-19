import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: (query: string) => void;
  onClear: () => void;
}

export function SearchBar({ query, onQueryChange, onSearch, onClear }: SearchBarProps) {
  const handleSearch = () => {
    onSearch(query);
  };

  const handleClear = () => {
    onClear();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="자연어로 검색하세요 (예: 20대 남성, 흡연자, OTT 이용자 등)..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pl-12 pr-12 h-16 text-lg border-2 shadow-lg focus:shadow-xl transition-shadow bg-white"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      <Button 
        onClick={handleSearch} 
        disabled={!query.trim()} 
        className="h-16 px-8 disabled:opacity-100 disabled:bg-primary"
      >
        검색
      </Button>
    </div>
  );
}
