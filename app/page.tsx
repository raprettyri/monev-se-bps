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
  User, Pencil, Trash2, FileText, ExternalLink, ArrowUpFromLine, ArrowDownToLine, PieChart as PieChartIcon
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"

// IMPORT UNTUK GRAFIK
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

const DAFTAR_KABKOTA = [
  "Simeulue", "Aceh Singkil", "Aceh Selatan", "Aceh Tenggara", "Aceh Timur",
  "Aceh Tengah", "Aceh Barat", "Aceh Besar", "Pidie", "Bireuen",
  "Aceh Utara", "Aceh Barat Daya", "Gayo Lues", "Aceh Tamiang", "Nagan Raya",
  "Aceh Jaya", "Bener Meriah", "Pidie Jaya", "Kota Banda Aceh", "Kota Sabang",
  "Kota Langsa", "Kota Lhokseumawe", "Kota Subulussalam"
];

// DATA DUMMY DASHBOARD (Sesuai Gambar Excel)
const dummyStiker = [
  { name: 'Terdistribusi (Kab/Kota)', value: 1630670, color: '#3b82f6' }, // Biru
  { name: 'Sisa Stock (Provinsi)', value: 181310, color: '#cbd5e1' }      // Abu-abu
];
const dummySpidol = [
  { name: 'Terdistribusi (Kab/Kota)', value: 8552, color: '#10b981' },   // Hijau
  { name: 'Sisa Stock (Provinsi)', value: 952, color: '#cbd5e1' }
];
const dummyRompi = [
  { name: 'Terdistribusi (Kab/Kota)', value: 4489, color: '#f59e0b' },   // Kuning/Amber
  { name: 'Sisa Stock (Provinsi)', value: 501, color: '#cbd5e1' }
];

// Helper format angka ribuan (titik)
const formatAngka = (angka: number) => new Intl.NumberFormat('id-ID').format(angka);

export default function MonevApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeMenu, setActiveMenu] = useState("dashboard") // Default menu sekarang Dashboard
  const [viewDocument, setViewDocument] = useState<any>(null)

  // --- States ---
  const [dataPembelian, setDataPembelian] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({ id: "", noBast: "", tanggal: "", barang: "", jumlah: "", penyedia: "" })
  const [file, setFile] = useState<File | null>(null)

  const [dataPemakaian, setDataPemakaian] = useState<any[]>([])
  const [isDialogPemakaianOpen, setIsDialogPemakaianOpen] = useState(false)
  const [formPemakaian, setFormPemakaian] = useState({ id: "", tanggal: "", nama: "", kegiatan: "", barang: "", jumlah: "" })
  const [filePemakaian, setFilePemakaian] = useState<File | null>(null)

  const [dataTransfer, setDataTransfer] = useState<any[]>([])
  const [isDialogTransferOpen, setIsDialogTransferOpen] = useState(false)
  const [formTransfer, setFormTransfer] = useState({ id: "", noBast: "", tanggal: "", tujuan: "", barang: "", jumlah: "", status: "Dikirim" })
  const [fileTransfer, setFileTransfer] = useState<File | null>(null)

  const [dataMasuk, setDataMasuk] = useState<any[]>([])
  const [isDialogMasukOpen, setIsDialogMasukOpen] = useState(false)
  const [formMasuk, setFormMasuk] = useState({ id: "", noBast: "", tanggal: "", pengirim: "BPS Provinsi Aceh", barang: "", jumlah: "" })
  const [fileMasuk, setFileMasuk] = useState<File | null>(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [beli, pakai, transferOut, transferIn] = await Promise.all([
        getPembelian(), getPemakaian(), getTransferKeluar(), getTransferMasuk()
      ])
      setDataPembelian(beli || []); setDataPemakaian(pakai || []);
      setDataTransfer(transferOut || []); setDataMasuk(transferIn || []);
    } catch (e) { console.error("Gagal load data:", e) }
  }

  // --- Handlers ---
  const handleSavePembelian = async () => {
    const dataToSend = new FormData()
    dataToSend.append("noBast", formData.noBast); dataToSend.append("tanggal", formData.tanggal);
    dataToSend.append("barang", formData.barang); dataToSend.append("jumlah", formData.jumlah);
    dataToSend.append("penyedia", formData.penyedia); if (file) dataToSend.append("dokumen", file);
    try {
      if (formData.id) await updatePembelian(formData.id, dataToSend)
      else await addPembelian(dataToSend)
      await loadData(); setIsDialogOpen(false); resetFormPembelian(); alert("Berhasil simpan pembelian!")
    } catch (error) { alert("Gagal simpan pembelian") }
  }

  const handleSavePemakaian = async () => {
    const dataToSend = new FormData()
    dataToSend.append("tanggal", formPemakaian.tanggal); dataToSend.append("nama", formPemakaian.nama);
    dataToSend.append("kegiatan", formPemakaian.kegiatan); dataToSend.append("barang", formPemakaian.barang);
    dataToSend.append("jumlah", formPemakaian.jumlah); if (filePemakaian) dataToSend.append("dokumen", filePemakaian);
    try {
      if (formPemakaian.id) await updatePemakaian(formPemakaian.id, dataToSend)
      else await addPemakaian(dataToSend)
      await loadData(); setIsDialogPemakaianOpen(false); resetFormPemakaian(); alert("Berhasil simpan pemakaian!")
    } catch (error) { alert("Gagal simpan pemakaian") }
  }

  const handleSaveTransfer = async () => {
    if(!formTransfer.tujuan) return alert("Pilih Tujuan Kab/Kota terlebih dahulu!");
    const dataToSend = new FormData()
    dataToSend.append("noBast", formTransfer.noBast); dataToSend.append("tanggal", formTransfer.tanggal);
    dataToSend.append("tujuan", formTransfer.tujuan); dataToSend.append("barang", formTransfer.barang);
    dataToSend.append("jumlah", formTransfer.jumlah); dataToSend.append("status", formTransfer.status);
    if (fileTransfer) dataToSend.append("dokumen", fileTransfer)
    try {
      if (formTransfer.id) await updateTransferKeluar(formTransfer.id, dataToSend)
      else await addTransferKeluar(dataToSend)
      await loadData(); setIsDialogTransferOpen(false); resetFormTransfer(); alert("Berhasil simpan transfer keluar!")
    } catch (error) { alert("Gagal simpan transfer") }
  }

  const handleSaveMasuk = async () => {
    const dataToSend = new FormData()
    dataToSend.append("noBast", formMasuk.noBast); dataToSend.append("tanggal", formMasuk.tanggal);
    dataToSend.append("pengirim", formMasuk.pengirim); dataToSend.append("barang", formMasuk.barang);
    dataToSend.append("jumlah", formMasuk.jumlah); if (fileMasuk) dataToSend.append("dokumen", fileMasuk)
    try {
      if (formMasuk.id) await updateTransferMasuk(formMasuk.id, dataToSend)
      else await addTransferMasuk(dataToSend)
      await loadData(); setIsDialogMasukOpen(false); resetFormMasuk(); alert("Berhasil simpan penerimaan barang!")
    } catch (error) { alert("Gagal simpan transfer masuk") }
  }

  if (!isLoggedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100">
        <Card className="w-[350px]">
          <CardHeader><CardTitle>Login Monev-SE</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Username" /><Input type="password" placeholder="Password" />
            <Button className="w-full bg-blue-600" onClick={() => setIsLoggedIn(true)}>Masuk</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className={`${isSidebarOpen ? "w-64" : "w-20"} bg-white border-r border-slate-200 transition-all flex flex-col`}>
        <div className="p-4 border-b h-20 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white"><LayoutDashboard size={20} /></div>
          {isSidebarOpen && <span className="font-bold text-slate-800">MONEV-SE</span>}
        </div>
        <div className="flex-1 py-4 px-3 flex flex-col gap-2">
          {/* MENU DASHBOARD */}
          <button onClick={() => setActiveMenu("dashboard")} className={`flex items-center w-full p-3 rounded-lg ${activeMenu === "dashboard" ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}>
            <PieChartIcon size={20} /> {isSidebarOpen && <span className="ml-3 font-medium">Dashboard</span>}
          </button>
          <button onClick={() => setActiveMenu("pembelian")} className={`flex items-center w-full p-3 rounded-lg ${activeMenu === "pembelian" ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}>
            <ShoppingCart size={20} /> {isSidebarOpen && <span className="ml-3 font-medium">Pembelian</span>}
          </button>
          <button onClick={() => setActiveMenu("pemakaian")} className={`flex items-center w-full p-3 rounded-lg ${activeMenu === "pemakaian" ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}>
            <PackageMinus size={20} /> {isSidebarOpen && <span className="ml-3 font-medium">Pemakaian</span>}
          </button>
          <button onClick={() => setActiveMenu("transfer")} className={`flex items-center w-full p-3 rounded-lg ${activeMenu === "transfer" ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}>
            <ArrowUpFromLine size={20} /> {isSidebarOpen && <span className="ml-3 font-medium">Transfer Keluar</span>}
          </button>
          <button onClick={() => setActiveMenu("masuk")} className={`flex items-center w-full p-3 rounded-lg ${activeMenu === "masuk" ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}>
            <ArrowDownToLine size={20} /> {isSidebarOpen && <span className="ml-3 font-medium">Transfer Masuk</span>}
          </button>
        </div>
        <div className="p-4 border-t">
          <button onClick={() => setIsLoggedIn(false)} className="flex items-center text-red-500 gap-3 p-2 w-full hover:bg-red-50 rounded-lg">
            <LogOut size={20} /> {isSidebarOpen && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b flex items-center px-8 justify-between">
          <h1 className="text-xl font-bold text-slate-800">BPS PROVINSI ACEH</h1>
          <div className="flex items-center gap-2 text-sm bg-slate-100 px-4 py-2 rounded-full"><User size={16} /> Admin</div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-[#F4F7FB]">

          {/* MENU DASHBOARD (GRAFIK DONAT) */}
          {activeMenu === "dashboard" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Dashboard Visualisasi Logistik</h2>
                <p className="text-slate-500">Pemantauan persediaan perlengkapan Sensus Ekonomi 2026</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* DONAT STIKER */}
                <Card className="shadow-sm border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Stiker (pcs)</CardTitle>
                    <p className="text-sm text-slate-500">Total Stock Awal: <b>{formatAngka(1811980)}</b></p>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={dummyStiker} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                            {dummyStiker.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                          </Pie>
                          <Tooltip formatter={(value) => formatAngka(value as number)} />
                          <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* DONAT SPIDOL */}
                <Card className="shadow-sm border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Spidol (pcs)</CardTitle>
                    <p className="text-sm text-slate-500">Total Stock Awal: <b>{formatAngka(9504)}</b></p>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={dummySpidol} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                            {dummySpidol.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                          </Pie>
                          <Tooltip formatter={(value) => formatAngka(value as number)} />
                          <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* DONAT ROMPI */}
                <Card className="shadow-sm border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Rompi (pcs)</CardTitle>
                    <p className="text-sm text-slate-500">Total Stock Awal: <b>{formatAngka(4990)}</b></p>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={dummyRompi} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                            {dummyRompi.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                          </Pie>
                          <Tooltip formatter={(value) => formatAngka(value as number)} />
                          <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* MENU PEMBELIAN */}
          {activeMenu === "pembelian" && (
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <div><CardTitle>Data Pembelian</CardTitle></div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) resetFormPembelian(); }}>
                  <DialogTrigger asChild><Button className="bg-blue-600">+ Tambah</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>{formData.id ? "Edit" : "Tambah"} Pembelian</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2"><Label>No BAST</Label><Input value={formData.noBast} onChange={(e) => setFormData({...formData, noBast: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>Tanggal BAST</Label><Input type="date" value={formData.tanggal} onChange={(e) => setFormData({...formData, tanggal: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>Nama Barang</Label><Input placeholder="Contoh: Rompi Sensus" value={formData.barang} onChange={(e) => setFormData({...formData, barang: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>Jumlah Barang</Label><Input type="number" value={formData.jumlah} onChange={(e) => setFormData({...formData, jumlah: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>Nama Penyedia</Label><Input value={formData.penyedia} onChange={(e) => setFormData({...formData, penyedia: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>Dokumen BAST (PDF)</Label><Input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} /></div>
                    </div>
                    <DialogFooter><Button onClick={handleSavePembelian} className="bg-blue-600 w-full">Simpan</Button></DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <Table>
                <TableHeader className="bg-slate-50"><TableRow><TableHead className="px-6">No BAST</TableHead><TableHead>Nama Barang</TableHead><TableHead>Jumlah</TableHead><TableHead>Penyedia</TableHead><TableHead className="text-center">Dokumen</TableHead><TableHead className="text-right px-6">Aksi</TableHead></TableRow></TableHeader>
                <TableBody>
                  {dataPembelian.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="px-6 font-medium">{item.noBast}</TableCell><TableCell>{item.barang}</TableCell><TableCell>{formatAngka(item.jumlah)} Unit</TableCell><TableCell>{item.penyedia}</TableCell>
                      <TableCell className="text-center"><Button variant="ghost" size="sm" onClick={() => setViewDocument(item)}><FileText size={16} /></Button></TableCell>
                      <TableCell className="text-right px-6 space-x-2">
                        <Button variant="outline" size="icon" onClick={() => { setFormData({ id: item.id, noBast: item.noBast, tanggal: item.tanggal, barang: item.barang || "", jumlah: item.jumlah.toString(), penyedia: item.penyedia }); setIsDialogOpen(true); }}><Pencil size={16} className="text-amber-600" /></Button>
                        <Button variant="outline" size="icon" onClick={() => { if(confirm("Hapus?")) deletePembelian(item.id).then(loadData) }}><Trash2 size={16} className="text-red-600" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}

          {/* MENU PEMAKAIAN */}
          {activeMenu === "pemakaian" && (
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <div><CardTitle>Data Pemakaian Internal</CardTitle></div>
                <Dialog open={isDialogPemakaianOpen} onOpenChange={(open) => { setIsDialogPemakaianOpen(open); if(!open) resetFormPemakaian(); }}>
                  <DialogTrigger asChild><Button className="bg-blue-600">+ Tambah</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>{formPemakaian.id ? "Edit" : "Tambah"} Pemakaian</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2"><Label>Tanggal Pakai</Label><Input type="date" value={formPemakaian.tanggal} onChange={(e) => setFormPemakaian({...formPemakaian, tanggal: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>Nama Pegawai</Label><Input value={formPemakaian.nama} onChange={(e) => setFormPemakaian({...formPemakaian, nama: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>Keperluan</Label><Input value={formPemakaian.kegiatan} onChange={(e) => setFormPemakaian({...formPemakaian, kegiatan: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>Nama Barang</Label><Input value={formPemakaian.barang} onChange={(e) => setFormPemakaian({...formPemakaian, barang: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>Jumlah</Label><Input type="number" value={formPemakaian.jumlah} onChange={(e) => setFormPemakaian({...formPemakaian, jumlah: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>Bon Pengambilan (PDF)</Label><Input type="file" accept=".pdf" onChange={(e) => setFilePemakaian(e.target.files?.[0] || null)} /></div>
                    </div>
                    <DialogFooter><Button onClick={handleSavePemakaian} className="bg-blue-600 w-full">Simpan</Button></DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <Table>
                <TableHeader className="bg-slate-50"><TableRow><TableHead className="px-6">Tanggal</TableHead><TableHead>Nama Pegawai</TableHead><TableHead>Nama Barang</TableHead><TableHead>Jumlah</TableHead><TableHead className="text-center">Dokumen</TableHead><TableHead className="text-right px-6">Aksi</TableHead></TableRow></TableHeader>
                <TableBody>
                  {dataPemakaian.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="px-6">{item.tanggal}</TableCell><TableCell className="font-medium">{item.nama}</TableCell><TableCell>{item.barang}</TableCell><TableCell>{formatAngka(item.jumlah)} Unit</TableCell>
                      <TableCell className="text-center"><Button variant="ghost" size="sm" onClick={() => setViewDocument(item)}><FileText size={16} /></Button></TableCell>
                      <TableCell className="text-right px-6 space-x-2">
                        <Button variant="outline" size="icon" onClick={() => { setFormPemakaian({ id: item.id, tanggal: item.tanggal, nama: item.nama, kegiatan: item.kegiatan, barang: item.barang, jumlah: item.jumlah.toString() }); setIsDialogPemakaianOpen(true); }}><Pencil size={16} className="text-amber-600" /></Button>
                        <Button variant="outline" size="icon" onClick={() => { if(confirm("Hapus?")) deletePemakaian(item.id).then(loadData) }}><Trash2 size={16} className="text-red-600" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}

          {/* MENU TRANSFER KELUAR */}
          {activeMenu === "transfer" && (
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <div><CardTitle>Transfer Keluar (Distribusi)</CardTitle></div>
                <Dialog open={isDialogTransferOpen} onOpenChange={(open) => { setIsDialogTransferOpen(open); if(!open) resetFormTransfer(); }}>
                  <DialogTrigger asChild><Button className="bg-blue-600">+ Tambah</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>{formTransfer.id ? "Edit" : "Tambah"} Transfer Keluar</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2"><Label>No BAST</Label><Input placeholder="Nomor BAST Serah Terima" value={formTransfer.noBast} onChange={(e) => setFormTransfer({...formTransfer, noBast: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>Tanggal</Label><Input type="date" value={formTransfer.tanggal} onChange={(e) => setFormTransfer({...formTransfer, tanggal: e.target.value})} /></div>
                      <div className="grid gap-2">
                        <Label>Tujuan (Kab/Kota)</Label>
                        <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={formTransfer.tujuan} onChange={(e) => setFormTransfer({...formTransfer, tujuan: e.target.value})}>
                          <option value="" disabled>Pilih Tujuan...</option>
                          {DAFTAR_KABKOTA.map((kab) => (<option key={kab} value={kab}>{kab}</option>))}
                        </select>
                      </div>
                      <div className="grid gap-2"><Label>Barang</Label><Input placeholder="Contoh: Rompi" value={formTransfer.barang} onChange={(e) => setFormTransfer({...formTransfer, barang: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>Jumlah</Label><Input type="number" value={formTransfer.jumlah} onChange={(e) => setFormTransfer({...formTransfer, jumlah: e.target.value})} /></div>
                      <div className="grid gap-2">
                        <Label>Status Pengiriman</Label>
                        <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={formTransfer.status} onChange={(e) => setFormTransfer({...formTransfer, status: e.target.value})}>
                          <option value="Dikirim">Dikirim</option>
                          <option value="Diterima">Diterima</option>
                        </select>
                      </div>
                      <div className="grid gap-2"><Label>Dokumen BAST (PDF)</Label><Input type="file" accept=".pdf" onChange={(e) => setFileTransfer(e.target.files?.[0] || null)} /></div>
                    </div>
                    <DialogFooter><Button onClick={handleSaveTransfer} className="bg-blue-600 w-full">Simpan</Button></DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow><TableHead className="px-6">No BAST</TableHead><TableHead>Tanggal</TableHead><TableHead>Tujuan</TableHead><TableHead>Barang</TableHead><TableHead>Jumlah</TableHead><TableHead className="text-center">Status</TableHead><TableHead className="text-center">Dokumen</TableHead><TableHead className="text-right px-6">Aksi</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {dataTransfer.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="px-6 font-medium">{item.noBast}</TableCell><TableCell>{item.tanggal}</TableCell><TableCell>{item.tujuan}</TableCell><TableCell>{item.barang}</TableCell><TableCell>{formatAngka(item.jumlah)} Unit</TableCell>
                      <TableCell className="text-center"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.status === 'Diterima' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{item.status}</span></TableCell>
                      <TableCell className="text-center"><Button variant="ghost" size="sm" onClick={() => setViewDocument(item)}><FileText size={16} /></Button></TableCell>
                      <TableCell className="text-right px-6 space-x-2">
                        <Button variant="outline" size="icon" onClick={() => { setFormTransfer({ id: item.id, noBast: item.noBast, tanggal: item.tanggal, tujuan: item.tujuan, barang: item.barang, jumlah: item.jumlah.toString(), status: item.status }); setIsDialogTransferOpen(true); }}><Pencil size={16} className="text-amber-600" /></Button>
                        <Button variant="outline" size="icon" onClick={() => { if(confirm("Hapus?")) deleteTransferKeluar(item.id).then(loadData) }}><Trash2 size={16} className="text-red-600" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}

          {/* MENU TRANSFER MASUK */}
          {activeMenu === "masuk" && (
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <div><CardTitle>Transfer Masuk (Penerimaan Sah)</CardTitle></div>
                <Dialog open={isDialogMasukOpen} onOpenChange={(open) => { setIsDialogMasukOpen(open); if(!open) resetFormMasuk(); }}>
                  <DialogTrigger asChild><Button className="bg-blue-600">+ Tambah</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>{formMasuk.id ? "Edit" : "Tambah"} Transfer Masuk</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2"><Label>No BAST Resmi</Label><Input value={formMasuk.noBast} onChange={(e) => setFormMasuk({...formMasuk, noBast: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>Tanggal Terima</Label><Input type="date" value={formMasuk.tanggal} onChange={(e) => setFormMasuk({...formMasuk, tanggal: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>Satker Pengirim</Label><Input value={formMasuk.pengirim} onChange={(e) => setFormMasuk({...formMasuk, pengirim: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>Nama Barang</Label><Input value={formMasuk.barang} onChange={(e) => setFormMasuk({...formMasuk, barang: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>Jumlah Diterima</Label><Input type="number" value={formMasuk.jumlah} onChange={(e) => setFormMasuk({...formMasuk, jumlah: e.target.value})} /></div>
                      <div className="grid gap-2"><Label>BAST (PDF)</Label><Input type="file" accept=".pdf" onChange={(e) => setFileMasuk(e.target.files?.[0] || null)} /></div>
                    </div>
                    <DialogFooter><Button onClick={handleSaveMasuk} className="bg-blue-600 w-full">Simpan</Button></DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <Table>
                <TableHeader className="bg-slate-50"><TableRow><TableHead className="px-6">No BAST</TableHead><TableHead>Tanggal</TableHead><TableHead>Pengirim</TableHead><TableHead>Barang</TableHead><TableHead>Jumlah</TableHead><TableHead className="text-center">Dokumen</TableHead><TableHead className="text-right px-6">Aksi</TableHead></TableRow></TableHeader>
                <TableBody>
                  {dataMasuk.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="px-6 font-medium">{item.noBast}</TableCell><TableCell>{item.tanggal}</TableCell><TableCell>{item.pengirim}</TableCell><TableCell>{item.barang}</TableCell><TableCell>{formatAngka(item.jumlah)} Unit</TableCell>
                      <TableCell className="text-center"><Button variant="ghost" size="sm" onClick={() => setViewDocument(item)}><FileText size={16} /></Button></TableCell>
                      <TableCell className="text-right px-6 space-x-2">
                        <Button variant="outline" size="icon" onClick={() => { setFormMasuk({ id: item.id, noBast: item.noBast, tanggal: item.tanggal, pengirim: item.pengirim, barang: item.barang, jumlah: item.jumlah.toString() }); setIsDialogMasukOpen(true); }}><Pencil size={16} className="text-amber-600" /></Button>
                        <Button variant="outline" size="icon" onClick={() => { if(confirm("Hapus?")) deleteTransferMasuk(item.id).then(loadData) }}><Trash2 size={16} className="text-red-600" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}

        </div>
      </main>

      {/* VIEW DOKUMEN MODAL */}
      <Dialog open={!!viewDocument} onOpenChange={() => setViewDocument(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Pratinjau Dokumen</DialogTitle></DialogHeader>
          <div className="flex flex-col items-center p-8 bg-slate-50 border-2 border-dashed rounded-lg">
            <FileText size={48} className="text-slate-400 mb-4" />
            <p className="text-sm mb-6">{viewDocument?.dokumen ? "Dokumen tersedia di cloud" : "Tidak ada file PDF"}</p>
            {viewDocument?.dokumen && (<a href={viewDocument.dokumen} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-6 py-2 rounded-md flex items-center gap-2"><ExternalLink size={16} /> Buka PDF Asli</a>)}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )

  // Reset Helpers
  function resetFormPembelian() { setFormData({ id: "", noBast: "", tanggal: "", barang: "", jumlah: "", penyedia: "" }); setFile(null); }
  function resetFormPemakaian() { setFormPemakaian({ id: "", tanggal: "", nama: "", kegiatan: "", barang: "", jumlah: "" }); setFilePemakaian(null); }
  function resetFormTransfer() { setFormTransfer({ id: "", noBast: "", tanggal: "", tujuan: "", barang: "", jumlah: "", status: "Dikirim" }); setFileTransfer(null); }
  function resetFormMasuk() { setFormMasuk({ id: "", noBast: "", tanggal: "", pengirim: "BPS Provinsi Aceh", barang: "", jumlah: "" }); setFileMasuk(null); }
}
