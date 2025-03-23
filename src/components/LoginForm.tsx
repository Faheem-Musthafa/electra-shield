
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import OTPLoginForm from './login/OTPLoginForm';
import EmailLoginForm from './login/EmailLoginForm';
import LoginFooter from './login/LoginFooter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('email');

  const handleLoginSuccess = () => {
    // Redirect admin users to admin panel, regular users to index page
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="email">Email & Password</TabsTrigger>
            <TabsTrigger value="otp">OTP Verification</TabsTrigger>
          </TabsList>
          
          <TabsContent value="email" className="space-y-4">
            <EmailLoginForm onLoginSuccess={handleLoginSuccess} />
          </TabsContent>
          
          <TabsContent value="otp" className="space-y-4">
            <OTPLoginForm onLoginSuccess={handleLoginSuccess} />
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <LoginFooter />
    </Card>
  );
};

export default LoginForm;
