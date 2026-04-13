"use server"

import { PrismaClient } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { put } from "@vercel/blob" // Import fungsi upload ke cloud

const prisma = new PrismaClient()

// ... fungsi getPembelian tetap sama ...

export async function addPembelian(formData: FormData) {
  const file = formData.get("dokumen") as File;
  let urlFile = "";

  // PROSES UPLOAD KE CLOUD (Vercel Blob)
  if (file && file.size > 0) {
    // Kita upload filenya dan Vercel akan kasih kita link URL
    const blob = await put(file.name, file, {
      access: 'public',
    });
    urlFile = blob.url; // Link inilah yang akan kita simpan ke Database
  }

  // SIMPAN KE DATABASE NEON
  await prisma.pembelian.create({
    data: {
      noBast: formData.get("noBast") as string,
      tanggal: formData.get("tanggal") as string,
      jumlah: parseInt(formData.get("jumlah") as string),
      penyedia: formData.get("penyedia") as string,
      dokumen: urlFile // Sekarang isinya link https://...
    }
  })

  revalidatePath("/")
}
