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
      // Ensure we attempt to stop only once during unmount
      if (scannerRef.current && !hasStoppedRef.current) {
        hasStoppedRef.current = true;
        scannerRef.current
          .stop()
          .catch(() => {})
          .finally(() => {
            scannerRef.current = null;
          });
      }
    };
  }, []);

  const stopScanner = async (shouldClose?: boolean) => {
    if (hasStoppedRef.current) {
      if (shouldClose) onClose?.();
      return;
    }
    hasStoppedRef.current = true;
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
      }
    } catch (_) {
      // Swallow errors from double-stops or invalid state
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
      scannerRef.current = html5QrCode;

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

      setIsScanning(true);
      setCameraPermission("granted");
    } catch (err: any) {
      console.error("Error starting scanner:", err);
      setCameraPermission("denied");
      setError(
        "Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan."
      );
      onUnavailable?.();
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
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Arahkan kamera ke QR Code yang ada pada barang
        </p>
      </div>
    </Card>
  );
};

export default QRScanner;
