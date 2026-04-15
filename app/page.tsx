"use client"

import React, { useState, useEffect } from "react"
import {
  getPembelian, addPembelian, deletePembelian, updatePembelian,
  getPemakaian, addPemakaian, deletePemakaian, updatePemakaian,
  getTransferKeluar, addTransferKeluar, deleteTransferKeluar, updateTransferKeluar,
  getTransferMasuk, addTransferMasuk, deleteTransferMasuk, updateTransferMasuk
} from "./actions"
import {
  LayoutDashboard, ShoppingCart, PackageMinus, LogOut,
  User, Pencil, Trash2, FileText, ExternalLink, ArrowUpFromLine,
  ArrowDownToLine, PieChart as PieChartIcon, Menu, Lock,
  ArrowUpDown, ArrowUp, ArrowDown, X
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

const DAFTAR_KABKOTA = [
  "Simeulue", "Aceh Singkil", "Aceh Selatan", "Aceh Tenggara", "Aceh Timur",
  "Aceh Tengah", "Aceh Barat", "Aceh Besar", "Pidie", "Bireuen",
  "Aceh Utara", "Aceh Barat Daya", "Gayo Lues", "Aceh Tamiang", "Nagan Raya",
  "Aceh Jaya", "Bener Meriah", "Pidie Jaya", "Kota Banda Aceh", "Kota Sabang",
  "Kota Langsa", "Kota Lhokseumawe", "Kota Subulussalam"
];

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e'];
const formatAngka = (angka: number) => new Intl.NumberFormat('id-ID').format(angka);
const modernFont = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif";

export default function MonevApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [inputUsername, setInputUsername] = useState("")
  const [inputPassword, setInputPassword] = useState("")

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState("dashboard")
  const [viewDocument, setViewDocument] = useState<any>(null)
  const [sortConfig, setSortConfig] = useState<{ key: string | null, direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });

  // --- States CRUD ---
  const [dataPembelian, setDataPembelian] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({ id: "", noBast: "", tanggal: "", barang: "", penyedia: "", baik: "", rusakRingan: "", rusakBerat: "" })

  const [chkBaik, setCheckBaik] = useState(false);
  const [chkRR, setCheckRR] = useState(false);
  const [chkRB, setCheckRB] = useState(false);
  const [file, setFile] = useState<File | null>(null)

  const [dataPemakaian, setDataPemakaian] = useState<any[]>([])
  const [isDialogPemakaianOpen, setIsDialogPemakaianOpen] = useState(false)
  const [formPemakaian, setFormPemakaian] = useState({ id: "", noBukti: "", tanggal: "", nama: "", kegiatan: "", barang: "", jumlah: "" })
  const [pemakaianItems, setPemakaianItems] = useState<{barang: string, jumlah: string}[]>([])
  const [filePemakaian, setFilePemakaian] = useState<File | null>(null)

  const [dataTransfer, setDataTransfer] = useState<any[]>([])
  const [isDialogTransferOpen, setIsDialogTransferOpen] = useState(false)
  const [formTransfer, setFormTransfer] = useState({ id: "", noBast: "", tanggal: "", tujuan: "", barang: "", jumlah: "", status: "Dikirim" })
  const [transferItems, setTransferItems] = useState<{barang: string, jumlah: string}[]>([])
  const [fileTransfer, setFileTransfer] = useState<File | null>(null)

  const [dataMasuk, setDataMasuk] = useState<any[]>([])
  const [isDialogMasukOpen, setIsDialogMasukOpen] = useState(false)
  const [formMasuk, setFormMasuk] = useState({ id: "", noBast: "", tanggal: "", pengirim: "BPS Provinsi Aceh", barang: "", jumlah: "" })
  const [fileMasuk, setFileMasuk] = useState<File | null>(null)

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 640) setIsSidebarOpen(true); else setIsSidebarOpen(false); }
    window.addEventListener('resize', handleResize);
    handleResize();

    const session = sessionStorage.getItem("appSession");
    if (session === "aktif") { setIsLoggedIn(true); loadData(); }
    setIsCheckingSession(false);
    return () => window.removeEventListener('resize', handleResize);
  }, [])

  useEffect(() => { if (isLoggedIn) loadData(); }, [isLoggedIn])
  useEffect(() => { setSortConfig({ key: null, direction: 'asc' }); if(window.innerWidth < 640) setIsSidebarOpen(false); }, [activeMenu])

  async function loadData() {
    try {
      const [beli, pakai, transferOut, transferIn] = await Promise.all([
        getPembelian(), getPemakaian(), getTransferKeluar(), getTransferMasuk()
      ])
      setDataPembelian(beli || []); setDataPemakaian(pakai || []);
      setDataTransfer(transferOut || []); setDataMasuk(transferIn || []);
    } catch (e) { console.error("Gagal load data:", e) }
  }

  const handleLogin = () => {
    if (inputUsername.toLowerCase() === "admin" && inputPassword === "bpsaceh2026") {
      setIsLoggedIn(true); sessionStorage.setItem("appSession", "aktif"); setInputUsername(""); setInputPassword("");
    } else { alert("Username atau Password salah! Silakan coba lagi.") }
  }

  const handleLogout = () => { setIsLoggedIn(false); sessionStorage.removeItem("appSession"); setActiveMenu("dashboard"); }

  // --- LOGIKA SORTING ---
  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  }

  const getSortIcon = (columnName: string) => {
    if (sortConfig.key !== columnName) return <ArrowUpDown size={14} className="ml-1 opacity-40 inline-block" />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="ml-1 text-[#D48B10] inline-block" /> : <ArrowDown size={14} className="ml-1 text-[#D48B10] inline-block" />;
  }

  const getSortedData = (data: any[]) => {
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key!]?.toString().toLowerCase() || '';
      const bValue = b[sortConfig.key!]?.toString().toLowerCase() || '';
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const sortedPembelian = getSortedData(dataPembelian);
  const sortedPemakaian = getSortedData(dataPemakaian);
  const sortedTransfer = getSortedData(dataTransfer);
  const sortedMasuk = getSortedData(dataMasuk);

  // --- LOGIKA DASHBOARD KUALITAS ---
  const uniqueBarangMap = new Map();
  dataPembelian.forEach(item => {
    if (item.barang) {
      const key = item.barang.trim().toLowerCase();
      if (!uniqueBarangMap.has(key)) uniqueBarangMap.set(key, item.barang.trim());
    }
  });

  const dynamicStats = Array.from(uniqueBarangMap.entries()).map(([key, originalName]) => {
    const pembelianBarang = dataPembelian.filter(i => i.barang?.toLowerCase().trim() === key);

    const masukBaik = pembelianBarang.reduce((sum, i) => sum + (i.baik || 0), 0);
    const masukRR = pembelianBarang.reduce((sum, i) => sum + (i.rusakRingan || 0), 0);
    const masukRB = pembelianBarang.reduce((sum, i) => sum + (i.rusakBerat || 0), 0);
    const totalMasuk = masukBaik + masukRR + masukRB;

    const pakai = dataPemakaian.filter(i => i.barang?.toLowerCase().trim() === key).reduce((sum, i) => sum + i.jumlah, 0);
    const transfer = dataTransfer.filter(i => i.barang?.toLowerCase().trim() === key).reduce((sum, i) => sum + i.jumlah, 0);
    const totalKeluar = pakai + transfer;

    const sisaBaik = masukBaik - totalKeluar;

    return {
      name: originalName,
      masuk: totalMasuk,
      keluar: totalKeluar,
      sisaBaik: sisaBaik > 0 ? sisaBaik : 0,
      sisaRR: masukRR,
      sisaRB: masukRB
    };
  });

  // --- Handlers CRUD ---
  const handleSavePembelian = async () => {
    const dataToSend = new FormData();
    dataToSend.append("noBast", formData.noBast);
    dataToSend.append("tanggal", formData.tanggal);
    dataToSend.append("barang", formData.barang);
    dataToSend.append("penyedia", formData.penyedia);

    dataToSend.append("baik", chkBaik ? formData.baik : "0");
    dataToSend.append("rusakRingan", chkRR ? formData.rusakRingan : "0");
    dataToSend.append("rusakBerat", chkRB ? formData.rusakBerat : "0");

    if (file) dataToSend.append("dokumen", file);
    try {
      if (formData.id) await updatePembelian(formData.id, dataToSend);
      else await addPembelian(dataToSend);
      await loadData(); setIsDialogOpen(false); resetFormPembelian(); alert("Berhasil simpan pengadaan!")
    } catch (error) { alert("Gagal simpan pengadaan") }
  }

  const handleSavePemakaian = async () => {
    const dataToSend = new FormData();
    dataToSend.append("noBukti", formPemakaian.noBukti);
    dataToSend.append("tanggal", formPemakaian.tanggal);
    dataToSend.append("nama", formPemakaian.nama);
    dataToSend.append("kegiatan", formPemakaian.kegiatan);
    if (filePemakaian) dataToSend.append("dokumen", filePemakaian);

    if (formPemakaian.id) {
      dataToSend.append("barang", formPemakaian.barang);
      dataToSend.append("jumlah", formPemakaian.jumlah);
      try { await updatePemakaian(formPemakaian.id, dataToSend); } catch(e) { return alert("Gagal update pemakaian!"); }
    } else {
      if (pemakaianItems.length === 0) return alert("Pilih minimal 1 barang yang dipakai!");
      if (pemakaianItems.some(i => !i.jumlah || parseInt(i.jumlah) <= 0)) return alert("Pastikan semua barang yang dicentang memiliki jumlah yang valid!");
      dataToSend.append("items", JSON.stringify(pemakaianItems));
      try { await addPemakaian(dataToSend); } catch(e) { return alert("Gagal simpan pemakaian!"); }
    }
    await loadData(); setIsDialogPemakaianOpen(false); resetFormPemakaian(); alert("Berhasil simpan pemakaian!")
  }

  const handleSaveTransfer = async () => {
    if(!formTransfer.tujuan) return alert("Pilih Tujuan Kab/Kota terlebih dahulu!");
    const dataToSend = new FormData();
    dataToSend.append("noBast", formTransfer.noBast);
    dataToSend.append("tanggal", formTransfer.tanggal);
    dataToSend.append("tujuan", formTransfer.tujuan);
    dataToSend.append("status", formTransfer.status);
    if (fileTransfer) dataToSend.append("dokumen", fileTransfer);

    if (formTransfer.id) {
      dataToSend.append("barang", formTransfer.barang);
      dataToSend.append("jumlah", formTransfer.jumlah);
      try { await updateTransferKeluar(formTransfer.id, dataToSend); } catch(e) { return alert("Gagal update transfer!"); }
    } else {
      if (transferItems.length === 0) return alert("Pilih minimal 1 barang yang akan dikirim!");
      if (transferItems.some(i => !i.jumlah || parseInt(i.jumlah) <= 0)) return alert("Pastikan semua barang yang dicentang memiliki jumlah yang valid!");
      dataToSend.append("items", JSON.stringify(transferItems));
      try { await addTransferKeluar(dataToSend); } catch(e) { return alert("Gagal simpan transfer!"); }
    }
    await loadData(); setIsDialogTransferOpen(false); resetFormTransfer(); alert("Berhasil simpan transfer keluar!")
  }

  const handleSaveMasuk = async () => {
    const dataToSend = new FormData(); dataToSend.append("noBast", formMasuk.noBast); dataToSend.append("tanggal", formMasuk.tanggal); dataToSend.append("pengirim", formMasuk.pengirim); dataToSend.append("barang", formMasuk.barang); dataToSend.append("jumlah", formMasuk.jumlah); if (fileMasuk) dataToSend.append("dokumen", fileMasuk)
    try { if (formMasuk.id) await updateTransferMasuk(formMasuk.id, dataToSend); else await addTransferMasuk(dataToSend); await loadData(); setIsDialogMasukOpen(false); resetFormMasuk(); alert("Berhasil simpan penerimaan barang!") } catch (error) { alert("Gagal simpan transfer masuk") }
  }

  // --- HALAMAN LOGIN ---
  if (isCheckingSession) return null;

  if (!isLoggedIn) {
    return (
      <div className="flex h-screen items-center justify-center p-4" style={{ backgroundColor: "#D48B10", fontFamily: modernFont }}>
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-[380px] flex flex-col items-center">
          <img src="/logo-bps.png" alt="Logo BPS" className="h-16 sm:h-20 mb-8 object-contain" />
          <div className="w-full space-y-5">
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <Input placeholder="USERNAME" className="pl-10 text-sm h-10 border-slate-300 focus-visible:ring-[#2C415C]" style={{ fontFamily: modernFont }} value={inputUsername} onChange={(e) => setInputUsername(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <Input type="password" placeholder="PASSWORD" className="pl-10 text-sm h-10 border-slate-300 focus-visible:ring-[#2C415C]" style={{ fontFamily: modernFont }} value={inputPassword} onChange={(e) => setInputPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
            </div>
            <Button className="w-full bg-[#2C415C] hover:bg-[#1a2839] text-white mt-4 font-semibold tracking-wider h-10" style={{ fontFamily: modernFont }} onClick={handleLogin}>
              LOGIN
            </Button>
            <p className="text-xs text-right text-slate-500 mt-2 cursor-pointer hover:underline hover:text-[#2C415C] transition-colors">Forgot password?</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#D9D9D9] text-slate-800 overflow-hidden" style={{ fontFamily: modernFont }}>

      {/* OVERLAY MOBILE UNTUK SIDEBAR */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 sm:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"} sm:relative sm:translate-x-0 sm:flex sm:w-64 bg-white border-r border-slate-200 transition-transform duration-300 flex-col shadow-xl sm:shadow-sm`}>
        <div className="p-4 border-b h-20 flex items-center justify-between sm:justify-center gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-[#D48B10] p-2 rounded-lg text-white shrink-0"><LayoutDashboard size={20} /></div>
            <span className="font-bold text-[#2C415C] whitespace-nowrap tracking-wide">MONEV-SE</span>
          </div>
          <button className="sm:hidden text-slate-500 hover:text-slate-800" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 py-4 px-3 flex flex-col gap-2 overflow-y-auto">
          <button onClick={() => setActiveMenu("dashboard")} className={`flex items-center w-full p-3 rounded-lg transition-colors ${activeMenu === "dashboard" ? "bg-[#D48B10] text-white shadow-md" : "text-slate-500 hover:bg-slate-100"}`}>
            <div className="min-w-5"><PieChartIcon size={20} /></div><span className="ml-3 font-medium whitespace-nowrap">Dashboard</span>
          </button>
          <button onClick={() => setActiveMenu("pembelian")} className={`flex items-center w-full p-3 rounded-lg transition-colors ${activeMenu === "pembelian" ? "bg-[#D48B10] text-white shadow-md" : "text-slate-500 hover:bg-slate-100"}`}>
            <div className="min-w-5"><ShoppingCart size={20} /></div><span className="ml-3 font-medium whitespace-nowrap">Pembelian</span>
          </button>
          <button onClick={() => setActiveMenu("pemakaian")} className={`flex items-center w-full p-3 rounded-lg transition-colors ${activeMenu === "pemakaian" ? "bg-[#D48B10] text-white shadow-md" : "text-slate-500 hover:bg-slate-100"}`}>
            <div className="min-w-5"><PackageMinus size={20} /></div><span className="ml-3 font-medium whitespace-nowrap">Pemakaian Internal</span>
          </button>
          <button onClick={() => setActiveMenu("transfer")} className={`flex items-center w-full p-3 rounded-lg transition-colors ${activeMenu === "transfer" ? "bg-[#D48B10] text-white shadow-md" : "text-slate-500 hover:bg-slate-100"}`}>
            <div className="min-w-5"><ArrowUpFromLine size={20} /></div><span className="ml-3 font-medium whitespace-nowrap">Transfer Keluar</span>
          </button>
          <button onClick={() => setActiveMenu("masuk")} className={`flex items-center w-full p-3 rounded-lg transition-colors ${activeMenu === "masuk" ? "bg-[#D48B10] text-white shadow-md" : "text-slate-500 hover:bg-slate-100"}`}>
            <div className="min-w-5"><ArrowDownToLine size={20} /></div><span className="ml-3 font-medium whitespace-nowrap">Transfer Masuk</span>
          </button>
        </div>
        <div className="p-4 border-t">
          <button onClick={handleLogout} className="flex items-center text-red-500 gap-3 p-2 w-full hover:bg-red-50 rounded-lg transition-colors">
            <div className="min-w-5"><LogOut size={20} /></div><span className="whitespace-nowrap font-medium">Keluar</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative w-full">
        <header className="h-16 sm:h-20 bg-white shadow-sm border-b flex items-center px-4 sm:px-6 justify-between z-20 shrink-0">
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 rounded-md hover:bg-slate-100 text-slate-600 sm:hidden transition-colors"><Menu size={24} /></button>
            <h1 className="text-lg sm:text-xl font-bold text-[#2C415C] tracking-wide">BPS PROVINSI ACEH</h1>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm bg-slate-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium text-[#2C415C]"><User size={16} /> <span className="hidden sm:inline">Admin</span></div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#D9D9D9] relative flex flex-col">

          {/* MENU DASHBOARD */}
          {activeMenu === "dashboard" && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-xl sm:text-2xl font-bold text-[#2C415C]">Dashboard Kualitas Logistik</h2>
                <p className="text-sm sm:text-base text-slate-500 mt-1">Diagram otomatis memisahkan barang berdasarkan kondisi kualitas di gudang Provinsi.</p>
              </div>

              {dynamicStats.length === 0 ? (
                <div className="p-8 sm:p-12 text-center bg-white rounded-xl shadow-sm border-2 border-dashed border-slate-200">
                  <PieChartIcon size={48} className="mx-auto text-slate-300 mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-slate-700">Belum Ada Data Pengadaan</h3>
                  <p className="text-sm sm:text-base text-slate-500">Input data di menu Pembelian terlebih dahulu.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 pb-8">
                  {dynamicStats.map((stat, index) => {
                    const colorUtama = CHART_COLORS[index % CHART_COLORS.length];
                    // Terdistribusi dihilangkan dari chartData, paddingAngle dihapus
                    const chartData = [
                      { name: 'Sisa Baik', value: stat.sisaBaik, color: colorUtama },
                      { name: 'Rusak Ringan', value: stat.sisaRR, color: '#f59e0b' },
                      { name: 'Rusak Berat', value: stat.sisaRB, color: '#ef4444' }
                    ].filter(d => d.value > 0);

                    return (
                      <Card key={index} className="shadow-sm border-none rounded-xl">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg truncate text-[#2C415C]" title={stat.name}>{stat.name}</CardTitle>
                          <div className="flex flex-col gap-0.5 mt-1">
                            <p className="text-xs sm:text-sm text-slate-500 flex justify-between">
                              <span>Total Pengadaan:</span>
                              <b className="text-slate-700">{formatAngka(stat.masuk)} pcs</b>
                            </p>
                            <p className="text-xs sm:text-sm text-slate-500 flex justify-between">
                              <span>Telah Didistribusi/Dipakai:</span>
                              <b className="text-slate-700">{formatAngka(stat.keluar)} pcs</b>
                            </p>
                          </div>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center">
                          <div className="h-56 sm:h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                {/* paddingAngle dihapus agar potongan kecil tidak termakan spasi putih */}
                                <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value">
                                  {chartData.map((entry, idx) => (<Cell key={`cell-${idx}`} fill={entry.color} />))}
                                </Pie>
                                <Tooltip formatter={(value) => formatAngka(value as number)} />
                                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }}/>
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* MENU PEMBELIAN */}
          {activeMenu === "pembelian" && (
            <Card className="shadow-sm border-none rounded-xl flex flex-col flex-1 min-h-0">
              <CardHeader className="flex flex-row items-center justify-between shrink-0 bg-white rounded-t-xl z-20 border-b border-slate-100 p-4 sm:p-6">
                <div><CardTitle className="text-base sm:text-xl text-[#2C415C]">Pengadaan Provinsi</CardTitle></div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) resetFormPembelian(); }}>
                  <DialogTrigger asChild><Button className="bg-[#D48B10] hover:bg-[#b0730d] text-white shadow-md text-xs sm:text-sm h-8 sm:h-10">+ Tambah</Button></DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] h-[90vh] sm:h-auto overflow-y-auto" style={{ fontFamily: modernFont }}>
                    <DialogHeader><DialogTitle>{formData.id ? "Edit" : "Tambah"} Pengadaan</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2"><Label>No BAST</Label><Input value={formData.noBast} onChange={(e) => setFormData({...formData, noBast: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>Tanggal BAST</Label><Input type="date" value={formData.tanggal} onChange={(e) => setFormData({...formData, tanggal: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>Nama Barang</Label><Input placeholder="Contoh: Meteran, Rompi, Stiker..." value={formData.barang} onChange={(e) => setFormData({...formData, barang: e.target.value})} /></div>

                      {/* Ceklis Kualitas */}
                      <div className="grid gap-2">
                        <Label className="text-[#D48B10] font-semibold">Kondisi & Jumlah Barang (pcs)</Label>
                        <div className="flex flex-col gap-3 p-3 border border-slate-200 rounded-lg bg-slate-50">
                          <div className="flex items-center gap-3">
                            <input type="checkbox" className="w-5 h-5 accent-[#D48B10]" checked={chkBaik} onChange={e => setCheckBaik(e.target.checked)}/>
                            <Label className="flex-1">Kualitas Baik</Label>
                            {chkBaik && <Input type="number" placeholder="Jumlah" className="w-24 h-8 text-sm" value={formData.baik} onChange={e => setFormData({...formData, baik: e.target.value})} />}
                          </div>
                          <div className="flex items-center gap-3">
                            <input type="checkbox" className="w-5 h-5 accent-[#f59e0b]" checked={chkRR} onChange={e => setCheckRR(e.target.checked)}/>
                            <Label className="flex-1">Rusak Ringan</Label>
                            {chkRR && <Input type="number" placeholder="Jumlah" className="w-24 h-8 text-sm" value={formData.rusakRingan} onChange={e => setFormData({...formData, rusakRingan: e.target.value})} />}
                          </div>
                          <div className="flex items-center gap-3">
                            <input type="checkbox" className="w-5 h-5 accent-[#ef4444]" checked={chkRB} onChange={e => setCheckRB(e.target.checked)}/>
                            <Label className="flex-1">Rusak Berat</Label>
                            {chkRB && <Input type="number" placeholder="Jumlah" className="w-24 h-8 text-sm" value={formData.rusakBerat} onChange={e => setFormData({...formData, rusakBerat: e.target.value})} />}
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-2"><Label>Nama Penyedia</Label><Input value={formData.penyedia} onChange={(e) => setFormData({...formData, penyedia: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>Dokumen Pengadaan (PDF)</Label><Input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} /></div>
                    </div>
                    <DialogFooter><Button onClick={handleSavePembelian} className="bg-[#D48B10] hover:bg-[#b0730d] text-white w-full">Simpan Data</Button></DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <div className="flex-1 bg-white rounded-b-xl relative overflow-x-auto overflow-y-auto">
                <Table className="min-w-[800px]">
                  <TableHeader className="sticky top-0 z-10 bg-slate-100 shadow-sm border-b border-slate-200">
                    <TableRow>
                      <TableHead className="px-4 py-3 bg-slate-100 whitespace-nowrap">No BAST</TableHead>
                      <TableHead className="py-3 bg-slate-100 cursor-pointer whitespace-nowrap" onClick={() => requestSort('tanggal')}><div className="flex items-center">Tanggal {getSortIcon('tanggal')}</div></TableHead>
                      <TableHead className="py-3 bg-slate-100 cursor-pointer whitespace-nowrap" onClick={() => requestSort('barang')}><div className="flex items-center">Nama Barang {getSortIcon('barang')}</div></TableHead>
                      <TableHead className="py-3 bg-slate-100 whitespace-nowrap text-center">Total</TableHead>
                      <TableHead className="py-3 bg-slate-100 whitespace-nowrap text-center">Baik</TableHead>
                      <TableHead className="py-3 bg-slate-100 whitespace-nowrap text-center text-amber-600">R. Ringan</TableHead>
                      <TableHead className="py-3 bg-slate-100 whitespace-nowrap text-center text-red-600">R. Berat</TableHead>
                      <TableHead className="text-center py-3 bg-slate-100 whitespace-nowrap">Dok. Pengadaan</TableHead>
                      <TableHead className="text-right px-4 py-3 bg-slate-100">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedPembelian.map((item) => (
                      <TableRow key={item.id} className="hover:bg-slate-50/50">
                        <TableCell className="px-4 font-medium text-slate-700 whitespace-nowrap">{item.noBast}</TableCell>
                        <TableCell className="whitespace-nowrap">{item.tanggal}</TableCell>
                        <TableCell className="whitespace-nowrap">{item.barang}</TableCell>
                        <TableCell className="text-center font-bold bg-slate-50">{formatAngka(item.jumlah)}</TableCell>
                        <TableCell className="text-center">{formatAngka(item.baik)}</TableCell>
                        <TableCell className="text-center text-amber-600">{formatAngka(item.rusakRingan)}</TableCell>
                        <TableCell className="text-center text-red-600">{formatAngka(item.rusakBerat)}</TableCell>
                        <TableCell className="text-center"><Button variant="ghost" size="sm" onClick={() => setViewDocument(item)}><FileText size={16} className="text-[#D48B10]" /></Button></TableCell>
                        <TableCell className="text-right px-4 space-x-2 whitespace-nowrap">
                          <Button variant="outline" size="icon" onClick={() => {
                            setFormData({ id: item.id, noBast: item.noBast, tanggal: item.tanggal, barang: item.barang || "", penyedia: item.penyedia, baik: item.baik.toString(), rusakRingan: item.rusakRingan.toString(), rusakBerat: item.rusakBerat.toString() });
                            setCheckBaik(item.baik > 0); setCheckRR(item.rusakRingan > 0); setCheckRB(item.rusakBerat > 0);
                            setIsDialogOpen(true);
                          }}><Pencil size={16} className="text-amber-600" /></Button>
                          <Button variant="outline" size="icon" onClick={() => { if(confirm("Hapus?")) deletePembelian(item.id).then(loadData) }}><Trash2 size={16} className="text-red-600" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}

          {/* MENU PEMAKAIAN INTERNAL */}
          {activeMenu === "pemakaian" && (
            <Card className="shadow-sm border-none rounded-xl flex flex-col flex-1 min-h-0">
              <CardHeader className="flex flex-row items-center justify-between shrink-0 bg-white rounded-t-xl z-20 border-b border-slate-100 p-4 sm:p-6">
                <div><CardTitle className="text-base sm:text-xl text-[#2C415C]">Data Pemakaian Internal</CardTitle></div>
                <Dialog open={isDialogPemakaianOpen} onOpenChange={(open) => { setIsDialogPemakaianOpen(open); if(!open) resetFormPemakaian(); }}>
                  <DialogTrigger asChild><Button className="bg-[#D48B10] hover:bg-[#b0730d] text-white shadow-md text-xs sm:text-sm h-8 sm:h-10">+ Tambah</Button></DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] h-[90vh] sm:h-auto overflow-y-auto" style={{ fontFamily: modernFont }}>
                    <DialogHeader><DialogTitle>{formPemakaian.id ? "Edit" : "Tambah"} Pemakaian</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2"><Label>No Bukti (Bon)</Label><Input placeholder="Nomor Bukti Pengambilan" value={formPemakaian.noBukti} onChange={(e) => setFormPemakaian({...formPemakaian, noBukti: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>Tanggal Pakai</Label><Input type="date" value={formPemakaian.tanggal} onChange={(e) => setFormPemakaian({...formPemakaian, tanggal: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>Nama Pegawai</Label><Input value={formPemakaian.nama} onChange={(e) => setFormPemakaian({...formPemakaian, nama: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>Keperluan</Label><Input value={formPemakaian.kegiatan} onChange={(e) => setFormPemakaian({...formPemakaian, kegiatan: e.target.value})} /></div>

                      <div className="grid gap-2">
                        <Label className="text-[#D48B10] font-semibold">Pilih Barang yang Dipakai (Stok Baik)</Label>
                        {formPemakaian.id ? (
                          <div className="flex gap-2">
                            <Input value={formPemakaian.barang} disabled className="bg-slate-100 flex-1" />
                            <Input type="number" placeholder="Jml" value={formPemakaian.jumlah} onChange={(e) => setFormPemakaian({...formPemakaian, jumlah: e.target.value})} className="w-20" />
                          </div>
                        ) : (
                          <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-md p-3 space-y-3 bg-slate-50">
                            {Array.from(uniqueBarangMap.values()).map((barangStr) => {
                              const isChecked = pemakaianItems.some(i => i.barang === barangStr);
                              const currentItem = pemakaianItems.find(i => i.barang === barangStr);
                              return (
                                <div key={barangStr as string} className="flex items-center gap-3 bg-white p-2 rounded border shadow-sm">
                                  <input type="checkbox" className="w-4 h-4 accent-[#D48B10]" checked={isChecked} onChange={(e) => { if (e.target.checked) setPemakaianItems([...pemakaianItems, { barang: barangStr as string, jumlah: "" }]); else setPemakaianItems(pemakaianItems.filter(i => i.barang !== barangStr)); }} />
                                  <Label className="flex-1 cursor-pointer text-sm truncate">{barangStr as string}</Label>
                                  {isChecked && ( <Input type="number" placeholder="Jml" className="w-20 h-8 text-sm" value={currentItem?.jumlah || ""} onChange={(e) => { setPemakaianItems(pemakaianItems.map(i => i.barang === barangStr ? { ...i, jumlah: e.target.value } : i)); }} /> )}
                                </div>
                              )
                            })}
                            {uniqueBarangMap.size === 0 && <p className="text-xs text-slate-500 italic text-center">Belum ada barang di Data Pengadaan</p>}
                          </div>
                        )}
                      </div>

                      <div className="grid gap-2"><Label>Bon Pengambilan (PDF)</Label><Input type="file" accept=".pdf" onChange={(e) => setFilePemakaian(e.target.files?.[0] || null)} /></div>
                    </div>
                    <DialogFooter><Button onClick={handleSavePemakaian} className="bg-[#D48B10] hover:bg-[#b0730d] text-white w-full">Simpan</Button></DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <div className="flex-1 bg-white rounded-b-xl relative overflow-x-auto overflow-y-auto">
                <Table className="min-w-[700px]">
                  <TableHeader className="sticky top-0 z-10 bg-slate-100 shadow-sm border-b border-slate-200">
                    <TableRow>
                      <TableHead className="px-4 py-3 bg-slate-100 whitespace-nowrap">No Bukti</TableHead>
                      <TableHead className="py-3 bg-slate-100 cursor-pointer whitespace-nowrap" onClick={() => requestSort('tanggal')}><div className="flex items-center">Tanggal {getSortIcon('tanggal')}</div></TableHead>
                      <TableHead className="py-3 bg-slate-100 whitespace-nowrap">Nama Pegawai</TableHead>
                      <TableHead className="py-3 bg-slate-100 cursor-pointer whitespace-nowrap" onClick={() => requestSort('barang')}><div className="flex items-center">Nama Barang {getSortIcon('barang')}</div></TableHead>
                      <TableHead className="py-3 bg-slate-100 whitespace-nowrap text-center">Jumlah</TableHead>
                      <TableHead className="text-center py-3 bg-slate-100 whitespace-nowrap">Dokumen</TableHead>
                      <TableHead className="text-right px-4 py-3 bg-slate-100">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedPemakaian.map((item) => (
                      <TableRow key={item.id} className="hover:bg-slate-50/50">
                        <TableCell className="px-4 font-medium text-slate-700 whitespace-nowrap">{item.noBukti}</TableCell><TableCell className="whitespace-nowrap">{item.tanggal}</TableCell><TableCell className="whitespace-nowrap">{item.nama}</TableCell><TableCell className="whitespace-nowrap">{item.barang}</TableCell><TableCell className="text-center font-bold bg-slate-50">{formatAngka(item.jumlah)} pcs</TableCell>
                        <TableCell className="text-center"><Button variant="ghost" size="sm" onClick={() => setViewDocument(item)}><FileText size={16} className="text-[#D48B10]" /></Button></TableCell>
                        <TableCell className="text-right px-4 space-x-2 whitespace-nowrap">
                          <Button variant="outline" size="icon" onClick={() => { setFormPemakaian({ id: item.id, noBukti: item.noBukti || "", tanggal: item.tanggal, nama: item.nama, kegiatan: item.kegiatan, barang: item.barang, jumlah: item.jumlah.toString() }); setIsDialogPemakaianOpen(true); }}><Pencil size={16} className="text-amber-600" /></Button>
                          <Button variant="outline" size="icon" onClick={() => { if(confirm("Hapus?")) deletePemakaian(item.id).then(loadData) }}><Trash2 size={16} className="text-red-600" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}

          {/* MENU TRANSFER KELUAR */}
          {activeMenu === "transfer" && (
            <Card className="shadow-sm border-none rounded-xl flex flex-col flex-1 min-h-0">
              <CardHeader className="flex flex-row items-center justify-between shrink-0 bg-white rounded-t-xl z-20 border-b border-slate-100 p-4 sm:p-6">
                <div><CardTitle className="text-base sm:text-xl text-[#2C415C]">Distribusi (Transfer Keluar)</CardTitle></div>
                <Dialog open={isDialogTransferOpen} onOpenChange={(open) => { setIsDialogTransferOpen(open); if(!open) resetFormTransfer(); }}>
                  <DialogTrigger asChild><Button className="bg-[#D48B10] hover:bg-[#b0730d] text-white shadow-md text-xs sm:text-sm h-8 sm:h-10">+ Tambah</Button></DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] h-[90vh] sm:h-auto overflow-y-auto" style={{ fontFamily: modernFont }}>
                    <DialogHeader><DialogTitle>{formTransfer.id ? "Edit" : "Tambah"} Distribusi</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2"><Label>No BAST</Label><Input placeholder="Nomor BAST Serah Terima" value={formTransfer.noBast} onChange={(e) => setFormTransfer({...formTransfer, noBast: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>Tanggal</Label><Input type="date" value={formTransfer.tanggal} onChange={(e) => setFormTransfer({...formTransfer, tanggal: e.target.value})} /></div>
                      <div className="grid gap-2">
                        <Label>Tujuan (Kab/Kota)</Label>
                        <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D48B10]" value={formTransfer.tujuan} onChange={(e) => setFormTransfer({...formTransfer, tujuan: e.target.value})}>
                          <option value="" disabled>Pilih Tujuan...</option>
                          {DAFTAR_KABKOTA.map((kab) => (<option key={kab} value={kab}>{kab}</option>))}
                        </select>
                      </div>

                      <div className="grid gap-2">
                        <Label className="text-[#D48B10] font-semibold">Pilih Barang yang Dikirim (Stok Baik)</Label>
                        {formTransfer.id ? (
                          <div className="flex gap-2">
                            <Input value={formTransfer.barang} disabled className="bg-slate-100 flex-1" />
                            <Input type="number" placeholder="Jml" value={formTransfer.jumlah} onChange={(e) => setFormTransfer({...formTransfer, jumlah: e.target.value})} className="w-20" />
                          </div>
                        ) : (
                          <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-md p-3 space-y-3 bg-slate-50">
                            {Array.from(uniqueBarangMap.values()).map((barangStr) => {
                              const isChecked = transferItems.some(i => i.barang === barangStr);
                              const currentItem = transferItems.find(i => i.barang === barangStr);
                              return (
                                <div key={barangStr as string} className="flex items-center gap-3 bg-white p-2 rounded border shadow-sm">
                                  <input type="checkbox" className="w-4 h-4 accent-[#D48B10]" checked={isChecked} onChange={(e) => { if (e.target.checked) setTransferItems([...transferItems, { barang: barangStr as string, jumlah: "" }]); else setTransferItems(transferItems.filter(i => i.barang !== barangStr)); }} />
                                  <Label className="flex-1 cursor-pointer text-sm truncate">{barangStr as string}</Label>
                                  {isChecked && ( <Input type="number" placeholder="Jml" className="w-20 h-8 text-sm" value={currentItem?.jumlah || ""} onChange={(e) => { setTransferItems(transferItems.map(i => i.barang === barangStr ? { ...i, jumlah: e.target.value } : i)); }} /> )}
                                </div>
                              )
                            })}
                            {uniqueBarangMap.size === 0 && <p className="text-xs text-slate-500 italic text-center">Belum ada barang di Data Pengadaan</p>}
                          </div>
                        )}
                      </div>

                      <div className="grid gap-2">
                        <Label>Status Pengiriman</Label>
                        <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D48B10]" value={formTransfer.status} onChange={(e) => setFormTransfer({...formTransfer, status: e.target.value})}>
                          <option value="Dikirim">Dikirim</option>
                          <option value="Diterima">Diterima</option>
                        </select>
                      </div>
                      <div className="grid gap-2"><Label>Dokumen BAST (PDF)</Label><Input type="file" accept=".pdf" onChange={(e) => setFileTransfer(e.target.files?.[0] || null)} /></div>
                    </div>
                    <DialogFooter><Button onClick={handleSaveTransfer} className="bg-[#D48B10] hover:bg-[#b0730d] text-white w-full">Simpan Data</Button></DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <div className="flex-1 bg-white rounded-b-xl relative overflow-x-auto overflow-y-auto">
                <Table className="min-w-[850px]">
                  <TableHeader className="sticky top-0 z-10 bg-slate-100 shadow-sm border-b border-slate-200">
                    <TableRow>
                      <TableHead className="px-4 py-3 bg-slate-100 whitespace-nowrap">No BAST</TableHead>
                      <TableHead className="py-3 bg-slate-100 cursor-pointer whitespace-nowrap" onClick={() => requestSort('tanggal')}><div className="flex items-center">Tanggal {getSortIcon('tanggal')}</div></TableHead>
                      <TableHead className="py-3 bg-slate-100 cursor-pointer whitespace-nowrap" onClick={() => requestSort('tujuan')}><div className="flex items-center">Tujuan {getSortIcon('tujuan')}</div></TableHead>
                      <TableHead className="py-3 bg-slate-100 cursor-pointer whitespace-nowrap" onClick={() => requestSort('barang')}><div className="flex items-center">Barang {getSortIcon('barang')}</div></TableHead>
                      <TableHead className="py-3 bg-slate-100 text-center whitespace-nowrap">Jumlah</TableHead>
                      <TableHead className="text-center py-3 bg-slate-100 whitespace-nowrap">Status</TableHead>
                      <TableHead className="text-center py-3 bg-slate-100 whitespace-nowrap">Dokumen</TableHead>
                      <TableHead className="text-right px-4 py-3 bg-slate-100">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedTransfer.map((item) => (
                      <TableRow key={item.id} className="hover:bg-slate-50/50">
                        <TableCell className="px-4 font-medium text-slate-700 whitespace-nowrap">{item.noBast}</TableCell><TableCell className="whitespace-nowrap">{item.tanggal}</TableCell><TableCell className="whitespace-nowrap">{item.tujuan}</TableCell><TableCell className="whitespace-nowrap">{item.barang}</TableCell>
                        <TableCell className="text-center font-bold bg-slate-50">{formatAngka(item.jumlah)} pcs</TableCell>
                        <TableCell className="text-center"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.status === 'Diterima' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{item.status}</span></TableCell>
                        <TableCell className="text-center"><Button variant="ghost" size="sm" onClick={() => setViewDocument(item)}><FileText size={16} className="text-[#D48B10]" /></Button></TableCell>
                        <TableCell className="text-right px-4 space-x-2 whitespace-nowrap">
                          <Button variant="outline" size="icon" onClick={() => { setFormTransfer({ id: item.id, noBast: item.noBast, tanggal: item.tanggal, tujuan: item.tujuan, barang: item.barang, jumlah: item.jumlah.toString(), status: item.status }); setIsDialogTransferOpen(true); }}><Pencil size={16} className="text-amber-600" /></Button>
                          <Button variant="outline" size="icon" onClick={() => { if(confirm("Hapus?")) deleteTransferKeluar(item.id).then(loadData) }}><Trash2 size={16} className="text-red-600" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}

          {/* MENU TRANSFER MASUK */}
          {activeMenu === "masuk" && (
            <Card className="shadow-sm border-none rounded-xl flex flex-col flex-1 min-h-0">
              <CardHeader className="flex flex-row items-center justify-between shrink-0 bg-white rounded-t-xl z-20 border-b border-slate-100 p-4 sm:p-6">
                <div><CardTitle className="text-base sm:text-xl text-[#2C415C]">Penerimaan Sah (Transfer Masuk)</CardTitle></div>
                <Dialog open={isDialogMasukOpen} onOpenChange={(open) => { setIsDialogMasukOpen(open); if(!open) resetFormMasuk(); }}>
                  <DialogTrigger asChild><Button className="bg-[#D48B10] hover:bg-[#b0730d] text-white shadow-md text-xs sm:text-sm h-8 sm:h-10">+ Tambah</Button></DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] h-[90vh] sm:h-auto overflow-y-auto" style={{ fontFamily: modernFont }}>
                    <DialogHeader><DialogTitle>{formMasuk.id ? "Edit" : "Tambah"} Penerimaan Daerah</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2"><Label>No BAST Resmi</Label><Input value={formMasuk.noBast} onChange={(e) => setFormMasuk({...formMasuk, noBast: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>Tanggal Terima</Label><Input type="date" value={formMasuk.tanggal} onChange={(e) => setFormMasuk({...formMasuk, tanggal: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>Satker Pengirim</Label><Input value={formMasuk.pengirim} onChange={(e) => setFormMasuk({...formMasuk, pengirim: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>Nama Barang</Label><Input value={formMasuk.barang} onChange={(e) => setFormMasuk({...formMasuk, barang: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>Jumlah Diterima (Kondisi Baik)</Label><Input type="number" value={formMasuk.jumlah} onChange={(e) => setFormMasuk({...formMasuk, jumlah: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>BAST (PDF)</Label><Input type="file" accept=".pdf" onChange={(e) => setFileMasuk(e.target.files?.[0] || null)} /></div>
                    </div>
                    <DialogFooter><Button onClick={handleSaveMasuk} className="bg-[#D48B10] hover:bg-[#b0730d] text-white w-full">Simpan Data</Button></DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <div className="flex-1 bg-white rounded-b-xl relative overflow-x-auto overflow-y-auto">
                <Table className="min-w-[800px]">
                  <TableHeader className="sticky top-0 z-10 bg-slate-100 shadow-sm border-b border-slate-200">
                    <TableRow>
                      <TableHead className="px-4 py-3 bg-slate-100 whitespace-nowrap">No BAST</TableHead>
                      <TableHead className="py-3 bg-slate-100 cursor-pointer whitespace-nowrap" onClick={() => requestSort('tanggal')}><div className="flex items-center">Tanggal {getSortIcon('tanggal')}</div></TableHead>
                      <TableHead className="py-3 bg-slate-100 cursor-pointer whitespace-nowrap" onClick={() => requestSort('pengirim')}><div className="flex items-center">Pengirim {getSortIcon('pengirim')}</div></TableHead>
                      <TableHead className="py-3 bg-slate-100 cursor-pointer whitespace-nowrap" onClick={() => requestSort('barang')}><div className="flex items-center">Barang {getSortIcon('barang')}</div></TableHead>
                      <TableHead className="py-3 bg-slate-100 text-center whitespace-nowrap">Jumlah</TableHead>
                      <TableHead className="text-center py-3 bg-slate-100 whitespace-nowrap">Dokumen</TableHead>
                      <TableHead className="text-right px-4 py-3 bg-slate-100">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedMasuk.map((item) => (
                      <TableRow key={item.id} className="hover:bg-slate-50/50">
                        <TableCell className="px-4 font-medium text-slate-700 whitespace-nowrap">{item.noBast}</TableCell><TableCell className="whitespace-nowrap">{item.tanggal}</TableCell><TableCell className="whitespace-nowrap">{item.pengirim}</TableCell><TableCell className="whitespace-nowrap">{item.barang}</TableCell>
                        <TableCell className="text-center font-bold bg-slate-50">{formatAngka(item.jumlah)} pcs</TableCell>
                        <TableCell className="text-center"><Button variant="ghost" size="sm" onClick={() => setViewDocument(item)}><FileText size={16} className="text-[#D48B10]" /></Button></TableCell>
                        <TableCell className="text-right px-4 space-x-2 whitespace-nowrap">
                          <Button variant="outline" size="icon" onClick={() => { setFormMasuk({ id: item.id, noBast: item.noBast, tanggal: item.tanggal, pengirim: item.pengirim, barang: item.barang, jumlah: item.jumlah.toString() }); setIsDialogMasukOpen(true); }}><Pencil size={16} className="text-amber-600" /></Button>
                          <Button variant="outline" size="icon" onClick={() => { if(confirm("Hapus?")) deleteTransferMasuk(item.id).then(loadData) }}><Trash2 size={16} className="text-red-600" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}

        </div>
      </main>

      {/* VIEW DOKUMEN MODAL */}
      <Dialog open={!!viewDocument} onOpenChange={() => setViewDocument(null)}>
        <DialogContent className="sm:max-w-[425px] w-[90vw]" style={{ fontFamily: modernFont }}>
          <DialogHeader><DialogTitle>Pratinjau Dokumen</DialogTitle></DialogHeader>
          <div className="flex flex-col items-center p-6 sm:p-8 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg">
            <FileText size={48} className="text-[#D48B10] mb-4" />
            <p className="text-xs sm:text-sm mb-6 text-slate-600 text-center">{viewDocument?.dokumen ? "Dokumen tersedia di server cloud" : "Tidak ada file PDF terlampir"}</p>
            {viewDocument?.dokumen && (
              <a href={viewDocument.dokumen} target="_blank" rel="noopener noreferrer" className="bg-[#D48B10] hover:bg-[#b0730d] text-white px-6 py-2 rounded-md flex items-center gap-2 transition-colors shadow-md text-sm">
                <ExternalLink size={16} /> Buka PDF Asli
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )

  function resetFormPembelian() { setFormData({ id: "", noBast: "", tanggal: "", barang: "", penyedia: "", baik: "", rusakRingan: "", rusakBerat: "" }); setCheckBaik(false); setCheckRR(false); setCheckRB(false); setFile(null); }
  function resetFormPemakaian() { setFormPemakaian({ id: "", noBukti: "", tanggal: "", nama: "", kegiatan: "", barang: "", jumlah: "" }); setPemakaianItems([]); setFilePemakaian(null); }
  function resetFormTransfer() { setFormTransfer({ id: "", noBast: "", tanggal: "", tujuan: "", barang: "", jumlah: "", status: "Dikirim" }); setTransferItems([]); setFileTransfer(null); }
  function resetFormMasuk() { setFormMasuk({ id: "", noBast: "", tanggal: "", pengirim: "BPS Provinsi Aceh", barang: "", jumlah: "" }); setFileMasuk(null); }
}
