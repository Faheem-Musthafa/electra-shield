
/**
 * Utilities for OTP generation and validation
 */

// Generate a random OTP of specified length
export const generateOTP = (length: number = 6): string => {
  const digits = '0123456789';
  let OTP = '';
  
  for (let i = 0; i < length; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  
  return OTP;
};

// Check if OTP is valid (for mock purposes, we'll check against a stored OTP)
export const validateOTP = (inputOTP: string, storedOTP: string): boolean => {
  return inputOTP === storedOTP;
};

// Format phone number for display
export const formatPhoneNumber = (phone: string): string => {
  // Basic formatting - would be more sophisticated in production
  if (phone.length === 10) {
    return `(${phone.substring(0, 3)}) ${phone.substring(3, 6)}-${phone.substring(6)}`;
  }
  return phone;
};

// Check if we're in development mode
export const isDevelopmentMode = (): boolean => {
  return process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
};

// Simple encryption for user data (for demonstration purposes)
export const encryptUserData = (userData: object): string => {
  try {
    // Convert the object to a string and encode it
    const dataString = JSON.stringify(userData);
    const encodedData = btoa(dataString);
    return `encrypted:${encodedData}:${Date.now()}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt user data');
  }
};

// Decrypt user data
export const decryptUserData = (encryptedData: string): any => {
  try {
    // Check if data follows our encryption format
    if (!encryptedData.startsWith('encrypted:')) {
      throw new Error('Invalid encrypted data format');
    }
    
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data structure');
    }
    
    // Decode and parse the data
    const decodedData = atob(parts[1]);
    return JSON.parse(decodedData);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt user data');
  }
};
