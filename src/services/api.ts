
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
  loginWithEmailPassword: authService.loginWithEmailPassword,
  registerUser: authService.registerUser,
  
  // Vote services
  castVote: voteService.castVote,
  addCandidate: voteService.addCandidate,
  getVoteCounts: voteService.getVoteCounts
};
