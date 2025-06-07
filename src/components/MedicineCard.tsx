
import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MedicineCardProps {
  id: string;
  name: string;
  description: string;
  image: string;
  expiry: string;
  distance: string;
  isFree: boolean;
  price?: string;
  locality: string;
  className?: string;
}

const MedicineCard = ({
  id,
  name,
  description,
  image,
  expiry,
  distance,
  isFree,
  price,
  locality,
  className,
}: MedicineCardProps) => {
  return (
    <Card 
      className={cn(
        'overflow-hidden transition-all duration-300 hover:shadow-md glass group',
        className
      )}
    >
      <div className="relative">
        {/* Image */}
        <div className="aspect-[4/3] overflow-hidden">
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
        </div>
        
        {/* Free/Price Badge */}
        <Badge 
          className={cn(
            'absolute top-3 left-3 z-10',
            isFree ? 'bg-green-500 hover:bg-green-600' : 'bg-accent hover:bg-accent/90'
          )}
        >
          {isFree ? 'Free' : price}
        </Badge>
        
        {/* Favorite Button */}
        <Button 
          variant="ghost" 
          size="icon"
          className="rounded-full absolute top-2 right-2 z-10 bg-white/80 hover:bg-white shadow-sm backdrop-blur-sm"
        >
          <Heart className="h-4 w-4 text-gray-600" />
        </Button>
      </div>
      
      <div className="p-4">
        {/* Title and Description */}
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{name}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{description}</p>
        
        {/* Meta Information */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            <span>Expires {expiry}</span>
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 mr-1.5" />
            <span>{locality} · {distance} away</span>
          </div>
        </div>
        
        {/* Action Button */}
        <div className="flex items-center space-x-2">
          <Button 
            variant="default" 
            className="w-full rounded-md text-sm bg-blue-500"
            onClick={() => window.location.href = `/medicine/${id}`}
          >
            View Details
            <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default MedicineCard;
