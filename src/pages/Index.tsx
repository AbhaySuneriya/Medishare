
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import MedicineCard from '@/components/MedicineCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, Heart, MapPin, Search, Pill, MessageCircle, Shield, Star } from 'lucide-react';
import { getFeaturedMedicines, Medicine } from '@/lib/supabase';
import { formatDistance } from '@/lib/location';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const [featuredMedicines, setFeaturedMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch featured medicines when component mounts
  useEffect(() => {
    const loadFeaturedMedicines = async () => {
      try {
        setLoading(true);
        const { data, error } = await getFeaturedMedicines(4);
        if (error) {
          console.error('Error loading featured medicines:', error);
        } else {
          setFeaturedMedicines(data);
        }
      } catch (err) {
        console.error('Exception loading featured medicines:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedMedicines();
  }, []);

  // Map medicine data to component props
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
    price: medicine.is_free ? undefined : `$${medicine.price}`,
    locality: medicine.locality,
  });

  // Features data
  const features = [
    {
      icon: Heart,
      title: 'Donate Unused Medicines',
      description: 'Help those in need by donating your unused, unexpired medicines.',
      color: 'text-red-500',
      bgColor: 'bg-red-50',
    },
    {
      icon: MapPin,
      title: 'Find Nearby Medicines',
      description: 'Locate medicines available near you with our integrated map feature.',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Pill,
      title: 'Verified Listings',
      description: 'All listings are verified for authenticity and expiration dates.',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      icon: MessageCircle,
      title: 'Secure Communication',
      description: 'Chat securely with donors and buyers without sharing personal info.',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Shield,
      title: 'Privacy Protection',
      description: 'Your personal information stays private with our masked address system.',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
    },
    {
      icon: Search,
      title: 'Smart Search',
      description: 'Find exactly what you need with our powerful search and filter system.',
      color: 'text-teal-500',
      bgColor: 'bg-teal-50',
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <Hero />
      
      {/* Featured Medicines Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-4">Featured Medicines</h2>
              <p className="text-muted-foreground max-w-2xl">
                Explore some of the recently listed medicines and medical equipment available for donation or purchase.
              </p>
            </div>
            <Link to="/medicines">
              <Button variant="outline" className="mt-4 md:mt-0">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {loading ? (
              // Skeleton loaders while medicines are being fetched
              Array(4).fill(0).map((_, index) => (
                <div key={index} className="glass rounded-lg overflow-hidden">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-8 w-full mt-2" />
                  </div>
                </div>
              ))
            ) : featuredMedicines.length > 0 ? (
              featuredMedicines.map(medicine => (
                <MedicineCard
                  key={medicine.id}
                  {...mapMedicineData(medicine)}
                  className="animate-fade-up"
                />
              ))
            ) : (
              <div className="col-span-4 text-center py-8">
                <p className="text-muted-foreground">No medicines found. Be the first to donate!</p>
                <Link to="/donate" className="mt-4 inline-block">
                  <Button>Donate Medicines</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">
              Our platform connects those who have unused medicines with those who need them, 
              creating a sustainable solution to reduce medical waste and increase accessibility.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:text-left text-center">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="glass p-6 rounded-xl transition-all duration-300 hover:shadow-md"
                >
                  <div className={`${feature.bgColor} p-3 rounded-full inline-block mb-4`}>
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Make a Difference?</h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join our community today and start sharing unused medicines with those who need them most.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {/* <Link to="/signup">
                <Button size="lg" className="px-8 rounded-full">
                  Sign Up Now
                </Button>
              </Link> */}
              <Link to="/about">
                <Button variant="outline" size="lg" className="px-8 rounded-full">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:text-left text-center">
            <div>
              <div className='d-flex flex-col items-center mb-4 '>   
              
            
              <h3 className="text-xl font-semibold mb-4">  
              <span className='text-blue-500'>MEDI</span>SHARE</h3>
              </div>
             
              <p className="text-muted-foreground">
                Connecting medicine donors with those in need through a secure and user-friendly platform.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-muted-foreground hover:text-accent">Home</Link></li>
                <li><Link to="/medicines" className="text-muted-foreground hover:text-accent">Browse Medicines</Link></li>
                <li><Link to="/donate" className="text-muted-foreground hover:text-accent">Donate</Link></li>
                <li><Link to="/about" className="text-muted-foreground hover:text-accent">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-accent">Privacy Policy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-accent">Terms of Service</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-accent">FAQ</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-accent">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-center mb-4">Connect With Us</h4>
              <div className="flex md:justify-center justify-end space-x-4 mx-auto">
                <a href="#" className="text-muted-foreground hover:text-accent">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                  </svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-accent">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-accent">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.772 1.153 4.902 4.902 0 01-1.153 1.772c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} MedShare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
