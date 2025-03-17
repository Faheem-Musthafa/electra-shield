
import { MockUser } from './types';
import { decryptUserData, encryptUserData } from '@/utils/otpUtils';

// Helper function to load registered users from localStorage
export const loadRegisteredUsers = (): Array<MockUser> => {
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
export const saveRegisteredUsers = (users: Array<MockUser>): void => {
  try {
    const encryptedUsers = users.map(user => encryptUserData(user));
    localStorage.setItem('electra-shield-registered-users', JSON.stringify(encryptedUsers));
  } catch (error) {
    console.error('Error saving registered users:', error);
  }
};
