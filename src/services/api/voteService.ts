
import { loadRegisteredUsers, saveRegisteredUsers } from './storageUtils';
import { delay } from './mockDatabase';
import { Candidate } from '@/contexts/VoteContext';

// Mock votes storage (in a real app, this would be in a database)
const VOTES_STORAGE_KEY = 'electra-shield-votes';

// Helper to load votes from localStorage
const loadVotes = (): { [key: string]: string[] } => {
  try {
    const storedVotes = localStorage.getItem(VOTES_STORAGE_KEY);
    if (storedVotes) {
      return JSON.parse(storedVotes);
    }
  } catch (error) {
    console.error('Error loading votes:', error);
  }
  return {};
};

// Helper to save votes to localStorage
const saveVotes = (votes: { [key: string]: string[] }): void => {
  try {
    localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(votes));
  } catch (error) {
    console.error('Error saving votes:', error);
  }
};

/**
 * Cast a vote
 */
export async function castVote(userId: string, encryptedVote: string): Promise<{ success: boolean; message: string; candidateId?: string }> {
  // Simulate API call delay
  await delay(1500);
  
  try {
    // Decrypt vote to get candidateId (in a real app, this would happen securely on the server)
    const candidateId = decryptVoteForDemo(encryptedVote);
    
    // Store the vote
    const votes = loadVotes();
    if (!votes[candidateId]) {
      votes[candidateId] = [];
    }
    votes[candidateId].push(encryptedVote);
    saveVotes(votes);
    
    // Update user's voted status
    const registeredUsers = loadRegisteredUsers();
    const updatedUsers = registeredUsers.map(user => {
      if (user.id === userId) {
        return { ...user, hasVoted: true };
      }
      return user;
    });
    saveRegisteredUsers(updatedUsers);
    
    console.log(`[DEV MODE] Vote cast by user ${userId} for candidate ${candidateId}`);
    
    return {
      success: true,
      message: "Vote cast successfully",
      candidateId
    };
  } catch (error) {
    console.error('Error casting vote:', error);
    return {
      success: false,
      message: "Failed to cast vote"
    };
  }
};

/**
 * Add a new candidate to the system
 */
export async function addCandidate(candidate: Candidate): Promise<{ success: boolean; message: string }> {
  // Simulate API call delay
  await delay(1000);
  
  try {
    // In a real app, we would store the candidate in a database
    console.log(`[DEV MODE] Adding new candidate: ${JSON.stringify(candidate)}`);
    
    // Initialize empty votes array for the new candidate
    const votes = loadVotes();
    if (!votes[candidate.id]) {
      votes[candidate.id] = [];
      saveVotes(votes);
    }
    
    return {
      success: true,
      message: `Candidate ${candidate.name} added successfully`
    };
  } catch (error) {
    console.error('Error adding candidate:', error);
    return {
      success: false,
      message: "Failed to add candidate"
    };
  }
}

/**
 * Get vote counts for all candidates
 */
export async function getVoteCounts(): Promise<{ [key: string]: number }> {
  // Simulate API call delay
  await delay(800);
  
  try {
    const votes = loadVotes();
    const counts: { [key: string]: number } = {};
    
    // Make sure all candidates have an entry, even if they have 0 votes
    Object.keys(votes).forEach(candidateId => {
      counts[candidateId] = votes[candidateId].length;
    });
    
    console.log("[DEV MODE] Retrieved vote counts:", counts);
    
    return counts;
  } catch (error) {
    console.error('Error getting vote counts:', error);
    return {};
  }
}

// Simple function to extract candidateId from encrypted vote (for demo only)
function decryptVoteForDemo(encryptedVote: string): string {
  try {
    const decoded = atob(encryptedVote);
    const parts = decoded.split(':');
    if (parts.length === 3 && parts[0] === 'secured') {
      return parts[1]; // Return the candidateId
    }
    throw new Error('Invalid encrypted vote format');
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt vote');
  }
}
