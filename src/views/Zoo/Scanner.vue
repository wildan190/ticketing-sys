<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { Html5Qrcode } from 'html5-qrcode'

const router = useRouter()
const orderId = ref('')
const loading = ref(false)
const scanResult = ref<any>(null)
const errorMsg = ref('')
const isScanningPaused = ref(false)
const isCameraStarted = ref(false)
const html5QrCode = ref<Html5Qrcode | null>(null)
const currentTime = ref('')

const updateTime = () => {
  currentTime.value = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Makassar',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(new Date())
}

let timeInterval: any = null

// Camera Selection State
const devices = ref<any[]>([])
const selectedCameraId = ref(localStorage.getItem('preferredCameraId') || '')
const isCameraLoading = ref(false)

const getAuthHeaders = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  return userInfo.token ? { Authorization: `Bearer ${userInfo.token}` } : {}
}

const initializeScanner = async () => {
  try {
    const cameras = await Html5Qrcode.getCameras()
    devices.value = cameras
    if (cameras.length > 0) {
      if (!selectedCameraId.value || !cameras.find(c => c.id === selectedCameraId.value)) {
        selectedCameraId.value = cameras[0].id
      }
      startCamera()
    } else {
      errorMsg.value = 'Tidak ada kamera ditemukan.'
    }
  } catch (e) {
    console.error('Failed to get cameras', e)
    errorMsg.value = 'Izin kamera ditolak.'
  }
}

const startCamera = async () => {
  if (!selectedCameraId.value) return
  isCameraLoading.value = true
  
  if (html5QrCode.value && isCameraStarted.value) {
    try { await html5QrCode.value.stop() } catch (e) {}
    isCameraStarted.value = false
  }

  if (!html5QrCode.value) {
    html5QrCode.value = new Html5Qrcode('reader')
  }

  try {
    // Optimization for Blur: Request higher resolution
    await html5QrCode.value.start(
      selectedCameraId.value,
      { 
        fps: 20, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        // High resolution constraints to fix blur
        videoConstraints: {
            width: { min: 640, ideal: 1280, max: 1920 },
            height: { min: 480, ideal: 720, max: 1080 }
        }
      },
      onScanSuccess,
      () => {} 
    )
    isCameraStarted.value = true
    localStorage.setItem('preferredCameraId', selectedCameraId.value)
  } catch (err) {
    console.error('Failed to start camera', err)
    errorMsg.value = 'Gagal membuka kamera. Coba kamera lain atau pastikan izin aktif.'
  } finally {
    isCameraLoading.value = false
  }
}

const onScanSuccess = async (decodedText: string) => {
  if (isScanningPaused.value || loading.value) return
  
  isScanningPaused.value = true
  orderId.value = decodedText.trim()
  await scanTicket()
}

const scanTicket = async () => {
  if (!orderId.value) {
    isScanningPaused.value = false
    return
  }
  
  loading.value = true
  scanResult.value = null
  errorMsg.value = ''
  
  try {
    const rawVal = orderId.value.trim()
    let payload: any = {}
    
    try {
      const parsed = JSON.parse(rawVal)
      if (parsed.ticket_id) {
        payload = { ticket_id: parsed.ticket_id }
      } else if (parsed.order_id) {
        payload = { order_id: parsed.order_id }
      }
    } catch (e) {
      const parts = rawVal.split('-')
      if (parts.length >= 4) {
        payload = { ticket_id: rawVal }
      } else {
        payload = { order_id: rawVal }
      }
    }

    const { data } = await axios.post('/api/bookings/scan', payload, {
      headers: getAuthHeaders()
    })
    
    const result = data.booking as any
    if (data.ticket) {
      result._ticket_info = data.ticket
      result._progress = data.progress
    }
    scanResult.value = result

    setTimeout(() => {
      if (scanResult.value === result) {
        resetScanner()
      }
    }, 4000)
  } catch (error: any) {
    console.error('Scan failed', error)
    errorMsg.value = error.response?.data?.message || 'Tiket salah atau sudah digunakan.'
    
    setTimeout(() => {
      if (!scanResult.value) {
        resetScanner()
      }
    }, 3000)
  } finally {
    loading.value = false
  }
}

const resetScanner = () => {
  scanResult.value = null
  errorMsg.value = ''
  orderId.value = ''
  isScanningPaused.value = false
}

const goBack = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  if (userInfo.role === 'admin') {
    router.push('/zoo/dashboard')
  } else {
    router.push('/zoo/booking')
  }
}

watch(selectedCameraId, () => {
  if (isCameraStarted.value && selectedCameraId.value) {
    startCamera()
  }
})

onMounted(() => {
  initializeScanner()
  updateTime()
  timeInterval = setInterval(() => {
    updateTime()
  }, 1000)
})

onBeforeUnmount(async () => {
  if (timeInterval) clearInterval(timeInterval)
  if (html5QrCode.value && isCameraStarted.value) {
    try { await html5QrCode.value.stop() } catch (e) {}
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-950 flex flex-col font-sans">
    
    <!-- Top Bar -->
    <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between shadow-sm">
      <div class="flex items-center gap-4">
        <button 
          @click="goBack"
          class="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div>
          <h1 class="text-lg font-bold text-gray-900 dark:text-white leading-none">Scanner Tiket</h1>
          <p class="text-xs text-gray-500 mt-0.5">Validasi Individual</p>
        </div>
      </div>
      <div class="text-right">
        <div class="text-xl font-bold font-mono text-gray-900 dark:text-white tabular-nums leading-none">
          {{ currentTime }}
        </div>
        <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5 text-right">WITA (GMT+8)</p>
      </div>
    </header>

    <main class="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      
      <!-- Left Column: Scanner & Input -->
      <div class="space-y-6">
        <div class="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
          <h2 class="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Area Scanner</h2>
          
          <!-- Camera Selection -->
          <div class="mb-4">
            <label class="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Pilih Kamera:</label>
            <div class="relative">
              <select 
                v-model="selectedCameraId"
                class="w-full appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-brand-500 transition-all cursor-pointer"
              >
                <option v-for="device in devices" :key="device.id" :value="device.id">
                  {{ device.label || `Kamera ${devices.indexOf(device) + 1}` }}
                </option>
              </select>
              <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>

          <!-- Camera Preview -->
          <div class="relative aspect-square w-full bg-gray-900 rounded-2xl overflow-hidden border-2 border-gray-100 dark:border-gray-800 mb-6">
            <div id="reader" class="w-full h-full"></div>
            <div v-if="isCameraLoading" class="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white p-4 text-center">
              <div class="h-10 w-10 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
              <p class="text-xs font-bold uppercase tracking-widest">Inisialisasi Kamera...</p>
            </div>
            <div v-if="!isCameraLoading && !isCameraStarted" class="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white p-6 text-center">
               <p class="text-sm font-bold mb-4">{{ errorMsg || 'Kamera Mati' }}</p>
               <button @click="startCamera" class="px-6 py-2.5 bg-brand-500 text-white text-xs font-bold uppercase rounded-xl shadow-lg">Aktifkan Kamera</button>
            </div>
            <!-- Focus Guide -->
            <div v-if="isCameraStarted" class="absolute inset-12 border-2 border-brand-500/30 rounded-2xl pointer-events-none">
                <div class="absolute top-0 left-0 w-full h-0.5 bg-brand-500/60 shadow-[0_0_10px_rgba(70,95,255,0.8)] animate-[scan_2.5s_linear_infinite]"></div>
            </div>
          </div>

          <!-- Manual Input Section -->
          <div class="space-y-3">
             <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider">Atau Input Manual:</label>
             <div class="flex gap-2">
                <input 
                  v-model="orderId"
                  @keyup.enter="scanTicket"
                  type="text"
                  placeholder="ID Tiket (Contoh: ZOO-XXX)"
                  class="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-4 text-base font-bold text-gray-900 dark:text-white outline-none focus:border-brand-500 transition-all placeholder:text-gray-400"
                />
                <button 
                  @click="scanTicket"
                  :disabled="loading || !orderId"
                  class="bg-gray-900 dark:bg-brand-500 text-white px-6 rounded-xl font-bold text-sm shadow-sm hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all"
                >
                  VALIDASI
                </button>
             </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Results Section -->
      <div class="space-y-6">
        <div class="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 min-h-[500px] flex flex-col">
          <h2 class="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 text-center">Hasil Pemindaian</h2>

          <!-- Idle State -->
          <div v-if="!scanResult && !errorMsg && !loading" class="flex-1 flex flex-col items-center justify-center text-center opacity-40">
             <div class="h-24 w-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-300 dark:text-gray-600 mb-6">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 21l-4.35-4.35"/><circle cx="11" cy="11" r="8"/></svg>
             </div>
             <p class="text-lg font-bold text-gray-400 uppercase tracking-widest italic">Menunggu Pembacaan...</p>
             <p class="text-xs text-gray-400 mt-2">Pindai QR Tiket Pengunjung</p>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="flex-1 flex flex-col items-center justify-center text-center">
             <div class="h-14 w-14 border-4 border-gray-100 dark:border-gray-800 border-t-brand-500 rounded-full animate-spin mb-6"></div>
             <p class="text-base font-bold text-gray-500 uppercase tracking-widest animate-pulse">Memproses Data...</p>
          </div>

          <!-- Success State -->
          <div v-if="scanResult" class="flex-1 space-y-6 animate-in fade-in zoom-in duration-300">
             <div class="bg-green-500 text-white p-6 rounded-2xl shadow-lg flex items-center gap-6">
                <div class="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/20">
                   <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div>
                   <h3 class="text-3xl font-black uppercase italic tracking-tighter leading-none">VALID</h3>
                   <p class="text-[11px] font-bold uppercase tracking-widest opacity-80 mt-1">Akses Diizinkan</p>
                </div>
             </div>

             <div class="p-8 bg-gray-50 dark:bg-white/[0.03] rounded-3xl border border-gray-100 dark:border-gray-800 space-y-8">
                <div class="space-y-2">
                   <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Detail Tiket</p>
                   <p class="text-2xl font-black text-gray-900 dark:text-white uppercase leading-none">{{ scanResult._ticket_info?.category?.name }}</p>
                   <p class="text-sm font-mono font-bold text-gray-400 uppercase tracking-widest">{{ scanResult._ticket_info?.ticket_id }}</p>
                </div>

                <div class="grid grid-cols-2 gap-6">
                   <div class="space-y-1">
                      <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID</p>
                      <p class="text-sm font-black text-gray-800 dark:text-gray-200 truncate">{{ scanResult.order_id }}</p>
                   </div>
                   <div class="space-y-1 text-right">
                      <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Urutan</p>
                      <p class="text-sm font-black text-brand-500">{{ scanResult._progress }}</p>
                   </div>
                </div>

                <div class="pt-6 border-t border-gray-200 dark:border-gray-800">
                   <button @click="resetScanner" class="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-950 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-lg hover:scale-[1.02] active:scale-95 transition-all">
                      SCAN BERIKUTNYA
                   </button>
                </div>
             </div>
          </div>

          <!-- Error State -->
          <div v-if="errorMsg" class="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in slide-in-from-bottom-4">
             <div class="h-20 w-20 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-6">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
             </div>
             <h3 class="text-2xl font-black text-red-600 dark:text-red-500 uppercase tracking-tight mb-2 italic">DITOLAK</h3>
             <p class="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide leading-relaxed max-w-[280px] mb-8">{{ errorMsg }}</p>
             <button @click="resetScanner" class="px-8 py-3 bg-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest active:scale-95 transition-all">TRY AGAIN</button>
          </div>

        </div>
      </div>

    </main>

    <!-- Footer Stats (Optional Simple) -->
    <div class="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 text-center">
       <p class="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Sistem Validasi Tiket Individual Kebun Binatang</p>
    </div>
  </div>
</template>

<style scoped>
@keyframes scan {
  0% { top: 0%; opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}

#reader :deep(video) {
  object-fit: cover !important;
  width: 100% !important;
  height: 100% !important;
}

#reader :deep(img) { display: none !important; }

/* Accessible focus ring */
input:focus {
  box-shadow: 0 0 0 4px rgba(70, 95, 255, 0.1);
}
</style>
