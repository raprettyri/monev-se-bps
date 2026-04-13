"use server"

import { PrismaClient } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { put } from "@vercel/blob"

const prisma = new PrismaClient()

// 1. Fungsi untuk mengambil data (Yang tadi dibilang hilang)
export async function getPembelian() {
  return await prisma.pembelian.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

// 2. Fungsi untuk menambah data + Upload Cloud
export async function addPembelian(formData: FormData) {
  const file = formData.get("dokumen") as File;
  let urlFile = "";

  if (file && file.size > 0) {
    const blob = await put(file.name, file, {
      access: 'public',
    });
    urlFile = blob.url;
  }

  await prisma.pembelian.create({
    data: {
      noBast: formData.get("noBast") as string,
      tanggal: formData.get("tanggal") as string,
      jumlah: parseInt(formData.get("jumlah") as string),
      penyedia: formData.get("penyedia") as string,
      dokumen: urlFile
    }
  })

  revalidatePath("/")
}

// 3. Fungsi untuk menghapus data (Yang tadi dibilang hilang juga)
export async function deletePembelian(id: string) {
  await prisma.pembelian.delete({ where: { id } })
  revalidatePath("/")
}
