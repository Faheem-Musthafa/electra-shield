
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiService } from '@/services/api';

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
  register: (name: string, phone: string, addressId: string) => Promise<boolean>;
  logout: () => void;
  requestOtp: (phone: string) => Promise<boolean>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  markAsVoted: () => void;
  validateAdminAccess: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const savedUser = localStorage.getItem('electra-shield-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

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
        register, 
        logout, 
        requestOtp,
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin || false,
        markAsVoted,
        validateAdminAccess
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
