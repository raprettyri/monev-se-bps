"use client"

import React, { useState, useEffect } from "react"
import {
  getPembelian, addPembelian, deletePembelian, updatePembelian,
  getPemakaian, addPemakaian, deletePemakaian, updatePemakaian
} from "./actions"
import {
  Menu, LayoutDashboard, ShoppingCart, ArrowDownToLine,
  PackageMinus, ArrowUpFromLine, ChevronLeft, LogOut,
  User, Pencil, Trash2, FileText, ExternalLink
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"

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
  const [formPemakaian, setFormPemakaian] = useState({ id: "", tanggal: "", nama: "", kegiatan: "", barang: "", jumlah: "" })
  const [filePemakaian, setFilePemakaian] = useState<File | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const beli = await getPembelian()
    const pakai = await getPemakaian()
    setDataPembelian(beli)
    setDataPemakaian(pakai)
  }

  // --- Handler Simpan Pembelian ---
  const handleSavePembelian = async () => {
    const dataToSend = new FormData()
    dataToSend.append("noBast", formData.noBast)
    dataToSend.append("tanggal", formData.tanggal)
    dataToSend.append("jumlah", formData.jumlah)
    dataToSend.append("penyedia", formData.penyedia)
    if (file) dataToSend.append("dokumen", file)

    try {
      if (formData.id) {
        await updatePembelian(formData.id, dataToSend)
      } else {
        await addPembelian(dataToSend)
      }
      await loadData()
      setIsDialogOpen(false)
      resetFormPembelian()
      alert("Data Pembelian Berhasil Disimpan!")
    } catch (error) {
      alert("Gagal simpan pembelian")
    }
  }

  // --- Handler Simpan Pemakaian ---
  const handleSavePemakaian = async () => {
    const dataToSend = new FormData()
    dataToSend.append("tanggal", formPemakaian.tanggal)
    dataToSend.append("nama", formPemakaian.nama)
    dataToSend.append("kegiatan", formPemakaian.kegiatan)
    dataToSend.append("barang", formPemakaian.barang)
    dataToSend.append("jumlah", formPemakaian.jumlah)
    if (filePemakaian) dataToSend.append("dokumen", filePemakaian)

    try {
      if (formPemakaian.id) {
        await updatePemakaian(formPemakaian.id, dataToSend)
      } else {
        await addPemakaian(dataToSend)
      }
      await loadData()
      setIsDialogPemakaianOpen(false)
      resetFormPemakaian()
      alert("Data Pemakaian Berhasil Disimpan!")
    } catch (error) {
      alert("Gagal simpan pemakaian")
    }
  }

  const resetFormPembelian = () => {
    setFormData({ id: "", noBast: "", tanggal: "", jumlah: "", penyedia: "" })
    setFile(null)
  }

  const resetFormPemakaian = () => {
    setFormPemakaian({ id: "", tanggal: "", nama: "", kegiatan: "", barang: "", jumlah: "" })
    setFilePemakaian(null)
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
              <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) resetFormPembelian(); }}>
                <DialogTrigger asChild><Button className="bg-blue-600">+ Tambah Pembelian</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{formData.id ? "Edit" : "Tambah"} Pembelian</DialogTitle></DialogHeader>
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
                      <TableCell className="text-right px-6 space-x-2">
                        <Button variant="outline" size="icon" onClick={() => {
                          setFormData({ id: item.id, noBast: item.noBast, tanggal: item.tanggal, jumlah: item.jumlah.toString(), penyedia: item.penyedia });
                          setIsDialogOpen(true);
                        }}><Pencil size={16} className="text-amber-600" /></Button>
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
                <CardDescription>Pencatatan barang logistik yang digunakan pegawai internal.</CardDescription>
              </div>
              <Dialog open={isDialogPemakaianOpen} onOpenChange={(open) => { setIsDialogPemakaianOpen(open); if(!open) resetFormPemakaian(); }}>
                <DialogTrigger asChild><Button className="bg-blue-600">+ Catat Pemakaian</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{formPemakaian.id ? "Edit" : "Tambah"} Pemakaian</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2"><Label>Tanggal Pakai</Label><Input type="date" value={formPemakaian.tanggal} onChange={(e) => setFormPemakaian({...formPemakaian, tanggal: e.target.value})} /></div>
                    <div className="grid gap-2"><Label>Nama Pegawai</Label><Input value={formPemakaian.nama} onChange={(e) => setFormPemakaian({...formPemakaian, nama: e.target.value})} /></div>
                    <div className="grid gap-2"><Label>Kegiatan</Label><Input value={formPemakaian.kegiatan} onChange={(e) => setFormPemakaian({...formPemakaian, kegiatan: e.target.value})} /></div>
                    <div className="grid gap-2"><Label>Nama Barang</Label><Input value={formPemakaian.barang} onChange={(e) => setFormPemakaian({...formPemakaian, barang: e.target.value})} /></div>
                    <div className="grid gap-2"><Label>Jumlah</Label><Input type="number" value={formPemakaian.jumlah} onChange={(e) => setFormPemakaian({...formPemakaian, jumlah: e.target.value})} /></div>
                    <div className="grid gap-2"><Label>Bon Pengambilan (PDF)</Label><Input type="file" accept=".pdf" onChange={(e) => setFilePemakaian(e.target.files?.[0] || null)} /></div>
                  </div>
                  <DialogFooter><Button onClick={handleSavePemakaian} className="bg-blue-600 w-full">Simpan Data</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="px-6">Tanggal</TableHead><TableHead>Pegawai</TableHead><TableHead>Barang</TableHead><TableHead>Jumlah</TableHead><TableHead className="text-center">Bon</TableHead><TableHead className="text-right px-6">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataPemakaian.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="px-6">{item.tanggal}</TableCell>
                      <TableCell className="font-medium">{item.nama}</TableCell>
                      <TableCell>{item.barang}</TableCell>
                      <TableCell>{item.jumlah} Unit</TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" onClick={() => setViewDocument(item)}><FileText size={16} /></Button>
                      </TableCell>
                      <TableCell className="text-right px-6 space-x-2">
                        <Button variant="outline" size="icon" onClick={() => {
                          setFormPemakaian({ id: item.id, tanggal: item.tanggal, nama: item.nama, kegiatan: item.kegiatan, barang: item.barang, jumlah: item.jumlah.toString() });
                          setIsDialogPemakaianOpen(true);
                        }}><Pencil size={16} className="text-amber-600" /></Button>
                        <Button variant="outline" size="icon" onClick={() => { if(confirm("Hapus?")) deletePemakaian(item.id).then(loadData) }}><Trash2 size={16} className="text-red-600" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )

      default:
        return <div className="p-8 text-center text-slate-500">Pilih menu di samping.</div>
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
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">BPS PROVINSI ACEH</h1>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-100 px-4 py-2 rounded-full">
            <User size={16} /> {isSidebarOpen ? "Admin Logistik" : ""}
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8 bg-[#F4F7FB]">
          {renderContent()}
        </div>
      </main>

      <Dialog open={!!viewDocument} onOpenChange={() => setViewDocument(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Pratinjau Dokumen</DialogTitle></DialogHeader>
          <div className="flex flex-col items-center p-8 bg-slate-50 border-2 border-dashed rounded-lg">
            <FileText size={48} className="text-slate-400 mb-4" />
            <p className="text-sm text-center mb-6">{viewDocument?.dokumen ? "Dokumen tersedia di Cloud" : "Tidak ada file dokumen"}</p>
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
