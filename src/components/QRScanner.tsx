import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QrCode, X, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose?: () => void;
  onUnavailable?: () => void;
}

const QRScanner = ({
  onScanSuccess,
  onClose,
  onUnavailable,
}: QRScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const hasStoppedRef = useRef<boolean>(false);
  const [cameraPermission, setCameraPermission] = useState<
    "granted" | "denied" | "prompt"
  >("prompt");

  useEffect(() => {
    return () => {
      // Cleanup: only stop if scanner was actually running
      if (scannerRef.current && !hasStoppedRef.current && isScanning) {
        hasStoppedRef.current = true;
        scannerRef.current
          .stop()
          .catch(() => {})
          .finally(() => {
            scannerRef.current = null;
          });
      }
    };
  }, [isScanning]);

  const stopScanner = async (shouldClose?: boolean) => {
    if (hasStoppedRef.current) {
      if (shouldClose) onClose?.();
      return;
    }
    hasStoppedRef.current = true;
    try {
      if (scannerRef.current && isScanning) {
        await scannerRef.current.stop();
      }
    } catch (err) {
      // Swallow errors from double-stops or invalid state
      // This is expected when scanner was never started successfully
      console.log("Scanner stop error (safe to ignore):", err);
    } finally {
      setIsScanning(false);
      scannerRef.current = null;
      if (shouldClose) onClose?.();
    }
  };

  const startScanning = async () => {
    try {
      setError("");
      hasStoppedRef.current = false;
      if (isScanning) return; // avoid starting twice
      const html5QrCode = new Html5Qrcode("qr-reader");

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          await stopScanner(false);
          onScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Ignore scanning errors (too frequent)
        }
      );

      // Only set refs and state after successful start
      scannerRef.current = html5QrCode;
      setIsScanning(true);
      setCameraPermission("granted");
    } catch (err: any) {
      console.error("Error starting scanner:", err);

      // Clear scanner ref since start failed
      scannerRef.current = null;
      hasStoppedRef.current = true; // Prevent stop errors
      setCameraPermission("denied");

      // Check if it's a permission denied error
      if (
        err.name === "NotAllowedError" ||
        err.message?.includes("Permission denied")
      ) {
        setError(
          "Akses kamera ditolak. Silakan gunakan input manual di bawah."
        );
      } else {
        setError(
          "Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan atau gunakan input manual."
        );
      }

      // Call onUnavailable after a brief delay to allow component to settle
      setTimeout(() => {
        onUnavailable?.();
      }, 100);
    }
  };

  const stopScanning = () => {
    stopScanner(true);
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Scan QR Code</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={stopScanning}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="relative bg-muted rounded-lg overflow-hidden">
          <div id="qr-reader" className="w-full min-h-[300px]"></div>
          {!isScanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="text-center space-y-4">
                <QrCode className="h-16 w-16 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">
                  {cameraPermission === "denied"
                    ? "Akses kamera ditolak"
                    : "Klik tombol di bawah untuk memulai scan"}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {!isScanning ? (
            <Button onClick={startScanning} className="w-full">
              Mulai Scan
            </Button>
          ) : (
            <Button onClick={stopScanning} variant="outline" className="w-full">
              Batal
            </Button>
          )}

          {cameraPermission === "denied" && onUnavailable && (
            <Button
              onClick={() => onUnavailable()}
              variant="outline"
              className="w-full"
            >
              Gunakan Input Manual
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          {cameraPermission === "denied"
            ? "Atau klik tombol di atas untuk input kode manual"
            : "Arahkan kamera ke QR Code yang ada pada barang"}
        </p>
      </div>
    </Card>
  );
};

export default QRScanner;
