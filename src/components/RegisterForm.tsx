
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { User, CreditCard, Phone } from 'lucide-react';
import { toast } from 'sonner';

const RegisterForm: React.FC = () => {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressId, setAddressId] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!name.trim()) {
      errors.name = 'Name is required';
    } else if (name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    if (!phone) {
      errors.phone = 'Phone number is required';
    } else if (phone.length !== 10) {
      errors.phone = 'Phone number must be 10 digits';
    }
    
    if (!addressId.trim()) {
      errors.addressId = 'Address ID is required';
    } else if (addressId.length < 4) {
      errors.addressId = 'Address ID must be at least 4 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Show first error in toast
      const firstError = Object.values(validationErrors)[0];
      if (firstError) {
        toast.error(firstError);
      }
      return;
    }
    
    const success = await register(name, phone, addressId);
    if (success) {
      navigate('/login');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Register to Vote</CardTitle>
        <CardDescription className="text-center">
          Create your secure ElectraShield account
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (validationErrors.name) {
                    setValidationErrors({ ...validationErrors, name: '' });
                  }
                }}
                required
                className={`pl-10 ${validationErrors.name ? 'border-red-500' : ''}`}
              />
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            {validationErrors.name && (
              <p className="text-xs text-red-500 mt-1">{validationErrors.name}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, '').substring(0, 10));
                  if (validationErrors.phone) {
                    setValidationErrors({ ...validationErrors, phone: '' });
                  }
                }}
                required
                className={`pl-10 ${validationErrors.phone ? 'border-red-500' : ''}`}
              />
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            {validationErrors.phone && (
              <p className="text-xs text-red-500 mt-1">{validationErrors.phone}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="addressId">Address ID</Label>
            <div className="relative">
              <Input
                id="addressId"
                type="text"
                placeholder="Enter your address ID"
                value={addressId}
                onChange={(e) => {
                  setAddressId(e.target.value);
                  if (validationErrors.addressId) {
                    setValidationErrors({ ...validationErrors, addressId: '' });
                  }
                }}
                required
                className={`pl-10 ${validationErrors.addressId ? 'border-red-500' : ''}`}
              />
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            {validationErrors.addressId && (
              <p className="text-xs text-red-500 mt-1">{validationErrors.addressId}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Your unique government-issued address identification number
            </p>
          </div>
          
          <CardFooter className="flex justify-center pt-6 px-0 pb-0">
            <Button 
              type="submit" 
              className="w-full bg-vote-accent hover:bg-vote-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Register'}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
      
      <div className="mt-6 mb-4 text-center">
        <span className="text-sm text-muted-foreground">
          Already have an account?{' '}
        </span>
        <a 
          href="/login" 
          className="text-sm text-vote-secondary hover:underline"
        >
          Login
        </a>
      </div>
    </Card>
  );
};

export default RegisterForm;
