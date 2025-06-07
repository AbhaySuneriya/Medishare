
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Heart, BookmarkCheck } from 'lucide-react';

interface MedicineStatsProps {
  donated: number;
  received: number;
  saved: number;
}

const MedicineStats = ({ donated, received, saved }: MedicineStatsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Medicine Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col items-center justify-center p-4 bg-secondary/20 rounded-lg">
            <Package className="h-8 w-8 text-primary mb-2" />
            <span className="text-2xl font-bold">{donated}</span>
            <span className="text-sm text-muted-foreground">Donated</span>
          </div>
          
          <div className="flex flex-col items-center justify-center p-4 bg-secondary/20 rounded-lg">
            <Heart className="h-8 w-8 text-red-500 mb-2" />
            <span className="text-2xl font-bold">{received}</span>
            <span className="text-sm text-muted-foreground">Received</span>
          </div>
          
          <div className="flex flex-col items-center justify-center p-4 bg-secondary/20 rounded-lg">
            <BookmarkCheck className="h-8 w-8 text-amber-500 mb-2" />
            <span className="text-2xl font-bold">{saved}</span>
            <span className="text-sm text-muted-foreground">Saved</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicineStats;
