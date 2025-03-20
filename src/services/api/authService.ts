import { generateOTP, isDevelopmentMode } from '@/utils/otpUtils';
import { 
  LoginResponse, 
  OtpResponse, 
  RegisterResponse
} from './types';
import { 
  MOCK_USERS, 
  otpStore, 
  delay 
} from './mockDatabase';
import { loadRegisteredUsers, saveRegisteredUsers } from './storageUtils';

/**
 * Request OTP for a phone number
 */
export async function requestOTP(phone: string): Promise<OtpResponse> {
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
  
  // Only log in development mode
  if (isDevelopmentMode()) {
    console.log(`[DEV MODE] Generated OTP for ${phone}: ${otp}`);
  }
  
  return {
    success: true,
    message: userExists 
      ? "OTP sent successfully to your phone" 
      : "OTP sent. Note: This number is not registered yet",
    // Only include OTP in response for development
    otp: isDevelopmentMode() ? otp : undefined
  };
}

/**
 * Verify OTP and login user
 */
export async function verifyOTPAndLogin(phone: string, otp: string): Promise<LoginResponse> {
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
}

/**
 * Register a new user
 */
export async function registerUser(name: string, phone: string, addressId: string): Promise<RegisterResponse> {
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
}
