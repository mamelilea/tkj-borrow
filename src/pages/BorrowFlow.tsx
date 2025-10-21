import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PublicLayout from "@/layouts/PublicLayout";
import QRScanner from "@/components/QRScanner";
import CameraCapture from "@/components/CameraCapture";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, QrCode, FileText, Camera, CheckCircle, AlertCircle } from "lucide-react";
import { mockItems } from "@/lib/mockData";
import { Item, BorrowingFormData } from "@/types";
import { generateBorrowingCode } from "@/lib/qrUtils";
import { toast } from "react-hot-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Step = "scan" | "form" | "photo" | "summary";

const BorrowFlow = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>("scan");
  const [selectedItem, setSelectedItem] = useState<Item | null>(location.state?.selectedItem || null);
  const [scanMode, setScanMode] = useState<"qr" | "manual">("qr");
  const [formData, setFormData] = useState<BorrowingFormData>({
    nama_peminjam: "",
    kontak: "",
    keperluan: "",
    guru_pendamping: "",
    id_barang: 0,
    jumlah: 1,
  });
  const [photoData, setPhotoData] = useState<string>("");
  const [borrowingCode, setBorrowingCode] = useState<string>("");

  useEffect(() => {
    if (selectedItem) {
      setCurrentStep("form");
      setFormData(prev => ({ ...prev, id_barang: selectedItem.id }));
    }
  }, [selectedItem]);

  const handleQRScan = (decodedText: string) => {
    const item = mockItems.find(i => i.kode_barang === decodedText);
    if (item) {
      const available = item.jumlah_stok - item.jumlah_dipinjam;
      if (available > 0) {
        setSelectedItem(item);
        setFormData(prev => ({ ...prev, id_barang: item.id }));
        setCurrentStep("form");
        toast.success(`Barang ditemukan: ${item.nama_barang}`);
      } else {
        toast.error("Maaf, barang tidak tersedia saat ini");
      }
    } else {
      toast.error("QR Code tidak valid atau barang tidak ditemukan");
    }
  };

  const handleManualCode = () => {
    const kodeBarang = (document.getElementById("manual-code") as HTMLInputElement)?.value;
    if (kodeBarang) {
      handleQRScan(kodeBarang);
    } else {
      toast.error("Masukkan kode barang");
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nama_peminjam || !formData.kontak || !formData.keperluan || !formData.guru_pendamping) {
      toast.error("Mohon lengkapi semua field");
      return;
    }

    if (!selectedItem || formData.jumlah <= 0) {
      toast.error("Data barang tidak valid");
      return;
    }

    const available = selectedItem.jumlah_stok - selectedItem.jumlah_dipinjam;
    if (formData.jumlah > available) {
      toast.error(`Stok tidak mencukupi. Tersedia: ${available}`);
      return;
    }

    setCurrentStep("photo");
  };

  const handlePhotoCapture = (imageData: string) => {
    setPhotoData(imageData);
    const code = generateBorrowingCode();
    setBorrowingCode(code);
    setCurrentStep("summary");
    toast.success("Foto berhasil diambil!");
  };

  const handleComplete = () => {
    // In real app, this would save to database
    toast.success("Peminjaman berhasil! Barang telah dipinjam.");
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  const renderStepIndicator = () => {
    const steps = [
      { id: "scan", label: "Scan/Pilih Barang", icon: QrCode },
      { id: "form", label: "Isi Data", icon: FileText },
      { id: "photo", label: "Ambil Foto", icon: Camera },
      { id: "summary", label: "Selesai", icon: CheckCircle },
    ];

    const currentIndex = steps.findIndex(s => s.id === currentStep);

    return (
      <div className="flex items-center justify-center mb-8 gap-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;

          return (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isActive ? "bg-primary text-primary-foreground shadow-md" :
                isCompleted ? "bg-success text-success-foreground" :
                "bg-muted text-muted-foreground"
              }`}>
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className={`h-4 w-4 mx-1 ${isCompleted ? "text-success" : "text-muted-foreground"}`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Beranda
        </Button>

        <h2 className="text-3xl font-bold mb-2">Pinjam Barang</h2>
        <p className="text-muted-foreground mb-8">
          Ikuti langkah-langkah berikut untuk meminjam barang
        </p>

        {renderStepIndicator()}

        {/* Step: Scan/Select Item */}
        {currentStep === "scan" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pilih Metode</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Button
                    variant={scanMode === "qr" ? "default" : "outline"}
                    onClick={() => setScanMode("qr")}
                    className="h-auto py-6"
                  >
                    <div className="text-center">
                      <QrCode className="h-8 w-8 mx-auto mb-2" />
                      <div className="font-semibold">Scan QR Code</div>
                      <div className="text-xs text-muted-foreground mt-1">Metode tercepat</div>
                    </div>
                  </Button>
                  <Button
                    variant={scanMode === "manual" ? "default" : "outline"}
                    onClick={() => setScanMode("manual")}
                    className="h-auto py-6"
                  >
                    <div className="text-center">
                      <FileText className="h-8 w-8 mx-auto mb-2" />
                      <div className="font-semibold">Input Manual</div>
                      <div className="text-xs text-muted-foreground mt-1">Jika scan tidak bisa</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {scanMode === "qr" ? (
              <QRScanner
                onScanSuccess={handleQRScan}
                onClose={() => navigate("/")}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Masukkan Kode Barang</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="manual-code">Kode Barang</Label>
                    <Input
                      id="manual-code"
                      placeholder="Contoh: BRG-001"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Lihat kode pada label barang
                    </p>
                  </div>
                  <Button onClick={handleManualCode} className="w-full">
                    Cari Barang
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Step: Form */}
        {currentStep === "form" && selectedItem && (
          <Card>
            <CardHeader>
              <CardTitle>Data Peminjaman</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Selected Item Info */}
                <div className="bg-accent/50 p-4 rounded-lg mb-4">
                  <div className="flex items-center gap-3">
                    {selectedItem.foto_barang && (
                      <img
                        src={selectedItem.foto_barang}
                        alt={selectedItem.nama_barang}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div>
                      <p className="font-semibold">{selectedItem.nama_barang}</p>
                      <p className="text-sm text-muted-foreground">Kode: {selectedItem.kode_barang}</p>
                      <p className="text-sm text-muted-foreground">
                        Tersedia: {selectedItem.jumlah_stok - selectedItem.jumlah_dipinjam}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nama">Nama Peminjam *</Label>
                    <Input
                      id="nama"
                      value={formData.nama_peminjam}
                      onChange={(e) => setFormData({ ...formData, nama_peminjam: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="kontak">Nomor Kontak (WA) *</Label>
                    <Input
                      id="kontak"
                      type="tel"
                      value={formData.kontak}
                      onChange={(e) => setFormData({ ...formData, kontak: e.target.value })}
                      placeholder="08xxxxxxxxxx"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="keperluan">Keperluan *</Label>
                  <Textarea
                    id="keperluan"
                    value={formData.keperluan}
                    onChange={(e) => setFormData({ ...formData, keperluan: e.target.value })}
                    placeholder="Contoh: Praktikum Jaringan Komputer"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="guru">Guru Pendamping *</Label>
                    <Input
                      id="guru"
                      value={formData.guru_pendamping}
                      onChange={(e) => setFormData({ ...formData, guru_pendamping: e.target.value })}
                      placeholder="Contoh: Pak Budi"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="jumlah">Jumlah Barang *</Label>
                    <Input
                      id="jumlah"
                      type="number"
                      min="1"
                      max={selectedItem.jumlah_stok - selectedItem.jumlah_dipinjam}
                      value={formData.jumlah}
                      onChange={(e) => setFormData({ ...formData, jumlah: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep("scan")}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Kembali
                  </Button>
                  <Button type="submit" className="flex-1">
                    Selanjutnya
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step: Photo */}
        {currentStep === "photo" && (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Ambil foto yang jelas menampilkan wajah peminjam dan barang yang dipinjam
              </AlertDescription>
            </Alert>
            <CameraCapture
              onCapture={handlePhotoCapture}
              label="Foto Peminjam & Barang"
            />
            <Button
              variant="outline"
              onClick={() => setCurrentStep("form")}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </div>
        )}

        {/* Step: Summary */}
        {currentStep === "summary" && selectedItem && (
          <Card>
            <CardHeader>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-success/10 text-success rounded-full mb-4">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl mb-2">Peminjaman Berhasil!</CardTitle>
                <p className="text-muted-foreground">
                  Simpan kode peminjaman di bawah untuk proses pengembalian
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Borrowing Code */}
              <div className="bg-primary/5 border-2 border-primary rounded-lg p-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">Kode Peminjaman</p>
                <p className="text-3xl font-bold text-primary mb-4">{borrowingCode}</p>
                <Alert variant="default" className="bg-warning/10 border-warning">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  <AlertDescription className="text-warning-foreground">
                    <strong>PENTING!</strong> Catat atau foto kode ini. Kode diperlukan saat pengembalian barang.
                  </AlertDescription>
                </Alert>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <h4 className="font-semibold">Detail Peminjaman:</h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Barang:</span>
                    <span className="font-medium">{selectedItem.nama_barang}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Jumlah:</span>
                    <span className="font-medium">{formData.jumlah}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Peminjam:</span>
                    <span className="font-medium">{formData.nama_peminjam}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kontak:</span>
                    <span className="font-medium">{formData.kontak}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Keperluan:</span>
                    <span className="font-medium">{formData.keperluan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Guru Pendamping:</span>
                    <span className="font-medium">{formData.guru_pendamping}</span>
                  </div>
                </div>
              </div>

              {/* Photo */}
              {photoData && (
                <div>
                  <h4 className="font-semibold mb-2">Foto Credential:</h4>
                  <img
                    src={photoData}
                    alt="Credential"
                    className="w-full rounded-lg border border-border"
                  />
                </div>
              )}

              <Button onClick={handleComplete} className="w-full" size="lg">
                <CheckCircle className="h-5 w-5 mr-2" />
                Selesai
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </PublicLayout>
  );
};

export default BorrowFlow;
