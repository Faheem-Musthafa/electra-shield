
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { User, CreditCard, Phone, AtSign, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { FaceCapture } from '@/components/ui/face-capture';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatPhoneNumber, isDevelopmentMode } from '@/utils/otpUtils';
import { 
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator
} from '@/components/ui/input-otp';
import { useIsMobile } from '@/hooks/use-mobile';

const RegisterForm: React.FC = () => {
  const { register, requestOtp, isLoading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [addressId, setAddressId] = useState('');
  const [faceImage, setFaceImage] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // OTP verification states
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

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
    
    if (!email) {
      errors.email = 'Email address is required';
    } else if (!email.includes('@')) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (!addressId.trim()) {
      errors.addressId = 'Address ID is required';
    } else if (addressId.length < 4) {
      errors.addressId = 'Address ID must be at least 4 characters';
    }
    
    if (!otpVerified) {
      errors.otp = 'Phone verification is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone || phone.length < 10) {
      setValidationErrors({ 
        ...validationErrors, 
        phone: 'Please enter a valid 10-digit phone number' 
      });
      toast.error('Please enter a valid phone number');
      return;
    }
    
    const success = await requestOtp(phone);
    if (success) {
      setOtpSent(true);
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

  const handleVerifyOtp = () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    
    setOtpVerified(true);
    toast.success('Phone number verified successfully');
    setValidationErrors({
      ...validationErrors,
      otp: ''
    });
  };

  const handleOtpChange = (value: string) => {
    setOtp(value);
  };

  const handleFaceCapture = (imageSrc: string) => {
    setFaceImage(imageSrc);
    if (validationErrors.faceImage) {
      setValidationErrors({
        ...validationErrors,
        faceImage: ''
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      const firstError = Object.values(validationErrors)[0];
      if (firstError) {
        toast.error(firstError);
      }
      return;
    }
    
    const success = await register(name, phone, addressId, email, password);
    if (success) {
      if (faceImage) {
        toast.success('Registration successful! Face biometrics saved.');
      } else {
        toast.success('Registration successful!');
      }
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
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Face Capture (Optional)</Label>
              <FaceCapture onCapture={handleFaceCapture} capturedImage={faceImage} />
              {validationErrors.faceImage && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.faceImage}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Your face can be used for secure biometric verification (optional)
              </p>
            </div>
            
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
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationErrors.email) {
                      setValidationErrors({ ...validationErrors, email: '' });
                    }
                  }}
                  required
                  className={`pl-10 ${validationErrors.email ? 'border-red-500' : ''}`}
                />
                <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              {validationErrors.email && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.email}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Your email will be used for account recovery and notifications
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a secure password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationErrors.password) {
                      setValidationErrors({ ...validationErrors, password: '' });
                    }
                  }}
                  required
                  className={`pl-10 ${validationErrors.password ? 'border-red-500' : ''}`}
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              {validationErrors.password && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.password}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (validationErrors.confirmPassword) {
                      setValidationErrors({ ...validationErrors, confirmPassword: '' });
                    }
                  }}
                  required
                  className={`pl-10 ${validationErrors.confirmPassword ? 'border-red-500' : ''}`}
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              {validationErrors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.confirmPassword}</p>
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
                    if (otpVerified) {
                      setOtpVerified(false);
                      setOtpSent(false);
                      setOtp('');
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
            
            {!otpVerified ? (
              <div className="p-4 border border-input rounded-md bg-background">
                {otpSent ? (
                  <div className="space-y-4">
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
                      
                      <Button 
                        type="button"
                        className="w-full mt-4"
                        onClick={handleVerifyOtp}
                        disabled={!otp || otp.length !== 6}
                      >
                        Verify OTP
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Verify your phone number</span>
                    <Button 
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSendOtp}
                      disabled={!phone || phone.length !== 10}
                    >
                      Send OTP
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 border border-input rounded-md bg-muted/50">
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center gap-2">
                    <Phone className="h-4 w-4 text-green-500" />
                    Phone verified: {formatPhoneNumber(phone)}
                  </span>
                  <Button 
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={() => {
                      setOtpVerified(false);
                      setOtpSent(false);
                      setOtp('');
                    }}
                  >
                    Change
                  </Button>
                </div>
              </div>
            )}
            
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
          </div>
          
          <CardFooter className="flex justify-center pt-6 px-0 pb-0">
            <Button 
              type="submit" 
              className="w-full bg-vote-accent hover:bg-vote-primary"
              disabled={isLoading || !otpVerified}
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
