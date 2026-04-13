"use server"

import { PrismaClient } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { put } from "@vercel/blob"

const prisma = new PrismaClient()

export async function getPembelian() {
  return await prisma.pembelian.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function addPembelian(formData: FormData) {
  const file = formData.get("dokumen") as File;
  let urlFile = "";
  if (file && file.size > 0) {
    const blob = await put(file.name, file, { access: 'public', addRandomSuffix: true });
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

export async function deletePembelian(id: string) {
  await prisma.pembelian.delete({ where: { id } })
  revalidatePath("/")
}

// INI FUNGSI YANG SANGAT PENTING
export async function updatePembelian(id: string, formData: FormData) {
  const file = formData.get("dokumen") as File;
  let urlFile = "";
  if (file && file.size > 0) {
    const blob = await put(file.name, file, { access: 'public', addRandomSuffix: true });
    urlFile = blob.url;
  }

  const dataToUpdate: any = {
    noBast: formData.get("noBast") as string,
    tanggal: formData.get("tanggal") as string,
    jumlah: parseInt(formData.get("jumlah") as string),
    penyedia: formData.get("penyedia") as string,
  };

  if (urlFile) {
    dataToUpdate.dokumen = urlFile;
  }

  await prisma.pembelian.update({
    where: { id },
    data: dataToUpdate
  })
  revalidatePath("/")
}

// Tambahkan di actions.ts
export async function getPemakaian() {
  return await prisma.pemakaian.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function addPemakaian(data: any) {
  await prisma.pemakaian.create({
    data: {
      tanggal: data.tanggal,
      nama: data.nama,
      kegiatan: data.kegiatan,
      barang: data.barang,
      jumlah: parseInt(data.jumlah)
    }
  })
  revalidatePath("/")
}

export async function deletePemakaian(id: string) {
  await prisma.pemakaian.delete({ where: { id } })
  revalidatePath("/")
}
