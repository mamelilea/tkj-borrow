import { ReactNode } from "react";

interface PublicLayoutProps {
  children: ReactNode;
}

const PublicLayout = ({ children }: PublicLayoutProps) => {
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
                  Peminjaman Barang
                </h1>
                <p className="text-sm text-muted-foreground">Unit TKJ</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto min-h-[65vh] px-4 py-8">
        {children}
      </main>

      <footer className="bg-card border-t border-border mt-16">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Unit TKJ - Sistem Peminjaman Barang
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
