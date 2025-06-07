import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon, X } from 'lucide-react';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  initialValue?: string;
  onSearch?: (query: string) => void;
}

const SearchBar = ({
  className,
  placeholder = 'Search for medicines...',
  initialValue = '',
  onSearch,
}: SearchBarProps) => {
  const [query, setQuery] = useState(initialValue);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
    if (query.trim() !== '') {
      setHasSearched(true);
    }
  };

  const handleClear = () => {
    setQuery('');
    setHasSearched(false);
    if (onSearch) {
      onSearch('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (e.target.value === '') {
      setHasSearched(false);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className={cn('relative w-full max-w-3xl mx-auto', className)}
    >
      <div className="relative flex items-center">
        <SearchIcon className="absolute left-3 h-5 w-5 text-muted-foreground pointer-events-none" />

        <Input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="pl-10 pr-16 py-6 h-12 bg-background border border-input focus-visible:ring-accent rounded-full"
        />

        {hasSearched ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 h-10 w-10 rounded-full"
            onClick={handleClear}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Clear search</span>
          </Button>
        ) : (
          <Button
            type="submit"
            size="sm"
            className="absolute right-1 h-10 rounded-full px-4 bg-blue-500"
          >
            Search
          </Button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;
