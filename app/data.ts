export type Barang = {
  id: string;
  noBast: string;
  tanggal: string;
  namaBarang: string;
  jumlah: number;
  pihakTerkait: string; // Bisa Penyedia atau Satker
  dokumen: string;
  status?: string; // Khusus Transfer Keluar
};

// Data Dummy Awal
export const dataPembelian: Barang[] = [
  { id: "1", noBast: "BAST/P-01", tanggal: "2024-01-10", namaBarang: "Rompi", jumlah: 100, pihakTerkait: "PT Konveksi", dokumen: "dok1.pdf" }
];

export const dataTransferMasuk: Barang[] = [
  { id: "2", noBast: "BAST/TM-01", tanggal: "2024-01-15", namaBarang: "Rompi", jumlah: 50, pihakTerkait: "BPS Provinsi", dokumen: "dok2.pdf" }
];

export const dataPemakaian: Barang[] = [
  { id: "3", noBast: "BON-01", tanggal: "2024-01-20", namaBarang: "Rompi", jumlah: 20, pihakTerkait: "Internal", dokumen: "bon1.pdf" }
];

export const dataTransferKeluar: Barang[] = [
  { id: "4", noBast: "BAST/TK-01", tanggal: "2024-01-25", namaBarang: "Rompi", jumlah: 30, pihakTerkait: "BPS Kab. Pidie", dokumen: "sp1.pdf", status: "Diterima" }
];
