
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { addMedicine, uploadMedicineImage } from '@/lib/supabase';
import { getUserLocation } from '@/lib/location';
import { 
  Upload, 
  Calendar, 
  MapPin, 
  Tag, 
  Loader2,
  PillIcon,
  IndianRupee
} from 'lucide-react';

// Define the form schema with Zod
const formSchema = z.object({
  name: z.string().min(3, { message: "Medicine name must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  expiry: z.string().refine(val => {
    // Simple date validation (YYYY-MM-DD)
    return /^\d{4}-\d{2}-\d{2}$/.test(val) || 
           /^\d{2}\/\d{2}\/\d{4}$/.test(val) ||
           /^[A-Za-z]+ \d{4}$/.test(val); // Allow "Month YYYY" format
  }, { message: "Please enter a valid expiry date (YYYY-MM-DD, MM/DD/YYYY, or Month YYYY)" }),
  category: z.string().min(1, { message: "Please select a category" }),
  locality: z.string().min(3, { message: "Location must be at least 3 characters" }),
  is_free: z.boolean(),
  price: z.string().optional().refine(val => {
    if (val === undefined || val === '') return true;
    return !isNaN(parseFloat(val)) && parseFloat(val) > 0;
  }, { message: "Price must be a valid number greater than 0" }),
});

type FormValues = z.infer<typeof formSchema>;

const Donate = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [userLocationLoading, setUserLocationLoading] = useState(false);

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      expiry: "",
      category: "",
      locality: "",
      is_free: true,
      price: "",
    },
  });

  // Disable price field when donation is free
  const watchIsFree = form.watch("is_free");

  // Update price field when is_free changes
  React.useEffect(() => {
    if (watchIsFree) {
      form.setValue("price", "");
    }
  }, [watchIsFree, form]);

  // Categories for medicine
  const categories = [
    "Pain Relief",
    "Antibiotics",
    "Allergy",
    "Digestive Health",
    "Cardiovascular",
    "Respiratory",
    "Mental Health",
    "Diabetes",
    "Vitamins & Supplements",
    "First Aid",
    "Medical Equipment",
    "Other"
  ];

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Get user location with permission
  const requestUserLocation = async () => {
    setUserLocationLoading(true);
    try {
      const location = await getUserLocation();
      setUserLocation(location);
      toast.success("Location detected successfully");
    } catch (error) {
      // console.error("Error getting location:", error);
      toast.error("Could not get your location. Setting location will be manual.");
    } finally {
      setUserLocationLoading(false);
    }
  };

  // Effect to request location when component mounts
  useEffect(() => {
    if (!user) {
      // Redirect to sign in if not authenticated
      navigate('/signin', { state: { from: '/donate' } });
      toast.error("Please sign in to donate medicines");
      return;
    }
    
    // Request location
    requestUserLocation();
  }, [user, navigate]);

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast.error("Please sign in to donate medicines");
      navigate('/signin', { state: { from: '/donate' } });
      return;
    }

    if (!imageFile) {
      toast.error("Please upload an image of the medicine");
      return;
    }

    setLoading(true);

    try {
      // Upload image first
      const { data: imageUrl, error: uploadError } = await uploadMedicineImage(
        imageFile,
        user.id // Use the user ID directly from the auth context
      );

      if (uploadError || !imageUrl) {
        throw new Error(uploadError?.message || "Failed to upload image");
      }

      // Prepare medicine data
      const medicineData = {
        name: data.name,
        description: data.description,
        expiry: data.expiry,
        category: data.category,
        is_free: data.is_free,
        price: data.is_free ? null : parseFloat(data.price || "0"),
        image_url: imageUrl,
        locality: data.locality,
        latitude: userLocation?.lat || null,
        longitude: userLocation?.lng || null,
        user_id: user.id, // Use the user ID directly from the auth context
      };

      // Add medicine to database
      const { data: newMedicine, error } = await addMedicine(medicineData);

      if (error) {
        throw new Error(error.message || "Failed to add medicine");
      }

      toast.success("Medicine donated successfully!");
      
      // Redirect to newly created medicine page
      if (newMedicine && newMedicine[0]?.id) {
        navigate(`/medicine/${newMedicine[0].id}`);
      } else {
        navigate("/medicines");
      }
    } catch (err: any) {
      // console.error("Error donating medicine:", err);
      toast.error(err.message || "Failed to donate medicine. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <Header />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 pt-28 pb-12">
        <h1 className="text-3xl font-bold mb-2">Donate Medicine</h1>
        <p className="text-muted-foreground mb-8">
          Share your unused medicines with those who need them
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="glass p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Medicine Information */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Medicine Information</h2>
                    
                    {/* Medicine Name */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medicine Name*</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Paracetamol 500mg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Description */}
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description*</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the medicine, its condition, etc." 
                              rows={4} 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Category */}
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category*</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Expiry Date */}
                    <FormField
                      control={form.control}
                      name="expiry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiry Date*</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder="YYYY-MM-DD, MM/DD/YYYY, or Month YYYY" 
                                {...field} 
                              />
                              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Price Information */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Price Information</h2>
                    
                    {/* Free Donation Switch */}
                    <FormField
                      control={form.control}
                      name="is_free"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Free Donation</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Toggle if you're donating this medicine for free
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    {/* Price (shown only if not free) */}
                    {!watchIsFree && (
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price (₹)*</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <span className="text-gray-500 sm:text-sm">₹</span>
                                </div>
                                <Input
                                  className="pl-7"
                                  type="number"
                                  step="0.01"
                                  min="0.01"
                                  placeholder="e.g., 150"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                  
                  {/* Location Information */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Location Information</h2>
                    
                    {/* Locality */}
                    <FormField
                      control={form.control}
                      name="locality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location/Neighborhood*</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder="e.g., Downtown, North Side" 
                                {...field} 
                              />
                              <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Location Detection */}
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Precise Location</h3>
                          <p className="text-sm text-muted-foreground">
                            {userLocation 
                              ? "Location detected successfully" 
                              : "Share your location to help people find this medicine"}
                          </p>
                        </div>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={requestUserLocation}
                          disabled={userLocationLoading}
                        >
                          {userLocationLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Detecting...
                            </>
                          ) : userLocation ? (
                            <>
                              <MapPin className="mr-2 h-4 w-4" />
                              Update Location
                            </>
                          ) : (
                            <>
                              <MapPin className="mr-2 h-4 w-4" />
                              Detect Location
                            </>
                          )}
                        </Button>
                      </div>
                      {userLocation && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          <p>
                            Location coordinates detected. For privacy reasons, only approximate 
                            location will be shown to others.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Image Upload */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Medicine Image</h2>
                    
                    <div className="rounded-lg border p-4">
                      <div className="space-y-4">
                        <div className="flex flex-col items-center justify-center">
                          {imagePreview ? (
                            <div className="relative w-full max-w-md">
                              <img 
                                src={imagePreview} 
                                alt="Medicine preview" 
                                className="rounded-lg max-h-64 mx-auto object-contain" 
                              />
                              <Button
                                type="button"
                                variant="destructive" 
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => {
                                  setImageFile(null);
                                  setImagePreview(null);
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed rounded-lg p-12 text-center">
                              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground mb-4">
                                Drag and drop or click to upload
                              </p>
                              <Button 
                                type="button" 
                                variant="secondary" 
                                onClick={() => document.getElementById('imageUpload')?.click()}
                              >
                                Upload Image
                              </Button>
                            </div>
                          )}
                          <input
                            id="imageUpload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <p>
                            Please upload a clear image of the medicine. This helps others identify 
                            the medicine and increases trust.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Donating Medicine...
                      </>
                    ) : (
                      <>
                        <PillIcon className="mr-2 h-4 w-4" />
                        Donate Medicine
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              <Card className="glass p-6">
                <h3 className="font-semibold mb-4">Donation Guidelines</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <span className="font-bold mr-2">•</span>
                    Medicines must not be expired or near expiry (at least 3 months remaining)
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">•</span>
                    Original packaging and labels should be intact
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">•</span>
                    Do not list prescription medicines without proper documentation
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">•</span>
                    Be honest about the condition of the medicine
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">•</span>
                    Include clear images showing the medicine and expiry date
                  </li>
                </ul>
              </Card>
              
              <Card className="glass p-6">
                <h3 className="font-semibold mb-4">Safety Tips</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <span className="font-bold mr-2">•</span>
                    Meet in public places for medicine handovers
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">•</span>
                    Do not share personal information outside our platform
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">•</span>
                    Report suspicious activity to our support team
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">•</span>
                    Verify the recipient's identity before handing over medicines
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donate;
