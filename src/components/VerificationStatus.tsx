
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Phone, FileText, CheckCircle, XCircle } from 'lucide-react';

interface VerificationStatusProps {
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isIdVerified: boolean;
  isCurrentUser: boolean;
}

const VerificationStatus = ({ 
  isEmailVerified, 
  isPhoneVerified, 
  isIdVerified, 
  isCurrentUser 
}: VerificationStatusProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Verification</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2 items-center">
              <Mail className={`h-4 w-4 ${isEmailVerified ? 'text-green-500' : 'text-muted-foreground'}`} />
              <span>Email verification</span>
            </div>
            <Badge className={isEmailVerified ? 'bg-green-500' : 'bg-background text-foreground border'}>
              {isEmailVerified ? 'Verified' : 'Not verified'}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex gap-2 items-center">
              <Phone className={`h-4 w-4 ${isPhoneVerified ? 'text-green-500' : 'text-muted-foreground'}`} />
              <span>Phone verification</span>
            </div>
            <Badge className={isPhoneVerified ? 'bg-green-500' : 'bg-background text-foreground border'}>
              {isPhoneVerified ? 'Verified' : 'Not verified'}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex gap-2 items-center">
              <FileText className={`h-4 w-4 ${isIdVerified ? 'text-green-500' : 'text-muted-foreground'}`} />
              <span>ID verification</span>
            </div>
            <Badge className={isIdVerified ? 'bg-green-500' : 'bg-background text-foreground border'}>
              {isIdVerified ? 'Verified' : 'Not verified'}
            </Badge>
          </div>
        </div>
      </CardContent>
      
      {isCurrentUser && (
        <CardFooter>
          <Button variant="outline" className="w-full">
            Complete Verification
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default VerificationStatus;
