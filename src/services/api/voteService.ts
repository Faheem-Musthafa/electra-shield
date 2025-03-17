
import { loadRegisteredUsers, saveRegisteredUsers } from './storageUtils';
import { delay } from './mockDatabase';

/**
 * Cast a vote
 */
export async function castVote(userId: string, encryptedVote: string): Promise<{ success: boolean; message: string }> {
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
}
