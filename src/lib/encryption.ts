
// This is a simplified mock encryption system for demonstration purposes
// In a real application, you would use a proper cryptographic library

// Mock RSA encryption (in a real app, use a proper library like node-forge or crypto-js)
export function encryptVote(voteData: string): string {
  // For demo purposes, just encoding the vote
  const mockEncrypted = btoa(`secured:${voteData}:${Date.now()}`);
  return mockEncrypted;
}

export function decryptVote(encryptedVote: string): string {
  try {
    // For demo purposes, just decoding the vote
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

// For verifying vote integrity
export function generateVoteHash(userId: string, candidateId: string, timestamp: number): string {
  const data = `${userId}:${candidateId}:${timestamp}`;
  
  // Simple hash function (not cryptographically secure - for demo only)
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return hash.toString(16);
}
