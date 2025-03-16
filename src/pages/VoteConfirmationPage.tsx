
import React from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import VoteConfirmation from '@/components/VoteConfirmation';
import { useAuth } from '@/contexts/AuthContext';

const VoteConfirmationPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect to voting page if the user hasn't voted yet
  if (user && !user.hasVoted) {
    return <Navigate to="/vote" replace />;
  }

  return (
    <Layout>
      <div className="py-8">
        <VoteConfirmation />
      </div>
    </Layout>
  );
};

export default VoteConfirmationPage;
