"use client"

import React, { useState, useEffect } from "react"
import { getPembelian, addPembelian, deletePembelian, getPemakaian, addPemakaian, deletePemakaian } from "./actions"
import { Menu, LayoutDashboard, ShoppingCart, ArrowDownToLine, PackageMinus, ArrowUpFromLine, ChevronLeft, LogOut, User, Pencil, Trash2, FileText, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

export default function MonevApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeMenu, setActiveMenu] = useState("pembelian")

  // ================= STATE PEMBELIAN =================
  const [dataPembelian, setDataPembelian] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({ id: "", noBast: "", tanggal: "", jumlah: "", penyedia: "" })
  const [file, setFile] = useState<File | null>(null)
  const [viewDocument, setViewDocument] = useState<any>(null)

  // ================= STATE PEMAKAIAN =================
  const [dataPemakaian, setDataPemakaian] = useState<any[]>([])
  const [isDialogPemakaianOpen, setIsDialogPemakaianOpen] = useState(false)
  const [formPemakaian, setFormPemakaian] = useState({ tanggal: "", nama: "", kegiatan: "", barang: "", jumlah: "" })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const beli = await getPembelian()
    const pakai = await getPemakaian()
    setDataPembelian(beli)
    setDataPemakaian(pakai)
  }

  // --- Handler Pembelian ---
  const handleSavePembelian = async () => {
    const dataToSend = new FormData()
    dataToSend.append("noBast", formData.noBast)
    dataToSend.append("tanggal", formData.tanggal)
    dataToSend.append("jumlah", formData.jumlah)
    dataToSend.append("penyedia", formData.penyedia)
    if (file) dataToSend.append("dokumen", file)

    try {
      await addPembelian(dataToSend)
      await loadData()
      setIsDialogOpen(false)
      setFormData({ id: "", noBast: "", tanggal: "", jumlah: "", penyedia: "" })
      setFile(null)
      alert("Data Pembelian Berhasil Disimpan!")
    } catch (error) {
      alert("Gagal simpan pembelian")
    }
  }

  // --- Handler Pemakaian ---
  const handleSavePemakaian = async () => {
    try {
      await addPemakaian(formPemakaian)
      await loadData()
      setIsDialogPemakaianOpen(false)
      setFormPemakaian({ tanggal: "", nama: "", kegiatan: "", barang: "", jumlah: "" })
      alert("Data Pemakaian Berhasil Disimpan!")
    } catch (error) {
      alert("Gagal simpan pemakaian")
    }
  }

  const handleDeletePemakaian = async (id: string) => {
    if(confirm("Hapus data pemakaian ini?")) {
      await deletePemakaian(id)
      await loadData()
    }
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

  const renderContent = () => {
    switch (activeMenu) {
      case "pembelian":
        return (
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Data Penerimaan (Provinsi)</CardTitle>
                <CardDescription>Barang masuk dari penyedia pihak ketiga.</CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild><Button className="bg-blue-600">+ Tambah Pembelian</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Tambah Pembelian</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2"><Label>Nomor BAST</Label><Input value={formData.noBast} onChange={(e) => setFormData({...formData, noBast: e.target.value})} /></div>
                    <div className="grid gap-2"><Label>Tanggal</Label><Input type="date" value={formData.tanggal} onChange={(e) => setFormData({...formData, tanggal: e.target.value})} /></div>
                    <div className="grid gap-2"><Label>Jumlah</Label><Input type="number" value={formData.jumlah} onChange={(e) => setFormData({...formData, jumlah: e.target.value})} /></div>
                    <div className="grid gap-2"><Label>Penyedia</Label><Input value={formData.penyedia} onChange={(e) => setFormData({...formData, penyedia: e.target.value})} /></div>
                    <div className="grid gap-2"><Label>File BAST (PDF)</Label><Input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} /></div>
                  </div>
                  <DialogFooter><Button onClick={handleSavePembelian} className="bg-blue-600 w-full">Simpan</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="px-6">No BAST</TableHead><TableHead>Tanggal</TableHead><TableHead>Jumlah</TableHead><TableHead>Penyedia</TableHead><TableHead className="text-center">File</TableHead><TableHead className="text-right px-6">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataPembelian.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="px-6 font-medium">{item.noBast}</TableCell>
                      <TableCell>{item.tanggal}</TableCell>
                      <TableCell>{item.jumlah}</TableCell>
                      <TableCell>{item.penyedia}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" onClick={() => setViewDocument(item)}><FileText size={16} /></Button>
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <Button variant="outline" size="icon" onClick={() => { if(confirm("Hapus?")) deletePembelian(item.id).then(loadData) }}><Trash2 size={16} className="text-red-600" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )

      case "pemakaian":
        return (
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Pemakaian Internal (Provinsi)</CardTitle>
                <CardDescription>Pencatatan barang yang digunakan pegawai BPS Provinsi Aceh.</CardDescription>
              </div>
              <Dialog open={isDialogPemakaianOpen} onOpenChange={setIsDialogPemakaianOpen}>
                <DialogTrigger asChild><Button className="bg-blue-600">+ Catat Pemakaian</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Form Pemakaian Barang</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2"><Label>Tanggal Pakai</Label><Input type="date" value={formPemakaian.tanggal} onChange={(e) => setFormPemakaian({...formPemakaian, tanggal: e.target.value})} /></div>
                    <div className="grid gap-2"><Label>Nama Pegawai</Label><Input placeholder="Misal: Riska" value={formPemakaian.nama} onChange={(e) => setFormPemakaian({...formPemakaian, nama: e.target.value})} /></div>
                    <div className="grid gap-2"><Label>Kegiatan</Label><Input placeholder="Misal: Rapat Teknis SE" value={formPemakaian.kegiatan} onChange={(e) => setFormPemakaian({...formPemakaian, kegiatan: e.target.value})} /></div>
                    <div className="grid gap-2"><Label>Nama Barang</Label><Input placeholder="Misal: Rompi" value={formPemakaian.barang} onChange={(e) => setFormPemakaian({...formPemakaian, barang: e.target.value})} /></div>
                    <div className="grid gap-2"><Label>Jumlah</Label><Input type="number" value={formPemakaian.jumlah} onChange={(e) => setFormPemakaian({...formPemakaian, jumlah: e.target.value})} /></div>
                  </div>
                  <DialogFooter><Button onClick={handleSavePemakaian} className="bg-blue-600 w-full">Simpan Data</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="px-6">Tanggal</TableHead>
                    <TableHead>Nama Pegawai</TableHead>
                    <TableHead>Kegiatan</TableHead>
                    <TableHead>Nama Barang</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead className="text-right px-6">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataPemakaian.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-500">Belum ada data pemakaian.</TableCell></TableRow>
                  ) : (
                    dataPemakaian.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="px-6">{item.tanggal}</TableCell>
                        <TableCell className="font-medium">{item.nama}</TableCell>
                        <TableCell>{item.kegiatan}</TableCell>
                        <TableCell>{item.barang}</TableCell>
                        <TableCell>{item.jumlah} Unit</TableCell>
                        <TableCell className="text-right px-6">
                          <Button variant="outline" size="icon" onClick={() => handleDeletePemakaian(item.id)}><Trash2 size={16} className="text-red-600" /></Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )

      default:
        return <div className="p-8 text-center text-slate-500">Pilih menu untuk melihat data.</div>
    }
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className={`${isSidebarOpen ? "w-64" : "w-20"} bg-white border-r border-slate-200 transition-all flex flex-col`}>
        <div className="p-4 border-b h-20 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white"><LayoutDashboard size={20} /></div>
          {isSidebarOpen && <span className="font-bold text-slate-800">MONEV-SE</span>}
        </div>
        <div className="flex-1 py-4 px-3 flex flex-col gap-2">
          <MenuButton icon={<ShoppingCart />} label="Pembelian" isActive={activeMenu === "pembelian"} onClick={() => setActiveMenu("pembelian")} isOpen={isSidebarOpen} />
          <MenuButton icon={<PackageMinus />} label="Pemakaian" isActive={activeMenu === "pemakaian"} onClick={() => setActiveMenu("pemakaian")} isOpen={isSidebarOpen} />
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
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-100 px-4 py-2 rounded-full">
            <User size={16} /> Admin Logistik
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8 bg-[#F4F7FB]">
          {renderContent()}
        </div>
      </main>

      {/* Modal View PDF */}
      <Dialog open={!!viewDocument} onOpenChange={() => setViewDocument(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Pratinjau Dokumen BAST</DialogTitle></DialogHeader>
          <div className="flex flex-col items-center p-8 bg-slate-50 border-2 border-dashed rounded-lg">
            <FileText size={48} className="text-slate-400 mb-4" />
            <p className="text-sm text-center mb-6">{viewDocument?.dokumen ? "File tersedia di Cloud Storage" : "Tidak ada file PDF"}</p>
            {viewDocument?.dokumen && (
              <a href={viewDocument.dokumen} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-6 py-2 rounded-md flex items-center gap-2">
                <ExternalLink size={16} /> Buka PDF Asli
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MenuButton({ icon, label, isActive, onClick, isOpen }: any) {
  return (
    <button onClick={onClick} className={`flex items-center p-3 rounded-lg transition-colors ${isActive ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100"} ${!isOpen && "justify-center"}`}>
      {icon} {isOpen && <span className="ml-3 font-medium">{label}</span>}
    </button>
  )
}
