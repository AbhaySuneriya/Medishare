
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  Share, 
  MapPin, 
  Calendar, 
  User, 
  MessageCircle, 
  Flag, 
  ArrowLeft,
  Star,
  ExternalLink,
  Loader2,
  Trash2,
  Phone,
  Mail,
  Home,
  Gift
} from 'lucide-react';
import { getMedicineById, getUserProfile, deleteMedicineById, saveMedicine, isMedicineSaved, unsaveMedicine } from '@/lib/supabase';
import { toast } from 'sonner';
import GoogleMap from '@/components/GoogleMap';
import { getUserLocation, formatDistance, calculateDistance } from '@/lib/location';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const MedicineDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [donorInfo, setDonorInfo] = useState<{
    name: string;
    joinedDate: string;
    rating: number;
    totalDonations: number;
    id: string;
    phoneNumber?: string;
    email?: string;
    address?: string;
  }>({
    name: 'Anonymous Donor',
    joinedDate: 'Unknown',
    rating: 5.0,
    totalDonations: 0,
    id: ''
  });
  
  // Request user location when component mounts
  useEffect(() => {
    const getLocation = async () => {
      try {
        const location = await getUserLocation();
        setUserLocation(location);
      } catch (error) {
        console.error('Error getting user location:', error);
      }
    };
    
    getLocation();
  }, []);
  
  // Fetch medicine with React Query
  const { data: medicine, isLoading, error, refetch } = useQuery({
    queryKey: ['medicine', id, userLocation],
    queryFn: async () => {
      if (!id) throw new Error('Medicine ID is required');
      const { data, error } = await getMedicineById(id);
      if (error) throw new Error(error.message || 'Failed to fetch medicine details');
      
      if (!data) {
        throw new Error('Medicine not found');
      }
      
      // Calculate distance if user location is provided
      let distance = 'Distance unknown';
      if (userLocation && data.latitude && data.longitude) {
        const distanceKm = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          data.latitude,
          data.longitude
        );
        distance = formatDistance(distanceKm);
      }
      
      // Fetch donor information
      if (data.user_id) {
        try {
          // Use the getUserProfile function to get user data
          const { data: userData, error: userError } = await getUserProfile(data.user_id);
            
          if (!userError && userData) {
            // console.log("Donor user data:", userData);
            setDonorInfo({
              name: userData.display_name || userData.email || 'Anonymous Donor',
              joinedDate: new Date(userData.created_at).toLocaleDateString(),
              phoneNumber: userData.phone_number,
              email: userData.email,
              address: userData.address || 'Address not provided',
              rating: 5.0,
              totalDonations: userData.total_donations || 0,
              id: data.user_id
            });
          } else {
            console.error('User profile fetch error:', userError);
          }
        } catch (e) {
          console.error('Error fetching donor info:', e);
        }
      }
      
      // Check if medicine is saved by current user
      if (user) {
        try {
          const { isSaved } = await isMedicineSaved(user.id, id);
          setIsSaved(isSaved);
        } catch (e) {
          console.error('Error checking if medicine is saved:', e);
        }
      }
      
      // Format the data to match the expected structure
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        image: data.image_url,
        additionalImages: [],
        expiry: data.expiry,
        distance: distance,
        isFree: data.is_free,
        price: data.is_free ? undefined : data.price,
        locality: data.locality,
        quantity: '1 unit',
        condition: 'Not specified',
        category: data.category || 'Not categorized',
        prescriptionRequired: false,
        donor: {
          id: data.user_id,
          name: donorInfo.name,
          joinedDate: donorInfo.joinedDate,
          rating: donorInfo.rating,
          totalDonations: donorInfo.totalDonations,
          phoneNumber: donorInfo.phoneNumber,
          email: donorInfo.email,
          address: donorInfo.address
        },
        listedDate: new Date(data.created_at).toLocaleDateString(),
        location: {
          lat: data.latitude || 0,
          lng: data.longitude || 0
        },
        user_id: data.user_id
      };
    },
    enabled: !!id,
  });
  
  // Show error toast if the query fails
  useEffect(() => {
    if (error) {
      toast.error('Failed to load medicine details. Please try again.');
      // console.error('Medicine detail fetch error:', error);
    }
  }, [error]);
  
  // Check if location data is valid
  const hasValidLocation = medicine?.location && 
    medicine.location.lat !== 0 && 
    medicine.location.lng !== 0;
  
  // Handler for view profile button
  const handleViewProfile = () => {
    if (medicine?.donor?.id) {
      navigate(`/profile/${medicine.donor.id}`);
    } else {
      toast.error("Could not find donor profile information");
    }
  };

  // Check if current user is the owner of this medicine
  const isOwner = user && medicine?.user_id === user.id;

  // Handle medicine deletion
  const handleDelete = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    try {
      const { error } = await deleteMedicineById(id);
      
      if (error) {
        toast.error('Failed to delete medicine. Please try again.');
        // console.error('Delete error:', error);
      } else {
        toast.success('Medicine deleted successfully!');
        navigate('/medicines');
      }
    } catch (err) {
      // console.error('Error during delete:', err);
      toast.error('An unexpected error occurred while deleting');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Handle save/unsave medicine
  const handleSaveMedicine = async () => {
    if (!user) {
      toast.error('You must be logged in to save medicines');
      navigate('/signin', { state: { from: `/medicine/${id}` } });
      return;
    }

    if (!id) return;

    setIsSaving(true);
    try {
      if (isSaved) {
        // Unsave the medicine
        const { error } = await unsaveMedicine(user.id, id);
        if (error) throw error;
        setIsSaved(false);
        toast.success('Medicine removed from saved items');
      } else {
        // Save the medicine
        const { error } = await saveMedicine(user.id, id);
        if (error) throw error;
        setIsSaved(true);
        toast.success('Medicine saved successfully!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update saved status');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary/30">
        <Header />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="animate-pulse space-y-4 max-w-6xl mx-auto">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-2/3">
                <div className="aspect-[4/3] bg-gray-200 rounded-lg mb-4"></div>
                <div className="flex gap-2 mb-6">
                  <div className="h-20 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-20 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-20 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="md:w-1/3">
                <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-48 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!medicine) {
    return (
      <div className="min-h-screen bg-secondary/30">
        <Header />
        <div className="container mx-auto px-4 pt-28 pb-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Medicine Not Found</h1>
          <p className="mb-6">The medicine you're looking for doesn't exist or has been removed.</p>
          <Link to="/medicines">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Medicines
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-secondary/30">
      <Header />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this medicine?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this medicine listing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 pt-28 pb-12">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-accent">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/medicines" className="hover:text-accent">Medicines</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{medicine?.name}</span>
        </div>
        
        {/* Main content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Medicine Details */}
          <div className="lg:w-2/3">
            {/* Back Button */}
            <Link to="/medicines" className="inline-flex items-center text-sm text-muted-foreground hover:text-accent mb-4">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to listings
            </Link>
            
            {/* Owner Actions */}
            {isOwner && (
              <div className="mb-4 flex justify-end">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  className="flex items-center"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Listing
                </Button>
              </div>
            )}
            
            {/* Main Image */}
            <div className="glass rounded-xl overflow-hidden mb-4">
              <div className="aspect-[16/9] relative">
                <img 
                  src={medicine.image} 
                  alt={medicine.name} 
                  className="w-full h-full object-cover" 
                />
                <Badge 
                  className={`absolute top-4 left-4 ${medicine.isFree ? 'bg-green-500 hover:bg-green-600' : ''}`}
                >
                  {medicine.isFree ? 'Free Donation' : `₹${medicine.price}`}
                </Badge>
              </div>
            </div>
            
            {/* Additional Images */}
            {medicine.additionalImages && medicine.additionalImages.length > 0 && (
              <div className="flex gap-4 mb-8">
                {medicine.additionalImages.map((img: string, index: number) => (
                  <div key={index} className="w-1/3 glass rounded-lg overflow-hidden">
                    <div className="aspect-square">
                      <img 
                        src={img} 
                        alt={`${medicine.name} - image ${index+2}`} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  </div>
                ))}
                <div className="w-1/3 glass rounded-lg overflow-hidden bg-accent/10 flex items-center justify-center">
                  <Button variant="ghost" className="text-accent">
                    View All Photos
                  </Button>
                </div>
              </div>
            )}
            
            {/* Medicine Details */}
            <h1 className="text-3xl font-bold mb-2">{medicine.name}</h1>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {medicine.locality}
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Listed {medicine.listedDate}
              </div>
            </div>
            
            {/* Donor Information Card - Prominent display */}
            <div className="glass rounded-lg p-6 mb-6 border ">
              <h2 className="text-xl font-semibold mb-4 flex items-center ">
                <User className="h-5 w-5 mr-2" />
                Donor Information
              </h2>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full  flex items-center justify-center bg-gray-200 mr-3">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-medium text-lg">{donorInfo.name}</div>
                  <div className="text-sm text-muted-foreground">Member since {donorInfo.joinedDate}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {donorInfo.phoneNumber && (
                  <div className="flex items-center p-3 border rounded-md">
                    <Phone className="h-5 w-5 text-accent mr-2" />
                    <div>
                      <div className="text-xs text-muted-foreground">Phone Number</div>
                      <div className="font-medium">{donorInfo.phoneNumber}</div>
                    </div>
                  </div>
                )}
                
                {donorInfo.email && (
                  <div className="flex items-center p-3 border rounded-md">
                    <Mail className="h-5 w-5 mr-2" />
                    <div>
                      <div className="text-xs text-muted-foreground">Email</div>
                      <div className="font-medium">{donorInfo.email}</div>
                    </div>
                  </div>
                )}
                
                {donorInfo.address && (
                  <div className="flex items-center p-3 border rounded-md">
                    <Home className="h-5 w-5  mr-2" />
                    <div>
                      <div className="text-xs text-muted-foreground">Address</div>
                      <div className="font-medium">{donorInfo.address}</div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center p-3 border rounded-md">
                  <Gift className="h-5 w-5 mr-2" />
                  <div>
                    <div className="text-xs text-muted-foreground">Total Donations</div>
                    <div className="font-medium">{donorInfo.totalDonations} {donorInfo.totalDonations === 1 ? 'medicine' : 'medicines'}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center text-sm mb-4">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="font-medium mr-1">{donorInfo.rating}</span>
                <span className="text-muted-foreground">Rating</span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
  {donorInfo.phoneNumber && (
    <Button className="w-full sm:w-1/3" asChild>
      <a href={`tel:${donorInfo.phoneNumber}`}>
        <Phone className="mr-2 h-4 w-4" />
        Call Donor
      </a>
    </Button>
  )}

  {donorInfo.email && (
    <Button className="w-full sm:w-1/3" variant="outline" asChild>
      <a href={`mailto:${donorInfo.email}`}>
        <Mail className="mr-2 h-4 w-4" />
        Email Donor
      </a>
    </Button>
  )}

  <Button
    variant="outline"
    className="w-full sm:w-1/3"
    onClick={handleViewProfile}
  >
    <User className="mr-2 h-4 w-4" />
    View Profile
  </Button>
</div>

            </div>
            
            <Separator className="my-6" />
            
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <p className="text-muted-foreground">{medicine.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass rounded-lg p-4">
                  <h3 className="font-medium mb-3">Medicine Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category</span>
                      <span className="font-medium">{medicine.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quantity</span>
                      <span className="font-medium">{medicine.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Condition</span>
                      <span className="font-medium">{medicine.condition}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expiry Date</span>
                      <span className="font-medium">{medicine.expiry}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prescription Required</span>
                      <span className="font-medium">{medicine.prescriptionRequired ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="glass rounded-lg p-4">
                  <h3 className="font-medium mb-3">Location Information</h3>
                  {hasValidLocation ? (
                    <div className="space-y-3">
                      <div className="aspect-video">
                        <GoogleMap 
                          donorLocation={medicine.location}
                          donorAddress={medicine.locality}
                        />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>This map shows the route from your current location to the approximate location of the donor.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-[4/3] bg-gray-100 rounded mb-3 flex items-center justify-center">
                      <div className="text-center p-4">
                        <MapPin className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Location data not available. Contact the donor for details.
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-muted-foreground">Approximate Location</span>
                    <span className="font-medium">{medicine.locality}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            {/* Safety Tips */}
            <div className="glass rounded-lg p-5 bg-blue-50/50 border border-blue-100">
              <h3 className="font-semibold text-blue-700 mb-3">Safety Tips</h3>
              <ul className="text-sm text-blue-700/80 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  Always check medicine expiry dates before consumption
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  Verify the packaging and seals are intact
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  If prescription is required, share it only through our secure system
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  Meet in public places for exchange or use our secure delivery options
                </li>
              </ul>
            </div>
          </div>
          
          {/* Right Column - Actions */}
          <div className="lg:w-1/3 space-y-6">
            {/* Action Card */}
            <Card className="glass overflow-hidden">
              <div className="p-6">
                <h3 className="font-semibold mb-4">Interested in this medicine?</h3>
                {donorInfo.phoneNumber ? (
                  <Button className="w-full mb-3" asChild>
                    <a href={`tel:${donorInfo.phoneNumber}`}>
                      <Phone className="mr-2 h-4 w-4" />
                      Call Donor: {donorInfo.phoneNumber}
                    </a>
                  </Button>
                ) : donorInfo.email ? (
                  <Button className="w-full mb-3" asChild>
                    <a href={`mailto:${donorInfo.email}`}>
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Email Donor: {donorInfo.email}
                    </a>
                  </Button>
                ) : (
                  <Button className="w-full mb-3" onClick={handleViewProfile}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Contact Donor
                  </Button>
                )}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="w-1/2" 
                    onClick={handleSaveMedicine}
                    disabled={isSaving}
                  >
                    <Heart className={`mr-2 h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                    {isSaving ? 'Processing...' : isSaved ? 'Saved' : 'Save'}
                  </Button>
                  <Button variant="outline" className="w-1/2">
                    <Share className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
                
                {medicine.prescriptionRequired && (
                  <div className="mt-4 text-sm text-muted-foreground">
                    <span className="text-red-500 font-medium block mb-1">Prescription Required</span>
                    You'll need to share a valid prescription to request this medicine.
                  </div>
                )}
              </div>
            </Card>
            
            {/* Similar Listings */}
            <Card className="glass overflow-hidden">
              <div className="p-6">
                <h3 className="font-semibold mb-4">Similar Listings</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded">
                      <img 
                        src="https://images.unsplash.com/photo-1550572017-9baed4d4326f?ixlib=rb-4.0.3&q=85&w=150&h=150" 
                        alt="Similar medicine" 
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">Paracetamol 650mg</div>
                      <div className="text-xs text-muted-foreground">0.8 km away • Free</div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded">
                      <img 
                        src="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&q=85&w=150&h=150" 
                        alt="Similar medicine" 
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">Cefalexin 250mg</div>
                      <div className="text-xs text-muted-foreground">2.3 km away • ₹12</div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded">
                      <img 
                        src="https://images.unsplash.com/photo-1576602976047-174e57a47881?ixlib=rb-4.0.3&q=85&w=150&h=150" 
                        alt="Similar medicine" 
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">Amoxiclav 625mg</div>
                      <div className="text-xs text-muted-foreground">3.4 km away • Free</div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4 text-sm">
                  View All Similar Listings
                </Button>
              </div>
            </Card>
            
            {/* Report Button */}
            <div className="text-center">
              <Button variant="ghost" size="sm" className="text-muted-foreground text-xs">
                <Flag className="h-3 w-3 mr-1" />
                Report this listing
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} MedShare. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default MedicineDetail;
