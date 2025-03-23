
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardFooter } from '@/components/ui/card';
import { AtSign, Lock } from 'lucide-react';
import { isDevelopmentMode } from '@/utils/otpUtils';

interface EmailLoginFormProps {
  onLoginSuccess: () => void;
}

const EmailLoginForm: React.FC<EmailLoginFormProps> = ({ onLoginSuccess }) => {
  const { loginWithEmail, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }
    
    if (!password || password.length < 6) {
      toast.error('Please enter a valid password');
      return;
    }
    
    try {
      console.log('Attempting login with email:', email);
      const success = await loginWithEmail(email, password);
      
      if (success) {
        toast.success('Login successful!');
        setEmail('');
        setPassword('');
        onLoginSuccess();
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials and try again.');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10"
            />
            <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          {isDevelopmentMode() && (
            <p className="text-xs text-muted-foreground mt-1">
              For demo, use email: admin@example.com (admin) or user@example.com (voter)
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-10"
            />
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          {isDevelopmentMode() && (
            <p className="text-xs text-muted-foreground mt-1">
              For demo, use password: password123
            </p>
          )}
        </div>
      </div>
      
      <CardFooter className="flex justify-center pt-6 pb-0 px-0">
        <Button 
          type="submit" 
          className="w-full bg-vote-secondary hover:bg-vote-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Sign In'}
        </Button>
      </CardFooter>
    </form>
  );
};

export default EmailLoginForm;
