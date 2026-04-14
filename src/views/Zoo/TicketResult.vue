<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import VisitorLayout from '@/components/layout/VisitorLayout.vue'
import axios from 'axios'

const route = useRoute()
const booking = ref<any>(null)
const tickets = ref<any[]>([])
const loading = ref(true)
const verifying = ref(false)

const getAuthHeaders = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  return userInfo.token ? { Authorization: `Bearer ${userInfo.token}` } : {}
}

const fetchBookingAndTickets = async () => {
  try {
    const { data } = await axios.get(`/api/bookings/${route.params.id}`)
    booking.value = data

    // If paid, fetch individual tickets
    if (data.payment_status === 'paid') {
      const { data: ticketData } = await axios.get(`/api/bookings/${data._id}/tickets`)
      tickets.value = ticketData
    }

    // If pending or no tickets yet, verify now (for dev/localhost convenience)
    if (data.payment_status === 'pending' || (data.payment_status === 'paid' && tickets.value.length === 0)) {
      verifying.value = true
      try {
        const { data: verified } = await axios.get(`/api/bookings/verify/${data.order_id}`, {
          headers: getAuthHeaders()
        })
        booking.value = verified
        if (verified.payment_status === 'paid') {
          const { data: ticketData } = await axios.get(`/api/bookings/${verified._id}/tickets`)
          tickets.value = ticketData
        }
      } catch (e) {
        console.warn('Verification failed', e)
      } finally {
        verifying.value = false
      }
    }
  } catch (error) {
    console.error('Failed to fetch booking', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchBookingAndTickets)
</script>

<template>
  <VisitorLayout>
    <div class="mx-auto max-w-4xl py-10 px-4">
      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <div class="h-12 w-12 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
        <p class="mt-4 text-gray-500">Memuat tiket Anda...</p>
      </div>

      <div v-else-if="booking" class="animate-in fade-in zoom-in duration-500">
        <div class="mb-8 text-center">
          <div class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mb-4 shadow-sm">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-black dark:text-white mb-2">E-Ticket Zoo</h1>
          <p class="text-gray-500 dark:text-gray-400">Order ID: <span class="font-bold text-gray-900 dark:text-gray-100">{{ booking.order_id }}</span></p>
        </div>

        <!-- Main Content: Tickets Grid/List -->
        <div v-if="booking.payment_status === 'paid'" class="space-y-8">
           
           <div v-if="tickets.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div v-for="(ticket, index) in tickets" :key="ticket._id" 
                class="group relative bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden transition-all hover:scale-[1.02]"
              >
                <!-- Card Header -->
                <div class="bg-gray-50 dark:bg-gray-800/50 px-8 py-5 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
                   <div class="flex items-center gap-3">
                     <div class="h-8 w-8 rounded-lg bg-brand-500 text-white flex items-center justify-center font-black text-xs">
                        {{ index + 1 }}
                     </div>
                     <span class="text-[10px] font-black uppercase tracking-widest text-gray-400">Tiket Elektronik</span>
                   </div>
                   <div v-if="ticket.status === 'used'" class="flex items-center gap-1.5 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                      Telah Dipakai
                   </div>
                   <div v-else class="flex items-center gap-1.5 bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-sm">
                      <span class="relative flex h-1.5 w-1.5">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                      </span>
                      Siap Pakai
                   </div>
                </div>

                <!-- QR Section -->
                <div class="p-8 flex flex-col items-center">
                   <div class="relative p-4 bg-white rounded-3xl shadow-inner border border-gray-100 mb-6 group-hover:shadow-lg transition-all">
                      <img :src="ticket.qr_code" alt="QR Code Ticket" class="w-48 h-48 mx-auto" :class="{ 'grayscale opacity-20': ticket.status === 'used' }" />
                      <div v-if="ticket.status === 'used'" class="absolute inset-0 flex items-center justify-center">
                         <div class="bg-gray-900/10 backdrop-blur-[2px] rounded-full p-4 border-2 border-white/50 text-gray-600">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                         </div>
                      </div>
                   </div>
                   
                   <div class="text-center">
                      <h3 class="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-1">{{ ticket.category?.name || 'Tiket Masuk' }}</h3>
                      <p class="text-[10px] font-mono font-bold text-gray-400 dark:text-gray-500 tracking-[0.2em]">{{ ticket.ticket_id }}</p>
                   </div>
                </div>

                <!-- Perforation Decor -->
                <div class="relative flex items-center justify-center px-4">
                   <div class="absolute left-[-16px] h-8 w-8 rounded-full bg-gray-50 dark:bg-gray-950 border-r border-gray-100 dark:border-gray-800"></div>
                   <div class="w-full border-t-2 border-dashed border-gray-100 dark:border-gray-800"></div>
                   <div class="absolute right-[-16px] h-8 w-8 rounded-full bg-gray-50 dark:bg-gray-950 border-l border-gray-100 dark:border-gray-800"></div>
                </div>

                <!-- Footer Summary -->
                <div class="px-8 py-6 bg-gray-50/50 dark:bg-white/[0.02] flex justify-between items-center">
                   <div>
                      <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">Berlaku Pada</p>
                      <p class="text-xs font-black text-gray-800 dark:text-gray-200">{{ new Date(booking.visit_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) }}</p>
                   </div>
                   <div class="h-10 w-10 flex items-center justify-center text-gray-200 dark:text-gray-800">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v20M2 12h20"/></svg>
                   </div>
                </div>
              </div>
           </div>

           <div v-else-if="verifying" class="py-20 text-center flex flex-col items-center">
              <div class="h-16 w-16 animate-spin rounded-full border-4 border-brand-500 border-t-transparent mb-6"></div>
              <p class="font-bold text-gray-900 dark:text-white">Menyiapkan QR Code Anda...</p>
              <p class="text-sm text-gray-500">Mohon tunggu sebentar, kami sedang memproses tiket individual.</p>
           </div>
        </div>

        <!-- Pending Payment State -->
        <div v-else class="bg-white dark:bg-boxdark rounded-[2.5rem] shadow-xl p-10 text-center border border-stroke dark:border-strokedark max-w-lg mx-auto">
           <div class="h-20 w-20 bg-yellow-50 dark:bg-yellow-500/10 rounded-full flex items-center justify-center text-yellow-600 mb-6 mx-auto">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
           </div>
           <h2 class="text-2xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Pembayaran Tertunda</h2>
           <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-8">Selesaikan pembayaran Anda untuk melihat QR Code tiket. Jika sudah membayar, mohon tunggu beberapa saat untuk verifikasi otomatis.</p>
           
           <div class="flex flex-col gap-3">
              <a :href="booking.payment_details?.redirect_url" target="_blank" class="w-full bg-brand-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-brand-500/30 hover:bg-brand-600 transition-all uppercase tracking-widest text-sm">Selesaikan Pembayaran</a>
              <button @click="fetchBookingAndTickets" class="text-sm font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">Sudah Bayar? Refresh Status</button>
           </div>
        </div>

        <!-- Sticky Footer Info -->
        <div class="mt-12 p-6 rounded-3xl bg-gray-100/50 dark:bg-white/[0.02] border border-gray-200 dark:border-gray-800">
           <div class="flex gap-4 items-start">
              <div class="h-10 w-10 flex-shrink-0 bg-white dark:bg-gray-900 rounded-xl flex items-center justify-center shadow-sm text-brand-500">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <div>
                <h4 class="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight mb-1">Informasi Penting</h4>
                <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Satu QR Code berlaku untuk satu orang pengunjung. Jika Anda membeli lebih dari satu tiket, serahkan perangkat Anda kepada petugas untuk melakukan pemindaian satu per satu.</p>
              </div>
           </div>
        </div>
      </div>

      <div v-else class="text-center py-20 bg-white dark:bg-boxdark rounded-3xl border border-stroke dark:border-strokedark shadow-sm">
        <h2 class="text-xl font-bold text-black dark:text-white mb-2">Tiket Tidak Ditemukan</h2>
        <p class="text-gray-500 mb-8">Maaf, kami tidak dapat menemukan data pemesanan tersebut.</p>
        <router-link to="/zoo/booking" class="bg-brand-500 px-8 py-3 rounded-xl text-white font-bold shadow-md hover:bg-opacity-90">Kembali ke Pemesanan</router-link>
      </div>
    </div>
  </VisitorLayout>
</template>

<style scoped>
@media print {
  header, footer, button, .router-link, .no-print {
    display: none !important;
  }
  .mx-auto {
    max-width: 100% !important;
    padding: 0 !important;
  }
  .shadow-xl {
    box-shadow: none !important;
    border: 1px solid #eee !important;
  }
}
</style>


<style scoped>
@media print {
  header, footer, button, .router-link {
    display: none !important;
  }
  .mx-auto {
    max-width: 100% !important;
    padding: 0 !important;
  }
  .shadow-xl {
    box-shadow: none !important;
    border: 1px solid #eee !important;
  }
}
</style>
