
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import OTPLoginForm from './login/OTPLoginForm';
import LoginFooter from './login/LoginFooter';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const handleLoginSuccess = () => {
    // If user is admin, navigate to admin panel instead of home page
    if (isAdmin) {
      navigate('/admin');
    } else {
      navigate('/home');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Secure Login</CardTitle>
        <CardDescription className="text-center">
          Access your ElectraShield account
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <OTPLoginForm onLoginSuccess={handleLoginSuccess} />
      </CardContent>
      
      <LoginFooter />
    </Card>
  );
};

export default LoginForm;
