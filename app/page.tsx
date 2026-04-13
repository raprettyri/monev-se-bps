"use client"

import React, { useState, useEffect } from "react"
import { getPembelian, addPembelian, deletePembelian } from "./actions"
import { Menu, LayoutDashboard, ShoppingCart, ArrowDownToLine, PackageMinus, ArrowUpFromLine, ChevronLeft, LogOut, User, Pencil, Trash2, FileText } from "lucide-react"
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
  const [activeMenu, setActiveMenu] = useState("pembelian") // Langsung buka menu pembelian

  // ================= STATE UNTUK PEMBELIAN (DATABASE) =================
  const [dataPembelian, setDataPembelian] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({ id: "", noBast: "", tanggal: "", jumlah: "", penyedia: "", dokumen: "" })
  const [viewDocument, setViewDocument] = useState<any>(null)
  // Ambil data dari database saat pertama kali halaman dimuat
  useEffect(() => {
    async function loadData() {
      const data = await getPembelian()
      setDataPembelian(data)
    }
    loadData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Fungsi Simpan ke Database
  const handleSave = async () => {
    if (formData.id) {
      console.log("Fitur ubah ke DB akan disambung nanti")
    } else {
      await addPembelian(formData) // Kirim ke Neon.tech
    }

    // Tarik data terbaru untuk menyegarkan tabel
    const updatedData = await getPembelian()
    setDataPembelian(updatedData)
    setIsDialogOpen(false)
    resetForm()
  }

  // Fungsi Hapus dari Database
  const handleDelete = async (id: string) => {
    if(confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      await deletePembelian(id) // Hapus dari Neon.tech
      const updatedData = await getPembelian()
      setDataPembelian(updatedData)
    }
  }

  const handleEdit = (item: any) => {
    setFormData({ id: item.id, noBast: item.noBast, tanggal: item.tanggal, jumlah: item.jumlah.toString(), penyedia: item.penyedia, dokumen: item.dokumen })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({ id: "", noBast: "", tanggal: "", jumlah: "", penyedia: "", dokumen: "" })
  }
  // ================= END STATE PEMBELIAN =================

  if (!isLoggedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Login Monev-SE</CardTitle>
            <CardDescription>Masukkan kredensial untuk masuk ke sistem.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Username" />
            <Input type="password" placeholder="Password" />
            <Button className="w-full bg-blue-600" onClick={() => setIsLoggedIn(true)}>Masuk</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // --- Data Dummy untuk Chart ---
  const totalMasuk = 150
  const totalKeluar = 50
  const sisaStok = totalMasuk - totalKeluar
  const chartData = [
    { name: 'Sisa Stok', value: sisaStok, color: '#2563eb' },
    { name: 'Terpakai/Keluar', value: totalKeluar, color: '#cbd5e1' },
  ]

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Selamat Datang di Dashboard Monev-SE!</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader><CardTitle>Ringkasan Stok di Provinsi</CardTitle></CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                        {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                  <p className="text-center mt-4 font-semibold text-blue-700">Sisa Stok Saat Ini: {sisaStok} Unit</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      case "pembelian":
        return (
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between bg-white border-b border-slate-100 pb-4">
              <div>
                <CardTitle className="text-xl font-bold text-slate-800">Data Penerimaan (Pembelian)</CardTitle>
                <CardDescription>Kelola barang masuk dari penyedia.</CardDescription>
              </div>

              <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) resetForm(); }}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">+ Tambah Pembelian</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{formData.id ? "Ubah Data Pembelian" : "Tambah Data Pembelian"}</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2"><Label>Nomor BAST</Label><Input name="noBast" value={formData.noBast} onChange={handleInputChange} /></div>
                    <div className="grid gap-2"><Label>Tanggal BAST</Label><Input name="tanggal" type="date" value={formData.tanggal} onChange={handleInputChange} /></div>
                    <div className="grid gap-2"><Label>Jumlah Barang</Label><Input name="jumlah" type="number" value={formData.jumlah} onChange={handleInputChange} /></div>
                    <div className="grid gap-2"><Label>Nama Penyedia</Label><Input name="penyedia" value={formData.penyedia} onChange={handleInputChange} /></div>
                    <div className="grid gap-2"><Label>Upload Dokumen</Label><Input type="file" /></div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                    <Button onClick={handleSave} className="bg-blue-600">Simpan Data</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Dialog open={!!viewDocument} onOpenChange={(open) => { if(!open) setViewDocument(null) }}>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Pratinjau Dokumen</DialogTitle>
                    <CardDescription>Nomor BAST: {viewDocument?.noBast}</CardDescription>
                  </DialogHeader>
                  <div className="flex flex-col items-center justify-center p-8 mt-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg">
                    <FileText size={64} className="text-slate-400 mb-4" />
                    <p className="font-semibold text-slate-700 text-lg">{viewDocument?.dokumen || "Dokumen_BAST.pdf"}</p>
                    <p className="text-sm text-slate-500 mt-1">Penyedia: {viewDocument?.penyedia}</p>

                    <div className="mt-6 p-3 bg-blue-50 text-blue-700 text-sm rounded-md w-full text-center border border-blue-100">
                      Karena masih menggunakan server lokal, pratinjau PDF asli belum ditampilkan. Di versi *production*, PDF akan muncul di sini.
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setViewDocument(null)}>Tutup</Button>
                    <Button className="bg-blue-600">Unduh Berkas</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="px-6">No BAST</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Penyedia</TableHead>
                    <TableHead className="text-center">Dokumen</TableHead>
                    <TableHead className="text-right px-6">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataPembelian.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-500">Belum ada data pembelian.</TableCell></TableRow>
                  ) : (
                    dataPembelian.map((item) => (
                      <TableRow key={item.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium px-6">{item.noBast}</TableCell>
                        <TableCell>{item.tanggal}</TableCell>
                        <TableCell>{item.jumlah} Unit</TableCell>
                        <TableCell>{item.penyedia}</TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800" onClick={() => setViewDocument(item)}>
                            <FileText size={16} className="mr-2"/> Lihat
                          </Button>
                        </TableCell>
                        <TableCell className="text-right px-6 space-x-2">
                          <Button variant="outline" size="icon" onClick={() => handleEdit(item)}><Pencil size={16} className="text-amber-600" /></Button>
                          <Button variant="outline" size="icon" onClick={() => handleDelete(item.id)}><Trash2 size={16} className="text-red-600" /></Button>
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
        return <div><h2 className="text-2xl font-bold">Fitur Sedang Dibangun</h2></div>
    }
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className={`${isSidebarOpen ? "w-64" : "w-0 sm:w-20"} bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col relative`}>
        {isSidebarOpen && (<button onClick={() => setIsSidebarOpen(false)} className="absolute -right-3 top-6 bg-white border border-slate-200 rounded-full p-1 hover:bg-slate-100 hidden sm:block"><ChevronLeft size={16} /></button>)}
        <div className={`p-4 border-b border-slate-100 flex items-center ${isSidebarOpen ? 'justify-start' : 'justify-center'} h-20`}>
          <div className="bg-blue-100 p-2 rounded-full text-blue-600 shrink-0"><User size={24} /></div>
          {isSidebarOpen && (<div className="ml-3 overflow-hidden"><p className="text-sm font-bold truncate">Admin Provinsi</p><p className="text-xs text-slate-500 truncate">BPS Aceh</p></div>)}
        </div>
        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-2 px-3">
          <MenuButton icon={<LayoutDashboard />} label="Dashboard" isActive={activeMenu === "dashboard"} onClick={() => setActiveMenu("dashboard")} isOpen={isSidebarOpen} />
          <MenuButton icon={<ShoppingCart />} label="Pembelian" isActive={activeMenu === "pembelian"} onClick={() => setActiveMenu("pembelian")} isOpen={isSidebarOpen} />
          <MenuButton icon={<ArrowDownToLine />} label="Transfer Masuk" isActive={activeMenu === "masuk"} onClick={() => setActiveMenu("masuk")} isOpen={isSidebarOpen} />
          <MenuButton icon={<PackageMinus />} label="Pemakaian" isActive={activeMenu === "pemakaian"} onClick={() => setActiveMenu("pemakaian")} isOpen={isSidebarOpen} />
          <MenuButton icon={<ArrowUpFromLine />} label="Transfer Keluar" isActive={activeMenu === "keluar"} onClick={() => setActiveMenu("keluar")} isOpen={isSidebarOpen} />
        </div>
        <div className="p-4 border-t border-slate-100">
          <button onClick={() => setIsLoggedIn(false)} className={`flex items-center w-full p-2 rounded-md text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}>
            <LogOut size={20} className="shrink-0" />
            {isSidebarOpen && <span className="ml-3 font-medium text-sm">Keluar Akun</span>}
          </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center px-6 justify-between shrink-0">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (<button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-slate-100 rounded-md hover:bg-slate-200"><Menu size={20} /></button>)}
            <div><h1 className="text-xl font-bold text-slate-800 tracking-tight">MONEV-SE</h1><p className="text-xs text-slate-500 hidden sm:block">Logistik Sensus Ekonomi</p></div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#F4F7FB]">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}

function MenuButton({ icon, label, isActive, onClick, isOpen }: any) {
  return (
    <button onClick={onClick} title={!isOpen ? label : ""} className={`flex items-center p-3 rounded-lg transition-colors w-full ${isActive ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"} ${isOpen ? 'justify-start' : 'justify-center'}`}>
      <span className="shrink-0">{icon}</span>
      {isOpen && <span className="ml-3 text-sm font-medium whitespace-nowrap overflow-hidden">{label}</span>}
    </button>
  )
}
