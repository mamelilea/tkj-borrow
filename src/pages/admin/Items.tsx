import { useState } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Download, QrCode, Search, Package } from "lucide-react";
import { mockItems } from "@/lib/mockData";
import { Item } from "@/types";
import { generateQRCode, downloadQRCode, generateItemCode } from "@/lib/qrUtils";
import { toast } from "react-hot-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Items = () => {
  const [items, setItems] = useState<Item[]>(mockItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string>("");
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [currentQrCode, setCurrentQrCode] = useState("");

  const filteredItems = items.filter(
    (item) =>
      item.nama_barang.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.kode_barang.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const lastCode = items[items.length - 1]?.kode_barang;
    const newCode = generateItemCode(lastCode);

    const newItem: Item = {
      id: items.length + 1,
      kode_barang: newCode,
      nama_barang: formData.get("nama") as string,
      jumlah_stok: parseInt(formData.get("stok") as string),
      jumlah_dipinjam: 0,
      foto_barang: formData.get("foto") as string,
      notes: formData.get("notes") as string,
      created_at: new Date().toISOString(),
    };

    setItems([...items, newItem]);
    setIsAddDialogOpen(false);

    // Generate and show QR Code
    const qrData = await generateQRCode(newCode);
    setQrCodeData(qrData);
    setCurrentQrCode(newCode);
    setQrDialogOpen(true);

    toast.success("Barang berhasil ditambahkan!");
  };

  const handleEditItem = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingItem) return;

    const formData = new FormData(e.currentTarget);
    
    const updatedItem: Item = {
      ...editingItem,
      nama_barang: formData.get("nama") as string,
      jumlah_stok: parseInt(formData.get("stok") as string),
      foto_barang: formData.get("foto") as string,
      notes: formData.get("notes") as string,
    };

    setItems(items.map(item => item.id === updatedItem.id ? updatedItem : item));
    setIsEditDialogOpen(false);
    setEditingItem(null);
    toast.success("Barang berhasil diupdate!");
  };

  const handleDeleteItem = (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus barang ini?")) {
      setItems(items.filter(item => item.id !== id));
      toast.success("Barang berhasil dihapus!");
    }
  };

  const handleShowQR = async (kodeBarang: string) => {
    const qrData = await generateQRCode(kodeBarang);
    setQrCodeData(qrData);
    setCurrentQrCode(kodeBarang);
    setQrDialogOpen(true);
  };

  const handleDownloadQR = () => {
    downloadQRCode(qrCodeData, currentQrCode);
    toast.success("QR Code berhasil diunduh!");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Kelola Barang</h2>
            <p className="text-muted-foreground">
              Tambah, edit, atau hapus data barang Unit TKJ
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="shadow-md">
                <Plus className="h-5 w-5 mr-2" />
                Tambah Barang
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Tambah Barang Baru</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddItem} className="space-y-4">
                <div>
                  <Label htmlFor="add-nama">Nama Barang *</Label>
                  <Input id="add-nama" name="nama" required />
                </div>
                <div>
                  <Label htmlFor="add-stok">Jumlah Stok *</Label>
                  <Input
                    id="add-stok"
                    name="stok"
                    type="number"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="add-foto">URL Foto</Label>
                  <Input
                    id="add-foto"
                    name="foto"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <Label htmlFor="add-notes">Catatan</Label>
                  <Textarea
                    id="add-notes"
                    name="notes"
                    placeholder="Keterangan tambahan..."
                  />
                </div>
                <Alert>
                  <AlertDescription className="text-xs">
                    Kode barang dan QR Code akan dibuat otomatis setelah barang ditambahkan
                  </AlertDescription>
                </Alert>
                <Button type="submit" className="w-full">
                  Tambah Barang
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari barang..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Barang ({filteredItems.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Foto</TableHead>
                    <TableHead>Nama Barang</TableHead>
                    <TableHead>Kode</TableHead>
                    <TableHead>Stok</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item, index) => {
                    const available = item.jumlah_stok - item.jumlah_dipinjam;
                    return (
                      <TableRow key={item.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          {item.foto_barang ? (
                            <img
                              src={item.foto_barang}
                              alt={item.nama_barang}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{item.nama_barang}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {item.kode_barang}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleShowQR(item.kode_barang)}
                            >
                              <QrCode className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>Total: {item.jumlah_stok}</div>
                            <div className="text-success">Tersedia: {available}</div>
                            <div className="text-warning">Dipinjam: {item.jumlah_dipinjam}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={available > 0 ? "default" : "secondary"}>
                            {available > 0 ? "Tersedia" : "Habis"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate text-sm text-muted-foreground">
                            {item.notes || "-"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingItem(item);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Barang</DialogTitle>
            </DialogHeader>
            {editingItem && (
              <form onSubmit={handleEditItem} className="space-y-4">
                <div>
                  <Label>Kode Barang</Label>
                  <Input value={editingItem.kode_barang} disabled />
                </div>
                <div>
                  <Label htmlFor="edit-nama">Nama Barang *</Label>
                  <Input
                    id="edit-nama"
                    name="nama"
                    defaultValue={editingItem.nama_barang}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-stok">Jumlah Stok *</Label>
                  <Input
                    id="edit-stok"
                    name="stok"
                    type="number"
                    min="0"
                    defaultValue={editingItem.jumlah_stok}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Saat ini dipinjam: {editingItem.jumlah_dipinjam}
                  </p>
                </div>
                <div>
                  <Label htmlFor="edit-foto">URL Foto</Label>
                  <Input
                    id="edit-foto"
                    name="foto"
                    type="url"
                    defaultValue={editingItem.foto_barang}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-notes">Catatan</Label>
                  <Textarea
                    id="edit-notes"
                    name="notes"
                    defaultValue={editingItem.notes}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                  <Button type="submit" className="flex-1">
                    Simpan
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* QR Code Dialog */}
        <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>QR Code Barang</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg text-center">
                <code className="font-mono font-semibold">{currentQrCode}</code>
              </div>
              {qrCodeData && (
                <div className="flex justify-center">
                  <img src={qrCodeData} alt="QR Code" className="w-64 h-64" />
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setQrDialogOpen(false)} className="flex-1">
                  Tutup
                </Button>
                <Button onClick={handleDownloadQR} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default Items;
