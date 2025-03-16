
import React from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import VotingBooth from '@/components/VotingBooth';
import { useAuth } from '@/contexts/AuthContext';

const VotePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <div className="py-8">
        <VotingBooth />
      </div>
    </Layout>
  );
};

export default VotePage;
