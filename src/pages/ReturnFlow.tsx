import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicLayout from "@/layouts/PublicLayout";
import CameraCapture from "@/components/CameraCapture";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, AlertCircle, Search } from "lucide-react";
import { Borrowing } from "@/types";
import { toast } from "react-hot-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { peminjamanAPI } from "@/lib/api";

type Step = "search" | "verify" | "complete";

const ReturnFlow = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>("search");
  const [borrowingCode, setBorrowingCode] = useState("");
  const [foundBorrowing, setFoundBorrowing] = useState<Borrowing | null>(null);
  const [verificationPhoto, setVerificationPhoto] = useState("");

  const handleSearch = async () => {
    if (!borrowingCode.trim()) {
      toast.error("Masukkan kode peminjaman");
      return;
    }

    try {
      const borrowing = await peminjamanAPI.getByKode(borrowingCode);

      if (borrowing && borrowing.status === "Dipinjam") {
        setFoundBorrowing(borrowing);
        setCurrentStep("verify");
        toast.success("Data peminjaman ditemukan!");
      } else {
        toast.error("Kode peminjaman tidak ditemukan atau sudah dikembalikan");
      }
    } catch (error) {
      console.error("Error fetching borrowing:", error);
      toast.error("Gagal memuat data peminjaman");
    }
  };

  const handlePhotoVerification = (imageData: string) => {
    setVerificationPhoto(imageData);
    // In real app, this might do face recognition verification
    toast.success("Foto verifikasi berhasil!");
    setTimeout(() => {
      setCurrentStep("complete");
    }, 500);
  };

  const handleComplete = async () => {
    if (!foundBorrowing) {
      toast.error("Data tidak lengkap");
      return;
    }

    try {
      await peminjamanAPI.return(
        foundBorrowing.kode_peminjaman,
        verificationPhoto
      );
      toast.success("Pengembalian berhasil! Terima kasih.");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Error returning item:", error);
      toast.error("Gagal menyimpan data pengembalian");
    }
  };

  return (
    <PublicLayout>
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Beranda
        </Button>

        <h2 className="text-3xl font-bold mb-2">Kembalikan Barang</h2>
        <p className="text-muted-foreground mb-8">
          Masukkan kode peminjaman untuk mengembalikan barang
        </p>

        {/* Step: Search */}
        {currentStep === "search" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Cari Data Peminjaman
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="code">Kode Peminjaman</Label>
                <Input
                  id="code"
                  placeholder="Contoh: PMJ-2025-001"
                  value={borrowingCode}
                  onChange={(e) =>
                    setBorrowingCode(e.target.value.toUpperCase())
                  }
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="text-lg font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Masukkan kode yang diberikan saat peminjaman
                </p>
              </div>

              <Button onClick={handleSearch} className="w-full" size="lg">
                <Search className="h-5 w-5 mr-2" />
                Cari
              </Button>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Pastikan Anda memasukkan kode peminjaman yang benar. Kode ini
                  diberikan saat Anda meminjam barang.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Step: Verify */}
        {currentStep === "verify" && foundBorrowing && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detail Peminjaman</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-accent/50 p-4 rounded-lg">
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Kode:</span>
                      <span className="font-mono font-semibold">
                        {foundBorrowing.kode_peminjaman}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Barang:</span>
                      <span className="font-medium">
                        {foundBorrowing.nama_barang}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Jumlah:</span>
                      <span className="font-medium">
                        {foundBorrowing.jumlah}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Peminjam:</span>
                      <span className="font-medium">
                        {foundBorrowing.nama_peminjam}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Tanggal Pinjam:
                      </span>
                      <span className="font-medium">
                        {new Date(
                          foundBorrowing.tanggal_pinjam
                        ).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>

                {foundBorrowing.foto_credential && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Foto saat peminjaman:
                    </p>
                    <img
                      src={foundBorrowing.foto_credential}
                      alt="Foto peminjaman"
                      className="w-full rounded-lg border border-border"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Ambil foto untuk verifikasi pengembalian. Pastikan wajah dan
                barang terlihat jelas.
              </AlertDescription>
            </Alert>

            <CameraCapture
              onCapture={handlePhotoVerification}
              label="Foto Verifikasi Pengembalian"
            />

            <Button
              variant="outline"
              onClick={() => setCurrentStep("search")}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </div>
        )}

        {/* Step: Complete */}
        {currentStep === "complete" && foundBorrowing && (
          <Card>
            <CardHeader>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-success/10 text-success rounded-full mb-4">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl mb-2">
                  Pengembalian Berhasil!
                </CardTitle>
                <p className="text-muted-foreground">
                  Barang telah dikembalikan. Terima kasih!
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-success/5 border border-success rounded-lg p-4">
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Kode Peminjaman:
                    </span>
                    <span className="font-mono font-semibold">
                      {foundBorrowing.kode_peminjaman}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Barang:</span>
                    <span className="font-medium">
                      {foundBorrowing.nama_barang}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Jumlah:</span>
                    <span className="font-medium">{foundBorrowing.jumlah}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Tanggal Kembali:
                    </span>
                    <span className="font-medium">
                      {new Date().toLocaleDateString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>

              {verificationPhoto && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Foto verifikasi:
                  </p>
                  <img
                    src={verificationPhoto}
                    alt="Verifikasi"
                    className="w-full rounded-lg border border-border"
                  />
                </div>
              )}

              <Alert className="bg-success/10 border-success">
                <CheckCircle className="h-4 w-4 text-success" />
                <AlertDescription className="text-success-foreground text-black">
                  Status barang telah diperbarui. Barang kembali tersedia untuk
                  dipinjam.
                </AlertDescription>
              </Alert>

              <Button onClick={handleComplete} className="w-full" size="lg">
                Kembali ke Beranda
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </PublicLayout>
  );
};

export default ReturnFlow;
