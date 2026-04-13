"use client"

import React, { useState, useEffect } from "react"
import { getPembelian, addPembelian, deletePembelian } from "./actions"
// Pastikan Pencil diimport di sini
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

  const [dataPembelian, setDataPembelian] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewDocument, setViewDocument] = useState<any>(null)

  // State Form
  const [formData, setFormData] = useState({ id: "", noBast: "", tanggal: "", jumlah: "", penyedia: "" })
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const data = await getPembelian()
    setDataPembelian(data)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSave = async () => {
    // Tombol sekarang pasti bereaksi
    const dataToSend = new FormData()
    dataToSend.append("noBast", formData.noBast)
    dataToSend.append("tanggal", formData.tanggal)
    dataToSend.append("jumlah", formData.jumlah)
    dataToSend.append("penyedia", formData.penyedia)
    if (file) dataToSend.append("dokumen", file)

    try {
      if (formData.id) {
        alert("Fitur update akan segera datang, sementara silakan hapus dan buat baru.")
      } else {
        await addPembelian(dataToSend)
      }
      await loadData()
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Gagal simpan:", error)
      alert("Terjadi kesalahan saat menyimpan data.")
    }
  }

  const handleDelete = async (id: string) => {
    if(confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      await deletePembelian(id)
      await loadData()
    }
  }

  // Fungsi Edit dimunculkan kembali
  const handleEdit = (item: any) => {
    setFormData({
      id: item.id,
      noBast: item.noBast,
      tanggal: item.tanggal,
      jumlah: item.jumlah.toString(),
      penyedia: item.penyedia
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({ id: "", noBast: "", tanggal: "", jumlah: "", penyedia: "" })
    setFile(null)
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
      {/* Sidebar - Tetap Sama */}
      <aside className={`${isSidebarOpen ? "w-64" : "w-0 sm:w-20"} bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col relative`}>
        <div className="p-4 border-b border-slate-100 flex items-center h-20">
          <div className="bg-blue-100 p-2 rounded-full text-blue-600 shrink-0"><User size={24} /></div>
          {isSidebarOpen && <div className="ml-3"><p className="text-sm font-bold">Admin Pidie</p></div>}
        </div>
        <div className="flex-1 py-4 px-3 flex flex-col gap-2">
          <MenuButton icon={<LayoutDashboard />} label="Dashboard" isActive={activeMenu === "dashboard"} onClick={() => setActiveMenu("dashboard")} isOpen={isSidebarOpen} />
          <MenuButton icon={<ShoppingCart />} label="Pembelian" isActive={activeMenu === "pembelian"} onClick={() => setActiveMenu("pembelian")} isOpen={isSidebarOpen} />
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center px-6">
          <h1 className="text-xl font-bold text-slate-800">MONEV-SE BPS PIDIE</h1>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-[#F4F7FB]">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <div><CardTitle>Data Penerimaan</CardTitle></div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild><Button className="bg-blue-600">+ Tambah Data</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{formData.id ? "Edit" : "Tambah"} Pembelian</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2"><Label>Nomor BAST</Label><Input name="noBast" value={formData.noBast} onChange={handleInputChange} /></div>
                    <div className="grid gap-2"><Label>Tanggal</Label><Input name="tanggal" type="date" value={formData.tanggal} onChange={handleInputChange} /></div>
                    <div className="grid gap-2"><Label>Jumlah</Label><Input name="jumlah" type="number" value={formData.jumlah} onChange={handleInputChange} /></div>
                    <div className="grid gap-2"><Label>Penyedia</Label><Input name="penyedia" value={formData.penyedia} onChange={handleInputChange} /></div>
                    <div className="grid gap-2"><Label>File PDF</Label><Input type="file" accept=".pdf" onChange={handleFileChange} /></div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleSave} className="bg-blue-600 w-full">Simpan Data</Button>
                  </DialogFooter>
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
                        {/* IKON EDIT MUNCUL LAGI DI SINI */}
                        <Button variant="outline" size="icon" onClick={() => handleEdit(item)}><Pencil size={16} className="text-amber-600" /></Button>
                        <Button variant="outline" size="icon" onClick={() => handleDelete(item.id)}><Trash2 size={16} className="text-red-600" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modal View Document */}
      <Dialog open={!!viewDocument} onOpenChange={() => setViewDocument(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Pratinjau Dokumen</DialogTitle></DialogHeader>
          <div className="flex flex-col items-center p-6 bg-slate-50 rounded-lg border-2 border-dashed">
            <FileText size={48} className="text-slate-400 mb-4" />
            <p className="text-sm font-medium mb-4 text-center">{viewDocument?.dokumen ? "Dokumen tersedia di cloud" : "Tidak ada file"}</p>
            {viewDocument?.dokumen && (
              <a href={viewDocument.dokumen} target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm">
                <ExternalLink size={14} className="mr-2" /> Lihat PDF Asli
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
    <button onClick={onClick} className={`flex items-center p-3 rounded-lg w-full ${isActive ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100"} ${isOpen ? 'justify-start' : 'justify-center'}`}>
      {icon} {isOpen && <span className="ml-3 text-sm font-medium">{label}</span>}
    </button>
  )
}
