
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Shield, ShieldCheck } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-vote-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-vote-accent" />
            <span className="text-xl font-bold">ElectraShield</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center">
                  <ShieldCheck className="h-4 w-4 mr-1 text-vote-accent" />
                  <span className="text-sm mr-2">
                    Welcome, {user?.name}
                  </span>
                </div>
                
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost" className="text-white hover:text-vote-accent">
                      Admin Panel
                    </Button>
                  </Link>
                )}
                
                <Link to="/vote">
                  <Button variant="ghost" className="text-white hover:text-vote-accent">
                    Cast Vote
                  </Button>
                </Link>
                
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  className="border-vote-accent text-vote-accent hover:bg-vote-accent hover:text-white"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-white hover:text-vote-accent">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    variant="outline" 
                    className="border-vote-accent text-vote-accent hover:bg-vote-accent hover:text-white"
                  >
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
