
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useVote } from '@/contexts/VoteContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Check, AlertCircle, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Define schema for adding a candidate
const candidateSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  party: z.string().min(1, { message: "Party name is required" }),
  image: z.string().default("/placeholder.svg")
});

type CandidateFormValues = z.infer<typeof candidateSchema>;

const AdminPanel: React.FC = () => {
  const { isAdmin } = useAuth();
  const { candidates, results, loadResults, isLoadingResults, syncVotes, lastSyncTime, addCandidate } = useVote();
  const [totalVotes, setTotalVotes] = useState(0);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [showCandidateForm, setShowCandidateForm] = useState(false);
  
  // Initialize form
  const form = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateSchema),
    defaultValues: {
      name: "",
      party: "",
      image: "/placeholder.svg"
    }
  });
  
  useEffect(() => {
    if (isAdmin) {
      loadResults();
    }
  }, [isAdmin, loadResults]);
  
  useEffect(() => {
    // Calculate total votes
    const total = Object.values(results).reduce((sum, count) => sum + count, 0);
    setTotalVotes(total);
  }, [results]);
  
  const handleSyncVotes = async () => {
    setSyncStatus('syncing');
    try {
      const success = await syncVotes();
      if (success) {
        setSyncStatus('success');
        // Reset success status after 3 seconds
        setTimeout(() => setSyncStatus('idle'), 3000);
      } else {
        setSyncStatus('error');
        // Reset error status after 3 seconds
        setTimeout(() => setSyncStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Error during sync:', error);
      setSyncStatus('error');
      toast.error('An unexpected error occurred during synchronization');
      // Reset error status after 3 seconds
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const onSubmitCandidate = (data: CandidateFormValues) => {
    try {
      addCandidate({
        id: Date.now().toString(), // Generate a simple ID
        name: data.name,
        party: data.party,
        image: data.image
      });
      
      toast.success('Candidate added successfully');
      setShowCandidateForm(false);
      form.reset();
    } catch (error) {
      console.error('Error adding candidate:', error);
      toast.error('Failed to add candidate');
    }
  };
  
  // Redirect non-admin users
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-vote-primary">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {lastSyncTime ? (
              <span>Last sync: {format(lastSyncTime, 'MMM d, yyyy HH:mm:ss')}</span>
            ) : (
              <span>Never synced</span>
            )}
          </div>
          <Button 
            onClick={handleSyncVotes}
            disabled={isLoadingResults || syncStatus === 'syncing'}
            variant={syncStatus === 'error' ? "destructive" : (syncStatus === 'success' ? "outline" : "default")}
            className="flex items-center gap-2"
          >
            {syncStatus === 'syncing' ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                <span>Syncing...</span>
              </>
            ) : syncStatus === 'success' ? (
              <>
                <Check className="h-4 w-4" />
                <span>Synced</span>
              </>
            ) : syncStatus === 'error' ? (
              <>
                <AlertCircle className="h-4 w-4" />
                <span>Sync Failed</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Sync Votes</span>
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Votes Cast
            </CardTitle>
            <CardDescription className="text-3xl font-bold">
              {totalVotes}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
      
      {/* Vote Counting Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Live Vote Tallies</CardTitle>
              <CardDescription>
                Decrypted vote counts from the secure ballot system
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setShowCandidateForm(!showCandidateForm)}
            >
              <Plus className="h-4 w-4" />
              Add Candidate
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingResults ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vote-secondary"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {candidates.map((candidate) => {
                const voteCount = results[candidate.id] || 0;
                const percentage = totalVotes > 0 
                  ? Math.round((voteCount / totalVotes) * 100) 
                  : 0;
                
                return (
                  <div key={candidate.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <img
                          src={candidate.image}
                          alt={candidate.name}
                          className="h-8 w-8 rounded-full mr-3 bg-gray-200"
                        />
                        <div>
                          <h4 className="font-medium">{candidate.name}</h4>
                          <p className="text-sm text-muted-foreground">{candidate.party}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">{voteCount}</span>
                        <span className="text-sm text-muted-foreground ml-1">
                          ({percentage}%)
                        </span>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add Candidate Form */}
      {showCandidateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Candidate</CardTitle>
            <CardDescription>
              Enter details to register a new candidate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitCandidate)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Candidate Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter candidate name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="party"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Political Party</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter party name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Photo URL (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/photo.jpg" 
                          {...field} 
                          defaultValue="/placeholder.svg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCandidateForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Add Candidate</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminPanel;
