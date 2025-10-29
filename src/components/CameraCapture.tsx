import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, RotateCcw, Check, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SignaturePad from "@/components/SignaturePad";

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  label?: string;
}

const CameraCapture = ({
  onCapture,
  label = "Ambil Foto",
}: CameraCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string>("");
  const [useSignature, setUseSignature] = useState<boolean>(false);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      setError("");
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API tidak tersedia pada perangkat ini");
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsStreaming(true);
      }
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      setError(
        err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError"
          ? "Akses kamera ditolak. Silakan gunakan tanda tangan digital."
          : "Kamera tidak tersedia. Silakan gunakan tanda tangan digital."
      );
      setUseSignature(true);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        const imageData = canvas.toDataURL("image/jpeg", 0.8);
        setCapturedImage(imageData);

        // Stop camera after capture
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          setIsStreaming(false);
        }
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Camera className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">{label}</h3>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!useSignature ? (
          <div className="relative bg-muted rounded-lg overflow-hidden aspect-video">
            {!isStreaming && !capturedImage && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Camera className="h-16 w-16 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    Klik tombol di bawah untuk membuka kamera
                  </p>
                </div>
              </div>
            )}

            {capturedImage ? (
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>
        ) : (
          <SignaturePad
            label="Tanda Tangan Digital"
            onConfirm={(img) => {
              setCapturedImage(img);
              setError("");
            }}
          />
        )}

        <div className="space-y-2">
          {!useSignature && !isStreaming && !capturedImage && (
            <Button onClick={startCamera} className="w-full">
              <Camera className="h-4 w-4 mr-2" />
              Buka Kamera
            </Button>
          )}

          {!capturedImage && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                // Switch to signature mode; stop camera if active
                if (stream) {
                  stream.getTracks().forEach((track) => track.stop());
                }
                setIsStreaming(false);
                setUseSignature(true);
                setError("");
              }}
            >
              Gunakan Tanda Tangan Digital
            </Button>
          )}

          {isStreaming && !capturedImage && (
            <Button onClick={capturePhoto} className="w-full">
              <Camera className="h-4 w-4 mr-2" />
              Ambil Foto
            </Button>
          )}

          {capturedImage && (
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={retakePhoto} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Ulangi
              </Button>
              <Button
                onClick={confirmPhoto}
                className="bg-success hover:bg-success-light"
              >
                <Check className="h-4 w-4 mr-2" />
                Gunakan
              </Button>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          {useSignature
            ? "Tanda tangan ini akan disimpan sebagai bukti peminjaman."
            : "Pastikan wajah peminjam dan barang terlihat jelas"}
        </p>
      </div>
    </Card>
  );
};

export default CameraCapture;
