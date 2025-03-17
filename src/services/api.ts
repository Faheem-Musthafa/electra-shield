
import { generateOTP, encryptUserData, decryptUserData, authenticateWithBiometric } from '@/utils/otpUtils';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock user database
const MOCK_USERS = [
  { id: '1', name: 'Admin User', phone: '1234567890', isAdmin: true, hasVoted: false },
  { id: '2', name: 'John Voter', phone: '9876543210', isAdmin: false, hasVoted: false },
];

// Store OTPs temporarily (in a real app, this would be in a database with TTL)
const otpStore: Record<string, { otp: string, expiresAt: number }> = {};

// Store biometric credentials (in a real app, this would be in a secure database)
const biometricCredentials: Record<string, { userId: string, credential: string }> = {
  '1': { userId: '1', credential: 'mock-admin-biometric-credential' },
  '2': { userId: '2', credential: 'mock-voter-biometric-credential' }
};

interface LoginResponse {
  success: boolean;
  user?: {
    id: string;
    name: string;
    phone: string;
    isAdmin: boolean;
    hasVoted: boolean;
  };
  message?: string;
}

interface OtpResponse {
  success: boolean;
  message: string;
  otp?: string; // Only included in development mode
}

interface RegisterResponse {
  success: boolean;
  message: string;
  userId?: string;
}

interface BiometricAuthResponse {
  success: boolean;
  message: string;
  credential?: string;
}

// Helper function to load registered users from localStorage
const loadRegisteredUsers = (): Array<any> => {
  try {
    const storedUsers = localStorage.getItem('electra-shield-registered-users');
    if (storedUsers) {
      const encryptedUsers = JSON.parse(storedUsers);
      return encryptedUsers.map((encryptedUser: string) => decryptUserData(encryptedUser));
    }
  } catch (error) {
    console.error('Error loading registered users:', error);
  }
  return [];
};

// Helper function to save registered users to localStorage
const saveRegisteredUsers = (users: Array<any>): void => {
  try {
    const encryptedUsers = users.map(user => encryptUserData(user));
    localStorage.setItem('electra-shield-registered-users', JSON.stringify(encryptedUsers));
  } catch (error) {
    console.error('Error saving registered users:', error);
  }
};

/**
 * API Services - Mock implementation for frontend development
 * In a real application, these would make actual HTTP requests to a backend server
 */
export const apiService = {
  /**
   * Request OTP for a phone number
   */
  async requestOTP(phone: string): Promise<OtpResponse> {
    // Simulate API call delay
    await delay(1500);
    
    // Get all users (mock + registered)
    const registeredUsers = loadRegisteredUsers();
    const allUsers = [...MOCK_USERS, ...registeredUsers];
    
    // Check if phone exists in our database
    const userExists = allUsers.some(user => user.phone === phone);
    
    // Generate a 6-digit OTP
    const otp = generateOTP(6);
    
    // Store OTP with 5-minute expiration
    otpStore[phone] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000
    };
    
    console.log(`[DEV MODE] Generated OTP for ${phone}: ${otp}`);
    
    return {
      success: true,
      message: userExists 
        ? "OTP sent successfully to your phone" 
        : "OTP sent. Note: This number is not registered yet",
      // Only include OTP in response for development
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    };
  },
  
  /**
   * Verify OTP and login user
   */
  async verifyOTPAndLogin(phone: string, otp: string): Promise<LoginResponse> {
    // Simulate API call delay
    await delay(1000);
    
    // Check if OTP exists and is valid
    const storedOTPData = otpStore[phone];
    
    if (!storedOTPData) {
      return {
        success: false,
        message: "No OTP was requested for this number"
      };
    }
    
    if (Date.now() > storedOTPData.expiresAt) {
      delete otpStore[phone]; // Clean up expired OTP
      return {
        success: false,
        message: "OTP has expired. Please request a new one"
      };
    }
    
    if (storedOTPData.otp !== otp) {
      return {
        success: false,
        message: "Invalid OTP. Please try again"
      };
    }
    
    // OTP is valid, check if user exists in mock or registered users
    const registeredUsers = loadRegisteredUsers();
    const allUsers = [...MOCK_USERS, ...registeredUsers];
    const user = allUsers.find(u => u.phone === phone);
    
    if (!user) {
      return {
        success: false,
        message: "Phone number not registered"
      };
    }
    
    // Successful login
    delete otpStore[phone]; // Clean up used OTP
    
    return {
      success: true,
      user,
      message: "Login successful"
    };
  },
  
  /**
   * Register a new user
   */
  async registerUser(name: string, phone: string, addressId: string): Promise<RegisterResponse> {
    // Simulate API call delay
    await delay(2000);
    
    // Get all current users
    const registeredUsers = loadRegisteredUsers();
    const allUsers = [...MOCK_USERS, ...registeredUsers];
    
    // Check if phone already exists
    if (allUsers.some(user => user.phone === phone)) {
      return {
        success: false,
        message: "Phone number already registered"
      };
    }
    
    // Generate a new user ID
    const newUserId = Math.random().toString(36).substring(2, 10);
    
    // Create new user object
    const newUser = {
      id: newUserId,
      name,
      phone,
      addressId,
      isAdmin: false,
      hasVoted: false,
      registeredAt: new Date().toISOString()
    };
    
    // Save to our "database" (localStorage)
    registeredUsers.push(newUser);
    saveRegisteredUsers(registeredUsers);
    
    console.log(`[DEV MODE] Registered new user: ${name}, ${phone}, ${addressId} with ID: ${newUserId}`);
    
    return {
      success: true,
      userId: newUserId,
      message: "Registration successful"
    };
  },
  
  /**
   * Cast a vote
   */
  async castVote(userId: string, encryptedVote: string): Promise<{ success: boolean; message: string }> {
    // Simulate API call delay
    await delay(1500);
    
    // In a real app, we would store the vote in a database
    console.log(`[DEV MODE] Vote cast by user ${userId}: ${encryptedVote}`);
    
    // Update user's voted status
    try {
      const registeredUsers = loadRegisteredUsers();
      const updatedUsers = registeredUsers.map(user => {
        if (user.id === userId) {
          return { ...user, hasVoted: true };
        }
        return user;
      });
      saveRegisteredUsers(updatedUsers);
    } catch (error) {
      console.error('Error updating user vote status:', error);
    }
    
    return {
      success: true,
      message: "Vote cast successfully"
    };
  },

  /**
   * Authenticate using biometrics
   */
  async authenticateWithBiometrics(): Promise<LoginResponse> {
    // Simulate API call delay
    await delay(2000);
    
    try {
      // Simulate biometric authentication
      const authResult = await authenticateWithBiometric('mock-user-id');
      
      if (!authResult.success) {
        return {
          success: false,
          message: authResult.message
        };
      }
      
      // For demo purposes, just return the admin user
      return {
        success: true,
        user: MOCK_USERS[0], // Default to admin user for demo
        message: authResult.message
      };
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return {
        success: false,
        message: 'An error occurred during biometric authentication'
      };
    }
  },

  /**
   * Register biometric credentials
   */
  async registerBiometricCredential(userId: string): Promise<BiometricAuthResponse> {
    // Simulate API call delay
    await delay(1500);
    
    try {
      // In a real app, this would register the credential with the server
      console.log(`[DEV MODE] Registering biometric credential for user ${userId}`);
      
      // Store mock credential
      const mockCredential = `mock-biometric-credential-${Date.now()}`;
      biometricCredentials[userId] = { userId, credential: mockCredential };
      
      return {
        success: true,
        message: 'Biometric credential registered successfully',
        credential: mockCredential
      };
    } catch (error) {
      console.error('Biometric registration error:', error);
      return {
        success: false,
        message: 'Failed to register biometric credential'
      };
    }
  }
};
