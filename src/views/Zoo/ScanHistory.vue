<template>
  <AdminLayout>
    <div class="space-y-8">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="space-y-1">
          <h1 class="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase italic">
            Audit <span class="text-brand-500">Scan</span>
          </h1>
          <p class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">
            Log aktivitas pemindaian tiket WITA
          </p>
        </div>
        
        <div class="flex items-center gap-3">
          <div class="px-4 py-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-3">
            <div class="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <span class="text-[9px] font-black text-gray-900 dark:text-white uppercase tracking-widest leading-none">Status: Live</span>
          </div>
          <button 
            @click="fetchLogs"
            class="h-10 w-10 flex items-center justify-center bg-brand-500 text-white rounded-2xl shadow-lg shadow-brand-500/20 hover:scale-110 active:scale-95 transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          </button>
        </div>
      </div>

      <!-- Search & Data Section -->
      <div class="space-y-6">
        <div class="relative group max-w-2xl">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-500 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </div>
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Cari Tiket ID / Order / Nama..." 
            class="w-full pl-12 pr-6 py-4 bg-white dark:bg-gray-800 border-none rounded-2xl text-[13px] font-bold text-gray-900 dark:text-white ring-1 ring-gray-100 dark:ring-gray-800 focus:ring-2 focus:ring-brand-500 shadow-sm transition-all"
          />
        </div>

        <!-- Table -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-20 space-y-4 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
          <div class="h-10 w-10 rounded-full border-4 border-gray-100 dark:border-gray-800 border-t-brand-500 animate-spin"></div>
          <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">Sinkronisasi Data...</p>
        </div>

        <div v-else-if="filteredLogs.length === 0" class="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 text-center px-6">
          <div class="h-14 w-14 rounded-3xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-300 dark:text-gray-600 mb-4 border border-dashed border-gray-200 dark:border-gray-700">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 21l-4.35-4.35"/><circle cx="11" cy="11" r="8"/></svg>
          </div>
          <h3 class="text-sm font-black text-gray-900 dark:text-white uppercase mb-1">Tidak Ada Data</h3>
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Aktivitas belum tercatat</p>
        </div>

        <div v-else class="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div class="overflow-x-auto overflow-y-hidden">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-gray-800 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  <th class="px-6 py-5">Waktu Scan</th>
                  <th class="px-6 py-5">Tiket</th>
                  <th class="px-6 py-5">Order ID</th>
                  <th class="px-6 py-5">Pembeli</th>
                  <th class="px-6 py-5 text-center">Hasil</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50 dark:divide-gray-800/50">
                <tr v-for="log in filteredLogs" :key="log._id" class="group hover:bg-gray-50/50 dark:hover:bg-brand-500/5 transition-all">
                  <td class="px-6 py-5">
                    <div class="space-y-0.5">
                      <p class="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">{{ formatTime(log.scanned_at) }}</p>
                      <p class="text-[9px] font-bold text-gray-400 uppercase">{{ formatDate(log.scanned_at) }}</p>
                    </div>
                  </td>
                  <td class="px-6 py-5">
                    <div class="space-y-1">
                      <span class="inline-block px-2 py-0.5 bg-brand-500 text-white text-[8px] font-black rounded-md uppercase tracking-widest">{{ log.category?.name || 'Tiket' }}</span>
                      <p class="text-[10px] font-mono font-bold text-gray-500 dark:text-gray-400">{{ log.ticket_id }}</p>
                    </div>
                  </td>
                  <td class="px-6 py-5">
                    <p class="text-[10px] font-black text-gray-400 uppercase truncate max-w-[120px] italic">{{ log.booking?.order_id || 'N/A' }}</p>
                  </td>
                  <td class="px-6 py-5">
                    <div class="flex items-center gap-3">
                      <div class="h-8 w-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-black text-[10px] text-gray-400 uppercase border border-gray-50 dark:border-gray-700">
                        {{ log.booking?.user?.name?.charAt(0) || '?' }}
                      </div>
                      <div class="space-y-0.5">
                        <p class="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-tight">{{ log.booking?.user?.name || 'Guest' }}</p>
                        <p class="text-[9px] font-bold text-gray-400 lowercase italic leading-none">{{ log.booking?.user?.email || '-' }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-5 text-center">
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[8px] font-black uppercase tracking-widest ring-1 ring-green-500/20">
                      VALID
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import AdminLayout from '@/components/layout/AdminLayout.vue';

const logs = ref([]);
const loading = ref(true);
const error = ref(null);
const searchQuery = ref('');

const fetchLogs = async () => {
  loading.value = true;
  error.value = null;
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const { data } = await axios.get('/api/bookings/scan-logs', {
      headers: {
        Authorization: `Bearer ${userInfo.token}`
      }
    });
    logs.value = data;
  } catch (err) {
    console.error('Fetch scan logs error:', err);
    error.value = err.response?.data?.message || 'Gagal memuat data riwayat scan.';
  } finally {
    loading.value = false;
  }
};

const filteredLogs = computed(() => {
  if (!searchQuery.value) return logs.value;
  const q = searchQuery.value.toLowerCase();
  return logs.value.filter(log => 
    log.ticket_id.toLowerCase().includes(q) ||
    log.booking?.order_id?.toLowerCase().includes(q) ||
    log.booking?.user?.name?.toLowerCase().includes(q) ||
    log.booking?.user?.email?.toLowerCase().includes(q)
  );
});

const formatTime = (dateStr) => {
  if (!dateStr) return '--:--';
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Makassar',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date(dateStr));
};

const formatDate = (dateStr) => {
  if (!dateStr) return '---';
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Makassar',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(dateStr));
};

onMounted(fetchLogs);
</script>

<style scoped>
.table-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
}
.table-scrollbar::-webkit-scrollbar {
  height: 6px;
}
.table-scrollbar::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 10px;
}
</style>
