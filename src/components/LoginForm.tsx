
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Smartphone, Fingerprint, Camera } from 'lucide-react';
import OTPLoginForm from './login/OTPLoginForm';
import BiometricLoginForm from './login/BiometricLoginForm';
import LoginFooter from './login/LoginFooter';

const LoginForm: React.FC = () => {
  const { isBiometricsAvailable, biometricType } = useAuth();
  const navigate = useNavigate();
  
  const [authMethod, setAuthMethod] = React.useState('otp');

  // Effect to check if biometrics are available and set default tab
  useEffect(() => {
    if (isBiometricsAvailable) {
      setAuthMethod('biometric');
    }
  }, [isBiometricsAvailable]);

  const handleLoginSuccess = () => {
    navigate('/vote');
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Secure Login</CardTitle>
        <CardDescription className="text-center">
          Access your ElectraShield account
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue={isBiometricsAvailable ? "biometric" : "otp"} onValueChange={setAuthMethod}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="otp" className="flex items-center justify-center">
            <Smartphone className="h-4 w-4 mr-2" />
            <span>OTP</span>
          </TabsTrigger>
          <TabsTrigger value="biometric" className="flex items-center justify-center" disabled={!isBiometricsAvailable}>
            {biometricType === 'fingerprint' ? (
              <Fingerprint className="h-4 w-4 mr-2" />
            ) : (
              <Camera className="h-4 w-4 mr-2" />
            )}
            <span>{biometricType === 'fingerprint' ? 'Fingerprint' : 'Facial ID'}</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="otp">
          <CardContent className="pt-6">
            <OTPLoginForm onLoginSuccess={handleLoginSuccess} />
          </CardContent>
        </TabsContent>
        
        <TabsContent value="biometric">
          <CardContent className="pt-6 text-center">
            <BiometricLoginForm onLoginSuccess={handleLoginSuccess} />
          </CardContent>
        </TabsContent>
      </Tabs>
      
      <LoginFooter />
    </Card>
  );
};

export default LoginForm;
