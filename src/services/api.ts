
import { generateOTP } from '@/utils/otpUtils';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock user database
const MOCK_USERS = [
  { id: '1', name: 'Admin User', phone: '1234567890', isAdmin: true, hasVoted: false },
  { id: '2', name: 'John Voter', phone: '9876543210', isAdmin: false, hasVoted: false },
];

// Store OTPs temporarily (in a real app, this would be in a database with TTL)
const otpStore: Record<string, { otp: string, expiresAt: number }> = {};

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
    
    // Check if phone exists in our mock database
    const userExists = MOCK_USERS.some(user => user.phone === phone);
    
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
    
    // OTP is valid, check if user exists
    const user = MOCK_USERS.find(u => u.phone === phone);
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
    
    // Check if phone already exists
    if (MOCK_USERS.some(user => user.phone === phone)) {
      return {
        success: false,
        message: "Phone number already registered"
      };
    }
    
    // In a real app, we would add the user to the database
    // For this mock, we'll just simulate success but not actually add to our array
    const newUserId = Math.random().toString(36).substring(2, 10);
    
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
    
    return {
      success: true,
      message: "Vote cast successfully"
    };
  }
};
