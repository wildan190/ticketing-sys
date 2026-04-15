<script setup lang="ts">
import { ref, onMounted } from 'vue'
import VisitorLayout from '@/components/layout/VisitorLayout.vue'
import ResponsiveImage from '@/components/ui/images/ResponsiveImage.vue'
import axios from 'axios'

interface FeedingTime {
  time: string
}

interface Animal {
  _id: string
  name: string
  species: string
  description: string
  image_url: string
  feeding_times: FeedingTime[]
}

const animals = ref<Animal[]>([])
const loading = ref(false)

const fetchAnimals = async () => {
  loading.value = true
  try {
    const { data } = await axios.get('/api/animals')
    animals.value = data
  } catch (error) {
    console.error('Failed to fetch animals', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchAnimals)
</script>

<template>
  <VisitorLayout>
    <div class="mx-auto max-w-7xl">
      <div class="mb-12 text-center">
        <h1 class="text-3xl font-bold text-black dark:text-white sm:text-4xl mb-4">Informasi Satwa & Atraksi</h1>
        <p class="text-gray-500 dark:text-gray-400">Kenali lebih dekat penghuni kebun binatang kami dan jangan lewatkan jadwal pemberian makan!</p>
      </div>

      <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:gap-10">
        <div v-for="animal in animals" :key="animal._id" class="group bg-white dark:bg-boxdark rounded-2xl shadow-sm hover:shadow-xl border border-stroke dark:border-strokedark transition-all duration-300 overflow-hidden">
          <div class="relative h-64 w-full overflow-hidden">
            <ResponsiveImage 
              :src="animal.image_url || 'https://via.placeholder.com/300'" 
              :alt="animal.name" 
              class="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div class="absolute top-4 left-4">
              <span class="bg-white/90 dark:bg-black/70 backdrop-blur-sm text-brand-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                {{ animal.species }}
              </span>
            </div>
          </div>
          
          <div class="p-6">
            <h3 class="mb-3 text-2xl font-bold text-black dark:text-white group-hover:text-brand-500 transition-colors">{{ animal.name }}</h3>
            <p class="mb-6 text-sm text-gray-500 line-clamp-3 leading-relaxed">{{ animal.description }}</p>
            
            <div class="bg-gray-50 dark:bg-meta-4 rounded-xl p-4">
              <h4 class="mb-3 text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                Feeding Time
              </h4>
              <div class="flex flex-wrap gap-2">
                <span v-for="ft in animal.feeding_times" :key="ft.time" class="bg-white dark:bg-boxdark border border-stroke dark:border-strokedark rounded-lg py-1.5 px-3 text-xs font-bold text-black dark:text-white shadow-sm">
                  {{ ft.time }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Placeholder if empty -->
      <div v-if="animals.length === 0 && !loading" class="flex flex-col items-center justify-center py-32 bg-white dark:bg-boxdark rounded-3xl border border-stroke dark:border-strokedark shadow-sm">
        <div class="h-20 w-20 bg-gray-100 dark:bg-meta-4 rounded-full flex items-center justify-center mb-6">
          <svg class="text-gray-400" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
          </svg>
        </div>
        <p class="text-xl font-medium text-gray-500">Belum ada data satwa tersedia</p>
      </div>
    </div>
  </VisitorLayout>
</template>
