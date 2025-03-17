import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiService } from '@/services/api';
import { isBiometricAvailable, detectDeviceType } from '@/utils/otpUtils';

interface User {
  id: string;
  name: string;
  phone: string;
  isAdmin: boolean;
  hasVoted: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (phone: string, otp: string) => Promise<boolean>;
  loginWithBiometrics: () => Promise<boolean>;
  register: (name: string, phone: string, addressId: string) => Promise<boolean>;
  logout: () => void;
  requestOtp: (phone: string) => Promise<boolean>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  markAsVoted: () => void;
  validateAdminAccess: () => boolean;
  isBiometricsAvailable: boolean;
  biometricType: 'fingerprint' | 'facial' | null;
  registerBiometrics: (userId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBiometricsAvailable, setIsBiometricsAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'facial' | null>(null);

  useEffect(() => {
    // Check for existing session in localStorage
    const savedUser = localStorage.getItem('electra-shield-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    // Check for biometric availability
    checkBiometricAvailability();
    
    setIsLoading(false);
  }, []);

  const checkBiometricAvailability = async () => {
    const available = await isBiometricAvailable();
    setIsBiometricsAvailable(available);
    
    if (available) {
      const deviceType = detectDeviceType();
      setBiometricType(deviceType === 'mobile' ? 'fingerprint' : 'facial');
    } else {
      setBiometricType(null);
    }
  };

  const requestOtp = async (phone: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiService.requestOTP(phone);
      
      if (response.success) {
        toast.success(response.message);
        
        // In development mode, also show the OTP in a toast for easy testing
        if (response.otp) {
          toast.info(`Development OTP: ${response.otp}`, {
            duration: 10000, // Show for 10 seconds
          });
        }
        
        setIsLoading(false);
        return true;
      } else {
        toast.error(response.message);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('Failed to send OTP. Please try again.');
      setIsLoading(false);
      return false;
    }
  };

  const login = async (phone: string, otp: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiService.verifyOTPAndLogin(phone, otp);
      
      if (response.success && response.user) {
        setUser(response.user);
        localStorage.setItem('electra-shield-user', JSON.stringify(response.user));
        toast.success(response.message || 'Login successful!');
        
        // Show admin toast if user is an admin
        if (response.user.isAdmin) {
          toast.success('Admin privileges detected');
        }
        
        setIsLoading(false);
        return true;
      } else {
        toast.error(response.message || 'Invalid credentials');
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      setIsLoading(false);
      return false;
    }
  };

  const loginWithBiometrics = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiService.authenticateWithBiometrics();
      
      if (response.success && response.user) {
        setUser(response.user);
        localStorage.setItem('electra-shield-user', JSON.stringify(response.user));
        toast.success(response.message || 'Biometric authentication successful!');
        
        // Show admin toast if user is an admin
        if (response.user.isAdmin) {
          toast.success('Admin privileges detected');
        }
        
        setIsLoading(false);
        return true;
      } else {
        toast.error(response.message || 'Biometric authentication failed');
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Biometric login error:', error);
      toast.error('Biometric authentication failed. Please try again.');
      setIsLoading(false);
      return false;
    }
  };

  const registerBiometrics = async (userId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiService.registerBiometricCredential(userId);
      
      if (response.success) {
        toast.success(response.message);
        setIsLoading(false);
        return true;
      } else {
        toast.error(response.message);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Biometric registration error:', error);
      toast.error('Failed to register biometric credentials. Please try again.');
      setIsLoading(false);
      return false;
    }
  };

  const register = async (name: string, phone: string, addressId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiService.registerUser(name, phone, addressId);
      
      if (response.success) {
        toast.success(response.message);
        setIsLoading(false);
        return true;
      } else {
        toast.error(response.message);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('electra-shield-user');
    toast.info('You have been logged out');
  };

  const markAsVoted = () => {
    if (user) {
      const updatedUser = { ...user, hasVoted: true };
      setUser(updatedUser);
      localStorage.setItem('electra-shield-user', JSON.stringify(updatedUser));
    }
  };

  const validateAdminAccess = (): boolean => {
    if (!user) return false;
    if (!user.isAdmin) {
      toast.error('You do not have admin privileges');
      return false;
    }
    return true;
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        login, 
        loginWithBiometrics,
        register, 
        logout, 
        requestOtp,
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin || false,
        markAsVoted,
        validateAdminAccess,
        isBiometricsAvailable,
        biometricType,
        registerBiometrics
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
