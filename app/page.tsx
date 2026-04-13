"use client"

import React, { useState, useEffect } from "react"
// Import semua fungsi dari actions.ts
import {
  getPembelian, addPembelian, deletePembelian, updatePembelian,
  getPemakaian, addPemakaian, deletePemakaian, updatePemakaian
} from "./actions"
import {
  LayoutDashboard, ShoppingCart, PackageMinus, LogOut,
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

  // --- State Pembelian ---
  const [dataPembelian, setDataPembelian] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({ id: "", noBast: "", tanggal: "", jumlah: "", penyedia: "" })
  const [file, setFile] = useState<File | null>(null)
  const [viewDocument, setViewDocument] = useState<any>(null)

  // --- State Pemakaian ---
  const [dataPemakaian, setDataPemakaian] = useState<any[]>([])
  const [isDialogPemakaianOpen, setIsDialogPemakaianOpen] = useState(false)
  const [formPemakaian, setFormPemakaian] = useState({ id: "", tanggal: "", nama: "", kegiatan: "", barang: "", jumlah: "" })
  const [filePemakaian, setFilePemakaian] = useState<File | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const beli = await getPembelian()
      const pakai = await getPemakaian()
      setDataPembelian(beli || [])
      setDataPemakaian(pakai || [])
    } catch (e) {
      console.error("Gagal load data:", e)
    }
  }

  // --- Logic Simpan Pembelian ---
  const handleSavePembelian = async () => {
    const dataToSend = new FormData()
    dataToSend.append("noBast", formData.noBast)
    dataToSend.append("tanggal", formData.tanggal)
    dataToSend.append("jumlah", formData.jumlah)
    dataToSend.append("penyedia", formData.penyedia)
    if (file) dataToSend.append("dokumen", file)

    try {
      if (formData.id) await updatePembelian(formData.id, dataToSend)
      else await addPembelian(dataToSend)
      await loadData()
      setIsDialogOpen(false)
      setFormData({ id: "", noBast: "", tanggal: "", jumlah: "", penyedia: "" })
      setFile(null)
      alert("Berhasil simpan pembelian!")
    } catch (error) {
      alert("Gagal simpan pembelian")
    }
  }

  // --- Logic Simpan Pemakaian ---
  const handleSavePemakaian = async () => {
    const dataToSend = new FormData()
    dataToSend.append("tanggal", formPemakaian.tanggal)
    dataToSend.append("nama", formPemakaian.nama)
    dataToSend.append("kegiatan", formPemakaian.kegiatan)
    dataToSend.append("barang", formPemakaian.barang)
    dataToSend.append("jumlah", formPemakaian.jumlah)
    if (filePemakaian) dataToSend.append("dokumen", filePemakaian)

    try {
      if (formPemakaian.id) await updatePemakaian(formPemakaian.id, dataToSend)
      else await addPemakaian(dataToSend)
      await loadData()
      setIsDialogPemakaianOpen(false)
      setFormPemakaian({ id: "", tanggal: "", nama: "", kegiatan: "", barang: "", jumlah: "" })
      setFilePemakaian(null)
      alert("Berhasil simpan pemakaian!")
    } catch (error) {
      alert("Gagal simpan pemakaian")
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

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? "w-64" : "w-20"} bg-white border-r border-slate-200 transition-all flex flex-col`}>
        <div className="p-4 border-b h-20 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white"><LayoutDashboard size={20} /></div>
          {isSidebarOpen && <span className="font-bold">MONEV-SE</span>}
        </div>
        <div className="flex-1 py-4 px-3 flex flex-col gap-2">
          <button onClick={() => setActiveMenu("pembelian")} className={`flex items-center p-3 rounded-lg ${activeMenu === "pembelian" ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}>
            <ShoppingCart size={20} /> {isSidebarOpen && <span className="ml-3 font-medium">Pembelian</span>}
          </button>
          <button onClick={() => setActiveMenu("pemakaian")} className={`flex items-center p-3 rounded-lg ${activeMenu === "pemakaian" ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}>
            <PackageMinus size={20} /> {isSidebarOpen && <span className="ml-3 font-medium">Pemakaian</span>}
          </button>
        </div>
        <div className="p-4 border-t">
          <button onClick={() => setIsLoggedIn(false)} className="flex items-center text-red-500 gap-3 p-2 w-full hover:bg-red-50 rounded-lg">
            <LogOut size={20} /> {isSidebarOpen && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b flex items-center px-8 justify-between">
          <h1 className="text-xl font-bold">BPS PROVINSI ACEH</h1>
          <div className="flex items-center gap-2 text-sm bg-slate-100 px-4 py-2 rounded-full"><User size={16} /> Admin</div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-[#F4F7FB]">
          {activeMenu === "pembelian" ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div><CardTitle>Data Pembelian</CardTitle></div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <Button onClick={() => { resetFormPembelian(); setIsDialogOpen(true); }} className="bg-blue-600">+ Tambah</Button>
                  <DialogContent>
                    <DialogHeader><DialogTitle>{formData.id ? "Edit" : "Tambah"} Pembelian</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Input placeholder="No BAST" value={formData.noBast} onChange={(e) => setFormData({...formData, noBast: e.target.value})} />
                      <Input type="date" value={formData.tanggal} onChange={(e) => setFormData({...formData, tanggal: e.target.value})} />
                      <Input type="number" placeholder="Jumlah" value={formData.jumlah} onChange={(e) => setFormData({...formData, jumlah: e.target.value})} />
                      <Input placeholder="Penyedia" value={formData.penyedia} onChange={(e) => setFormData({...formData, penyedia: e.target.value})} />
                      <Input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                    </div>
                    <Button onClick={handleSavePembelian} className="bg-blue-600 w-full">Simpan</Button>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <Table>
                <TableHeader><TableRow><TableHead>No BAST</TableHead><TableHead>Tanggal</TableHead><TableHead>Penyedia</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                <TableBody>
                  {dataPembelian.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.noBast}</TableCell><TableCell>{item.tanggal}</TableCell><TableCell>{item.penyedia}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => setViewDocument(item)}><FileText size={16} /></Button>
                        <Button variant="outline" size="icon" onClick={() => { setFormData({ id: item.id, noBast: item.noBast, tanggal: item.tanggal, jumlah: item.jumlah.toString(), penyedia: item.penyedia }); setIsDialogOpen(true); }}><Pencil size={16} className="text-amber-600" /></Button>
                        <Button variant="outline" size="icon" onClick={() => { if(confirm("Hapus?")) deletePembelian(item.id).then(loadData) }}><Trash2 size={16} className="text-red-600" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          ) : (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div><CardTitle>Data Pemakaian</CardTitle></div>
                <Dialog open={isDialogPemakaianOpen} onOpenChange={setIsDialogPemakaianOpen}>
                  <Button onClick={() => { resetFormPemakaian(); setIsDialogPemakaianOpen(true); }} className="bg-blue-600">+ Tambah</Button>
                  <DialogContent>
                    <DialogHeader><DialogTitle>{formPemakaian.id ? "Edit" : "Tambah"} Pemakaian</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Input type="date" value={formPemakaian.tanggal} onChange={(e) => setFormPemakaian({...formPemakaian, tanggal: e.target.value})} />
                      <Input placeholder="Nama Pegawai" value={formPemakaian.nama} onChange={(e) => setFormPemakaian({...formPemakaian, nama: e.target.value})} />
                      <Input placeholder="Kegiatan" value={formPemakaian.kegiatan} onChange={(e) => setFormPemakaian({...formPemakaian, kegiatan: e.target.value})} />
                      <Input placeholder="Barang" value={formPemakaian.barang} onChange={(e) => setFormPemakaian({...formPemakaian, barang: e.target.value})} />
                      <Input type="number" placeholder="Jumlah" value={formPemakaian.jumlah} onChange={(e) => setFormPemakaian({...formPemakaian, jumlah: e.target.value})} />
                      <Input type="file" accept=".pdf" onChange={(e) => setFilePemakaian(e.target.files?.[0] || null)} />
                    </div>
                    <Button onClick={handleSavePemakaian} className="bg-blue-600 w-full">Simpan</Button>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <Table>
                <TableHeader><TableRow><TableHead>Tanggal</TableHead><TableHead>Nama</TableHead><TableHead>Barang</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                <TableBody>
                  {dataPemakaian.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.tanggal}</TableCell><TableCell>{item.nama}</TableCell><TableCell>{item.barang}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => setViewDocument(item)}><FileText size={16} /></Button>
                        <Button variant="outline" size="icon" onClick={() => { setFormPemakaian({ id: item.id, tanggal: item.tanggal, nama: item.nama, kegiatan: item.kegiatan, barang: item.barang, jumlah: item.jumlah.toString() }); setIsDialogPemakaianOpen(true); }}><Pencil size={16} className="text-amber-600" /></Button>
                        <Button variant="outline" size="icon" onClick={() => { if(confirm("Hapus?")) deletePemakaian(item.id).then(loadData) }}><Trash2 size={16} className="text-red-600" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      </main>

      {/* View Document Dialog */}
      <Dialog open={!!viewDocument} onOpenChange={() => setViewDocument(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Pratinjau Dokumen</DialogTitle></DialogHeader>
          <div className="flex flex-col items-center p-8 bg-slate-50 border-2 border-dashed rounded-lg">
            <FileText size={48} className="text-slate-400 mb-4" />
            <p className="text-sm mb-6">{viewDocument?.dokumen ? "Dokumen tersedia" : "Tidak ada file"}</p>
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

  // Helper reset functions
  function resetFormPembelian() {
    setFormData({ id: "", noBast: "", tanggal: "", jumlah: "", penyedia: "" });
    setFile(null);
  }
  function resetFormPemakaian() {
    setFormPemakaian({ id: "", tanggal: "", nama: "", kegiatan: "", barang: "", jumlah: "" });
    setFilePemakaian(null);
  }
}
