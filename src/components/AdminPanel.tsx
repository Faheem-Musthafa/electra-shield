
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useVote } from '@/contexts/VoteContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Upload, Check, AlertCircle, Plus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
  const [showCandidateList, setShowCandidateList] = useState(false);
  
  // Initialize form
  const form = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateSchema),
    defaultValues: {
      name: "",
      party: "",
      image: "/placeholder.svg"
    }
  });
  
  // Memoize the loadResults function to prevent unnecessary re-renders
  const memoizedLoadResults = useCallback(() => {
    if (isAdmin) {
      loadResults();
    }
  }, [isAdmin, loadResults]);
  
  useEffect(() => {
    // Initial load
    memoizedLoadResults();
    
    // Set up an interval to refresh the results every 30 seconds (increased from 10 seconds)
    // This reduces the frequency of re-renders and API calls
    const interval = setInterval(() => {
      memoizedLoadResults();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [isAdmin, loadResults]); // Use the original dependencies instead of the memoized function
  
  // Memoize the total votes calculation and update state in a single useMemo
  // This prevents an extra render cycle caused by the separate useEffect
  useMemo(() => {
    const newTotalVotes = Object.values(results).reduce((sum, count) => sum + count, 0);
    if (newTotalVotes !== totalVotes) {
      setTotalVotes(newTotalVotes);
    }
  }, [results, totalVotes]);
  
  // Memoize the handleSyncVotes function to prevent unnecessary re-renders
  const handleSyncVotes = useCallback(async () => {
    // Prevent multiple clicks while syncing
    if (syncStatus === 'syncing') return;
    
    setSyncStatus('syncing');
    let newStatus: 'success' | 'error' = 'error';
    
    try {
      const success = await syncVotes();
      if (success) {
        newStatus = 'success';
      } else {
        toast.error('Failed to sync votes');
      }
    } catch (error) {
      console.error('Error during sync:', error);
      toast.error('An unexpected error occurred during synchronization');
    } finally {
      // Set the final status
      setSyncStatus(newStatus);
      
      // Use a single timeout to reset status
      const timer = setTimeout(() => setSyncStatus('idle'), 3000);
      
      // Clean up timeout if component unmounts
      return () => clearTimeout(timer);
    }
  }, [syncVotes, syncStatus]); // Add syncStatus as dependency to prevent multiple calls

  // Memoize the onSubmitCandidate function to prevent unnecessary re-renders
  const onSubmitCandidate = useCallback(async (data: CandidateFormValues) => {
    try {
      const success = await addCandidate({
        id: Date.now().toString(), // Generate a simple ID
        name: data.name,
        party: data.party,
        image: data.image || "/placeholder.svg"
      });
      
      if (success) {
        setShowCandidateForm(false);
        form.reset();
        // Refresh results to include the new candidate
        await loadResults();
      }
    } catch (error) {
      console.error('Error adding candidate:', error);
      toast.error('Failed to add candidate');
    }
  }, [addCandidate, loadResults, setShowCandidateForm, form]); // Only recreate when dependencies change
  
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
      
      {/* Vote Counter Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Vote Counter
          </CardTitle>
          <CardDescription>
            Total votes cast: {totalVotes}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-center py-4">{totalVotes}</div>
        </CardContent>
      </Card>
      
      {/* Vote Tallies Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Live Vote Tallies</CardTitle>
              <CardDescription>
                Current vote counts: {totalVotes} total votes
              </CardDescription>
            </div>
            <div className="space-x-2">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={useCallback(() => setShowCandidateList(prev => !prev), [])}
              >
                <Users className="h-4 w-4" />
                {showCandidateList ? "Hide Candidates" : "View Candidates"}
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={useCallback(() => setShowCandidateForm(prev => !prev), [])}
              >
                <Plus className="h-4 w-4" />
                Add Candidate
              </Button>
            </div>
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
      
      {/* Candidate List */}
      {showCandidateList && (
        <Card>
          <CardHeader>
            <CardTitle>Candidate List</CardTitle>
            <CardDescription>
              All registered candidates in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Photo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Party</TableHead>
                  <TableHead className="text-right">Votes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      No candidates registered yet
                    </TableCell>
                  </TableRow>
                ) : (
                  candidates.map((candidate) => (
                    <TableRow key={candidate.id}>
                      <TableCell className="font-mono text-xs">{candidate.id}</TableCell>
                      <TableCell>
                        <img
                          src={candidate.image}
                          alt={candidate.name}
                          className="h-8 w-8 rounded-full bg-gray-200"
                        />
                      </TableCell>
                      <TableCell>{candidate.name}</TableCell>
                      <TableCell>{candidate.party}</TableCell>
                      <TableCell className="text-right font-medium">{results[candidate.id] || 0}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
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
