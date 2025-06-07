
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Filter, ArrowUpDown, MapPin, Clock, Heart, Tag } from 'lucide-react';

export interface FilterValues {
  type: 'all' | 'free' | 'paid';
  sortBy: 'distance' | 'expiry' | 'recent';
  categories: string[];
  distance: number;
  category?: string; // Add single category selection
}

interface FilterPanelProps {
  className?: string;
  initialFilters?: Partial<FilterValues>;
  onFiltersChange?: (filters: FilterValues) => void;
}

const FilterPanel = ({ className, initialFilters, onFiltersChange }: FilterPanelProps) => {
  const [distance, setDistance] = useState<number[]>([initialFilters?.distance || 10]);
  const [filters, setFilters] = useState<FilterValues>({
    type: initialFilters?.type || 'all',
    sortBy: initialFilters?.sortBy || 'distance',
    categories: initialFilters?.categories || [],
    distance: initialFilters?.distance || 10,
    category: initialFilters?.category || undefined,
  });

  // Apply filters when they change
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(filters);
    }
  }, [filters, onFiltersChange]);

  const handleFilterChange = (key: keyof FilterValues, value: any) => {
    setFilters(prev => {
      // Ensure we're setting the correct types
      if (key === 'type' && (value === 'all' || value === 'free' || value === 'paid')) {
        return { ...prev, [key]: value };
      }
      else if (key === 'sortBy' && (value === 'distance' || value === 'expiry' || value === 'recent')) {
        return { ...prev, [key]: value };
      }
      else if (key === 'categories' || key === 'distance' || key === 'category') {
        return { ...prev, [key]: value };
      }
      return prev;
    });
  };

  const handleCategoryToggle = (category: string) => {
    // If this category is already selected as the single category, deselect it
    if (filters.category === category) {
      handleFilterChange('category', undefined);
      return;
    }
    
    // Set this as the single selected category
    handleFilterChange('category', category);
    
    // Also update the categories array for backward compatibility
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    
    handleFilterChange('categories', newCategories);
  };

  const handleDistanceChange = (value: number[]) => {
    setDistance(value);
    handleFilterChange('distance', value[0]);
  };

  const resetFilters = () => {
    const defaultFilters: FilterValues = {
      type: 'all',
      sortBy: 'distance',
      categories: [],
      distance: 10,
      category: undefined
    };
    setFilters(defaultFilters);
    setDistance([10]);
  };

  const categories = [
    'Antibiotics',
    'Pain Relief',
    'Vitamins',
    'Supplements',
    'Diabetes',
    'Cardiovascular',
    'Respiratory',
    'Equipment',
  ];

  const typeOptions = [
    { label: 'All', value: 'all' },
    { label: 'Free / Donations', value: 'free' },
    { label: 'For Sale', value: 'paid' },
  ];

  const sortOptions = [
    { label: 'Nearest First', value: 'distance', icon: MapPin },
    { label: 'Expiring Soon', value: 'expiry', icon: Clock },
    { label: 'Newest Listings', value: 'recent', icon: ArrowUpDown },
  ];

  return (
    <div className={cn('p-5 glass rounded-xl', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium flex items-center">
          <Filter className="mr-2 h-5 w-5" />
          Filters
        </h3>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={resetFilters}
        >
          Reset
        </Button>
      </div>

      {/* Listing Type Filter */}
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-3 flex items-center">
          <Tag className="mr-2 h-4 w-4" />
          Listing Type
        </h4>
        <div className="flex flex-wrap gap-2">
          {typeOptions.map(option => (
            <Button
              key={option.value}
              variant={filters.type === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange('type', option.value as 'all' | 'free' | 'paid')}
              className={cn(
                'rounded-full text-xs h-8',
                option.value === 'free' && filters.type === 'free' && 'bg-green-500 hover:bg-green-600',
                option.value === 'free' && filters.type !== 'free' && 'border-green-200 text-green-700'
              )}
            >
              {option.value === 'free' && <Heart className="mr-1 h-3 w-3" />}
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <Separator className="my-4" />

      {/* Sort By Filter */}
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-3 flex items-center">
          <ArrowUpDown className="mr-2 h-4 w-4" />
          Sort By
        </h4>
        <div className="flex flex-col space-y-2">
          {sortOptions.map(option => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => handleFilterChange('sortBy', option.value as 'distance' | 'expiry' | 'recent')}
                className={cn(
                  'flex items-center px-3 py-2 rounded-md text-sm transition-colors',
                  filters.sortBy === option.value
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-blue-50 text-muted-foreground'
                )}
              >
                <Icon className="mr-2 h-4 w-4" />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <Separator className="my-4" />

      {/* Distance Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium flex items-center">
            <MapPin className="mr-2 h-4 w-4" />
            Distance
          </h4>
          <span className="text-sm font-medium text-muted-foreground">
            {distance[0]} km
          </span>
        </div>
        <Slider
          defaultValue={[10]}
          max={50}
          step={1}
          value={distance}
          onValueChange={handleDistanceChange}
          className="my-4"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0 km</span>
          <span>50 km</span>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Categories */}
      <div>
        <h4 className="text-sm font-medium mb-3">Categories</h4>
        <div className="flex flex-wrap gap-2 mb-2">
          {categories.map(category => (
            <Badge
              key={category}
              variant={filters.category === category ? "default" : "outline"}
              className={cn(
                'cursor-pointer rounded-full',
                filters.category === category ? 'bg-blue-500' : 'hover:bg-blue-100'
              )}
              onClick={() => handleCategoryToggle(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
