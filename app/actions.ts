"use server"

import { PrismaClient } from "@prisma/client"
// Tambahkan unstable_noStore untuk mencegah hantu cache Next.js!
import { revalidatePath, unstable_noStore as noStore } from "next/cache"
import { put } from "@vercel/blob"

const prisma = new PrismaClient()

// ================= ACTIONS PEMBELIAN =================
export async function getPembelian() { noStore(); return await prisma.pembelian.findMany({ orderBy: { createdAt: 'desc' } }) }
export async function addPembelian(formData: FormData) {
  const file = formData.get("dokumen") as File; let urlFile = "";
  if (file && file.size > 0) { const blob = await put(file.name, file, { access: 'public', addRandomSuffix: true }); urlFile = blob.url; }
  await prisma.pembelian.create({ data: { noBast: formData.get("noBast") as string, tanggal: formData.get("tanggal") as string, barang: formData.get("barang") as string, jumlah: parseInt(formData.get("jumlah") as string), penyedia: formData.get("penyedia") as string, dokumen: urlFile } })
  revalidatePath("/")
}
export async function deletePembelian(id: string) { await prisma.pembelian.delete({ where: { id } }); revalidatePath("/") }
export async function updatePembelian(id: string, formData: FormData) {
  const file = formData.get("dokumen") as File; let urlFile = "";
  if (file && file.size > 0) { const blob = await put(file.name, file, { access: 'public', addRandomSuffix: true }); urlFile = blob.url; }
  const dataToUpdate: any = { noBast: formData.get("noBast") as string, tanggal: formData.get("tanggal") as string, barang: formData.get("barang") as string, jumlah: parseInt(formData.get("jumlah") as string), penyedia: formData.get("penyedia") as string };
  if (urlFile) dataToUpdate.dokumen = urlFile;
  await prisma.pembelian.update({ where: { id }, data: dataToUpdate })
  revalidatePath("/")
}

// ================= ACTIONS PEMAKAIAN =================
export async function getPemakaian() { noStore(); return await prisma.pemakaian.findMany({ orderBy: { createdAt: 'desc' } }) }
export async function addPemakaian(formData: FormData) {
  const file = formData.get("dokumen") as File; let urlFile = "";
  if (file && file.size > 0) { const blob = await put(file.name, file, { access: 'public', addRandomSuffix: true }); urlFile = blob.url; }
  await prisma.pemakaian.create({ data: { tanggal: formData.get("tanggal") as string, nama: formData.get("nama") as string, kegiatan: formData.get("kegiatan") as string, barang: formData.get("barang") as string, jumlah: parseInt(formData.get("jumlah") as string), dokumen: urlFile } })
  revalidatePath("/")
}
export async function deletePemakaian(id: string) { await prisma.pemakaian.delete({ where: { id } }); revalidatePath("/") }
export async function updatePemakaian(id: string, formData: FormData) {
  const file = formData.get("dokumen") as File; let urlFile = "";
  if (file && file.size > 0) { const blob = await put(file.name, file, { access: 'public', addRandomSuffix: true }); urlFile = blob.url; }
  const dataToUpdate: any = { tanggal: formData.get("tanggal") as string, nama: formData.get("nama") as string, kegiatan: formData.get("kegiatan") as string, barang: formData.get("barang") as string, jumlah: parseInt(formData.get("jumlah") as string) };
  if (urlFile) dataToUpdate.dokumen = urlFile;
  await prisma.pemakaian.update({ where: { id }, data: dataToUpdate })
  revalidatePath("/")
}

// ================= ACTIONS TRANSFER KELUAR =================
export async function getTransferKeluar() { noStore(); return await prisma.transferKeluar.findMany({ orderBy: { createdAt: 'desc' } }) }
export async function addTransferKeluar(formData: FormData) {
  const file = formData.get("dokumen") as File; let urlFile = "";
  if (file && file.size > 0) { const blob = await put(file.name, file, { access: 'public', addRandomSuffix: true }); urlFile = blob.url; }
  await prisma.transferKeluar.create({ data: { noBast: formData.get("noBast") as string, tanggal: formData.get("tanggal") as string, tujuan: formData.get("tujuan") as string, barang: formData.get("barang") as string, jumlah: parseInt(formData.get("jumlah") as string), status: formData.get("status") as string || "Dikirim", dokumen: urlFile } })
  revalidatePath("/")
}
export async function deleteTransferKeluar(id: string) { await prisma.transferKeluar.delete({ where: { id } }); revalidatePath("/") }
export async function updateTransferKeluar(id: string, formData: FormData) {
  const file = formData.get("dokumen") as File; let urlFile = "";
  if (file && file.size > 0) { const blob = await put(file.name, file, { access: 'public', addRandomSuffix: true }); urlFile = blob.url; }
  const dataToUpdate: any = { noBast: formData.get("noBast") as string, tanggal: formData.get("tanggal") as string, tujuan: formData.get("tujuan") as string, barang: formData.get("barang") as string, jumlah: parseInt(formData.get("jumlah") as string), status: formData.get("status") as string };
  if (urlFile) dataToUpdate.dokumen = urlFile;
  await prisma.transferKeluar.update({ where: { id }, data: dataToUpdate })
  revalidatePath("/")
}

// ================= ACTIONS TRANSFER MASUK =================
export async function getTransferMasuk() { noStore(); return await prisma.transferMasuk.findMany({ orderBy: { createdAt: 'desc' } }) }
export async function addTransferMasuk(formData: FormData) {
  const file = formData.get("dokumen") as File; let urlFile = "";
  if (file && file.size > 0) { const blob = await put(file.name, file, { access: 'public', addRandomSuffix: true }); urlFile = blob.url; }
  await prisma.transferMasuk.create({ data: { noBast: formData.get("noBast") as string, tanggal: formData.get("tanggal") as string, pengirim: formData.get("pengirim") as string, barang: formData.get("barang") as string, jumlah: parseInt(formData.get("jumlah") as string), dokumen: urlFile } })
  revalidatePath("/")
}
export async function deleteTransferMasuk(id: string) { await prisma.transferMasuk.delete({ where: { id } }); revalidatePath("/") }
export async function updateTransferMasuk(id: string, formData: FormData) {
  const file = formData.get("dokumen") as File; let urlFile = "";
  if (file && file.size > 0) { const blob = await put(file.name, file, { access: 'public', addRandomSuffix: true }); urlFile = blob.url; }
  const dataToUpdate: any = { noBast: formData.get("noBast") as string, tanggal: formData.get("tanggal") as string, pengirim: formData.get("pengirim") as string, barang: formData.get("barang") as string, jumlah: parseInt(formData.get("jumlah") as string) };
  if (urlFile) dataToUpdate.dokumen = urlFile;
  await prisma.transferMasuk.update({ where: { id }, data: dataToUpdate })
  revalidatePath("/")
}
