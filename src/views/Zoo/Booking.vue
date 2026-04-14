<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import VisitorLayout from '@/components/layout/VisitorLayout.vue'
import Button from '@/components/ui/Button.vue'
import axios from 'axios'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.css'

const router = useRouter()
const categories = ref<any[]>([])
const visitDate = ref('')
const selectedTickets = ref<Record<string, number>>({})
const loading = ref(false)

const fetchCategories = async () => {
  try {
    const { data } = await axios.get('/api/tickets')
    categories.value = data
    
    // Check for pending booking from local storage
    const pending = localStorage.getItem('pendingBooking')
    if (pending) {
      const { tickets, date } = JSON.parse(pending)
      visitDate.value = date
      selectedTickets.value = tickets
      localStorage.removeItem('pendingBooking')
      
      // If user is now logged in, auto-trigger checkout
      const userInfo = localStorage.getItem('userInfo')
      if (userInfo) {
        // Use nextTick to ensure computed properties (totalPrice) are updated
        await nextTick()
        checkout()
      }
    } else {
      data.forEach((cat: any) => {
        selectedTickets.value[cat._id] = 0
      })
    }
  } catch (error) {
    console.error('Failed to fetch categories', error)
  }
}

// Returns true if the selected visit date is Saturday (6) or Sunday (0)
const isWeekend = computed(() => {
  if (!visitDate.value) return false
  const day = new Date(visitDate.value).getDay()
  return day === 0 || day === 6
})

// Get effective price for a category based on visit day
const effectivePrice = (cat: any) => {
  if (isWeekend.value && cat.weekend_price) return cat.weekend_price
  return cat.price
}

const totalPrice = computed(() => {
  return categories.value.reduce((acc, cat) => {
    return acc + (effectivePrice(cat) * (selectedTickets.value[cat._id] || 0))
  }, 0)
})

const checkout = async () => {
  if (totalPrice.value === 0) return alert('Pilih tiket terlebih dahulu')
  if (!visitDate.value) return alert('Pilih tanggal kunjungan')

  const userInfoString = localStorage.getItem('userInfo')
  if (!userInfoString) {
    // Save state before redirecting
    localStorage.setItem('pendingBooking', JSON.stringify({
      tickets: selectedTickets.value,
      date: visitDate.value
    }))
    router.push('/signin')
    return
  }

  loading.value = true
  try {
    const items = categories.value
      .filter(cat => selectedTickets.value[cat._id] > 0)
      .map(cat => ({
        category_id: cat._id,
        quantity: selectedTickets.value[cat._id]
      }))

    const userInfo = JSON.parse(userInfoString)
    const { data } = await axios.post('/api/bookings', {
      items,
      visit_date: visitDate.value,
      user_id: userInfo._id
    })

    window.location.href = data.payment_details.redirect_url
  } catch (error) {
    console.error('Checkout failed', error)
    alert('Terjadi kesalahan saat checkout')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCategories()
  flatpickr('#visit-date', {
    minDate: 'today',
    defaultDate: visitDate.value || undefined,
    onChange: (selectedDates, dateStr) => {
      visitDate.value = dateStr
    }
  })
})
</script>

<template>
  <VisitorLayout>
    <div class="mx-auto max-w-5xl py-10 px-4">
      <div class="mb-10 text-center">
        <h1 class="text-3xl font-bold text-black dark:text-white sm:text-4xl mb-4">Pemesanan Tiket Online</h1>
        <p class="text-gray-500 dark:text-gray-400">Pilih kategori tiket dan tanggal kunjungan Anda untuk menjelajahi keajaiban alam kami.</p>
      </div>

      <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <!-- Left: Ticket Selection + Date -->
        <div class="lg:col-span-2 flex flex-col gap-8">
          <!-- Ticket categories -->
          <div class="bg-white dark:bg-boxdark rounded-2xl shadow-sm border border-stroke dark:border-strokedark overflow-hidden">
            <div class="flex items-center justify-between bg-brand-500/5 p-6 border-b border-stroke dark:border-strokedark">
              <h3 class="text-xl font-bold text-black dark:text-white">Pilih Tiket</h3>
              <span v-if="isWeekend" class="inline-flex items-center gap-1.5 rounded-full bg-orange-100 dark:bg-orange-500/20 px-3 py-1 text-xs font-bold text-orange-600 dark:text-orange-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
                Harga Weekend Berlaku
              </span>
            </div>
            <div class="p-6 sm:p-8">
              <div v-for="cat in categories" :key="cat._id" class="mb-8 last:mb-0 flex items-center justify-between gap-4">
                <div class="flex-1">
                  <h4 class="text-lg font-bold text-black dark:text-white">{{ cat.name }}</h4>
                  <p class="text-sm text-gray-500 mt-1">{{ cat.description || 'Akses penuh ke seluruh area kebun binatang.' }}</p>
                  <div class="flex items-center gap-2 mt-2">
                    <p class="font-bold" :class="isWeekend && cat.weekend_price ? 'line-through text-gray-400 text-sm' : 'text-brand-500'">
                      Rp {{ cat.price.toLocaleString('id-ID') }}
                    </p>
                    <p v-if="isWeekend && cat.weekend_price" class="font-bold text-orange-600 dark:text-orange-400">
                      Rp {{ cat.weekend_price.toLocaleString('id-ID') }}
                      <span class="text-xs font-normal ml-1">(Weekend)</span>
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-3 bg-gray-50 dark:bg-meta-4 p-2 rounded-xl border border-stroke dark:border-strokedark">
                  <button
                    @click="selectedTickets[cat._id] = Math.max(0, (selectedTickets[cat._id] || 0) - 1)"
                    class="h-10 w-10 flex items-center justify-center rounded-lg bg-white dark:bg-boxdark text-black dark:text-white shadow-sm hover:bg-brand-500 hover:text-white transition-all"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  </button>
                  <span class="w-8 text-center text-lg font-bold text-black dark:text-white">{{ selectedTickets[cat._id] || 0 }}</span>
                  <button
                    @click="selectedTickets[cat._id] = (selectedTickets[cat._id] || 0) + 1"
                    class="h-10 w-10 flex items-center justify-center rounded-lg bg-white dark:bg-boxdark text-black dark:text-white shadow-sm hover:bg-brand-500 hover:text-white transition-all"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Date picker -->
          <div class="bg-white dark:bg-boxdark rounded-2xl shadow-sm border border-stroke dark:border-strokedark overflow-hidden">
            <div class="bg-brand-500/5 p-6 border-b border-stroke dark:border-strokedark">
              <h3 class="text-xl font-bold text-black dark:text-white">Pilih Tanggal Kunjungan</h3>
            </div>
            <div class="p-6 sm:p-8">
              <div class="relative">
                <input
                  id="visit-date"
                  type="text"
                  placeholder="Klik untuk memilih tanggal"
                  class="w-full rounded-xl border-[1.5px] border-stroke bg-gray-50 dark:bg-form-input py-4 px-6 font-medium outline-none transition focus:border-brand-500 dark:border-form-strokedark dark:focus:border-brand-500 dark:text-white text-lg"
                />
                <div class="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
              </div>
              <p class="mt-4 text-sm text-gray-500">Tiket hanya berlaku pada tanggal yang dipilih. Pastikan jadwal Anda sudah sesuai.</p>
              <div v-if="isWeekend" class="mt-3 flex items-center gap-2 rounded-lg bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 px-4 py-3">
                <svg class="text-orange-500 flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <p class="text-sm text-orange-700 dark:text-orange-400"><strong>Akhir Pekan:</strong> Harga tiket spesial weekend berlaku untuk tanggal ini.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Summary -->
        <div class="lg:col-span-1">
          <div class="sticky top-24 bg-white dark:bg-boxdark rounded-2xl shadow-lg border border-stroke dark:border-strokedark overflow-hidden">
            <div class="p-6 sm:p-8">
              <h3 class="text-xl font-bold text-black dark:text-white mb-6">Ringkasan Pesanan</h3>

              <div class="flex flex-col gap-4 mb-6">
                <div v-for="cat in categories" :key="cat._id" v-show="(selectedTickets[cat._id] || 0) > 0" class="flex justify-between items-start">
                  <div class="text-sm">
                    <p class="font-medium text-black dark:text-white">{{ cat.name }}</p>
                    <p class="text-gray-500">{{ selectedTickets[cat._id] }} Tiket</p>
                  </div>
                  <span class="font-bold text-sm text-black dark:text-white">
                    Rp {{ (effectivePrice(cat) * (selectedTickets[cat._id] || 0)).toLocaleString('id-ID') }}
                  </span>
                </div>

                <div v-if="visitDate" class="flex justify-between items-center pt-3 border-t border-stroke dark:border-strokedark">
                  <span class="text-sm text-gray-500">Tanggal Kunjungan</span>
                  <span class="text-sm font-bold text-black dark:text-white">{{ visitDate }}</span>
                </div>

                <div v-if="totalPrice === 0" class="text-center py-8 text-gray-400">
                  <p>Belum ada tiket yang dipilih</p>
                </div>
              </div>

              <div class="pt-4 border-t border-stroke dark:border-strokedark">
                <div class="flex justify-between items-center mb-6">
                  <span class="text-lg font-medium text-black dark:text-white">Total Harga</span>
                  <span class="text-2xl font-bold text-brand-500">Rp {{ totalPrice.toLocaleString('id-ID') }}</span>
                </div>

                <Button
                  @click="checkout"
                  :disabled="loading || totalPrice === 0 || !visitDate"
                  class="w-full flex justify-center items-center gap-2 rounded-xl bg-brand-500 py-4 px-6 font-bold text-white hover:bg-opacity-90 shadow-md transition-all disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  <svg v-if="loading" class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                  {{ loading ? 'Sedang Memproses...' : 'Bayar Sekarang' }}
                </Button>
                <p class="mt-4 text-center text-xs text-gray-400 italic">Aman & Terenkripsi oleh Midtrans</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </VisitorLayout>
</template>
