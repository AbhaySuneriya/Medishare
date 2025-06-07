
import React from 'react';
import Header from '@/components/Header';
import { Separator } from '@/components/ui/separator';

const About = () => {
  return (
    <div className="min-h-screen bg-secondary/30">
      <Header />
      
      <div className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-2">About MedShare</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Connecting people to share medicines and save lives
            </p>
            
            <Separator className="my-8" />
            
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
                <p className="text-lg leading-relaxed">
                  MedShare aims to reduce medicine waste and improve access to healthcare by
                  creating a platform where people can safely donate or sell their unused medicines
                  to those who need them. We believe that everyone deserves access to essential
                  medications, regardless of their financial situation.
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-background p-6 rounded-lg">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <span className="text-2xl font-bold text-primary">1</span>
                    </div>
                    <h3 className="text-xl font-medium mb-2">List Your Medicines</h3>
                    <p>Take a photo of your unused medicines and list them on our platform for free.</p>
                  </div>
                  
                  <div className="bg-background p-6 rounded-lg">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <span className="text-2xl font-bold text-primary">2</span>
                    </div>
                    <h3 className="text-xl font-medium mb-2">Connect Locally</h3>
                    <p>Find medicines near you or connect with people who need your donations.</p>
                  </div>
                  
                  <div className="bg-background p-6 rounded-lg">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <span className="text-2xl font-bold text-primary">3</span>
                    </div>
                    <h3 className="text-xl font-medium mb-2">Exchange Safely</h3>
                    <p>Meet in a safe location or arrange for delivery to exchange medicines.</p>
                  </div>
                </div>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">Safety Guidelines</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Only list medicines that are sealed and unexpired</li>
                  <li>Never share prescription medicines that were prescribed specifically for you</li>
                  <li>Verify the identity of the person you're meeting</li>
                  <li>Meet in public places for exchanges</li>
                  <li>Report any suspicious activity to our team</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
                <p className="mb-4">
                  Have questions or suggestions? We'd love to hear from you!
                </p>
                <p>
                  <strong>Email:</strong> support@medshare.example.com<br />
                  <strong>Phone:</strong> +1 (555) 123-4567<br />
                  <strong>Address:</strong> 123 Health Street, Medicine City, MC 12345
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
