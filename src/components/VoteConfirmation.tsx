
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ClipboardCheck, ArrowRight } from 'lucide-react';

const VoteConfirmation: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Generate a mock transaction ID for demo
  const transactionId = React.useMemo(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }, []);
  
  useEffect(() => {
    // Redirect if the user hasn't voted
    if (user && !user.hasVoted) {
      navigate('/vote');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const handleCopyReceipt = () => {
    const receiptText = `ElectraShield Vote Receipt\nTransaction ID: ${transactionId}\nTimestamp: ${new Date().toLocaleString()}`;
    navigator.clipboard.writeText(receiptText);
    alert('Receipt copied to clipboard!');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="text-center bg-vote-success text-white rounded-t-lg">
        <CheckCircle2 className="h-16 w-16 mx-auto mb-4" />
        <CardTitle className="text-3xl">Vote Successfully Cast!</CardTitle>
      </CardHeader>
      
      <CardContent className="pt-8">
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Vote Receipt</h3>
            <Button
              variant="ghost" 
              size="sm"
              onClick={handleCopyReceipt}
              className="flex items-center text-vote-secondary"
            >
              <ClipboardCheck className="h-4 w-4 mr-1" />
              Copy
            </Button>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Transaction ID:</span>
              <span className="font-mono">{transactionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Timestamp:</span>
              <span>{new Date().toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status:</span>
              <span className="text-vote-success font-medium">Confirmed</span>
            </div>
          </div>
        </div>
        
        <div className="text-center space-y-2 mb-4">
          <p className="text-lg font-medium">
            Thank you for participating in the democratic process!
          </p>
          <p className="text-gray-500">
            Your vote has been securely recorded and encrypted.
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-center gap-4">
        <Button
          onClick={() => navigate('/')}
          className="bg-vote-primary hover:bg-vote-secondary flex items-center"
        >
          Return Home
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VoteConfirmation;
