import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

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

// Mock data for demo purposes
const MOCK_USERS = [
  { id: '1', name: 'Admin User', phone: '1234567890', isAdmin: true, hasVoted: false },
  { id: '2', name: 'John Voter', phone: '9876543210', isAdmin: false, hasVoted: false },
];

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
      // Simulate API call to send OTP
      console.log(`OTP sent to ${phone}`);
      toast.success(`OTP sent to ${phone}`);
      setIsLoading(false);
      return true;
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
      // In a real app, verify OTP with backend
      // For demo, just check if the phone number exists in mock data
      const matchedUser = MOCK_USERS.find(u => u.phone === phone);
      
      if (matchedUser && otp === '123456') { // Mock OTP verification
        setUser(matchedUser);
        localStorage.setItem('electra-shield-user', JSON.stringify(matchedUser));
        toast.success('Login successful!');
        setIsLoading(false);
        // Show admin toast if user is an admin
        if (matchedUser.isAdmin) {
          toast.success('Admin privileges detected');
        }
        return true;
      } else {
        toast.error('Invalid credentials');
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
      // In a real app, send registration data to backend
      // For demo, just pretend it worked
      const newUser = {
        id: Math.random().toString(36).substring(2, 10),
        name,
        phone,
        isAdmin: false,
        hasVoted: false
      };
      
      toast.success('Registration successful! Please verify your phone number.');
      setIsLoading(false);
      return true;
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
