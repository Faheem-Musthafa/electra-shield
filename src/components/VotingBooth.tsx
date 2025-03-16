
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVote } from '@/contexts/VoteContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Shield, Lock } from 'lucide-react';

const VotingBooth: React.FC = () => {
  const { candidates, castVote } = useVote();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState(false);

  const handleSubmitVote = async () => {
    if (!selectedCandidate) return;
    
    setIsSubmitting(true);
    const success = await castVote(selectedCandidate);
    setIsSubmitting(false);
    
    if (success) {
      setVoteSuccess(true);
      setTimeout(() => {
        setIsDialogOpen(false);
        navigate('/vote-confirmation');
      }, 2000);
    }
  };

  if (user?.hasVoted) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-vote-success shadow-lg">
        <CardHeader className="text-center bg-vote-success text-white rounded-t-lg">
          <CheckCircle2 className="h-12 w-12 mx-auto mb-2" />
          <CardTitle className="text-2xl">Vote Already Cast</CardTitle>
          <CardDescription className="text-white opacity-90">
            Thank you for participating in the democratic process
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 text-center">
          <p className="text-lg mb-4">
            You have already cast your vote in this election.
          </p>
          <p className="text-vote-text">
            Each voter is permitted to vote only once to ensure a fair election process.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="border-vote-primary text-vote-primary hover:bg-vote-primary hover:text-white"
          >
            Return Home
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg">
      <CardHeader className="text-center">
        <Shield className="h-8 w-8 mx-auto mb-2 text-vote-primary" />
        <CardTitle className="text-2xl">Official Ballot</CardTitle>
        <CardDescription>
          Select one candidate below and submit your secure vote
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="flex items-center justify-center mb-6">
          <Lock className="h-4 w-4 mr-2 text-vote-secondary" />
          <span className="text-sm text-vote-secondary">
            Your vote is protected with end-to-end encryption
          </span>
        </div>
        
        <RadioGroup 
          value={selectedCandidate || ''} 
          onValueChange={setSelectedCandidate}
          className="space-y-4"
        >
          {candidates.map((candidate) => (
            <div key={candidate.id} className="flex">
              <div className="flex items-center space-x-2 border rounded-lg p-4 w-full hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value={candidate.id} id={candidate.id} />
                <div className="flex items-center flex-1">
                  <img
                    src={candidate.image}
                    alt={candidate.name}
                    className="h-12 w-12 rounded-full mr-4 bg-gray-200 p-1"
                  />
                  <div>
                    <Label htmlFor={candidate.id} className="font-medium text-lg cursor-pointer">
                      {candidate.name}
                    </Label>
                    <p className="text-sm text-gray-500">{candidate.party}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
      
      <CardFooter className="flex justify-center">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-vote-accent hover:bg-vote-primary"
              disabled={!selectedCandidate}
            >
              Cast My Vote
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Your Vote</DialogTitle>
              <DialogDescription>
                You are about to cast your vote in this election. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            {voteSuccess ? (
              <div className="flex flex-col items-center py-4">
                <CheckCircle2 className="h-16 w-16 text-vote-success mb-4" />
                <p className="text-center text-lg font-medium">
                  Your vote has been successfully recorded!
                </p>
              </div>
            ) : (
              <>
                <div className="py-4">
                  <p className="mb-4">
                    You have selected:
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {selectedCandidate && (
                      <div className="flex items-center">
                        <img
                          src={candidates.find(c => c.id === selectedCandidate)?.image || ''}
                          alt="Candidate"
                          className="h-10 w-10 rounded-full mr-3 bg-gray-200 p-1"
                        />
                        <div>
                          <p className="font-medium">
                            {candidates.find(c => c.id === selectedCandidate)?.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {candidates.find(c => c.id === selectedCandidate)?.party}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <DialogFooter className="sm:justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="sm:mr-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitVote}
                    className="bg-vote-accent hover:bg-vote-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Processing...' : 'Confirm Vote'}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default VotingBooth;
