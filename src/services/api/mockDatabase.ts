
import { MockUser, OtpData } from './types';

// Simulate network delay
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock user database
export const MOCK_USERS: MockUser[] = [
  { id: '1', name: 'Admin User', phone: '1234567890', isAdmin: true, hasVoted: false },
  { id: '2', name: 'John Voter', phone: '9876543210', isAdmin: false, hasVoted: false },
];

// Store OTPs temporarily (in a real app, this would be in a database with TTL)
export const otpStore: Record<string, OtpData> = {};
