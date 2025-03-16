
import React from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import AdminPanel from '@/components/AdminPanel';
import { useAuth } from '@/contexts/AuthContext';

const AdminPage: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect to home if authenticated but not an admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout>
      <div className="py-8">
        <AdminPanel />
      </div>
    </Layout>
  );
};

export default AdminPage;
