import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Package, ClipboardList, Home, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearAdminToken } from "@/lib/auth";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/favicon-32x32.png"
                alt="Logo"
                className="h-10 w-10 rounded-md border border-border object-contain bg-white"
              />
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">Unit TKJ</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Beranda
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => {
                  clearAdminToken();
                  navigate("/tkj-mgmt-2025/login", { replace: true });
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <nav className="flex gap-2 mb-6 bg-card p-2 rounded-lg border border-border shadow-sm">
          <Button
            variant={isActive("/tkj-mgmt-2025/dashboard") ? "default" : "ghost"}
            size="sm"
            asChild
          >
            <Link to="/tkj-mgmt-2025/dashboard">
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
          </Button>
          <Button
            variant={isActive("/tkj-mgmt-2025/items") ? "default" : "ghost"}
            size="sm"
            asChild
          >
            <Link to="/tkj-mgmt-2025/items">
              <Package className="h-4 w-4 mr-2" />
              Barang
            </Link>
          </Button>
          <Button
            variant={
              isActive("/tkj-mgmt-2025/borrowings") ? "default" : "ghost"
            }
            size="sm"
            asChild
          >
            <Link to="/tkj-mgmt-2025/borrowings">
              <ClipboardList className="h-4 w-4 mr-2" />
              Peminjaman
            </Link>
          </Button>
        </nav>

        <main>{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
