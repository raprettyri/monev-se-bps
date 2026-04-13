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

export async function addPemakaian(formData: FormData) {
  const file = formData.get("dokumen") as File;
  let urlFile = "";

  if (file && file.size > 0) {
    const blob = await put(file.name, file, { access: 'public', addRandomSuffix: true });
    urlFile = blob.url;
  }

  await prisma.pemakaian.create({
    data: {
      tanggal: formData.get("tanggal") as string,
      nama: formData.get("nama") as string,
      kegiatan: formData.get("kegiatan") as string,
      barang: formData.get("barang") as string,
      jumlah: parseInt(formData.get("jumlah") as string),
      dokumen: urlFile
    }
  })
  revalidatePath("/")
}

export async function updatePemakaian(id: string, formData: FormData) {
  const file = formData.get("dokumen") as File;
  let urlFile = "";

  if (file && file.size > 0) {
    const blob = await put(file.name, file, { access: 'public', addRandomSuffix: true });
    urlFile = blob.url;
  }

  const dataToUpdate: any = {
    tanggal: formData.get("tanggal") as string,
    nama: formData.get("nama") as string,
    kegiatan: formData.get("kegiatan") as string,
    barang: formData.get("barang") as string,
    jumlah: parseInt(formData.get("jumlah") as string),
  };

  if (urlFile) dataToUpdate.dokumen = urlFile;

  await prisma.pemakaian.update({
    where: { id },
    data: dataToUpdate
  })
  revalidatePath("/")
}
