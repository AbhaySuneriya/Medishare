import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Heart, Pill, Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-transparent -z-10" />

      {/* Animated gradient blob */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-60 animate-float -z-10" />
      <div className="absolute top-60 -left-20 w-72 h-72 bg-purple-100 rounded-full blur-3xl opacity-50 animate-float animation-delay-2000 -z-10" />

      <div className="container mx-auto px-4 pt-16 md:pt-24 lg:pt-32">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Hero content */}
          <div className="flex-1 max-w-2xl stagger-animate">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent mb-6">
              Medicine Donation & Exchange Platform
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
              Share Medicines,
              <span className="text-accent text-blue-500"> Save Lives</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-xl">
              A minimalist platform where you can donate, sell, or buy unused medicines
              and medical equipment to those who need them most.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link to="/medicines">
                <Button className="rounded-full px-8 py-6 text-base bg-blue-500 text-white">

                  Browse Medicines
                  <ArrowRight className="ml-2 h-5 w-5" />

                </Button>
              </Link>
              <Link to="/donate">
                <Button variant="outline" className="rounded-full px-8 py-6 text-base">
                  Donate Now
                  <Heart className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-6 mt-4">
              <div className="glass rounded-xl p-4 flex flex-col items-center text-center">
                <span className="font-bold text-2xl mb-1">8,500+</span>
                <span className="text-sm text-muted-foreground">Medicines Donated</span>
              </div>
              <div className="glass rounded-xl p-4 flex flex-col items-center text-center">
                <span className="font-bold text-2xl mb-1">12,000+</span>
                <span className="text-sm text-muted-foreground">Active Users</span>
              </div>
              <div className="glass rounded-xl p-4 flex flex-col items-center text-center">
                <span className="font-bold text-2xl mb-1">98%</span>
                <span className="text-sm text-muted-foreground">Satisfaction Rate</span>
              </div>
            </div>
          </div>

          {/* Hero image/illustration */}
          <div className="flex-1 w-full max-w-xl">
            <div className="relative">
              {/* Main image container with glass effect */}
              <div className="glass rounded-2xl overflow-hidden border border-white/20 shadow-lg">
                <div className="aspect-[4/3] bg-gradient-to-br from-blue-50 to-purple-50 relative">
                  {/* This would be replaced with an actual image in production */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-5xl text-accent">
                      <img
                        src="https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?ixlib=rb-4.0.3&q=85&w=1080&h=1080"
                        alt="Medicine sharing"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating cards */}
              <div className="glass absolute -bottom-6 -left-6 p-4 rounded-lg shadow-md animate-float">
                <div className="flex items-center">
                  <div className="rounded-full bg-green-100 p-2 mr-3">
                    <Heart className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Donate Unused Meds</p>
                    <p className="text-xs text-muted-foreground">Help those in need</p>
                  </div>
                </div>
              </div>

              <div className="glass absolute -top-6 -right-6 p-4 rounded-lg shadow-md animate-float animation-delay-1000">
                <div className="flex items-center">
                  <div className="rounded-full bg-blue-100 p-2 mr-3">
                    <Pill className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Quality Verified</p>
                    <p className="text-xs text-muted-foreground">Safe medicines</p>
                  </div>
                </div>
              </div>

              <div className="glass absolute top-1/2 right-0 translate-x-1/2 p-4 rounded-lg shadow-md animate-float animation-delay-2000">
                <div className="flex items-center">
                  <div className="rounded-full bg-purple-100 p-2 mr-3">
                    <MapPin className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Nearby Access</p>
                    <p className="text-xs text-muted-foreground">Location-based</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave separator */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-white -z-5" style={{
        maskImage: 'url("data:image/svg+xml;utf8,<svg viewBox=\'0 0 1200 120\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z\' opacity=\'.25\'></path><path d=\'M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z\' opacity=\'.5\'></path><path d=\'M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z\'></path></svg>")',
        maskSize: '100% 100%'
      }} />
    </div>
  );
};

export default Hero;
