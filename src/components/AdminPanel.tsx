
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useVote } from '@/contexts/VoteContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { BarChart, FileText, Users, Shield } from 'lucide-react';

// Custom line chart component for vote trends
const VoteChart: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm h-[300px] flex items-center justify-center">
      <p className="text-muted-foreground text-center">
        Vote trend chart would be displayed here in a real application<br />
        (using recharts or similar library)
      </p>
    </div>
  );
};

const AuditLog: React.FC = () => {
  // Mock audit log entries
  const auditLogs = [
    { id: 1, event: 'Vote Cast', user: 'Anonymous Voter', timestamp: '2023-07-25 09:12:34', details: 'Vote encrypted and recorded' },
    { id: 2, event: 'User Login', user: 'Admin User', timestamp: '2023-07-25 08:45:12', details: 'Admin login successful' },
    { id: 3, event: 'Results Viewed', user: 'Admin User', timestamp: '2023-07-25 08:46:03', details: 'Election results accessed' },
    { id: 4, event: 'Vote Cast', user: 'Anonymous Voter', timestamp: '2023-07-25 08:30:22', details: 'Vote encrypted and recorded' },
    { id: 5, event: 'Vote Cast', user: 'Anonymous Voter', timestamp: '2023-07-25 08:15:45', details: 'Vote encrypted and recorded' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="font-medium">System Audit Log</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Event</th>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Timestamp</th>
              <th className="px-4 py-3 text-left">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {auditLogs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{log.event}</td>
                <td className="px-4 py-3">{log.user}</td>
                <td className="px-4 py-3">{log.timestamp}</td>
                <td className="px-4 py-3">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminPanel: React.FC = () => {
  const { isAdmin } = useAuth();
  const { candidates, results, loadResults, isLoadingResults } = useVote();
  const [totalVotes, setTotalVotes] = useState(0);
  
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
  
  // Redirect non-admin users
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-vote-primary">Admin Dashboard</h1>
        <div className="bg-vote-accent/10 text-vote-accent px-3 py-1 rounded-full text-sm font-medium flex items-center">
          <Shield className="h-4 w-4 mr-1" />
          Secure Admin Mode
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
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Updated in real-time
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Voter Participation
            </CardTitle>
            <CardDescription className="text-3xl font-bold">
              73%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={73} className="h-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              System Security Status
            </CardTitle>
            <CardDescription className="text-3xl font-bold text-vote-success">
              Secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Last security check: 2 minutes ago
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="results">
        <TabsList className="mb-4">
          <TabsTrigger value="results" className="flex items-center">
            <BarChart className="h-4 w-4 mr-2" />
            Election Results
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Audit Log
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Voter Management
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Vote Tallies</CardTitle>
              <CardDescription>
                Decrypted vote counts from the secure ballot system
              </CardDescription>
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
          
          <Card>
            <CardHeader>
              <CardTitle>Vote Distribution Over Time</CardTitle>
              <CardDescription>
                Tracking voting patterns throughout the election period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VoteChart />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="audit">
          <AuditLog />
        </TabsContent>
        
        <TabsContent value="users" className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium mb-2">Voter Management</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            This section would contain voter registration verification and management tools
            in a complete implementation.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
