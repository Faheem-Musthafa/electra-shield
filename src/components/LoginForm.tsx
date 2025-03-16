import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Key, Smartphone, Fingerprint } from 'lucide-react';
import { formatPhoneNumber } from '@/utils/otpUtils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';

const LoginForm: React.FC = () => {
  const { login, requestOtp, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [authMethod, setAuthMethod] = useState('otp');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }
    
    const success = await requestOtp(phone);
    if (success) {
      setOtpSent(true);
      // Disable resend for 30 seconds
      setResendDisabled(true);
      setCountdown(30);
      
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleResendOtp = async () => {
    if (resendDisabled) return;
    await handleSendOtp({ preventDefault: () => {} } as React.FormEvent);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (authMethod === 'otp') {
      if (!phone || !otp) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      const success = await login(phone, otp);
      if (success) {
        navigate('/vote');
      }
    } else if (authMethod === 'biometric') {
      // In a real app, integrate with Web Authentication API or fingerprint scanner
      console.log('Biometric authentication not implemented in demo');
      // Mock successful login for demo
      const success = await login('1234567890', '123456');
      if (success) {
        navigate('/vote');
      }
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Secure Login</CardTitle>
        <CardDescription className="text-center">
          Access your ElectraShield account
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="otp" onValueChange={setAuthMethod}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="otp" className="flex items-center justify-center">
            <Smartphone className="h-4 w-4 mr-2" />
            <span>OTP</span>
          </TabsTrigger>
          <TabsTrigger value="biometric" className="flex items-center justify-center">
            <Fingerprint className="h-4 w-4 mr-2" />
            <span>Biometric</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="otp">
          <CardContent className="pt-6">
            <form onSubmit={otpSent ? handleLogin : handleSendOtp}>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').substring(0, 10))}
                    required
                    disabled={otpSent && isLoading}
                  />
                </div>
                
                {otpSent && (
                  <>
                    <Alert className="bg-muted">
                      <AlertTitle className="text-sm font-medium">OTP Sent</AlertTitle>
                      <AlertDescription className="text-xs">
                        A verification code has been sent to {formatPhoneNumber(phone)}
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="otp">OTP Code</Label>
                        <Button 
                          type="button" 
                          variant="link" 
                          size="sm"
                          className="text-xs p-0 h-auto"
                          disabled={resendDisabled}
                          onClick={handleResendOtp}
                        >
                          {resendDisabled 
                            ? `Resend in ${countdown}s` 
                            : 'Resend OTP'}
                        </Button>
                      </div>
                      <div className="relative">
                        <Input
                          id="otp"
                          type="text"
                          placeholder="Enter 6-digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').substring(0, 6))}
                          required
                          className="pr-10"
                          maxLength={6}
                          autoFocus
                        />
                        <Key className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        For demo, use phone: 1234567890 (admin) or 9876543210 (voter)
                      </p>
                    </div>
                  </>
                )}
              </div>
              
              <CardFooter className="flex justify-center pt-6 pb-0 px-0">
                <Button 
                  type="submit" 
                  className="w-full bg-vote-secondary hover:bg-vote-primary"
                  disabled={isLoading}
                >
                  {isLoading 
                    ? 'Processing...' 
                    : otpSent 
                      ? 'Verify & Login' 
                      : 'Send OTP'
                  }
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="biometric">
          <CardContent className="pt-6 text-center">
            <div className="flex flex-col items-center py-6">
              <Fingerprint className="h-24 w-24 text-vote-secondary animate-pulse-slow" />
              <p className="mt-4 text-muted-foreground">
                Use biometric authentication to login securely
              </p>
            </div>
            
            <CardFooter className="flex justify-center pt-6 pb-0 px-0">
              <Button 
                onClick={handleLogin} 
                className="w-full bg-vote-secondary hover:bg-vote-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Authenticating...' : 'Authenticate with Biometrics'}
              </Button>
            </CardFooter>
          </CardContent>
        </TabsContent>
      </Tabs>
      
      <div className="mt-6 mb-4 text-center">
        <span className="text-sm text-muted-foreground">
          Don't have an account?{' '}
        </span>
        <a 
          href="/register" 
          className="text-sm text-vote-secondary hover:underline"
        >
          Register
        </a>
      </div>
    </Card>
  );
};

export default LoginForm;
