<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import axios from 'axios'

interface Category {
  _id: string
  name: string
  price: number
  weekend_price: number | null
  description: string
  is_active: boolean
}

const categories = ref<Category[]>([])
const loading = ref(true)
const saving = ref(false)
const successMsg = ref('')
const errorMsg = ref('')
const showModal = ref(false)

const emptyForm = () => ({ name: '', price: 0, weekend_price: null as number | null, description: '', is_active: true })
const form = ref(emptyForm())
const editingId = ref<string | null>(null)

const getAuthHeaders = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  return userInfo.token ? { Authorization: `Bearer ${userInfo.token}` } : {}
}

const fetchCategories = async () => {
  loading.value = true
  try {
    const { data } = await axios.get('/api/tickets/all', { headers: getAuthHeaders() })
    categories.value = data
  } catch (e) {
    errorMsg.value = 'Gagal memuat kategori tiket'
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  editingId.value = null
  form.value = emptyForm()
  showModal.value = true
}

const openEdit = (cat: Category) => {
  editingId.value = cat._id
  form.value = {
    name: cat.name,
    price: cat.price,
    weekend_price: cat.weekend_price,
    description: cat.description,
    is_active: cat.is_active,
  }
  showModal.value = true
}

const saveCategory = async () => {
  saving.value = true
  successMsg.value = ''
  errorMsg.value = ''
  try {
    const payload = {
      ...form.value,
      weekend_price: form.value.weekend_price || null,
    }
    if (editingId.value) {
      await axios.put(`/api/tickets/${editingId.value}`, payload, { headers: getAuthHeaders() })
      successMsg.value = 'Kategori berhasil diperbarui!'
    } else {
      await axios.post('/api/tickets', payload, { headers: getAuthHeaders() })
      successMsg.value = 'Kategori baru berhasil ditambahkan!'
    }
    showModal.value = false
    await fetchCategories()
  } catch (e) {
    errorMsg.value = 'Gagal menyimpan kategori'
  } finally {
    saving.value = false
  }
}

const deleteCategory = async (id: string) => {
  if (!confirm('Yakin ingin menghapus kategori ini?')) return
  try {
    await axios.delete(`/api/tickets/${id}`, { headers: getAuthHeaders() })
    successMsg.value = 'Kategori berhasil dihapus!'
    await fetchCategories()
  } catch (e) {
    errorMsg.value = 'Gagal menghapus kategori'
  }
}

const toggleActive = async (cat: Category) => {
  try {
    await axios.put(`/api/tickets/${cat._id}`, { is_active: !cat.is_active }, { headers: getAuthHeaders() })
    await fetchCategories()
  } catch (e) {
    errorMsg.value = 'Gagal mengubah status'
  }
}

onMounted(fetchCategories)
</script>

<template>
  <AdminLayout>
    <div class="mx-auto max-w-7xl">
      <PageBreadcrumb pageTitle="Manajemen Harga Tiket" />

      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-black dark:text-white">Kategori Tiket</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Kelola harga tiket reguler dan harga spesial akhir pekan (Sabtu & Minggu).</p>
        </div>
        <button
          @click="openCreate"
          class="flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-opacity-90 transition-all shadow-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Tambah Kategori
        </button>
      </div>

      <!-- Notifications -->
      <div v-if="successMsg" class="mb-4 rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 p-4 text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        {{ successMsg }}
      </div>
      <div v-if="errorMsg" class="mb-4 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 text-sm text-red-700 dark:text-red-400">
        {{ errorMsg }}
      </div>

      <!-- Table -->
      <div class="rounded-xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full table-auto">
            <thead>
              <tr class="bg-gray-2 text-left dark:bg-meta-4">
                <th class="py-4 px-6 font-medium text-black dark:text-white">Nama Kategori</th>
                <th class="py-4 px-6 font-medium text-black dark:text-white">Harga Reguler</th>
                <th class="py-4 px-6 font-medium text-black dark:text-white">Harga Weekend</th>
                <th class="py-4 px-6 font-medium text-black dark:text-white">Deskripsi</th>
                <th class="py-4 px-6 text-center font-medium text-black dark:text-white">Status</th>
                <th class="py-4 px-6 text-center font-medium text-black dark:text-white">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="6" class="py-10 text-center text-gray-400">Memuat data...</td>
              </tr>
              <tr v-else-if="categories.length === 0">
                <td colspan="6" class="py-10 text-center text-gray-400">Belum ada kategori tiket.</td>
              </tr>
              <tr v-for="cat in categories" :key="cat._id" class="border-t border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <td class="py-4 px-6">
                  <p class="font-semibold text-black dark:text-white">{{ cat.name }}</p>
                </td>
                <td class="py-4 px-6">
                  <p class="font-medium text-black dark:text-white">Rp {{ cat.price.toLocaleString('id-ID') }}</p>
                </td>
                <td class="py-4 px-6">
                  <p v-if="cat.weekend_price" class="font-medium text-orange-600 dark:text-orange-400">
                    Rp {{ cat.weekend_price.toLocaleString('id-ID') }}
                  </p>
                  <span v-else class="text-xs text-gray-400 italic">Sama dengan reguler</span>
                </td>
                <td class="py-4 px-6">
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ cat.description || '-' }}</p>
                </td>
                <td class="py-4 px-6 text-center">
                  <button @click="toggleActive(cat)" class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all"
                    :class="cat.is_active
                      ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400 hover:bg-gray-200'">
                    <span class="h-1.5 w-1.5 rounded-full" :class="cat.is_active ? 'bg-green-500' : 'bg-gray-400'"></span>
                    {{ cat.is_active ? 'Aktif' : 'Nonaktif' }}
                  </button>
                </td>
                <td class="py-4 px-6 text-center">
                  <div class="flex items-center justify-center gap-2">
                    <button @click="openEdit(cat)" class="rounded-lg p-2 text-gray-500 hover:text-brand-500 hover:bg-brand-500/10 transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button @click="deleteCategory(cat._id)" class="rounded-lg p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Info weekend -->
      <div class="mt-4 flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
        <svg class="mt-0.5 flex-shrink-0 text-orange-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        Harga Weekend berlaku setiap <strong class="text-black dark:text-white mx-1">Sabtu &amp; Minggu</strong>. Jika dikosongkan, harga reguler akan dipakai di semua hari.
      </div>
    </div>
  </AdminLayout>

  <!-- Modal Create/Edit -->
  <Teleport to="body">
    <div v-if="showModal" class="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showModal = false"></div>
      <div class="relative w-full max-w-lg bg-white dark:bg-boxdark rounded-2xl shadow-2xl overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-stroke dark:border-strokedark">
          <h3 class="text-lg font-bold text-black dark:text-white">
            {{ editingId ? 'Edit Kategori Tiket' : 'Tambah Kategori Baru' }}
          </h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="p-6 space-y-4">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-black dark:text-white">Nama Kategori <span class="text-red-500">*</span></label>
            <input
              v-model="form.name"
              type="text"
              placeholder="contoh: Dewasa, Anak-anak, Mancanegara"
              class="w-full rounded-lg border border-stroke bg-gray-50 dark:bg-form-input dark:border-form-strokedark px-4 py-3 text-sm outline-none focus:border-brand-500 dark:focus:border-brand-500 dark:text-white transition"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-black dark:text-white">Harga Reguler (Rp) <span class="text-red-500">*</span></label>
              <input
                v-model.number="form.price"
                type="number"
                placeholder="0"
                min="0"
                class="w-full rounded-lg border border-stroke bg-gray-50 dark:bg-form-input dark:border-form-strokedark px-4 py-3 text-sm outline-none focus:border-brand-500 dark:focus:border-brand-500 dark:text-white transition"
              />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-black dark:text-white">
                Harga Weekend (Rp)
                <span class="text-orange-500 font-normal ml-1">Sab & Min</span>
              </label>
              <input
                v-model.number="form.weekend_price"
                type="number"
                placeholder="Kosongkan = sama"
                min="0"
                class="w-full rounded-lg border border-orange-300 dark:border-orange-500/40 bg-orange-50 dark:bg-orange-500/10 px-4 py-3 text-sm outline-none focus:border-orange-500 dark:text-white transition placeholder:text-orange-300 dark:placeholder:text-orange-500/50"
              />
            </div>
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-black dark:text-white">Deskripsi</label>
            <textarea
              v-model="form.description"
              rows="2"
              placeholder="Deskripsi singkat kategori tiket (opsional)"
              class="w-full rounded-lg border border-stroke bg-gray-50 dark:bg-form-input dark:border-form-strokedark px-4 py-3 text-sm outline-none focus:border-brand-500 dark:focus:border-brand-500 dark:text-white transition resize-none"
            ></textarea>
          </div>

          <div class="flex items-center gap-3">
            <button
              @click="form.is_active = !form.is_active"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              :class="form.is_active ? 'bg-brand-500' : 'bg-gray-300 dark:bg-gray-600'"
            >
              <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                :class="form.is_active ? 'translate-x-6' : 'translate-x-1'"></span>
            </button>
            <span class="text-sm text-black dark:text-white">Aktif (ditampilkan di halaman pemesanan)</span>
          </div>
        </div>

        <div class="flex gap-4 px-8 py-6 border-t border-stroke dark:border-strokedark bg-gray-50/50 dark:bg-white/[0.02]">
          <button
            @click="showModal = false"
            class="flex-1 rounded-xl border border-stroke dark:border-strokedark py-3.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-white/5 transition-all active:scale-95 shadow-sm"
          >
            Batal
          </button>
          <button
            @click="saveCategory"
            :disabled="saving || !form.name || !form.price"
            class="flex-1 rounded-xl bg-brand-500 py-3.5 text-sm font-bold text-white hover:bg-brand-600 shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all active:scale-95"
          >
            {{ saving ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Tambah Kategori') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
