import { Link } from "react-router-dom";
import AdminLayout from "@/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ClipboardList, TrendingUp, Users, ArrowRight } from "lucide-react";
import { mockItems, mockBorrowings } from "@/lib/mockData";

const Dashboard = () => {
  const totalItems = mockItems.length;
  const totalStock = mockItems.reduce((sum, item) => sum + item.jumlah_stok, 0);
  const totalBorrowed = mockItems.reduce((sum, item) => sum + item.jumlah_dipinjam, 0);
  const totalAvailable = totalStock - totalBorrowed;
  const activeBorrowings = mockBorrowings.filter(b => b.status === 'Dipinjam').length;
  const completedBorrowings = mockBorrowings.filter(b => b.status === 'Dikembalikan').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Dashboard Admin</h2>
          <p className="text-muted-foreground">
            Selamat datang di sistem manajemen peminjaman barang Unit TKJ
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Barang
              </CardTitle>
              <Package className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalItems}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Jenis barang terdaftar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Stok
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalStock}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalAvailable} tersedia, {totalBorrowed} dipinjam
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sedang Dipinjam
              </CardTitle>
              <ClipboardList className="h-5 w-5 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeBorrowings}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Transaksi aktif
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sudah Dikembalikan
              </CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{completedBorrowings}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Transaksi selesai
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6">
              <Package className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="text-2xl mb-2">Kelola Barang</CardTitle>
              <p className="text-muted-foreground mb-4">
                Tambah, edit, atau hapus data barang. Generate QR code otomatis untuk setiap barang.
              </p>
              <Button asChild size="lg" className="shadow-md">
                <Link to="/tkj-mgmt-2025/items">
                  Ke Halaman Barang
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-success/10 to-success/5 p-6">
              <ClipboardList className="h-12 w-12 text-success mb-4" />
              <CardTitle className="text-2xl mb-2">Kelola Peminjaman</CardTitle>
              <p className="text-muted-foreground mb-4">
                Lihat histori peminjaman, edit status, dan export data untuk laporan.
              </p>
              <Button asChild size="lg" className="shadow-md">
                <Link to="/tkj-mgmt-2025/borrowings">
                  Ke Halaman Peminjaman
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </Card>
        </div>

        {/* Recent Borrowings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Peminjaman Terbaru</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/tkj-mgmt-2025/borrowings">
                  Lihat Semua
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockBorrowings.slice(0, 5).map((borrowing) => (
                <div
                  key={borrowing.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {borrowing.foto_credential && (
                      <img
                        src={borrowing.foto_credential}
                        alt={borrowing.nama_peminjam}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium">{borrowing.nama_peminjam}</p>
                      <p className="text-sm text-muted-foreground">
                        {borrowing.nama_barang} ({borrowing.jumlah}x)
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-medium">{borrowing.kode_peminjaman}</p>
                    <p className={`text-xs ${
                      borrowing.status === 'Dipinjam' ? 'text-warning' : 'text-success'
                    }`}>
                      {borrowing.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
