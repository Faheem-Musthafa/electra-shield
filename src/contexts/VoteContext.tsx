
import React, { createContext, useContext, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { encryptVote } from '@/lib/encryption';

export interface Candidate {
  id: string;
  name: string;
  party: string;
  image: string;
}

interface VoteContextType {
  candidates: Candidate[];
  castVote: (candidateId: string) => Promise<boolean>;
  results: { [key: string]: number };
  loadResults: () => Promise<void>;
  isLoadingResults: boolean;
}

// Mock candidates
const MOCK_CANDIDATES: Candidate[] = [
  { id: '1', name: 'John Smith', party: 'Democratic Party', image: '/placeholder.svg' },
  { id: '2', name: 'Jane Doe', party: 'Republican Party', image: '/placeholder.svg' },
  { id: '3', name: 'Alex Johnson', party: 'Independent', image: '/placeholder.svg' },
];

// Mock votes for demonstration
const MOCK_VOTES: { [key: string]: string[] } = {
  '1': ['encrypted_vote_1', 'encrypted_vote_2'],
  '2': ['encrypted_vote_3'],
  '3': ['encrypted_vote_4', 'encrypted_vote_5', 'encrypted_vote_6'],
};

const VoteContext = createContext<VoteContextType | undefined>(undefined);

export const VoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, markAsVoted } = useAuth();
  const [results, setResults] = useState<{ [key: string]: number }>({});
  const [isLoadingResults, setIsLoadingResults] = useState(false);

  const castVote = async (candidateId: string): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to vote');
      return false;
    }

    if (user.hasVoted) {
      toast.error('You have already voted');
      return false;
    }

    try {
      // Encrypt the vote
      const encryptedVote = encryptVote(candidateId);
      
      // In a real app, send the encrypted vote to the backend
      console.log('Encrypted vote:', encryptedVote);
      
      // Mark user as having voted
      markAsVoted();
      
      toast.success('Your vote has been cast successfully!');
      return true;
    } catch (error) {
      console.error('Error casting vote:', error);
      toast.error('Failed to cast vote. Please try again.');
      return false;
    }
  };

  const loadResults = async (): Promise<void> => {
    setIsLoadingResults(true);
    try {
      // In a real app, fetch and decrypt results from backend
      // For demo, use mock data
      
      setTimeout(() => {
        const calculatedResults: { [key: string]: number } = {};
        
        Object.keys(MOCK_VOTES).forEach(candidateId => {
          calculatedResults[candidateId] = MOCK_VOTES[candidateId].length;
        });
        
        setResults(calculatedResults);
        setIsLoadingResults(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading results:', error);
      toast.error('Failed to load results');
      setIsLoadingResults(false);
    }
  };

  return (
    <VoteContext.Provider value={{ 
      candidates: MOCK_CANDIDATES, 
      castVote, 
      results, 
      loadResults,
      isLoadingResults
    }}>
      {children}
    </VoteContext.Provider>
  );
};

export const useVote = () => {
  const context = useContext(VoteContext);
  if (context === undefined) {
    throw new Error('useVote must be used within a VoteProvider');
  }
  return context;
};
