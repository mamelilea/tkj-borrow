import { useState, useEffect } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Eye, Trash2, Calendar } from "lucide-react";
import { Borrowing } from "@/types";
import { toast } from "react-hot-toast";
import { peminjamanAPI } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Borrowings = () => {
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBorrowing, setSelectedBorrowing] = useState<Borrowing | null>(
    null
  );
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBorrowings = async () => {
      try {
        setLoading(true);
        const data = await peminjamanAPI.getAll();
        setBorrowings(data);
      } catch (error) {
        console.error("Error fetching borrowings:", error);
        toast.error("Gagal memuat data peminjaman");
      } finally {
        setLoading(false);
      }
    };

    fetchBorrowings();
  }, []);

  const filteredBorrowings = borrowings.filter((borrowing) => {
    const matchesSearch =
      borrowing.kode_peminjaman
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      borrowing.nama_peminjam
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      borrowing.nama_barang?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || borrowing.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleViewDetail = (borrowing: Borrowing) => {
    setSelectedBorrowing(borrowing);
    setDetailDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await peminjamanAPI.delete(itemToDelete);
      setBorrowings(borrowings.filter((b) => b.id !== itemToDelete));
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      toast.success("Data peminjaman berhasil dihapus!");
    } catch (error) {
      console.error("Error deleting borrowing:", error);
      toast.error("Gagal menghapus data peminjaman");
    }
  };

  const exportToCSV = () => {
    const headers = [
      "No",
      "Kode Peminjaman",
      "Tanggal Pinjam",
      "Tanggal Kembali",
      "Nama Peminjam",
      "Kontak",
      "Barang",
      "Jumlah",
      "Keperluan",
      "Guru Pendamping",
      "Status",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredBorrowings.map((borrowing, index) =>
        [
          index + 1,
          borrowing.kode_peminjaman,
          new Date(borrowing.tanggal_pinjam).toLocaleDateString("id-ID"),
          borrowing.tanggal_kembali
            ? new Date(borrowing.tanggal_kembali).toLocaleDateString("id-ID")
            : "-",
          `"${borrowing.nama_peminjam}"`,
          borrowing.kontak || "-",
          `"${borrowing.nama_barang}"`,
          borrowing.jumlah,
          `"${borrowing.keperluan}"`,
          `"${borrowing.guru_pendamping}"`,
          borrowing.status,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Data_Peminjaman_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    const jsonContent = JSON.stringify(filteredBorrowings, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Data_Peminjaman_${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    // For Excel export, we'll use CSV with tab-separated values that Excel can open
    const headers = [
      "No",
      "Kode Peminjaman",
      "Tanggal Pinjam",
      "Tanggal Kembali",
      "Nama Peminjam",
      "Kontak",
      "Barang",
      "Jumlah",
      "Keperluan",
      "Guru Pendamping",
      "Status",
    ];

    const excelContent = [
      headers.join("\t"),
      ...filteredBorrowings.map((borrowing, index) =>
        [
          index + 1,
          borrowing.kode_peminjaman,
          new Date(borrowing.tanggal_pinjam).toLocaleDateString("id-ID"),
          borrowing.tanggal_kembali
            ? new Date(borrowing.tanggal_kembali).toLocaleDateString("id-ID")
            : "-",
          borrowing.nama_peminjam,
          borrowing.kontak || "-",
          borrowing.nama_barang,
          borrowing.jumlah,
          borrowing.keperluan,
          borrowing.guru_pendamping,
          borrowing.status,
        ].join("\t")
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + excelContent], {
      type: "text/plain;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Data_Peminjaman_${
      new Date().toISOString().split("T")[0]
    }.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = (format: "csv" | "json" | "excel") => {
    try {
      setExportDialogOpen(false);

      switch (format) {
        case "csv":
          exportToCSV();
          toast.success("Data berhasil diexport ke CSV!");
          break;
        case "json":
          exportToJSON();
          toast.success("Data berhasil diexport ke JSON!");
          break;
        case "excel":
          exportToExcel();
          toast.success("Data berhasil diexport ke Excel!");
          break;
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Gagal mengeksport data");
    }
  };

  const stats = {
    total: borrowings.length,
    active: borrowings.filter((b) => b.status === "Dipinjam").length,
    completed: borrowings.filter((b) => b.status === "Dikembalikan").length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Kelola Peminjaman</h2>
            <p className="text-muted-foreground">
              Lihat dan kelola semua transaksi peminjaman barang
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => setExportDialogOpen(true)}
            className="shadow-md"
          >
            <Download className="h-5 w-5 mr-2" />
            Export Data
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Transaksi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sedang Dipinjam
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">
                {stats.active}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sudah Dikembalikan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">
                {stats.completed}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari kode, nama peminjam, atau barang..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="Dipinjam">Dipinjam</SelectItem>
                  <SelectItem value="Dikembalikan">Dikembalikan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Daftar Peminjaman ({filteredBorrowings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Kode</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Peminjam</TableHead>
                    <TableHead>Barang</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBorrowings.map((borrowing, index) => (
                    <TableRow key={borrowing.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                          {borrowing.kode_peminjaman}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {new Date(
                              borrowing.tanggal_pinjam
                            ).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                          {borrowing.tanggal_kembali && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Kembali:{" "}
                              {new Date(
                                borrowing.tanggal_kembali
                              ).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "short",
                              })}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {borrowing.foto_credential && (
                            <img
                              src={borrowing.foto_credential}
                              alt={borrowing.nama_peminjam}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium">
                              {borrowing.nama_peminjam}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {borrowing.kontak}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {borrowing.nama_barang}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {borrowing.keperluan}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {borrowing.jumlah}x
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            borrowing.status === "Dipinjam"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            borrowing.status === "Dipinjam"
                              ? "bg-warning"
                              : "bg-success"
                          }
                        >
                          {borrowing.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetail(borrowing)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <AlertDialog
                            open={
                              deleteDialogOpen && itemToDelete === borrowing.id
                            }
                            onOpenChange={(open) => {
                              setDeleteDialogOpen(open);
                              if (!open) setItemToDelete(null);
                            }}
                          >
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setItemToDelete(borrowing.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Konfirmasi Hapus Peminjaman
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menghapus data
                                  peminjaman{" "}
                                  <strong>{borrowing.kode_peminjaman}</strong>?
                                  Tindakan ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleDelete}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Detail Peminjaman</DialogTitle>
            </DialogHeader>
            {selectedBorrowing && (
              <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                <div className="bg-accent/50 p-4 rounded-lg">
                  <div className="text-center mb-2">
                    <code className="text-lg font-mono font-bold">
                      {selectedBorrowing.kode_peminjaman}
                    </code>
                  </div>
                  <div className="flex justify-center">
                    <Badge
                      variant={
                        selectedBorrowing.status === "Dipinjam"
                          ? "default"
                          : "secondary"
                      }
                      className={
                        selectedBorrowing.status === "Dipinjam"
                          ? "bg-warning"
                          : "bg-success"
                      }
                    >
                      {selectedBorrowing.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-3">Informasi Peminjam</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nama:</span>
                        <span className="font-medium">
                          {selectedBorrowing.nama_peminjam}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Kontak:</span>
                        <span className="font-medium">
                          {selectedBorrowing.kontak}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Guru:</span>
                        <span className="font-medium">
                          {selectedBorrowing.guru_pendamping}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Informasi Barang</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Barang:</span>
                        <span className="font-medium">
                          {selectedBorrowing.nama_barang}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Jumlah:</span>
                        <span className="font-medium">
                          {selectedBorrowing.jumlah}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Keperluan:
                        </span>
                        <span className="font-medium">
                          {selectedBorrowing.keperluan}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Timeline</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Tanggal Pinjam:
                      </span>
                      <span className="font-medium">
                        {new Date(
                          selectedBorrowing.tanggal_pinjam
                        ).toLocaleString("id-ID")}
                      </span>
                    </div>
                    {selectedBorrowing.tanggal_kembali && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Tanggal Kembali:
                        </span>
                        <span className="font-medium">
                          {new Date(
                            selectedBorrowing.tanggal_kembali
                          ).toLocaleString("id-ID")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedBorrowing.foto_credential && (
                  <div>
                    <h4 className="font-semibold mb-3">Foto Credential</h4>
                    <img
                      src={selectedBorrowing.foto_credential}
                      alt="Credential"
                      className="w-full rounded-lg border border-border"
                    />
                  </div>
                )}

                <Button
                  onClick={() => setDetailDialogOpen(false)}
                  className="w-full"
                >
                  Tutup
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Export Data Peminjaman</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <p className="text-sm text-muted-foreground">
                Pilih format file untuk export data peminjaman
              </p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleExport("csv")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export ke CSV
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleExport("excel")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export ke Excel
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleExport("json")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export ke JSON
                </Button>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setExportDialogOpen(false)}
              >
                Batal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default Borrowings;
