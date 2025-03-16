
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldCheck, ShieldAlert, Lock, CheckCircle, Vote } from 'lucide-react';

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="space-y-16">
      <section className="text-center space-y-6 py-8">
        <div className="inline-flex justify-center items-center px-4 py-1 bg-vote-accent/10 text-vote-accent rounded-full text-sm font-medium mb-4">
          <Lock className="h-4 w-4 mr-2" />
          End-to-End Encrypted Voting
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-vote-primary max-w-3xl mx-auto leading-tight">
          Secure, Transparent, and <span className="text-vote-accent">Accessible</span> Electronic Voting
        </h1>
        
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          ElectraShield provides a cutting-edge platform for secure democratic participation with advanced encryption and authentication.
        </p>
        
        <div className="flex flex-wrap gap-4 justify-center pt-4">
          {isAuthenticated ? (
            <>
              {user?.hasVoted ? (
                <Link to="/vote-confirmation">
                  <Button 
                    size="lg" 
                    className="bg-vote-success hover:bg-vote-success/90 text-white font-medium"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    View Your Vote Receipt
                  </Button>
                </Link>
              ) : (
                <Link to="/vote">
                  <Button 
                    size="lg" 
                    className="bg-vote-accent hover:bg-vote-primary text-white font-medium"
                  >
                    <Vote className="h-5 w-5 mr-2" />
                    Cast Your Vote Now
                  </Button>
                </Link>
              )}
            </>
          ) : (
            <>
              <Link to="/register">
                <Button 
                  size="lg" 
                  className="bg-vote-accent hover:bg-vote-primary text-white font-medium"
                >
                  Register to Vote
                </Button>
              </Link>
              <Link to="/login">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-vote-secondary text-vote-secondary hover:bg-vote-secondary hover:text-white"
                >
                  Login
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>
      
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="rounded-full bg-vote-secondary/10 w-12 h-12 flex items-center justify-center mb-4">
            <ShieldCheck className="h-6 w-6 text-vote-secondary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Secure Encryption</h3>
          <p className="text-gray-600">
            Military-grade RSA encryption ensures your vote remains confidential while maintaining verifiability.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="rounded-full bg-vote-primary/10 w-12 h-12 flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-vote-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Multi-Factor Authentication</h3>
          <p className="text-gray-600">
            Advanced phone verification and biometric options protect your voting identity.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="rounded-full bg-vote-accent/10 w-12 h-12 flex items-center justify-center mb-4">
            <ShieldAlert className="h-6 w-6 text-vote-accent" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Anti-Fraud Protection</h3>
          <p className="text-gray-600">
            Sophisticated mechanisms prevent duplicate voting while maintaining complete anonymity.
          </p>
        </div>
      </section>
      
      <section className="bg-vote-primary text-white p-8 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">How ElectraShield Works</h2>
            <p className="text-lg opacity-90">
              Our platform combines advanced cryptography with a user-friendly interface to make voting secure and accessible for everyone.
            </p>
            
            <ul className="space-y-4">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 mr-3 text-vote-accent shrink-0 mt-0.5" />
                <span>Register with your government-issued Address ID</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 mr-3 text-vote-accent shrink-0 mt-0.5" />
                <span>Verify your identity through secure phone verification</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 mr-3 text-vote-accent shrink-0 mt-0.5" />
                <span>Cast your encrypted vote in seconds</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 mr-3 text-vote-accent shrink-0 mt-0.5" />
                <span>Receive a verification receipt for your records</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-white/5 rounded-lg p-6 h-full flex items-center justify-center">
            <p className="text-center opacity-80">
              [Diagram of the secure voting process would be displayed here]
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
