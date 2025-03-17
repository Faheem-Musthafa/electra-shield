
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardFooter } from '@/components/ui/card';
import { Key, Smartphone } from 'lucide-react';
import { formatPhoneNumber } from '@/utils/otpUtils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface OTPLoginFormProps {
  onLoginSuccess: () => void;
}

const OTPLoginForm: React.FC<OTPLoginFormProps> = ({ onLoginSuccess }) => {
  const { login, requestOtp, isLoading } = useAuth();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
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
    
    if (!phone || !otp) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const success = await login(phone, otp);
    if (success) {
      onLoginSuccess();
    }
  };

  return (
    <>
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
    </>
  );
};

export default OTPLoginForm;
