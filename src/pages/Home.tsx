import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import PublicLayout from "@/layouts/PublicLayout";
import ItemCard from "@/components/ItemCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Package, RotateCcw, Search } from "lucide-react";
import { Item } from "@/types";
import { barangAPI } from "@/lib/api";
import { toast } from "react-hot-toast";

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const data = await barangAPI.getAll();
        setItems(data);
      } catch (error) {
        console.error("Error fetching items:", error);
        toast.error("Gagal memuat data barang");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const filteredItems = items.filter(
    (item) =>
      item.nama_barang.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.kode_barang.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Arahkan ke halaman peminjaman yang memulai dari langkah scan QR.
  // Jangan mengirimkan `selectedItem` lewat state sehingga alur selalu
  // dimulai dari scanner (user harus scan QR untuk memilih/konfirmasi barang).
  const handleBorrowItem = (_item: Item) => {
    navigate("/borrow");
  };

  return (
    <PublicLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl p-8 border border-border shadow-custom">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold mb-3 ">Selamat Datang!</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Sistem peminjaman barang Unit TKJ. Pilih barang yang ingin
              dipinjam atau kembalikan barang yang sudah selesai digunakan.
            </p>

            <div className="flex flex-wrap gap-6 items-center">
              <Button
                size="lg"
                asChild
                className="shadow-md px-8 py-5 text-2xl md:text-2xl w-56 h-30 rounded-xl font-semibold md:w-auto transition-transform transform hover:scale-105"
              >
                <Link to="/borrow" className="flex items-center justify-center gap-3 w-full md:w-auto">
                  <Package className="h-7 w-7" />
                  <span>Pinjam Barang</span>
                  <ArrowRight className="h-6 w-6" />
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                asChild
                className="shadow-md px-8 py-5 text-2xl md:text-2xl rounded-xl h-30 font-semibold w-full md:w-auto transition-transform transform hover:scale-105"
              >
                <Link to="/return" className="flex items-center justify-center gap-3 w-full md:w-auto">
                  <RotateCcw className="h-7 w-7" />
                  <span>Kembalikan Barang</span>
                  <ArrowRight className="h-6 w-6" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold">Daftar Barang Tersedia</h3>
            <div className="text-sm text-muted-foreground">
              Total: {items.length} barang
            </div>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari barang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground mt-4">Memuat data...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} onBorrow={handleBorrowItem} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              Tidak ada barang yang ditemukan
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Coba kata kunci pencarian yang lain
            </p>
          </div>
        )}

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary/10 text-primary p-2 rounded-lg">
                <Package className="h-5 w-5" />
              </div>
              <h4 className="font-semibold">Scan QR</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Gunakan fitur scan QR untuk proses peminjaman yang lebih cepat
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-success/10 text-success p-2 rounded-lg">
                <RotateCcw className="h-5 w-5" />
              </div>
              <h4 className="font-semibold">Mudah Dikembalikan</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Catat kode peminjaman untuk proses pengembalian yang mudah
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-warning/10 text-warning p-2 rounded-lg">
                <Search className="h-5 w-5" />
              </div>
              <h4 className="font-semibold">Cari Barang</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Temukan barang yang Anda butuhkan dengan fitur pencarian
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Home;
