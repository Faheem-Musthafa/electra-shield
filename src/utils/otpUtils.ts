
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

// Detect device type for biometric authentication
export const detectDeviceType = (): 'mobile' | 'desktop' => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  if (/android|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent)) {
    return 'mobile';
  }
  return 'desktop';
};

// Check if biometric authentication is available
export const isBiometricAvailable = async (): Promise<boolean> => {
  try {
    // Check if Web Authentication API is available
    if (window.PublicKeyCredential) {
      // Check if biometric authentication is available
      return await (PublicKeyCredential as any).isUserVerifyingPlatformAuthenticatorAvailable();
    }
    return false;
  } catch (error) {
    console.error('Biometric availability check error:', error);
    return false;
  }
};

// Mock biometric authentication (in a real app, use Web Authentication API)
export const authenticateWithBiometric = async (userId: string): Promise<{success: boolean, message: string}> => {
  try {
    const deviceType = detectDeviceType();
    console.log(`[MOCK] Authenticating with ${deviceType === 'mobile' ? 'fingerprint' : 'facial recognition'}`);
    
    // Simulate biometric authentication
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockSuccess = Math.random() > 0.2; // 80% success rate for demo
    
    return {
      success: mockSuccess,
      message: mockSuccess 
        ? `Successfully authenticated with ${deviceType === 'mobile' ? 'fingerprint' : 'facial recognition'}`
        : `Failed to authenticate with ${deviceType === 'mobile' ? 'fingerprint' : 'facial recognition'}. Please try again.`
    };
  } catch (error) {
    console.error('Biometric authentication error:', error);
    return {
      success: false,
      message: 'An error occurred during biometric authentication.'
    };
  }
};
