
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
