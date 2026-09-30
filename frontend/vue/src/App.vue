<script setup lang="ts">
import { ref } from 'vue'

const query = ref('')
const documents = [
  { title: 'SK Pembentukan Prodi RPL', category: 'SK & Surat', year: '2026' },
  { title: 'RPS Pemrograman Web', category: 'Kurikulum', year: '2026' },
  { title: 'Laporan PKL - 2024', category: 'Laporan PKL/Magang', year: '2024' },
]
</script>

<template>
  <main class="min-h-screen bg-[#f4f7f8] text-slate-800">
    <aside class="fixed hidden h-screen w-64 flex-col bg-[#123b4a] p-7 text-white md:flex">
      <div class="mb-12"><p class="text-xs uppercase tracking-[0.25em] text-cyan-200">RPL / PRODI</p><h1 class="mt-2 text-2xl font-bold">Arsip Digital</h1></div>
      <nav class="space-y-2 text-sm"><a class="block rounded-xl bg-white/15 px-4 py-3 font-semibold" href="#dashboard">Dashboard</a><a class="block rounded-xl px-4 py-3 text-cyan-100 hover:bg-white/10" href="#arsip">Arsip Dokumen</a><a class="block rounded-xl px-4 py-3 text-cyan-100 hover:bg-white/10" href="#upload">Upload Dokumen</a><a class="block rounded-xl px-4 py-3 text-cyan-100 hover:bg-white/10" href="#master">Data Master</a></nav>
    </aside>
    <section class="md:ml-64"><header class="border-b border-slate-200 bg-white px-6 py-5 md:px-10"><p class="text-sm text-slate-500">Rabu, 30 September 2026</p><h2 class="text-2xl font-bold text-slate-900">Dashboard Arsip Digital</h2></header>
      <div class="mx-auto max-w-7xl space-y-8 p-6 md:p-10"><div class="rounded-3xl bg-[#d8eef0] p-7 md:p-10"><p class="text-sm font-semibold uppercase tracking-wider text-[#23707b]">Pusat arsip prodi</p><h3 class="mt-2 max-w-2xl text-3xl font-bold tracking-tight text-[#123b4a] md:text-5xl">Temukan dokumen penting dalam hitungan detik.</h3><div class="mt-7 flex max-w-2xl gap-3"><input v-model="query" class="min-w-0 flex-1 rounded-xl border-0 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#23707b]" placeholder="Cari judul, NIM, tag, atau isi dokumen..." /><button class="rounded-xl bg-[#123b4a] px-5 py-3 font-semibold text-white">Cari</button></div><p v-if="query" class="mt-3 text-sm text-[#23707b]">Mencari: {{ query }}</p></div>
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><div v-for="item in [['Total Dokumen','1,248','+12 bulan ini'],['Upload Bulan Ini','86','19 menunggu indeks'],['Dokumen Draft','24','Perlu dilengkapi'],['Pengguna Aktif','18','100% akun internal']]" :key="item[0]" class="rounded-2xl border border-slate-200 bg-white p-5"><p class="text-sm text-slate-500">{{ item[0] }}</p><p class="mt-3 text-3xl font-bold text-slate-900">{{ item[1] }}</p><p class="mt-2 text-xs font-medium text-emerald-600">{{ item[2] }}</p></div></div>
+        <div class="rounded-2xl border border-slate-200 bg-white p-6"><h3 class="font-bold text-slate-900">Dokumen terbaru</h3><div class="mt-5 divide-y divide-slate-100"><div v-for="document in documents" :key="document.title" class="flex items-center justify-between gap-4 py-4"><div><p class="font-semibold text-slate-800">{{ document.title }}</p><p class="mt-1 text-sm text-slate-500">{{ document.category }} · {{ document.year }}</p></div><span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Aktif</span></div></div></div>
+      </div>
+    </section>
+  </main>
+</template>
