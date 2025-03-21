
import React, { useRef, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface FaceCaptureProps {
  onCapture: (imageSrc: string) => void;
  capturedImage?: string;
}

const FaceCapture: React.FC<FaceCaptureProps> = ({ onCapture, capturedImage }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCaptured, setIsCaptured] = useState(!!capturedImage);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const constraints = {
        video: { 
          facingMode: "user",
          width: { ideal: isMobile ? 640 : 1280 },
          height: { ideal: isMobile ? 480 : 720 }
        },
        audio: false,
      };
      
      console.log("Attempting to access camera with constraints:", constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(e => {
              console.error("Error playing video:", e);
              setCameraError("Failed to start video stream");
            });
          }
        };
        setIsStreaming(true);
        setIsCaptured(false);
        console.log("Camera started successfully");
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      let errorMsg = "Could not access camera";
      if (error instanceof DOMException) {
        if (error.name === "NotAllowedError") {
          errorMsg = "Camera access denied. Please allow camera access in your browser settings.";
        } else if (error.name === "NotFoundError") {
          errorMsg = "No camera found on this device.";
        } else if (error.name === "NotReadableError") {
          errorMsg = "Camera is already in use by another application.";
        }
      }
      setCameraError(errorMsg);
    }
  }, [isMobile]);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
      console.log("Camera stopped");
    }
  }, []);

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        // Set canvas size to match video dimensions
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        
        // Draw video frame to canvas
        context.drawImage(
          videoRef.current,
          0, 0,
          videoRef.current.videoWidth,
          videoRef.current.videoHeight
        );
        
        // Convert canvas to data URL
        const imageSrc = canvasRef.current.toDataURL("image/png");
        onCapture(imageSrc);
        setIsCaptured(true);
        
        // Stop camera after capture
        stopCamera();
      }
    }
  }, [onCapture, stopCamera]);

  const resetCapture = useCallback(() => {
    onCapture("");
    setIsCaptured(false);
    startCamera();
  }, [onCapture, startCamera]);

  // Initialize camera when component mounts
  useEffect(() => {
    if (!capturedImage) {
      console.log("FaceCapture component mounted, starting camera");
      startCamera();
    } else {
      console.log("FaceCapture mounted with existing image, not starting camera");
      setIsCaptured(true);
    }
    
    // Clean up camera when component unmounts
    return () => {
      console.log("FaceCapture component unmounting, stopping camera");
      stopCamera();
    };
  }, [capturedImage, startCamera, stopCamera]);

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Hidden canvas used for capturing */}
      <canvas ref={canvasRef} className="hidden" />
      
      <div className={`
        relative overflow-hidden rounded-lg border border-input bg-background 
        ${isMobile ? "w-64 h-64" : "w-80 h-80"}
      `}>
        {isStreaming && !isCaptured ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-4 flex justify-center">
              <Button 
                onClick={captureImage}
                className="bg-vote-accent hover:bg-vote-primary rounded-full h-12 w-12 p-0"
              >
                <Camera className="h-6 w-6" />
              </Button>
            </div>
          </>
        ) : isCaptured && capturedImage ? (
          <>
            <img 
              src={capturedImage} 
              alt="Captured face" 
              className="absolute inset-0 h-full w-full object-cover" 
            />
            <div className="absolute inset-x-0 bottom-4 flex justify-center">
              <Button 
                onClick={resetCapture}
                variant="outline"
                className="bg-background/80 backdrop-blur-sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retake
              </Button>
            </div>
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-muted p-4">
            {cameraError ? (
              <>
                <p className="text-center text-red-500 mb-4">{cameraError}</p>
                <Button onClick={startCamera}>
                  <Camera className="h-4 w-4 mr-2" />
                  Retry Camera
                </Button>
              </>
            ) : (
              <Button onClick={startCamera}>
                <Camera className="h-4 w-4 mr-2" />
                Start Camera
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export { FaceCapture };
