
import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { Fingerprint, Camera } from 'lucide-react';

interface BiometricLoginFormProps {
  onLoginSuccess: () => void;
}

const BiometricLoginForm: React.FC<BiometricLoginFormProps> = ({ onLoginSuccess }) => {
  const { loginWithBiometrics, isLoading, biometricType } = useAuth();
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Handle camera activation for facial recognition
  const activateCamera = async () => {
    if (isCameraActive && cameraStream) {
      // Stop the camera if it's already active
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
      setIsCameraActive(false);
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "user",
          width: { ideal: 320 },
          height: { ideal: 240 }
        } 
      });
      
      setCameraStream(stream);
      setIsCameraActive(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Could not access camera. Please check permissions and try again.');
    }
  };

  const handleLogin = async () => {
    const success = await loginWithBiometrics();
    if (success) {
      // Clean up camera if it was active
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
      onLoginSuccess();
    }
  };

  return (
    <>
      <div className="flex flex-col items-center py-6">
        {biometricType === 'fingerprint' ? (
          <Fingerprint className="h-24 w-24 text-vote-secondary animate-pulse-slow" />
        ) : (
          <div className="relative w-full max-w-[240px] mx-auto">
            {isCameraActive ? (
              <video 
                ref={videoRef}
                className="w-full h-auto rounded-lg border-2 border-vote-secondary"
                autoPlay
                playsInline
              />
            ) : (
              <Camera className="h-24 w-24 text-vote-secondary animate-pulse-slow mx-auto" />
            )}
          </div>
        )}
        
        <p className="mt-4 text-muted-foreground">
          {biometricType === 'fingerprint' 
            ? 'Use fingerprint authentication to login securely'
            : 'Use facial recognition to login securely'}
        </p>
        
        {biometricType === 'facial' && (
          <Button
            onClick={activateCamera}
            variant="outline"
            className="mt-4"
            type="button"
          >
            {isCameraActive ? 'Deactivate Camera' : 'Activate Camera'}
          </Button>
        )}
      </div>
      
      <CardFooter className="flex justify-center pt-6 pb-0 px-0">
        <Button 
          onClick={handleLogin} 
          className="w-full bg-vote-secondary hover:bg-vote-primary"
          disabled={isLoading || (biometricType === 'facial' && !isCameraActive)}
        >
          {isLoading ? 'Authenticating...' : `Authenticate with ${biometricType === 'fingerprint' ? 'Fingerprint' : 'Facial Recognition'}`}
        </Button>
      </CardFooter>
    </>
  );
};

export default BiometricLoginForm;
