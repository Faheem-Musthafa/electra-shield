
import * as authService from './api/authService';
import * as voteService from './api/voteService';

/**
 * API Services - Mock implementation for frontend development
 * In a real application, these would make actual HTTP requests to a backend server
 */
export const apiService = {
  // Auth services
  requestOTP: authService.requestOTP,
  verifyOTPAndLogin: authService.verifyOTPAndLogin,
  registerUser: authService.registerUser,
  authenticateWithBiometrics: authService.authenticateWithBiometrics,
  registerBiometricCredential: authService.registerBiometricCredential,
  
  // Vote services
  castVote: voteService.castVote
};
