
import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import AdminPanel from '@/components/AdminPanel';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const AdminPage: React.FC = () => {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Add an additional security check when the component mounts
    if (!isAuthenticated) {
      toast.error('Authentication required to access admin panel');
      navigate('/login');
    } else if (!isAdmin) {
      toast.error('You do not have permission to access the admin panel');
      navigate('/home');
    }
  }, [isAuthenticated, isAdmin, navigate]);
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect to home if authenticated but not an admin
  if (!isAdmin) {
    return <Navigate to="/home" replace />;
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
