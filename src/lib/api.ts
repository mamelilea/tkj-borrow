// API Configuration and Helper Functions
import { Item, Borrowing, BorrowingFormData } from "@/types";

// Change this to your server IP for LAN access
// Example: http://192.168.1.100:3001/api
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Helper function for API calls
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<{ success: boolean; data?: T; message?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "API request failed");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// Barang API
export const barangAPI = {
  // Get all items
  getAll: async (): Promise<Item[]> => {
    const result = await fetchAPI<Item[]>("/barang");
    return result.data || [];
  },

  // Get item by ID
  getById: async (id: number): Promise<Item | null> => {
    const result = await fetchAPI<Item>(`/barang/${id}`);
    return result.data || null;
  },

  // Get item by code (for QR scan)
  getByKode: async (kode: string): Promise<Item | null> => {
    const result = await fetchAPI<Item>(`/barang/kode/${kode}`);
    return result.data || null;
  },

  // Create new item
  create: async (data: Omit<Item, "id" | "created_at">): Promise<Item> => {
    const result = await fetchAPI<Item>("/barang", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return result.data!;
  },

  // Update item
  update: async (id: number, data: Partial<Item>): Promise<void> => {
    await fetchAPI(`/barang/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Delete item
  delete: async (id: number): Promise<void> => {
    await fetchAPI(`/barang/${id}`, {
      method: "DELETE",
    });
  },
};

// Peminjaman API
export const peminjamanAPI = {
  // Get all borrowings
  getAll: async (status?: "Dipinjam" | "Dikembalikan"): Promise<Borrowing[]> => {
    const queryParams = status ? `?status=${status}` : "";
    const result = await fetchAPI<Borrowing[]>(`/peminjaman${queryParams}`);
    return result.data || [];
  },

  // Get borrowing by code
  getByKode: async (kode: string): Promise<Borrowing | null> => {
    const result = await fetchAPI<Borrowing>(`/peminjaman/kode/${kode}`);
    return result.data || null;
  },

  // Create new borrowing
  create: async (data: {
    id_barang: number;
    nama_peminjam: string;
    kontak?: string | null;
    keperluan: string;
    guru_pendamping: string;
    jumlah: number;
    foto_credential?: string | null;
  }): Promise<any> => {
    const result = await fetchAPI<any>("/peminjaman", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return result.data!;
  },

  // Return item
  return: async (kode_peminjaman: string, foto_verifikasi?: string): Promise<void> => {
    await fetchAPI(`/peminjaman/return/${kode_peminjaman}`, {
      method: "PUT",
      body: JSON.stringify({ foto_verifikasi }),
    });
  },

  // Update borrowing
  update: async (id: number, data: Partial<Borrowing>): Promise<void> => {
    await fetchAPI(`/peminjaman/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Delete borrowing
  delete: async (id: number): Promise<void> => {
    await fetchAPI(`/peminjaman/${id}`, {
      method: "DELETE",
    });
  },

  // Get statistics
  getStatistics: async (): Promise<{
    total_barang: number;
    total_peminjaman: number;
    active_peminjaman: number;
    completed_peminjaman: number;
    total_stok: number;
    total_dipinjam: number;
    total_tersedia: number;
  }> => {
    const result = await fetchAPI<any>("/peminjaman/statistics");
    return result.data!;
  },
};

// Admin API
export const adminAPI = {
  // Login
  login: async (username: string, password: string): Promise<{ token: string; admin: any }> => {
    const result = await fetchAPI<{ token: string; admin: any }>("/admin/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    return result.data!;
  },

  // Get profile (requires token)
  getProfile: async (token: string): Promise<any> => {
    const result = await fetchAPI<any>("/admin/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return result.data!;
  },
};

// Helper to check if backend is available
export const checkBackendConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(API_BASE_URL.replace("/api", ""));
    return response.ok;
  } catch {
    return false;
  }
};
