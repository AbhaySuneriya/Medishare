import { createClient } from '@supabase/supabase-js';
import { supabase as supabaseClient } from '@/integrations/supabase/client';
import { calculateDistance } from './location';

// Default development values - replace these with your own Supabase project credentials in production
const DEFAULT_SUPABASE_URL = 'https://xyzcompany.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhtcmt2eWt2YmV0YnBmdHh0dXBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MzQwNDUyNzgsImV4cCI6MTk0OTYyMTI3OH0.jbJpDkP1oM3U8x0Rq1X7quzfMlp-YnAQFkOlN_HLevQ';

// Try to get values from environment variables, fall back to defaults for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

// Log a warning in development if using default values
if (import.meta.env.DEV && 
    (import.meta.env.VITE_SUPABASE_URL === undefined || 
     import.meta.env.VITE_SUPABASE_ANON_KEY === undefined)) {
  console.warn(
    'Using default Supabase credentials for development. ' +
    'These are non-functional placeholders. ' +
    'To use your own Supabase project, set the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY ' +
    'environment variables.'
  );
}

// Initialize the Supabase client with the URL and anonymous key
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types based on our schema
export type Medicine = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  expiry: string;
  is_free: boolean;
  price?: number | null;
  locality: string;
  latitude?: number | null;
  longitude?: number | null;
  created_at: string;
  user_id: string;
  category?: string | null;
  distance?: number; // Optional distance property
};

// Define a type for user profile
export type UserProfile = {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  phone_number?: string;
  address?: string;
  created_at: string;
  updated_at?: string;
};

// Define a type for the filters
export type MedicineFilters = {
  isFree?: boolean;
  distance?: number;
  lat?: number;
  lng?: number;
  category?: string; // Add category filter
  sortBy?: string; // Add sort filter
  [key: string]: any;
};

// Auth related helpers
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return null;
    }
    return session.user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

// Medicine related helpers
export async function getMedicines(query = '', filters: MedicineFilters = {}) {
  console.log('Fetching medicines with query:', query, 'filters:', filters);
  
  try {
    // Use the client from the integrations folder to ensure proper typing
    let queryBuilder = supabaseClient
      .from('medicines')
      .select('*');
    
    // Apply search query
    if (query) {
      queryBuilder = queryBuilder.ilike('name', `%${query}%`);
    }
    
    // Apply filters - FIX: Check if isFree is a proper boolean before using it
    if (filters.isFree === true || filters.isFree === false) {
      queryBuilder = queryBuilder.eq('is_free', filters.isFree);
    }

    // Apply category filter
    if (filters.category) {
      queryBuilder = queryBuilder.eq('category', filters.category);
    }
    
    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'expiry':
          queryBuilder = queryBuilder.order('expiry', { ascending: true });
          break;
        case 'recent':
          queryBuilder = queryBuilder.order('created_at', { ascending: false });
          break;
        // For 'distance', we'll handle sorting after data is fetched
        default:
          // Default sort by created_at
          queryBuilder = queryBuilder.order('created_at', { ascending: false });
      }
    } else {
      // Default sort by created_at if no sort specified
      queryBuilder = queryBuilder.order('created_at', { ascending: false });
    }
    
    const { data, error } = await queryBuilder;
    
    if (error) {
      console.error('Error fetching medicines:', error);
      return { data: [], error };
    }
    
    // Calculate distances if user location is provided
    if (filters.lat && filters.lng && data) {
      data.forEach((medicine: Medicine) => {
        if (medicine.latitude && medicine.longitude) {
          medicine.distance = calculateDistance(
            filters.lat as number,
            filters.lng as number,
            medicine.latitude,
            medicine.longitude
          );
        } else {
          medicine.distance = 9999; // Default large distance for sorting
        }
      });
      
      // Sort by distance if requested
      if (filters.sortBy === 'distance') {
        data.sort((a: Medicine, b: Medicine) => (a.distance || 9999) - (b.distance || 9999));
      }
    }
    
    console.log('Medicines fetched:', data?.length || 0);
    return { data: data || [], error: null };
  } catch (err) {
    console.error('Exception in getMedicines:', err);
    // Fall back to mock data in case of errors for development/testing
    return { data: mockMedicines, error: err };
  }
}

// Enhanced function to get featured medicines for homepage
export async function getFeaturedMedicines(limit = 4) {
  console.log('Fetching featured medicines for homepage');
  
  try {
    const { data, error } = await supabaseClient
      .from('medicines')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error('Error fetching featured medicines:', error);
      return { data: mockMedicines.slice(0, limit), error };
    }
    
    console.log('Featured medicines fetched:', data?.length || 0);
    return { data: data || [], error: null };
  } catch (err) {
    console.error('Exception in getFeaturedMedicines:', err);
    return { data: mockMedicines.slice(0, limit), error: err };
  }
}

export async function addMedicine(medicine: any) {
  console.log('Adding medicine:', medicine);
  
  try {
    const { data, error } = await supabaseClient
      .from('medicines')
      .insert([medicine])
      .select();
      
    if (error) {
      console.error('Error adding medicine:', error);
    } else {
      console.log('Medicine added successfully:', data);
    }
    
    return { data, error };
  } catch (err) {
    console.error('Exception in addMedicine:', err);
    return { data: null, error: err };
  }
}

export async function getMedicineById(id: string) {
  console.log('Fetching medicine by id:', id);
  
  try {
    const { data, error } = await supabaseClient
      .from('medicines')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Error fetching medicine by id:', error);
    }
    
    return { data, error };
  } catch (err) {
    console.error('Exception in getMedicineById:', err);
    return { data: null, error: err };
  }
}

// Delete medicine by id
export async function deleteMedicineById(id: string) {
  console.log('Deleting medicine by id:', id);
  
  try {
    const { data, error } = await supabaseClient
      .from('medicines')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting medicine:', error);
    } else {
      console.log('Medicine deleted successfully');
    }
    
    return { data, error };
  } catch (err) {
    console.error('Exception in deleteMedicineById:', err);
    return { data: null, error: err };
  }
}

// Save medicine for a user
export async function saveMedicine(userId: string, medicineId: string) {
  console.log('Saving medicine:', medicineId, 'for user:', userId);
  
  try {
    // Create 'saved_medicines' table if not exists
    // This is typically done via SQL migration before using this function
    
    const { data, error } = await supabaseClient
      .from('saved_medicines')
      .insert([
        { user_id: userId, medicine_id: medicineId }
      ])
      .select();
      
    if (error) {
      // If already saved, don't treat as error
      if (error.code === '23505') { // Unique violation
        console.log('Medicine already saved');
        return { data: null, error: null };
      }
      console.error('Error saving medicine:', error);
    } else {
      console.log('Medicine saved successfully');
    }
    
    return { data, error };
  } catch (err) {
    console.error('Exception in saveMedicine:', err);
    return { data: null, error: err };
  }
}

// Unsave medicine for a user
export async function unsaveMedicine(userId: string, medicineId: string) {
  console.log('Removing saved medicine:', medicineId, 'for user:', userId);
  
  try {
    const { data, error } = await supabaseClient
      .from('saved_medicines')
      .delete()
      .match({ 
        user_id: userId, 
        medicine_id: medicineId 
      });
      
    if (error) {
      console.error('Error removing saved medicine:', error);
    } else {
      console.log('Medicine removed from saved successfully');
    }
    
    return { data, error };
  } catch (err) {
    console.error('Exception in unsaveMedicine:', err);
    return { data: null, error: err };
  }
}

// Check if a medicine is saved by user
export async function isMedicineSaved(userId: string, medicineId: string) {
  console.log('Checking if medicine is saved:', medicineId, 'for user:', userId);
  
  try {
    const { data, error } = await supabaseClient
      .from('saved_medicines')
      .select('*')
      .match({ 
        user_id: userId, 
        medicine_id: medicineId 
      })
      .maybeSingle();
      
    if (error) {
      console.error('Error checking saved medicine:', error);
      return { isSaved: false, error };
    }
    
    return { isSaved: !!data, error: null };
  } catch (err) {
    console.error('Exception in isMedicineSaved:', err);
    return { isSaved: false, error: err };
  }
}

// Get saved medicines for a user
export async function getUserSavedMedicines(userId: string) {
  console.log('Fetching saved medicines for user:', userId);
  
  try {
    const { data, error } = await supabaseClient
      .from('saved_medicines')
      .select(`
        medicine_id,
        saved_at,
        medicines (*)
      `)
      .eq('user_id', userId);
      
    if (error) {
      console.error('Error fetching saved medicines:', error);
      return { data: [], error };
    }
    
    // Transform data to match the expected format
    const medicines = data?.map(item => ({
      ...item.medicines,
      saved_at: item.saved_at
    })) || [];
    
    console.log('Saved medicines fetched:', medicines.length);
    return { data: medicines, error: null };
  } catch (err) {
    console.error('Exception in getUserSavedMedicines:', err);
    return { data: [], error: err };
  }
}

// Get user profile information
export async function getUserProfile(userId: string) {
  console.log('Fetching user profile:', userId);
  
  try {
    // Try using the get_user_info RPC function first
    const { data: userData, error: rpcError } = await supabaseClient.rpc(
      'get_user_info', 
      { user_id: userId }
    );
      
    if (rpcError) {
      console.error('Error fetching user via RPC:', rpcError);
      
      // Fallback to direct view query if RPC fails
      const { data, error } = await supabaseClient
        .from('auth_users_info')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching user via view:', error);
        
        // Fallback to auth.getUser (will only work for the current user)
        const { data: userData, error: authError } = await supabaseClient.auth.getUser();
        
        if (authError || !userData?.user || userData.user.id !== userId) {
          console.error('Error fetching user profile:', authError || 'Not authorized to access this user data');
          return { data: null, error: authError || new Error('Not authorized to access this user data') };
        }
        
        // Get donation count
        let donationCount = 0;
        try {
          // Fix type issue by using the rpc call without type constraints
          const { data: donationData, error: donationError } = await supabaseClient.rpc(
            'get_user_donation_count', 
            { user_id: userId }
          );
            
          if (donationError) {
            console.error('Error fetching donation count:', donationError);
          } else if (donationData !== null) {
            donationCount = donationData;
          }
        } catch (donationErr) {
          console.error('Exception in donation count:', donationErr);
        }
        
        const profileData = {
          id: userData.user?.id,
          email: userData.user?.email || '',
          display_name: userData.user?.user_metadata?.full_name || userData.user?.email || '',
          phone_number: userData.user?.user_metadata?.phone_number || '',
          address: userData.user?.user_metadata?.address || '',
          avatar_url: userData.user?.user_metadata?.avatar_url || '',
          created_at: userData.user?.created_at || new Date().toISOString(),
          total_donations: donationCount
        };
        
        console.log('User profile fetched via auth.getUser with donations:', profileData);
        return { data: profileData, error: null };
      }
      
      if (data) {
        // Get donation count
        let donationCount = 0;
        try {
          // Fix type issue by using the rpc call without type constraints
          const { data: donationData, error: donationError } = await supabaseClient.rpc(
            'get_user_donation_count', 
            { user_id: userId }
          );
            
          if (donationError) {
            console.error('Error fetching donation count:', donationError);
          } else if (donationData !== null) {
            donationCount = donationData;
          }
        } catch (donationErr) {
          console.error('Exception in donation count:', donationErr);
        }
        
        // Combine the user data with donation count
        const profileData = {
          id: data.id,
          email: data.email || '',
          display_name: data.display_name || data.email || 'Anonymous User',
          phone_number: data.phone_number || '',
          address: data.address || '',
          avatar_url: data.avatar_url || '',
          created_at: data.created_at || new Date().toISOString(),
          updated_at: data.updated_at || null,
          total_donations: donationCount
        };
        
        console.log('User profile fetched with donations:', profileData);
        return { data: profileData, error: null };
      }
    }
    
    // If the RPC call succeeded, parse the data
    if (userData) {
      // Get donation count
      let donationCount = 0;
      try {
        // Fix type issue by using the rpc call without type constraints
        const { data: donationData, error: donationError } = await supabaseClient.rpc(
          'get_user_donation_count', 
          { user_id: userId }
        );
          
        if (donationError) {
          console.error('Error fetching donation count:', donationError);
        } else if (donationData !== null) {
          donationCount = donationData;
        }
      } catch (donationErr) {
        console.error('Exception in donation count:', donationErr);
      }
      
      // Parse the JSON response and add donation count
      const parsedData = typeof userData === 'string' ? JSON.parse(userData) : userData;
      
      const profileData = {
        ...parsedData,
        total_donations: donationCount
      };
      
      console.log('User profile fetched via RPC with donations:', profileData);
      return { data: profileData, error: null };
    }

    // If we got here, we couldn't get the profile
    return { data: null, error: new Error('Could not fetch user profile') };
  } catch (err) {
    console.error('Exception in getUserProfile:', err);
    return { data: null, error: err };
  }
}

// Update user profile
export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  console.log('Updating user profile:', userId, updates);
  
  try {
    // Update the user metadata 
    const { data, error } = await supabaseClient.auth.updateUser({
      data: {
        full_name: updates.display_name,
        phone_number: updates.phone_number,
        address: updates.address,
        avatar_url: updates.avatar_url
      }
    });
    
    if (error) {
      console.error('Error updating user profile:', error);
      return { data: null, error };
    }
    
    console.log('User profile updated successfully');
    return { data: data.user, error: null };
  } catch (err) {
    console.error('Exception in updateUserProfile:', err);
    return { data: null, error: err };
  }
}

// Get medicines donated by a user
export async function getUserDonations(userId: string) {
  console.log('Fetching donations by user:', userId);
  
  try {
    const { data, error } = await supabaseClient
      .from('medicines')
      .select('*')
      .eq('user_id', userId);
      
    if (error) {
      console.error('Error fetching user donations:', error);
      return { data: [], error };
    }
    
    console.log('User donations fetched:', data?.length || 0);
    return { data: data || [], error: null };
  } catch (err) {
    console.error('Exception in getUserDonations:', err);
    return { data: [], error: err };
  }
}

export async function uploadMedicineImage(file: File, userId: string) {
  console.log('Uploading medicine image for user:', userId);
  
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;
    
    const { data, error } = await supabaseClient.storage
      .from('medicines')
      .upload(filePath, file);
      
    if (error) {
      console.error('Error uploading image:', error);
      return { data: null, error };
    }
    
    const { data: urlData } = supabaseClient.storage
      .from('medicines')
      .getPublicUrl(filePath);
      
    console.log('Image uploaded successfully:', urlData.publicUrl);
    return { data: urlData.publicUrl, error: null };
  } catch (error) {
    console.error('Error in image upload process:', error);
    // Fallback to a placeholder image if upload fails
    return { 
      data: `https://placehold.co/600x400?text=${encodeURIComponent(file.name)}`, 
      error 
    };
  }
}

// Update profile image
export async function uploadProfileImage(file: File, userId: string) {
  console.log('Uploading profile image for user:', userId);
  
  try {
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { data: null, error: new Error('Image size must be less than 5MB') };
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { data: null, error: new Error('Please upload a valid image file (JPEG, PNG, GIF, or WEBP)') };
    }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar.${fileExt}`;
    
    // First check if the bucket exists
    const { data: buckets } = await supabaseClient.storage.listBuckets();
    
    if (!buckets?.find(bucket => bucket.name === 'avatars')) {
      console.log('Avatars bucket does not exist, creating it...');
      // Create the bucket if it doesn't exist
      const { error: createError } = await supabaseClient.storage.createBucket('avatars', {
        public: true
      });
      
      if (createError) {
        console.error('Error creating avatars bucket:', createError);
        return { data: null, error: createError };
      }
    }
    
    // Check if file already exists and remove it
    try {
      const { data: existingFiles } = await supabaseClient.storage
        .from('avatars')
        .list(userId);
        
      if (existingFiles && existingFiles.length > 0) {
        // Remove existing files
        await supabaseClient.storage
          .from('avatars')
          .remove(existingFiles.map(file => `${userId}/${file.name}`));
      }
    } catch (error) {
      console.log('No existing files or error listing files, continuing...');
    }
    
    // Upload the new file
    const { data, error } = await supabaseClient.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });
      
    if (error) {
      console.error('Error uploading profile image:', error);
      return { data: null, error };
    }
    
    // Get the public URL
    const { data: urlData } = supabaseClient.storage
      .from('avatars')
      .getPublicUrl(fileName);
      
    console.log('Profile image uploaded successfully:', urlData.publicUrl);
    
    // Update the user metadata with the avatar URL
    const { error: updateError } = await supabaseClient.auth.updateUser({
      data: { avatar_url: urlData.publicUrl }
    });
    
    if (updateError) {
      console.error('Error updating user metadata with avatar URL:', updateError);
      // Still return the URL even if updating metadata fails
    }
    
    return { data: urlData.publicUrl, error: null };
  } catch (error) {
    console.error('Error in profile image upload process:', error);
    return { data: null, error };
  }
}

// Mock data for development without Supabase (now used as fallback only)
const mockMedicines: Medicine[] = [
  {
    id: "1",
    name: "Paracetamol",
    description: "Pain reliever and fever reducer",
    image_url: "https://placehold.co/600x400?text=Paracetamol",
    expiry: "2024-12-31",
    is_free: true,
    price: null,
    locality: "Downtown",
    latitude: 37.7749,
    longitude: -122.4194,
    created_at: new Date().toISOString(),
    user_id: "user1",
    category: "Pain Relief"
  },
  {
    id: "2",
    name: "Amoxicillin",
    description: "Antibiotic medication",
    image_url: "https://placehold.co/600x400?text=Amoxicillin",
    expiry: "2023-10-15",
    is_free: false,
    price: 15.99,
    locality: "Uptown",
    latitude: 37.7833,
    longitude: -122.4167,
    created_at: new Date().toISOString(),
    user_id: "user2",
    category: "Antibiotics"
  },
  {
    id: "3",
    name: "Ibuprofen",
    description: "Anti-inflammatory drug",
    image_url: "https://placehold.co/600x400?text=Ibuprofen",
    expiry: "2024-06-30",
    is_free: true,
    price: null,
    locality: "Westside",
    latitude: 37.7851,
    longitude: -122.4774,
    created_at: new Date().toISOString(),
    user_id: "user1",
    category: "Pain Relief"
  },
  {
    id: "4",
    name: "Cetirizine",
    description: "Antihistamine for allergies",
    image_url: "https://placehold.co/600x400?text=Cetirizine",
    expiry: "2024-08-15",
    is_free: false,
    price: 8.99,
    locality: "Eastside",
    latitude: 37.8044,
    longitude: -122.2711,
    created_at: new Date().toISOString(),
    user_id: "user3",
    category: "Allergy"
  },
  {
    id: "5",
    name: "Omeprazole",
    description: "Reduces stomach acid production",
    image_url: "https://placehold.co/600x400?text=Omeprazole",
    expiry: "2024-05-20",
    is_free: true,
    price: null,
    locality: "Northside",
    latitude: 37.8715,
    longitude: -122.2730,
    created_at: new Date().toISOString(),
    user_id: "user2",
    category: "Digestive Health"
  },
  {
    id: "6",
    name: "Vitamin D",
    description: "Dietary supplement",
    image_url: "https://placehold.co/600x400?text=Vitamin+D",
    expiry: "2025-01-10",
    is_free: false,
    price: 12.50,
    locality: "Southside",
    latitude: 37.7683,
    longitude: -122.4474,
    created_at: new Date().toISOString(),
    user_id: "user3",
    category: "Supplements"
  }
];
