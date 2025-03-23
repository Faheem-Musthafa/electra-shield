
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardFooter } from '@/components/ui/card';
import { Key, Smartphone, Lock } from 'lucide-react';
import { formatPhoneNumber, isDevelopmentMode } from '@/utils/otpUtils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator
} from '@/components/ui/input-otp';
import { FaceCapture } from '@/components/ui/face-capture';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OTPLoginFormProps {
  onLoginSuccess: () => void;
}

const OTPLoginForm: React.FC<OTPLoginFormProps> = ({ onLoginSuccess }) => {
  const { login, requestOtp, isLoading } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [faceImage, setFaceImage] = useState('');
  const [activeTab, setActiveTab] = useState('otp');
  const isMobile = useIsMobile();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }
    
    try {
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
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('Failed to send OTP. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    if (resendDisabled) return;
    await handleSendOtp({ preventDefault: () => {} } as React.FormEvent);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone || phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }
    
    if (!password || password.length < 6) {
      toast.error('Please enter a valid password (at least 6 characters)');
      return;
    }
    
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    
    if (activeTab === 'face' && !faceImage) {
      toast.error('Please capture your face image');
      return;
    }
    
    try {
      console.log('Attempting login with:', { phone, otp, password });
      // Pass the password as the third parameter to the login function
      const success = await login(phone, otp, password);
      
      if (success) {
        toast.success('Login successful!');
        setOtp('');
        setPhone('');
        setPassword('');
        setOtpSent(false);
        onLoginSuccess();
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials and try again.');
    }
  };

  const handleOtpChange = (value: string) => {
    setOtp(value);
    console.log('OTP entered:', value);
  };

  const handleFaceCapture = (imageSrc: string) => {
    setFaceImage(imageSrc);
    console.log('Face image captured');
  };

  // Auto-submit when OTP is fully entered
  React.useEffect(() => {
    if (otp.length === 6 && otpSent) {
      // Small delay to allow user to see the last digit they entered
      const timer = setTimeout(() => {
        handleLogin({ preventDefault: () => {} } as React.FormEvent);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [otp]);

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="otp">OTP Verification</TabsTrigger>
          <TabsTrigger value="face">Face Verification</TabsTrigger>
        </TabsList>
        
        <TabsContent value="otp" className="space-y-4">
          <form onSubmit={otpSent ? handleLogin : handleSendOtp}>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').substring(0, 10))}
                    required
                    disabled={otpSent && isLoading}
                    className="pl-10"
                  />
                  <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {isDevelopmentMode() && !otpSent && (
                  <p className="text-xs text-muted-foreground mt-1">
                    For demo, use phone: 1234567890 (admin) or 9876543210 (voter)
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
                    disabled={isLoading}
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
                    
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={handleOtpChange}
                      className="w-full"
                      containerClassName={isMobile ? "justify-center gap-1" : "justify-center gap-2"}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        {isMobile ? null : <InputOTPSeparator />}
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                    
                    {isDevelopmentMode() && (
                      <p className="text-xs text-muted-foreground mt-2">
                        For demo, use any 6-digit code (e.g., 123456)
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
            
            <CardFooter className="flex justify-center pt-6 pb-0 px-0">
              <Button 
                type="submit" 
                className="w-full bg-vote-secondary hover:bg-vote-primary"
                disabled={isLoading || (otpSent && otp.length !== 6)}
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
        </TabsContent>
        
        <TabsContent value="face" className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Face Verification</Label>
              <FaceCapture onCapture={handleFaceCapture} capturedImage={faceImage} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Input
                  id="phone-face"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').substring(0, 10))}
                  required
                  disabled={isLoading}
                  className="pl-10"
                />
                <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              {isDevelopmentMode() && !otpSent && (
                <p className="text-xs text-muted-foreground mt-1">
                  For demo, use phone: 1234567890 (admin) or 9876543210 (voter)
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password-face">Password</Label>
              <div className="relative">
                <Input
                  id="password-face"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
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

            {otpSent ? (
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
                
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={handleOtpChange}
                  className="w-full"
                  containerClassName={isMobile ? "justify-center gap-1" : "justify-center gap-2"}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    {isMobile ? null : <InputOTPSeparator />}
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                
                {isDevelopmentMode() && (
                  <p className="text-xs text-muted-foreground mt-2">
                    For demo, use any 6-digit code (e.g., 123456)
                  </p>
                )}
              </div>
            ) : (
              <Button 
                type="button" 
                className="w-full"
                onClick={handleSendOtp}
                disabled={!phone || phone.length !== 10}
              >
                Send OTP
              </Button>
            )}
            
            {otpSent && (
              <CardFooter className="flex justify-center pt-3 pb-0 px-0">
                <Button 
                  type="button" 
                  className="w-full bg-vote-secondary hover:bg-vote-primary"
                  disabled={isLoading || otp.length !== 6 || !faceImage}
                  onClick={handleLogin}
                >
                  {isLoading 
                    ? 'Processing...' 
                    : 'Verify & Login'
                  }
                </Button>
              </CardFooter>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default OTPLoginForm;
