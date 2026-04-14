<script setup lang="ts">
import { ref, onMounted } from 'vue'
import VisitorLayout from '@/components/layout/VisitorLayout.vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

interface TicketSummary {
  total: number;
  used: number;
  allUsed: boolean;
}

interface BookingItem {
  _id: string;
  category?: {
    name: string;
  };
  quantity: number;
  price: number;
}

interface Booking {
  _id: string;
  order_id: string;
  createdAt: string;
  visit_date: string;
  payment_status: 'pending' | 'paid' | 'expired' | 'cancelled';
  total_price: number;
  items: BookingItem[];
  ticketSummary?: TicketSummary;
}

const router = useRouter()
const orders = ref<Booking[]>([])
const loading = ref(true)

const getAuthHeaders = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  return userInfo.token ? { Authorization: `Bearer ${userInfo.token}` } : {}
}

const fetchMyOrders = async () => {
  try {
    const { data } = await axios.get('/api/bookings/myorders', {
      headers: getAuthHeaders()
    })
    orders.value = data
  } catch (error) {
    console.error('Failed to fetch orders', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchMyOrders()
})
</script>

<template>
  <VisitorLayout>
    <div class="mx-auto max-w-5xl py-12 px-4 sm:px-6 lg:px-8">
      <div class="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Riwayat Pembelian</h1>
          <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Seluruh tiket masuk dan layanan yang pernah Anda beli.</p>
        </div>
      </div>

      <div class="bg-white dark:bg-boxdark rounded-xl shadow-sm border border-stroke dark:border-strokedark overflow-hidden">
        <ul role="list" class="divide-y divide-stroke dark:divide-strokedark">
          <li v-if="loading" class="p-8 text-center text-gray-500">Memuat data pesanan...</li>
          <li v-else-if="orders.length === 0" class="p-8 text-center text-gray-500">Anda belum memiliki riwayat pembelian tiket.</li>
          
          <li v-for="order in orders" :key="order._id" class="p-6">
            <div class="flex items-center justify-between flex-wrap gap-4">
              <div class="flex flex-col">
                <p class="text-sm font-medium text-gray-900 dark:text-white uppercase tracking-wider mb-1">
                  {{ order.order_id }}
                </p>
                <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>Dibeli pada {{ new Date(order.createdAt).toLocaleDateString('id-ID') }}</span>
                  <span class="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span class="font-medium text-gray-900 dark:text-gray-300">Kunjungan: {{ new Date(order.visit_date).toLocaleDateString('id-ID') }}</span>
                </div>
              </div>
              
              <div class="flex items-center gap-4">
                <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wide ring-1 ring-inset"
                  :class="{
                    'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400': order.payment_status === 'paid',
                    'bg-yellow-50 text-yellow-800 ring-yellow-600/20 dark:bg-yellow-500/10 dark:text-yellow-400': order.payment_status === 'pending',
                    'bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-500/10 dark:text-red-400': order.payment_status === 'cancelled' || order.payment_status === 'expired'
                  }">
                  {{ order.payment_status === 'paid' ? 'LUNAS' : order.payment_status.toUpperCase() }}
                </span>

                <!-- Ticket Usage Summary -->
                <span v-if="order.payment_status === 'paid' && order.ticketSummary" 
                  class="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg transition-all"
                  :class="order.ticketSummary.allUsed 
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400' 
                    : 'bg-brand-50 text-brand-500 dark:bg-brand-500/10 shadow-sm'"
                >
                   <svg v-if="order.ticketSummary.allUsed" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                   <span v-else class="relative flex h-2 w-2">
                     <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                     <span class="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                   </span>
                   {{ order.ticketSummary.used }} / {{ order.ticketSummary.total }} Digunakan
                </span>
                
                <button 
                  @click="router.push(`/zoo/ticket/${order._id}`)"
                  class="rounded-full px-6 py-2 text-sm font-bold transition-all duration-300 shadow-sm flex items-center gap-2 active:scale-95 group border border-transparent"
                  :class="{
                    'bg-brand-500 text-white hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/20': order.payment_status === 'paid',
                    'bg-yellow-500 text-white hover:bg-yellow-600 hover:shadow-lg hover:shadow-yellow-500/20': order.payment_status === 'pending',
                    'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-400': order.payment_status !== 'paid' && order.payment_status !== 'pending'
                  }"
                >
                  <span v-if="order.payment_status === 'paid'">Lihat E-Ticket</span>
                  <span v-else-if="order.payment_status === 'pending'">Bayar / Cek Status</span>
                  <span v-else>Pratinjau Tiket</span>
                  <svg class="group-hover:translate-x-0.5 transition-transform" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </div>
            </div>
            
            <div class="mt-4 pt-4 border-t border-stroke dark:border-strokedark grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div>
                  <h4 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Item</h4>
                  <ul class="text-sm space-y-1">
                     <li v-for="item in order.items" :key="item._id" class="text-gray-700 dark:text-gray-300">
                        {{ item.quantity }}x {{ item.category?.name || 'Tiket' }}
                     </li>
                  </ul>
               </div>
               <div class="sm:text-right">
                  <h4 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Total Harga</h4>
                  <p class="text-lg font-bold text-gray-900 dark:text-white">Rp {{ (order.total_price || 0).toLocaleString('id-ID') }}</p>
               </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </VisitorLayout>
</template>

