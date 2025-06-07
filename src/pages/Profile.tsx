import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Calendar, User, Package, Heart, Settings, Edit, Mail, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getUserDonations, getUserProfile, UserProfile } from '@/lib/supabase';
import { toast } from 'sonner';

// Import our new components
import ProfileForm from '@/components/ProfileForm';
import SecuritySettings from '@/components/SecuritySettings';
import VerificationStatus from '@/components/VerificationStatus';
import MedicineStats from '@/components/MedicineStats';

type ProfileSection = 'overview' | 'donations' | 'received' | 'saved' | 'settings';

const Profile = () => {
  const { userId } = useParams<{ userId?: string }>();
  const [tab, setTab] = useState<ProfileSection>('overview');
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  
  // Check if we're viewing the current user's profile
  useEffect(() => {
    const checkCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsCurrentUser(!userId || session.user.id === userId);
      }
    };
    
    checkCurrentUser();
  }, [userId]);
  
  // Fetch user profile based on userId or current user
  const { data: userProfile, isLoading: isLoadingProfile, refetch: refetchProfile } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      // If no userId is provided, get the current user
      if (!userId) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Not authenticated');
        }
        
        return getUserProfile(session.user.id);
      }
      
      // Otherwise get the specified user profile
      return getUserProfile(userId);
    }
  });
  
  // Fetch donations made by this user
  const { data: donations, isLoading: isLoadingDonations } = useQuery({
    queryKey: ['donations', userId],
    queryFn: async () => {
      // Get user ID (either from params or current user)
      const id = userId || (await supabase.auth.getSession()).data.session?.user.id;
      
      if (!id) {
        throw new Error('User ID not available');
      }
      
      return getUserDonations(id);
    },
    enabled: tab === 'donations' || tab === 'overview' // Fetch for overview and donations tabs
  });
  
  const userEmail = userProfile?.data?.email || 'User';
  const userName = userProfile?.data?.display_name || userEmail;
  
  // Format timestamp to readable date
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Format timestamp to "Member since Month Year"
  const getMemberSince = (timestamp?: string) => {
    if (!timestamp) return 'New member';
    
    return `Member since ${new Date(timestamp).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    })}`;
  };

  // Handle profile update success
  const handleProfileUpdateSuccess = () => {
    refetchProfile();
    toast.success('Profile updated successfully');
  };
  
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  // Simplified for demo: Check if these verifications are done
  const isEmailVerified = true; // In a real app, this would be checked from user metadata
  const isPhoneVerified = false;
  const isIdVerified = false;
  
  return (
    <div className="min-h-screen bg-secondary/20">
      <Header />
      
      <div className="container mx-auto px-4 pt-28 pb-16">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
            <Avatar className="h-20 w-20 md:h-24 md:w-24">
              <AvatarImage src={userProfile?.data?.avatar_url} alt={userName} />
              <AvatarFallback className="text-lg">
                {userName ? getInitials(userName) : <User className="h-10 w-10" />}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold">{userName}</h1>
              <p className="text-muted-foreground">{getMemberSince(userProfile?.data?.created_at)}</p>
              
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="outline" className="flex items-center gap-1 px-2 py-1">
                  <Package className="h-3 w-3" />
                  <span>{donations?.data?.length || 0} Donations</span>
                </Badge>
                
                <Badge variant="outline" className="flex items-center gap-1 px-2 py-1">
                  <Heart className="h-3 w-3" />
                  <span>0 Received</span>
                </Badge>
              </div>
            </div>
            
            {isCurrentUser && (
              <Button variant="outline" size="sm" className="ml-auto">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
        
        {/* Profile Content */}
        <Tabs defaultValue="overview" onValueChange={(value) => setTab(value as ProfileSection)}>
          <TabsList className="w-full grid grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="donations" className="flex gap-1">
              <Package className="h-4 w-4 md:hidden" />
              <span>Donations</span>
            </TabsTrigger>
            <TabsTrigger value="received" className="flex gap-1">
              <Heart className="h-4 w-4 md:hidden" />
              <span>Received</span>
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex gap-1">
              <Heart className="h-4 w-4 md:hidden" />
              <span>Saved</span>
            </TabsTrigger>
            {isCurrentUser && (
              <TabsTrigger value="settings" className="flex gap-1">
                <Settings className="h-4 w-4 md:hidden" />
                <span>Settings</span>
              </TabsTrigger>
            )}
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Medicine Statistics */}
                <MedicineStats 
                  donated={donations?.data?.length || 0} 
                  received={0} 
                  saved={0} 
                />
                
                {/* Recent Donations Preview - Show latest 2 */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Recent Donations</h2>
                  
                  {isLoadingDonations ? (
                    <div className="text-center py-4">Loading donations...</div>
                  ) : donations?.data?.length ? (
                    <div className="grid grid-cols-1 gap-4">
                      {donations.data.slice(0, 2).map((medicine: any) => (
                        <div key={medicine.id} className="bg-background rounded-lg overflow-hidden shadow-sm border">
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
                                  {formatDate(medicine.created_at)}
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
                              
                              <div className="mt-auto">
                                <Link to={`/medicine/${medicine.id}`}>
                                  <Button variant="outline" size="sm" className="text-sm w-full md:w-auto">
                                    View Details
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {donations.data.length > 2 && (
                        <div className="text-center">
                          <Button 
                            variant="outline" 
                            onClick={() => setTab('donations')}
                          >
                            View All Donations
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-secondary/20 rounded-lg">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <h3 className="font-medium text-lg mb-1">No donations yet</h3>
                      <p className="text-muted-foreground">
                        {isCurrentUser 
                          ? "You haven't donated any medicines yet."
                          : "This user hasn't donated any medicines yet."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Right sidebar */}
              <div className="space-y-6">
                {/* Verification Status */}
                <VerificationStatus 
                  isEmailVerified={isEmailVerified}
                  isPhoneVerified={isPhoneVerified}
                  isIdVerified={isIdVerified}
                  isCurrentUser={isCurrentUser}
                />

                {/* Contact Information */}
                <div className="bg-background rounded-lg shadow-sm border p-6">
                  <h3 className="font-semibold mb-4">Contact Information</h3>
                  
                  <div className="space-y-3">
                    {userProfile?.data?.email && (
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-secondary/60 flex items-center justify-center mt-0.5">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Email</div>
                          <div className="font-medium">{userProfile.data.email}</div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-secondary/60 flex items-center justify-center mt-0.5">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Phone</div>
                        <div className="font-medium">
                          {userProfile?.data?.phone_number || (
                            <span className="text-muted-foreground">Not provided</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-secondary/60 flex items-center justify-center mt-0.5">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Address</div>
                        <div className="font-medium">
                          {userProfile?.data?.address || (
                            <span className="text-muted-foreground">Not provided</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Donations Tab - Reuse existing implementation */}
          <TabsContent value="donations" className="mt-6 space-y-4">
            <h2 className="text-xl font-semibold">Medicines Donated</h2>
            
            {isLoadingDonations ? (
              <div className="text-center py-4">Loading donations...</div>
            ) : donations?.data?.length ? (
              <div className="grid grid-cols-1 gap-4">
                {donations.data.map((medicine: any) => (
                  <div key={medicine.id} className="bg-background rounded-lg overflow-hidden shadow-sm border">
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
                            {formatDate(medicine.created_at)}
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
                        
                        <div className="mt-auto">
                          <Link to={`/medicine/${medicine.id}`}>
                            <Button variant="outline" size="sm" className="text-sm w-full md:w-auto">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-secondary/20 rounded-lg">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <h3 className="font-medium text-lg mb-1">No donations yet</h3>
                <p className="text-muted-foreground">
                  {isCurrentUser 
                    ? "You haven't donated any medicines yet. Start by donating your unused medicines."
                    : "This user hasn't donated any medicines yet."}
                </p>
                
                {isCurrentUser && (
                  <Link to="/donate">
                    <Button className="mt-4">
                      Donate a Medicine
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </TabsContent>
          
          {/* Received Tab - Keep existing implementation */}
          <TabsContent value="received" className="mt-6 space-y-4">
            <h2 className="text-xl font-semibold">Medicines Received</h2>
            
            <div className="text-center py-6 bg-secondary/20 rounded-lg">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <h3 className="font-medium text-lg mb-1">No medicines received yet</h3>
              <p className="text-muted-foreground">
                {isCurrentUser 
                  ? "You haven't received any medicines yet. Browse available medicines."
                  : "This user hasn't received any medicines yet."}
              </p>
              
              {isCurrentUser && (
                <Link to="/medicines">
                  <Button className="mt-4">
                    Browse Medicines
                  </Button>
                </Link>
              )}
            </div>
          </TabsContent>
          
          {/* Saved Tab - Keep existing implementation */}
          <TabsContent value="saved" className="mt-6 space-y-4">
            <h2 className="text-xl font-semibold">Saved Medicines</h2>
            
            <div className="text-center py-6 bg-secondary/20 rounded-lg">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <h3 className="font-medium text-lg mb-1">No saved medicines</h3>
              <p className="text-muted-foreground">
                {isCurrentUser 
                  ? "You haven't saved any medicines yet. Save medicines you're interested in."
                  : "This user hasn't saved any medicines yet."}
              </p>
              
              {isCurrentUser && (
                <Link to="/medicines">
                  <Button className="mt-4">
                    Browse Medicines
                  </Button>
                </Link>
              )}
            </div>
          </TabsContent>
          
          {/* Settings Tab - Only for current user */}
          {isCurrentUser && (
            <TabsContent value="settings" className="mt-6 space-y-6">
              <h2 className="text-xl font-semibold">Account Settings</h2>
              
              {userProfile?.data && (
                <ProfileForm 
                  initialData={userProfile.data as UserProfile} 
                  onSuccess={handleProfileUpdateSuccess}
                />
              )}
              
              <SecuritySettings />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
