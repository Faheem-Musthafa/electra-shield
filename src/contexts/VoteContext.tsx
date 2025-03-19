
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { encryptVote } from '@/lib/encryption';
import { apiService } from '@/services/api';

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
  syncVotes: () => Promise<boolean>;
  lastSyncTime: Date | null;
  addCandidate: (candidate: Candidate) => Promise<boolean>;
}

// Mock candidates
const MOCK_CANDIDATES: Candidate[] = [
  { id: '1', name: 'John Smith', party: 'Democratic Party', image: '/placeholder.svg' },
  { id: '2', name: 'Jane Doe', party: 'Republican Party', image: '/placeholder.svg' },
  { id: '3', name: 'Alex Johnson', party: 'Independent', image: '/placeholder.svg' },
];

const VoteContext = createContext<VoteContextType | undefined>(undefined);

export const VoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, markAsVoted } = useAuth();
  const [results, setResults] = useState<{ [key: string]: number }>({});
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>(MOCK_CANDIDATES);
  
  // Load results on initial render
  useEffect(() => {
    loadResults();
  }, []);

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
      
      // Send the encrypted vote to the API
      const response = await apiService.castVote(user.id, encryptedVote);
      
      if (response.success) {
        // Mark user as having voted
        markAsVoted();
        
        // Update results
        await loadResults();
        
        toast.success('Your vote has been cast successfully!');
        return true;
      } else {
        toast.error(response.message || 'Failed to cast vote');
        return false;
      }
    } catch (error) {
      console.error('Error casting vote:', error);
      toast.error('Failed to cast vote. Please try again.');
      return false;
    }
  };

  const loadResults = async (): Promise<void> => {
    setIsLoadingResults(true);
    try {
      // Get vote counts from the service
      const voteCounts = await apiService.getVoteCounts();
      setResults(voteCounts);
      setIsLoadingResults(false);
    } catch (error) {
      console.error('Error loading results:', error);
      toast.error('Failed to load results');
      setIsLoadingResults(false);
    }
  };

  const syncVotes = async (): Promise<boolean> => {
    if (!user?.isAdmin) {
      toast.error('Only administrators can sync votes');
      return false;
    }

    setIsLoadingResults(true);
    try {
      // Get latest vote counts
      await loadResults();
      setLastSyncTime(new Date());
      setIsLoadingResults(false);
      
      toast.success('Votes synchronized successfully');
      return true;
    } catch (error) {
      console.error('Error syncing votes:', error);
      toast.error('Failed to sync votes');
      setIsLoadingResults(false);
      return false;
    }
  };

  const addCandidate = async (candidate: Candidate): Promise<boolean> => {
    if (!user?.isAdmin) {
      toast.error('Only administrators can add candidates');
      return false;
    }

    // Check if a candidate with the same ID already exists
    if (candidates.some(c => c.id === candidate.id)) {
      toast.error('A candidate with this ID already exists');
      return false;
    }

    try {
      // Call the API to add the candidate
      const response = await apiService.addCandidate(candidate);
      
      if (response.success) {
        // Add the new candidate to our state
        setCandidates(prev => [...prev, candidate]);
        
        // Refresh results to include the new candidate
        await loadResults();
        
        toast.success(`Candidate ${candidate.name} added successfully`);
        return true;
      } else {
        toast.error(response.message || 'Failed to add candidate');
        return false;
      }
    } catch (error) {
      console.error('Error adding candidate:', error);
      toast.error('Failed to add candidate');
      return false;
    }
  };

  return (
    <VoteContext.Provider value={{ 
      candidates, 
      castVote, 
      results, 
      loadResults,
      isLoadingResults,
      syncVotes,
      lastSyncTime,
      addCandidate
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
