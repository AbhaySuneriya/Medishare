
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import FilterPanel, { FilterValues } from '@/components/FilterPanel';
import MedicineCard from '@/components/MedicineCard';
import { Button } from '@/components/ui/button';
import { Grid, List, MapPin, PlusCircle, Loader2 } from 'lucide-react';
import { getMedicines, Medicine } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { getUserLocation, formatDistance, DEFAULT_LOCATION } from '@/lib/location';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const Medicines = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterValues>({
    type: 'all',
    sortBy: 'distance',
    categories: [],
    distance: 10,
  });
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [locationRequested, setLocationRequested] = useState(false);

  // Request location on component mount
  useEffect(() => {
    requestLocation();
  }, []);

  // Function to request user location
  const requestLocation = async () => {
    try {
      const location = await getUserLocation();
      setUserLocation(location);
      // console.log('User location obtained:', location);
    } catch (error) {
      console.error('Failed to get user location:', error);
      if (!locationRequested) {
        setShowLocationDialog(true);
        setLocationRequested(true);
      }
    }
  };

  // Convert filters to the format expected by our API
  const apiFilters = {
    // Fix: Convert string type to boolean for isFree
    isFree: filters.type === 'free' ? true : 
            filters.type === 'paid' ? false : 
            undefined,
    // Add user location to filters if available
    lat: userLocation?.lat,
    lng: userLocation?.lng,
    // Add category filter
    category: filters.category,
    // Add sort filter
    sortBy: filters.sortBy,
  };

  // Fetch medicines with React Query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['medicines', searchQuery, apiFilters],
    queryFn: async () => {
      try {
        const { data, error } = await getMedicines(searchQuery, apiFilters);
        if (error) throw new Error(error.message || 'Failed to fetch medicines');
        return data || [];
      } catch (err: any) {
        console.error('Error in medicines query:', err);
        throw new Error(err.message || 'An unexpected error occurred');
      }
    },
  });

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Map the Supabase data structure to our component props
  const mapMedicineData = (medicine: Medicine) => ({
    id: medicine.id,
    name: medicine.name,
    description: medicine.description,
    image: medicine.image_url,
    expiry: medicine.expiry,
    distance: medicine.distance !== undefined 
      ? formatDistance(medicine.distance) 
      : 'Distance unknown',
    isFree: medicine.is_free,
    price: medicine.is_free ? undefined : `₹${medicine.price}`,
    locality: medicine.locality,
  });

  // Handle user agreeing to share location
  const handleShareLocation = () => {
    setShowLocationDialog(false);
    requestLocation();
  };

  // Show error toast if the query fails
  useEffect(() => {
    if (error) {
      toast.error('Failed to load medicines. Please try again.');
      // console.error('Medicine fetch error:', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-secondary/30">
      <Header />
      
      {/* Location Permission Dialog */}
      <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enable Location Services</DialogTitle>
            <DialogDescription>
              To show you medicines nearby and calculate distances accurately, we need 
              your location. This helps find donations closest to you.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLocationDialog(false)}>
              Not Now
            </Button>
            <Button onClick={handleShareLocation}>
              <MapPin className="h-4 w-4 mr-2" />
              Share My Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Page Header */}
      <div className="pt-28 pb-8 bg-white">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Browse Medicines</h1>
          <p className="text-muted-foreground mb-6">
            Find donated and affordable medicines near you
          </p>
          
          {/* Search Bar */}
          <SearchBar 
            initialValue={searchQuery}
            onSearch={handleSearch} 
            className="mb-4"
          />
          
          {/* Location Status */}
          {!userLocation && !isLoading && (
            <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-sm flex items-center">
              <MapPin className="h-4 w-4 text-yellow-500 mr-2" />
              <span>
                Location services are disabled. 
                <Button 
                  variant="link" 
                  className="h-auto p-0 ml-1 text-sm" 
                  onClick={requestLocation}
                >
                  Enable location
                </Button> 
                to see how far medicines are from you.
              </span>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
            {/* View Toggle */}
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-l-md rounded-r-none "
              >
                <Grid className="h-4 w-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-r-md rounded-l-none"
              >
                <List className="h-4 w-4 mr-2" />
                List
              </Button>
            </div>
            
            {/* Map View Button */}
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="rounded-md ">
                <MapPin className="h-4 w-4 mr-2" />
                Map View
              </Button>
              <Link to="/donate">
                <Button size="sm" className="rounded-md bg-blue-500 hover:bg-blue-600">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Listing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-1/4">
            <FilterPanel 
              className="lg:sticky lg:top-28"
              initialFilters={filters}
              onFiltersChange={setFilters}
            />
          </aside>
          
          {/* Medicines Grid */}
          <main className="lg:w-3/4">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
                <span className="ml-2 text-lg">Loading medicines...</span>
              </div>
            ) : data && data.length === 0 ? (
              <div className="glass text-center p-12 rounded-lg">
                <h3 className="text-xl font-medium mb-2">No medicines found</h3>
                <p className="text-muted-foreground mb-6">
                  {user ? 
                    "Try adjusting your filters or search query, or be the first to donate a medicine!" :
                    "Try adjusting your filters or search query, or sign in to donate a medicine!"
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => {
                      setSearchQuery('');
                      setFilters({
                        type: 'all',
                        sortBy: 'distance',
                        categories: [],
                        distance: 10,
                      });
                    }}
                  >
                    Reset Filters
                  </Button>
                  {user ? (
                    <Link to="/donate">
                      <Button variant="outline">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Donate Medicine
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/signin">
                      <Button variant="outline">
                        Sign In to Donate
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium">
                    {data?.length} {data?.length === 1 ? 'Result' : 'Results'}
                  </h2>
                </div>
                
                <div className={
                  viewMode === 'grid'
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                }>
                  {data?.map(medicine => (
                    <MedicineCard
                      key={medicine.id}
                      {...mapMedicineData(medicine)}
                      className={viewMode === 'list' ? "flex flex-col md:flex-row md:h-56" : ""}
                    />
                  ))}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white py-12 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} MedShare. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Medicines;
