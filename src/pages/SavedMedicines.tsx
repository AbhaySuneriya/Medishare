
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getUserSavedMedicines, unsaveMedicine } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, BookmarkCheck } from 'lucide-react';

const SavedMedicines = () => {
  const { user } = useAuth();
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  // Fetch saved medicines
  const { data: medicines, isLoading, refetch } = useQuery({
    queryKey: ['saved-medicines'],
    queryFn: async () => {
      if (!user) return { data: [], error: new Error('Not authenticated') };
      return getUserSavedMedicines(user.id);
    },
  });

  // Format date for display
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Remove from saved
  const handleRemoveFromSaved = async (medicineId: string) => {
    if (!user) {
      toast.error('You must be logged in to unsave medicines');
      return;
    }

    try {
      setIsRemoving(medicineId);
      const { error } = await unsaveMedicine(user.id, medicineId);
      
      if (error) throw error;
      
      toast.success('Medicine removed from saved');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove medicine');
    } finally {
      setIsRemoving(null);
    }
  };

  return (
    <div className="min-h-screen bg-secondary/20">
      <Header />
      
      <div className="container mx-auto px-4 pt-28 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Saved Medicines</h1>
          <p className="text-muted-foreground">Medicines you've saved for later</p>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">Loading saved medicines...</div>
        ) : !medicines?.data?.length ? (
          <div className="text-center py-12 bg-background rounded-lg shadow-sm border">
            <BookmarkCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No saved medicines</h3>
            <p className="text-muted-foreground mb-6">
              You haven't saved any medicines yet. Browse available medicines and save them for later.
            </p>
            <Link to="/medicines">
              <Button>Browse Medicines</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {medicines.data.map((medicine: any) => (
              <Card key={medicine.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/4 aspect-square md:aspect-auto">
                    <img
                      src={medicine.image_url || "https://placehold.co/400x400?text=No+Image"}
                      alt={medicine.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  
                  <div className="p-4 md:p-6 flex-1 flex flex-col">
                    <div className="flex justify-between mb-2">
                      <Badge className={medicine.is_free ? "bg-green-500" : ""}>
                        {medicine.is_free ? "Free" : `₹${medicine.price}`}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        Saved on {formatDate(medicine.saved_at || medicine.created_at)}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-1">{medicine.name}</h3>
                    
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                      <MapPin className="h-3 w-3" />
                      <span>{medicine.locality}</span>
                    </div>
                    
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                      {medicine.description}
                    </p>
                    
                    <div className="flex items-center gap-1 text-sm mb-2">
                      <Calendar className="h-3 w-3" />
                      <span className="text-muted-foreground">Expires: </span>
                      <span>{medicine.expiry}</span>
                    </div>
                    
                    <div className="mt-auto flex flex-wrap gap-2">
                      <Link to={`/medicine/${medicine.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                        onClick={() => handleRemoveFromSaved(medicine.id)}
                        disabled={isRemoving === medicine.id}
                      >
                        {isRemoving === medicine.id ? 'Removing...' : 'Remove from Saved'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedMedicines;
