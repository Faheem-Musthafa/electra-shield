
import React from 'react';
import Navbar from './Navbar';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen bg-vote-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-vote-primary text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>© 2024 ElectraShield - Secure Electronic Voting System</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
