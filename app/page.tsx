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
  ArrowUpDown, ArrowUp, ArrowDown
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

  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeMenu, setActiveMenu] = useState("dashboard")
  const [viewDocument, setViewDocument] = useState<any>(null)
  const [sortConfig, setSortConfig] = useState<{ key: string | null, direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });

  // --- States CRUD ---
  const [dataPembelian, setDataPembelian] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({ id: "", noBast: "", tanggal: "", barang: "", jumlah: "", penyedia: "" })
  const [file, setFile] = useState<File | null>(null)

  const [dataPemakaian, setDataPemakaian] = useState<any[]>([])
  const [isDialogPemakaianOpen, setIsDialogPemakaianOpen] = useState(false)
  const [formPemakaian, setFormPemakaian] = useState({ id: "", noBukti: "", tanggal: "", nama: "", kegiatan: "", barang: "", jumlah: "" })
  const [filePemakaian, setFilePemakaian] = useState<File | null>(null)

  const [dataTransfer, setDataTransfer] = useState<any[]>([])
  const [isDialogTransferOpen, setIsDialogTransferOpen] = useState(false)
  const [formTransfer, setFormTransfer] = useState({ id: "", noBast: "", tanggal: "", tujuan: "", barang: "", jumlah: "", status: "Dikirim" })
  const [transferItems, setTransferItems] = useState<{barang: string, jumlah: string}[]>([]) // State multi-item
  const [fileTransfer, setFileTransfer] = useState<File | null>(null)

  const [dataMasuk, setDataMasuk] = useState<any[]>([])
  const [isDialogMasukOpen, setIsDialogMasukOpen] = useState(false)
  const [formMasuk, setFormMasuk] = useState({ id: "", noBast: "", tanggal: "", pengirim: "BPS Provinsi Aceh", barang: "", jumlah: "" })
  const [fileMasuk, setFileMasuk] = useState<File | null>(null)

  useEffect(() => {
    const session = sessionStorage.getItem("appSession");
    if (session === "aktif") { setIsLoggedIn(true); loadData(); }
    setIsCheckingSession(false);
  }, [])

  useEffect(() => { if (isLoggedIn) loadData(); }, [isLoggedIn])
  useEffect(() => { setSortConfig({ key: null, direction: 'asc' }) }, [activeMenu])

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

  const uniqueBarangMap = new Map();
  dataPembelian.forEach(item => {
    if (item.barang) {
      const key = item.barang.trim().toLowerCase();
      if (!uniqueBarangMap.has(key)) uniqueBarangMap.set(key, item.barang.trim());
    }
  });

  const dynamicStats = Array.from(uniqueBarangMap.entries()).map(([key, originalName]) => {
    const masuk = dataPembelian.filter(i => i.barang?.toLowerCase().trim() === key).reduce((sum, i) => sum + i.jumlah, 0);
    const pakai = dataPemakaian.filter(i => i.barang?.toLowerCase().trim() === key).reduce((sum, i) => sum + i.jumlah, 0);
    const transfer = dataTransfer.filter(i => i.barang?.toLowerCase().trim() === key).reduce((sum, i) => sum + i.jumlah, 0);
    const totalKeluar = pakai + transfer; const sisa = masuk - totalKeluar;
    return { name: originalName, masuk, keluar: totalKeluar, sisa: sisa > 0 ? sisa : 0 };
  });

  // --- Handlers CRUD ---
  const handleSavePembelian = async () => {
    const dataToSend = new FormData(); dataToSend.append("noBast", formData.noBast); dataToSend.append("tanggal", formData.tanggal); dataToSend.append("barang", formData.barang); dataToSend.append("jumlah", formData.jumlah); dataToSend.append("penyedia", formData.penyedia); if (file) dataToSend.append("dokumen", file);
    try { if (formData.id) await updatePembelian(formData.id, dataToSend); else await addPembelian(dataToSend); await loadData(); setIsDialogOpen(false); resetFormPembelian(); alert("Berhasil simpan pembelian!") } catch (error) { alert("Gagal simpan pembelian") }
  }

  const handleSavePemakaian = async () => {
    const dataToSend = new FormData(); dataToSend.append("noBukti", formPemakaian.noBukti); dataToSend.append("tanggal", formPemakaian.tanggal); dataToSend.append("nama", formPemakaian.nama); dataToSend.append("kegiatan", formPemakaian.kegiatan); dataToSend.append("barang", formPemakaian.barang); dataToSend.append("jumlah", formPemakaian.jumlah); if (filePemakaian) dataToSend.append("dokumen", filePemakaian);
    try { if (formPemakaian.id) await updatePemakaian(formPemakaian.id, dataToSend); else await addPemakaian(dataToSend); await loadData(); setIsDialogPemakaianOpen(false); resetFormPemakaian(); alert("Berhasil simpan pemakaian!") } catch (error) { alert("Gagal simpan pemakaian") }
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
      // Jika mode Edit (Update tunggal)
      dataToSend.append("barang", formTransfer.barang);
      dataToSend.append("jumlah", formTransfer.jumlah);
      try { await updateTransferKeluar(formTransfer.id, dataToSend); } catch(e) { return alert("Gagal update transfer!"); }
    } else {
      // Jika mode Tambah (Multi item array)
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

  if (isCheckingSession) return null;

  if (!isLoggedIn) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: "#D48B10", fontFamily: modernFont }}>
        <div className="bg-white p-8 rounded-xl shadow-2xl w-[320px] sm:w-[380px] flex flex-col items-center">
          <img src="/logo-bps.png" alt="Logo BPS" className="h-20 mb-8 object-contain" />
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

      <aside className={`${isSidebarOpen ? "w-64" : "w-20"} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col shadow-sm z-30`}>
        <div className="p-4 border-b h-20 flex items-center justify-center gap-3">
          <div className="bg-[#D48B10] p-2 rounded-lg text-white"><LayoutDashboard size={20} /></div>
          {isSidebarOpen && <span className="font-bold text-[#2C415C] whitespace-nowrap overflow-hidden tracking-wide">MONEV-SE</span>}
        </div>
        <div className="flex-1 py-4 px-3 flex flex-col gap-2 overflow-y-auto">
          <button onClick={() => setActiveMenu("dashboard")} title="Dashboard" className={`flex items-center w-full p-3 rounded-lg transition-colors ${activeMenu === "dashboard" ? "bg-[#D48B10] text-white shadow-md" : "text-slate-500 hover:bg-slate-100"}`}>
            <div className="min-w-5"><PieChartIcon size={20} /></div> {isSidebarOpen && <span className="ml-3 font-medium whitespace-nowrap overflow-hidden">Dashboard</span>}
          </button>
          <button onClick={() => setActiveMenu("pembelian")} title="Pembelian" className={`flex items-center w-full p-3 rounded-lg transition-colors ${activeMenu === "pembelian" ? "bg-[#D48B10] text-white shadow-md" : "text-slate-500 hover:bg-slate-100"}`}>
            <div className="min-w-5"><ShoppingCart size={20} /></div> {isSidebarOpen && <span className="ml-3 font-medium whitespace-nowrap overflow-hidden">Pembelian</span>}
          </button>
          <button onClick={() => setActiveMenu("pemakaian")} title="Pemakaian Internal" className={`flex items-center w-full p-3 rounded-lg transition-colors ${activeMenu === "pemakaian" ? "bg-[#D48B10] text-white shadow-md" : "text-slate-500 hover:bg-slate-100"}`}>
            <div className="min-w-5"><PackageMinus size={20} /></div> {isSidebarOpen && <span className="ml-3 font-medium whitespace-nowrap overflow-hidden">Pemakaian Internal</span>}
          </button>
          <button onClick={() => setActiveMenu("transfer")} title="Transfer Keluar" className={`flex items-center w-full p-3 rounded-lg transition-colors ${activeMenu === "transfer" ? "bg-[#D48B10] text-white shadow-md" : "text-slate-500 hover:bg-slate-100"}`}>
            <div className="min-w-5"><ArrowUpFromLine size={20} /></div> {isSidebarOpen && <span className="ml-3 font-medium whitespace-nowrap overflow-hidden">Transfer Keluar</span>}
          </button>
          <button onClick={() => setActiveMenu("masuk")} title="Transfer Masuk" className={`flex items-center w-full p-3 rounded-lg transition-colors ${activeMenu === "masuk" ? "bg-[#D48B10] text-white shadow-md" : "text-slate-500 hover:bg-slate-100"}`}>
            <div className="min-w-5"><ArrowDownToLine size={20} /></div> {isSidebarOpen && <span className="ml-3 font-medium whitespace-nowrap overflow-hidden">Transfer Masuk</span>}
          </button>
        </div>
        <div className="p-4 border-t">
          <button onClick={handleLogout} title="Keluar" className="flex items-center text-red-500 gap-3 p-2 w-full hover:bg-red-50 rounded-lg transition-colors">
            <div className="min-w-5"><LogOut size={20} /></div> {isSidebarOpen && <span className="whitespace-nowrap overflow-hidden font-medium">Keluar</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 bg-white shadow-sm border-b flex items-center px-6 justify-between z-20 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-md hover:bg-slate-100 text-slate-600 transition-colors"><Menu size={24} /></button>
            <h1 className="text-xl font-bold text-[#2C415C] hidden sm:block tracking-wide">BPS PROVINSI ACEH</h1>
          </div>
          <div className="flex items-center gap-2 text-sm bg-slate-100 px-4 py-2 rounded-full font-medium text-[#2C415C]"><User size={16} /> Admin</div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#D9D9D9] relative flex flex-col">

          {/* MENU DASHBOARD */}
          {activeMenu === "dashboard" && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-xl sm:text-2xl font-bold text-[#2C415C]">Dashboard Visualisasi Logistik</h2>
                <p className="text-sm sm:text-base text-slate-500 mt-1">Angka dan diagram ter-update otomatis menyesuaikan jenis barang yang diinput.</p>
              </div>

              {dynamicStats.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-xl shadow-sm border-2 border-dashed border-slate-200">
                  <PieChartIcon size={48} className="mx-auto text-slate-300 mb-4" />
                  <h3 className="text-lg font-medium text-slate-700">Belum Ada Data Pembelian</h3>
                  <p className="text-slate-500">Input data di menu Pembelian terlebih dahulu untuk memunculkan grafik.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                  {dynamicStats.map((stat, index) => {
                    const colorPilih = CHART_COLORS[index % CHART_COLORS.length];
                    const chartData = [
                      { name: 'Terdistribusi / Dipakai', value: stat.keluar, color: '#e2e8f0' },
                      { name: 'Sisa Stock (Provinsi)', value: stat.sisa, color: colorPilih }
                    ];
                    return (
                      <Card key={index} className="shadow-sm border-none rounded-xl">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg truncate text-[#2C415C]" title={stat.name}>{stat.name}</CardTitle>
                          <p className="text-sm text-slate-500">Total Stock Awal: <b className="text-slate-700">{formatAngka(stat.masuk)}</b></p>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center">
                          <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                                  {chartData.map((entry, idx) => (<Cell key={`cell-${idx}`} fill={entry.color} />))}
                                </Pie>
                                <Tooltip formatter={(value) => formatAngka(value as number)} />
                                <Legend verticalAlign="bottom" height={36}/>
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
              <CardHeader className="flex flex-row items-center justify-between shrink-0 bg-white rounded-t-xl z-20 border-b border-slate-100">
                <div><CardTitle className="text-[#2C415C]">Data Pembelian (Penerimaan Provinsi)</CardTitle></div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) resetFormPembelian(); }}>
                  <DialogTrigger asChild><Button className="bg-[#D48B10] hover:bg-[#b0730d] text-white shadow-md">+ Tambah</Button></DialogTrigger>
                  <DialogContent style={{ fontFamily: modernFont }}>
                    <DialogHeader><DialogTitle>{formData.id ? "Edit" : "Tambah"} Pembelian</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2"><Label>No BAST</Label><Input value={formData.noBast} onChange={(e) => setFormData({...formData, noBast: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>Tanggal BAST</Label><Input type="date" value={formData.tanggal} onChange={(e) => setFormData({...formData, tanggal: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>Nama Barang</Label><Input placeholder="Contoh: Meteran, Rompi, Stiker..." value={formData.barang} onChange={(e) => setFormData({...formData, barang: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>Jumlah Barang</Label><Input type="number" value={formData.jumlah} onChange={(e) => setFormData({...formData, jumlah: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>Nama Penyedia</Label><Input value={formData.penyedia} onChange={(e) => setFormData({...formData, penyedia: e.target.value})} /></div>
                      {/* Nama Label Dokumen Pengadaan */}
                      <div className="grid gap-2"><Label>Dokumen Pengadaan (PDF)</Label><Input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} /></div>
                    </div>
                    <DialogFooter><Button onClick={handleSavePembelian} className="bg-[#D48B10] hover:bg-[#b0730d] text-white w-full">Simpan</Button></DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <div className="flex-1 bg-white rounded-b-xl relative overflow-hidden [&>div]:absolute [&>div]:inset-0 [&>div]:overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 z-20 bg-slate-100 shadow-sm border-b border-slate-200">
                    <TableRow>
                      <TableHead className="px-6 py-4 bg-slate-100">No BAST</TableHead>
                      <TableHead className="py-4 bg-slate-100 cursor-pointer hover:bg-slate-200/50 transition-colors" onClick={() => requestSort('tanggal')}><div className="flex items-center">Tanggal {getSortIcon('tanggal')}</div></TableHead>
                      <TableHead className="py-4 bg-slate-100 cursor-pointer hover:bg-slate-200/50 transition-colors" onClick={() => requestSort('barang')}><div className="flex items-center">Nama Barang {getSortIcon('barang')}</div></TableHead>
                      <TableHead className="py-4 bg-slate-100">Jumlah</TableHead>
                      <TableHead className="py-4 bg-slate-100">Penyedia</TableHead>
                      <TableHead className="text-center py-4 bg-slate-100">Dok. Pengadaan</TableHead>
                      <TableHead className="text-right px-6 py-4 bg-slate-100">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedPembelian.map((item) => (
                      <TableRow key={item.id} className="hover:bg-slate-50/50">
                        {/* Satuan diubah jadi pcs */}
                        <TableCell className="px-6 font-medium text-slate-700">{item.noBast}</TableCell><TableCell>{item.tanggal}</TableCell><TableCell>{item.barang}</TableCell><TableCell>{formatAngka(item.jumlah)} pcs</TableCell><TableCell>{item.penyedia}</TableCell>
                        <TableCell className="text-center"><Button variant="ghost" size="sm" onClick={() => setViewDocument(item)}><FileText size={16} className="text-[#D48B10]" /></Button></TableCell>
                        <TableCell className="text-right px-6 space-x-2">
                          <Button variant="outline" size="icon" onClick={() => { setFormData({ id: item.id, noBast: item.noBast, tanggal: item.tanggal, barang: item.barang || "", jumlah: item.jumlah.toString(), penyedia: item.penyedia }); setIsDialogOpen(true); }}><Pencil size={16} className="text-amber-600" /></Button>
                          <Button variant="outline" size="icon" onClick={() => { if(confirm("Hapus?")) deletePembelian(item.id).then(loadData) }}><Trash2 size={16} className="text-red-600" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}

          {/* MENU PEMAKAIAN */}
          {activeMenu === "pemakaian" && (
            <Card className="shadow-sm border-none rounded-xl flex flex-col flex-1 min-h-0">
              <CardHeader className="flex flex-row items-center justify-between shrink-0 bg-white rounded-t-xl z-20 border-b border-slate-100">
                <div><CardTitle className="text-[#2C415C]">Data Pemakaian Internal</CardTitle></div>
                <Dialog open={isDialogPemakaianOpen} onOpenChange={(open) => { setIsDialogPemakaianOpen(open); if(!open) resetFormPemakaian(); }}>
                  <DialogTrigger asChild><Button className="bg-[#D48B10] hover:bg-[#b0730d] text-white shadow-md">+ Tambah</Button></DialogTrigger>
                  <DialogContent style={{ fontFamily: modernFont }}>
                    <DialogHeader><DialogTitle>{formPemakaian.id ? "Edit" : "Tambah"} Pemakaian</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                      {/* Field Baru: No Bukti */}
                      <div className="grid gap-2"><Label>No Bukti (Bon)</Label><Input placeholder="Nomor Bukti Pengambilan" value={formPemakaian.noBukti} onChange={(e) => setFormPemakaian({...formPemakaian, noBukti: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>Tanggal Pakai</Label><Input type="date" value={formPemakaian.tanggal} onChange={(e) => setFormPemakaian({...formPemakaian, tanggal: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>Nama Pegawai</Label><Input value={formPemakaian.nama} onChange={(e) => setFormPemakaian({...formPemakaian, nama: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>Keperluan</Label><Input value={formPemakaian.kegiatan} onChange={(e) => setFormPemakaian({...formPemakaian, kegiatan: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>Nama Barang</Label><Input value={formPemakaian.barang} onChange={(e) => setFormPemakaian({...formPemakaian, barang: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>Jumlah</Label><Input type="number" value={formPemakaian.jumlah} onChange={(e) => setFormPemakaian({...formPemakaian, jumlah: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>Bon Pengambilan (PDF)</Label><Input type="file" accept=".pdf" onChange={(e) => setFilePemakaian(e.target.files?.[0] || null)} /></div>
                    </div>
                    <DialogFooter><Button onClick={handleSavePemakaian} className="bg-[#D48B10] hover:bg-[#b0730d] text-white w-full">Simpan</Button></DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <div className="flex-1 bg-white rounded-b-xl relative overflow-hidden [&>div]:absolute [&>div]:inset-0 [&>div]:overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 z-20 bg-slate-100 shadow-sm border-b border-slate-200">
                    <TableRow>
                      <TableHead className="px-6 py-4 bg-slate-100">No Bukti</TableHead>
                      <TableHead className="py-4 bg-slate-100 cursor-pointer hover:bg-slate-200/50 transition-colors" onClick={() => requestSort('tanggal')}><div className="flex items-center">Tanggal {getSortIcon('tanggal')}</div></TableHead>
                      <TableHead className="py-4 bg-slate-100">Nama Pegawai</TableHead>
                      <TableHead className="py-4 bg-slate-100 cursor-pointer hover:bg-slate-200/50 transition-colors" onClick={() => requestSort('barang')}><div className="flex items-center">Nama Barang {getSortIcon('barang')}</div></TableHead>
                      <TableHead className="py-4 bg-slate-100">Jumlah</TableHead>
                      <TableHead className="text-center py-4 bg-slate-100">Dokumen</TableHead>
                      <TableHead className="text-right px-6 py-4 bg-slate-100">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedPemakaian.map((item) => (
                      <TableRow key={item.id} className="hover:bg-slate-50/50">
                        <TableCell className="px-6 font-medium text-slate-700">{item.noBukti}</TableCell><TableCell>{item.tanggal}</TableCell><TableCell>{item.nama}</TableCell><TableCell>{item.barang}</TableCell><TableCell>{formatAngka(item.jumlah)} pcs</TableCell>
                        <TableCell className="text-center"><Button variant="ghost" size="sm" onClick={() => setViewDocument(item)}><FileText size={16} className="text-[#D48B10]" /></Button></TableCell>
                        <TableCell className="text-right px-6 space-x-2">
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
              <CardHeader className="flex flex-row items-center justify-between shrink-0 bg-white rounded-t-xl z-20 border-b border-slate-100">
                <div><CardTitle className="text-[#2C415C]">Transfer Keluar (Distribusi)</CardTitle></div>
                <Dialog open={isDialogTransferOpen} onOpenChange={(open) => { setIsDialogTransferOpen(open); if(!open) resetFormTransfer(); }}>
                  <DialogTrigger asChild><Button className="bg-[#D48B10] hover:bg-[#b0730d] text-white shadow-md">+ Tambah</Button></DialogTrigger>
                  <DialogContent style={{ fontFamily: modernFont }}>
                    <DialogHeader><DialogTitle>{formTransfer.id ? "Edit" : "Tambah"} Transfer Keluar</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2"><Label>No BAST</Label><Input placeholder="Nomor BAST Serah Terima" value={formTransfer.noBast} onChange={(e) => setFormTransfer({...formTransfer, noBast: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>Tanggal</Label><Input type="date" value={formTransfer.tanggal} onChange={(e) => setFormTransfer({...formTransfer, tanggal: e.target.value})} /></div>
                      <div className="grid gap-2">
                        <Label>Tujuan (Kab/Kota)</Label>
                        <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950" value={formTransfer.tujuan} onChange={(e) => setFormTransfer({...formTransfer, tujuan: e.target.value})}>
                          <option value="" disabled>Pilih Tujuan...</option>
                          {DAFTAR_KABKOTA.map((kab) => (<option key={kab} value={kab}>{kab}</option>))}
                        </select>
                      </div>

                      {/* LOGIKA CHECKBOX BATCH INPUT */}
                      <div className="grid gap-2">
                        <Label>Barang yang Dikirim</Label>
                        {formTransfer.id ? (
                          // Mode Edit: Hanya tampilkan barang dan jumlah 1 persatu
                          <>
                            <Input value={formTransfer.barang} disabled className="bg-slate-100 cursor-not-allowed" />
                            <Input type="number" placeholder="Jumlah" value={formTransfer.jumlah} onChange={(e) => setFormTransfer({...formTransfer, jumlah: e.target.value})} />
                          </>
                        ) : (
                          // Mode Tambah: Tampilkan checkbox dari barang yang ada
                          <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-md p-3 space-y-3 bg-slate-50">
                            {Array.from(uniqueBarangMap.values()).map((barangStr) => {
                              const isChecked = transferItems.some(i => i.barang === barangStr);
                              const currentItem = transferItems.find(i => i.barang === barangStr);
                              return (
                                <div key={barangStr as string} className="flex items-center gap-3 bg-white p-2 rounded border shadow-sm">
                                  <input
                                    type="checkbox"
                                    className="w-4 h-4 accent-[#D48B10]"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      if (e.target.checked) setTransferItems([...transferItems, { barang: barangStr as string, jumlah: "" }]);
                                      else setTransferItems(transferItems.filter(i => i.barang !== barangStr));
                                    }}
                                  />
                                  <Label className="flex-1 cursor-pointer">{barangStr as string}</Label>
                                  {isChecked && (
                                    <Input
                                      type="number"
                                      placeholder="Jumlah (pcs)"
                                      className="w-28 h-8 text-sm"
                                      value={currentItem?.jumlah || ""}
                                      onChange={(e) => {
                                        setTransferItems(transferItems.map(i => i.barang === barangStr ? { ...i, jumlah: e.target.value } : i));
                                      }}
                                    />
                                  )}
                                </div>
                              )
                            })}
                            {uniqueBarangMap.size === 0 && <p className="text-xs text-slate-500 italic text-center">Belum ada barang di Data Pembelian</p>}
                          </div>
                        )}
                      </div>

                      <div className="grid gap-2">
                        <Label>Status Pengiriman</Label>
                        <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950" value={formTransfer.status} onChange={(e) => setFormTransfer({...formTransfer, status: e.target.value})}>
                          <option value="Dikirim">Dikirim</option>
                          <option value="Diterima">Diterima</option>
                        </select>
                      </div>
                      <div className="grid gap-2"><Label>Dokumen BAST (PDF)</Label><Input type="file" accept=".pdf" onChange={(e) => setFileTransfer(e.target.files?.[0] || null)} /></div>
                    </div>
                    <DialogFooter><Button onClick={handleSaveTransfer} className="bg-[#D48B10] hover:bg-[#b0730d] text-white w-full">Simpan</Button></DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <div className="flex-1 bg-white rounded-b-xl relative overflow-hidden [&>div]:absolute [&>div]:inset-0 [&>div]:overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 z-20 bg-slate-100 shadow-sm border-b border-slate-200">
                    <TableRow>
                      <TableHead className="px-6 py-4 bg-slate-100">No BAST</TableHead>
                      <TableHead className="py-4 bg-slate-100 cursor-pointer hover:bg-slate-200/50 transition-colors" onClick={() => requestSort('tanggal')}><div className="flex items-center">Tanggal {getSortIcon('tanggal')}</div></TableHead>
                      <TableHead className="py-4 bg-slate-100 cursor-pointer hover:bg-slate-200/50 transition-colors" onClick={() => requestSort('tujuan')}><div className="flex items-center">Tujuan {getSortIcon('tujuan')}</div></TableHead>
                      <TableHead className="py-4 bg-slate-100 cursor-pointer hover:bg-slate-200/50 transition-colors" onClick={() => requestSort('barang')}><div className="flex items-center">Barang {getSortIcon('barang')}</div></TableHead>
                      <TableHead className="py-4 bg-slate-100">Jumlah</TableHead>
                      <TableHead className="text-center py-4 bg-slate-100">Status</TableHead>
                      <TableHead className="text-center py-4 bg-slate-100">Dokumen</TableHead>
                      <TableHead className="text-right px-6 py-4 bg-slate-100">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedTransfer.map((item) => (
                      <TableRow key={item.id} className="hover:bg-slate-50/50">
                        <TableCell className="px-6 font-medium text-slate-700">{item.noBast}</TableCell><TableCell>{item.tanggal}</TableCell><TableCell>{item.tujuan}</TableCell><TableCell>{item.barang}</TableCell><TableCell>{formatAngka(item.jumlah)} pcs</TableCell>
                        <TableCell className="text-center"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.status === 'Diterima' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{item.status}</span></TableCell>
                        <TableCell className="text-center"><Button variant="ghost" size="sm" onClick={() => setViewDocument(item)}><FileText size={16} className="text-[#D48B10]" /></Button></TableCell>
                        <TableCell className="text-right px-6 space-x-2">
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
              <CardHeader className="flex flex-row items-center justify-between shrink-0 bg-white rounded-t-xl z-20 border-b border-slate-100">
                <div><CardTitle className="text-[#2C415C]">Transfer Masuk (Penerimaan Sah)</CardTitle></div>
                <Dialog open={isDialogMasukOpen} onOpenChange={(open) => { setIsDialogMasukOpen(open); if(!open) resetFormMasuk(); }}>
                  <DialogTrigger asChild><Button className="bg-[#D48B10] hover:bg-[#b0730d] text-white shadow-md">+ Tambah</Button></DialogTrigger>
                  <DialogContent style={{ fontFamily: modernFont }}>
                    <DialogHeader><DialogTitle>{formMasuk.id ? "Edit" : "Tambah"} Transfer Masuk</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2"><Label>No BAST Resmi</Label><Input value={formMasuk.noBast} onChange={(e) => setFormMasuk({...formMasuk, noBast: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>Tanggal Terima</Label><Input type="date" value={formMasuk.tanggal} onChange={(e) => setFormMasuk({...formMasuk, tanggal: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>Satker Pengirim</Label><Input value={formMasuk.pengirim} onChange={(e) => setFormMasuk({...formMasuk, pengirim: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>Nama Barang</Label><Input value={formMasuk.barang} onChange={(e) => setFormMasuk({...formMasuk, barang: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>Jumlah Diterima</Label><Input type="number" value={formMasuk.jumlah} onChange={(e) => setFormMasuk({...formMasuk, jumlah: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>BAST (PDF)</Label><Input type="file" accept=".pdf" onChange={(e) => setFileMasuk(e.target.files?.[0] || null)} /></div>
                    </div>
                    <DialogFooter><Button onClick={handleSaveMasuk} className="bg-[#D48B10] hover:bg-[#b0730d] text-white w-full">Simpan</Button></DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <div className="flex-1 bg-white rounded-b-xl relative overflow-hidden [&>div]:absolute [&>div]:inset-0 [&>div]:overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 z-20 bg-slate-100 shadow-sm border-b border-slate-200">
                    <TableRow>
                      <TableHead className="px-6 py-4 bg-slate-100">No BAST</TableHead>
                      <TableHead className="py-4 bg-slate-100 cursor-pointer hover:bg-slate-200/50 transition-colors" onClick={() => requestSort('tanggal')}><div className="flex items-center">Tanggal {getSortIcon('tanggal')}</div></TableHead>
                      <TableHead className="py-4 bg-slate-100 cursor-pointer hover:bg-slate-200/50 transition-colors" onClick={() => requestSort('pengirim')}><div className="flex items-center">Pengirim {getSortIcon('pengirim')}</div></TableHead>
                      <TableHead className="py-4 bg-slate-100 cursor-pointer hover:bg-slate-200/50 transition-colors" onClick={() => requestSort('barang')}><div className="flex items-center">Barang {getSortIcon('barang')}</div></TableHead>
                      <TableHead className="py-4 bg-slate-100">Jumlah</TableHead>
                      <TableHead className="text-center py-4 bg-slate-100">Dokumen</TableHead>
                      <TableHead className="text-right px-6 py-4 bg-slate-100">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedMasuk.map((item) => (
                      <TableRow key={item.id} className="hover:bg-slate-50/50">
                        <TableCell className="px-6 font-medium text-slate-700">{item.noBast}</TableCell><TableCell>{item.tanggal}</TableCell><TableCell>{item.pengirim}</TableCell><TableCell>{item.barang}</TableCell><TableCell>{formatAngka(item.jumlah)} pcs</TableCell>
                        <TableCell className="text-center"><Button variant="ghost" size="sm" onClick={() => setViewDocument(item)}><FileText size={16} className="text-[#D48B10]" /></Button></TableCell>
                        <TableCell className="text-right px-6 space-x-2">
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
        <DialogContent style={{ fontFamily: modernFont }}>
          <DialogHeader><DialogTitle>Pratinjau Dokumen</DialogTitle></DialogHeader>
          <div className="flex flex-col items-center p-8 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg">
            <FileText size={48} className="text-[#D48B10] mb-4" />
            <p className="text-sm mb-6 text-slate-600">{viewDocument?.dokumen ? "Dokumen tersedia di server cloud" : "Tidak ada file PDF terlampir"}</p>
            {viewDocument?.dokumen && (
              <a href={viewDocument.dokumen} target="_blank" rel="noopener noreferrer" className="bg-[#D48B10] hover:bg-[#b0730d] text-white px-6 py-2 rounded-md flex items-center gap-2 transition-colors shadow-md">
                <ExternalLink size={16} /> Buka PDF Asli
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )

  function resetFormPembelian() { setFormData({ id: "", noBast: "", tanggal: "", barang: "", jumlah: "", penyedia: "" }); setFile(null); }
  function resetFormPemakaian() { setFormPemakaian({ id: "", noBukti: "", tanggal: "", nama: "", kegiatan: "", barang: "", jumlah: "" }); setFilePemakaian(null); }
  function resetFormTransfer() { setFormTransfer({ id: "", noBast: "", tanggal: "", tujuan: "", barang: "", jumlah: "", status: "Dikirim" }); setTransferItems([]); setFileTransfer(null); }
  function resetFormMasuk() { setFormMasuk({ id: "", noBast: "", tanggal: "", pengirim: "BPS Provinsi Aceh", barang: "", jumlah: "" }); setFileMasuk(null); }
}
