import { Item } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Info } from "lucide-react";

interface ItemCardProps {
  item: Item;
  onBorrow?: (item: Item) => void;
}

const ItemCard = ({ item, onBorrow }: ItemCardProps) => {
  const availableStock = item.jumlah_stok - item.jumlah_dipinjam;
  const isAvailable = availableStock > 0;

  return (
    <Card className="overflow-hidden hover:shadow-custom-lg transition-all duration-300 group">
      <div className="aspect-video relative overflow-hidden bg-muted">
        {item.foto_barang ? (
          <img
            src={item.foto_barang}
            alt={item.nama_barang}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge
            variant={isAvailable ? "default" : "secondary"}
            className={isAvailable ? "bg-success" : "bg-muted"}
          >
            {isAvailable ? "Tersedia" : "Habis"}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-lg mb-1 line-clamp-1">{item.nama_barang}</h3>
          <p className="text-sm text-muted-foreground">Kode: {item.kode_barang}</p>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Stok:</span>
            <span className="font-medium">{item.jumlah_stok}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tersedia:</span>
            <span className="font-medium text-success">{availableStock}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Dipinjam:</span>
            <span className="font-medium text-warning">{item.jumlah_dipinjam}</span>
          </div>
        </div>

        {item.notes && (
          <div className="mb-4 p-2 bg-accent/50 rounded-md">
            <div className="flex gap-2 items-start">
              <Info className="h-4 w-4 text-accent-foreground mt-0.5 flex-shrink-0" />
              <p className="text-xs text-accent-foreground line-clamp-2">{item.notes}</p>
            </div>
          </div>
        )}

        <Button
          onClick={() => onBorrow?.(item)}
          disabled={!isAvailable}
          className="w-full"
          size="sm"
        >
          {isAvailable ? "Pinjam Barang" : "Tidak Tersedia"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ItemCard;
