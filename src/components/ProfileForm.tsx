
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile, uploadProfileImage } from '@/lib/supabase';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Upload, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Form validation schema
const profileFormSchema = z.object({
  display_name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone_number: z.string().min(10, "Phone number must be at least 10 digits").optional(),
  address: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  initialData: {
    display_name?: string;
    phone_number?: string;
    email?: string;
    address?: string;
    avatar_url?: string;
    id: string;
  };
  onSuccess?: () => void;
}

const ProfileForm = ({ initialData, onSuccess }: ProfileFormProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(initialData.avatar_url || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      display_name: initialData.display_name || '',
      phone_number: initialData.phone_number || '',
      address: initialData.address || '',
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) {
      toast.error('You must be logged in to update your profile');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Handle avatar upload if there's a selected file
      let newAvatarUrl = avatarUrl;
      if (selectedFile) {
        setUploadingAvatar(true);
        try {
          const { data: fileData, error: fileError } = await uploadProfileImage(selectedFile, user.id);
          if (fileError) throw fileError;
          if (fileData) newAvatarUrl = fileData;
        } catch (uploadError: any) {
          console.error('Avatar upload error:', uploadError);
          toast.error('Failed to upload profile image. Your other profile changes will still be saved.');
        } finally {
          setUploadingAvatar(false);
        }
      }
      
      const { error } = await updateUserProfile(user.id, {
        ...data,
        id: initialData.id,
        email: initialData.email || '',
        avatar_url: newAvatarUrl
      });
      
      if (error) throw error;
      
      toast.success('Profile updated successfully');
      setAvatarUrl(newAvatarUrl);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WEBP)');
        return;
      }
      
      setSelectedFile(file);
      
      // Show preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarUrl(event.target.result.toString());
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl} alt={initialData.display_name || 'User'} />
                <AvatarFallback className="text-lg">
                  {initialData.display_name ? getInitials(initialData.display_name) : <User />}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-center">
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-2" 
                    type="button"
                    disabled={uploadingAvatar}
                  >
                    {uploadingAvatar ? 'Uploading...' : (
                      <>
                        <Upload className="h-4 w-4" />
                        Upload Photo
                      </>
                    )}
                  </Button>
                  <input 
                    id="avatar-upload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileChange}
                    disabled={uploadingAvatar}
                  />
                </label>
                {selectedFile && (
                  <span className="text-xs text-muted-foreground mt-1">
                    {selectedFile.name}
                  </span>
                )}
              </div>
            </div>

            <Separator />

            {/* Email (read-only) */}
            <div className="grid gap-1">
              <FormLabel>Email</FormLabel>
              <div className="flex">
                <Input 
                  type="email" 
                  value={initialData.email || ''}
                  disabled
                  className="bg-secondary/20"
                />
                <div className="ml-2 flex items-center text-green-500">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span className="text-xs">Verified</span>
                </div>
              </div>
            </div>

            {/* Display Name */}
            <FormField
              control={form.control}
              name="display_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone Number */}
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your phone number" {...field} />
                  </FormControl>
                  <FormDescription>
                    This will be used for medicine pickup coordination
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isSubmitting || uploadingAvatar}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};

export default ProfileForm;
