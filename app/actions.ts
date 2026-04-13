"use server"

import { PrismaClient } from "@prisma/client"
import { revalidatePath } from "next/cache"

// Koneksi standar yang langsung jalan!
const prisma = new PrismaClient()

export async function getPembelian() {
  return await prisma.pembelian.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function addPembelian(formData: any) {
  await prisma.pembelian.create({
    data: {
      noBast: formData.noBast,
      tanggal: formData.tanggal,
      jumlah: parseInt(formData.jumlah),
      penyedia: formData.penyedia,
      dokumen: "File_Tersimpan.pdf"
    }
  })
  revalidatePath("/")
}

export async function deletePembelian(id: string) {
  await prisma.pembelian.delete({ where: { id } })
  revalidatePath("/")
}
