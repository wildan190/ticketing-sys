<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import ComponentCard from '@/components/common/ComponentCard.vue'
import axios from 'axios'

interface SalesCategory {
  name: string;
  count: number;
}

interface HourlyVisitor {
  _id: number;
  count: number;
}

interface DashboardStats {
  todayVisitors: number;
  yesterdayVisitors: number;
  monthlyRevenue: number;
  totalRevenue: number;
  salesByCategory: SalesCategory[];
  hourlyVisitors: HourlyVisitor[];
}

const stats = ref<DashboardStats>({
  todayVisitors: 0,
  yesterdayVisitors: 0,
  monthlyRevenue: 0,
  totalRevenue: 0,
  salesByCategory: [],
  hourlyVisitors: []
})

const totalSales = computed(() => 
  stats.value.salesByCategory.reduce((acc, c) => acc + c.count, 0)
)

const fetchStats = async () => {
  try {
    const { data } = await axios.get('/api/dashboard')
    stats.value = data
  } catch (error) {
    console.error('Failed to fetch dashboard stats', error)
  }
}

let intervalId: any = null

onMounted(() => {
  fetchStats()
  // Refresh every 30 seconds for real-time feel
  intervalId = setInterval(fetchStats, 30000)
})

onBeforeUnmount(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<template>
  <AdminLayout>
    <div class="mx-auto max-w-7xl">
      <PageBreadcrumb pageTitle="Zoo Admin Dashboard" />

      <!-- Metrics Row -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div class="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <svg class="fill-gray-800 dark:fill-white/90" width="22" height="22" viewBox="0 0 22 22">
              <path d="M11 11.5a4.5 4.5 0 100-9 4.5 4.5 0 000 9zM11 13a7 7 0 00-7 7 1 1 0 001 1h12a1 1 0 001-1 7 7 0 00-7-7z" />
            </svg>
          </div>
          <div class="flex items-end justify-between mt-5">
            <div>
              <span class="text-sm text-gray-500 dark:text-gray-400">Today Visitors</span>
              <h4 class="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">{{ stats.todayVisitors }}</h4>
            </div>
            <span class="flex items-center gap-1 rounded-full bg-success-50 py-0.5 pl-2 pr-2.5 text-sm font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
              {{ stats.todayVisitors - stats.yesterdayVisitors >= 0 ? '+' : '' }}{{ stats.todayVisitors - stats.yesterdayVisitors }}
              <svg class="fill-current" width="10" height="11" viewBox="0 0 10 11">
                <path d="M4.35716 2.47737L0.908974 5.82987L5.0443e-07 4.94612L5 0.0848689L10 4.94612L9.09103 5.82987L5.64284 2.47737L5.64284 10.0849L4.35716 10.0849L4.35716 2.47737Z" />
              </svg>
            </span>
          </div>
        </div>

        <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div class="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <svg class="fill-gray-800 dark:fill-white/90" width="22" height="22" viewBox="0 0 22 22">
              <path d="M2.75 11c0-4.556 3.694-8.25 8.25-8.25S19.25 6.444 19.25 11s-3.694 8.25-8.25 8.25-8.25-3.694-8.25-8.25zm8.25-6.875a6.875 6.875 0 100 13.75 6.875 6.875 0 000-13.75zM11 7.563a.688.688 0 100 1.375.688.688 0 000-1.375zm-.688 2.75h1.375v4.125h-1.375V10.313z" />
            </svg>
          </div>
          <div class="flex items-end justify-between mt-5">
            <div>
               <span class="text-sm text-gray-500 dark:text-gray-400">Monthly Revenue</span>
              <h4 class="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">Rp {{ stats.monthlyRevenue.toLocaleString('id-ID') }}</h4>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div class="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <svg class="fill-gray-800 dark:fill-white/90" width="22" height="22" viewBox="0 0 22 22">
              <path d="M11 2.75a8.25 8.25 0 100 16.5 8.25 8.25 0 000-16.5zM4.125 11a6.875 6.875 0 1113.75 0 6.875 6.875 0 01-13.75 0zM11 6.875a.688.688 0 00-.688.688v2.75H7.563a.688.688 0 100 1.375h2.75v2.75a.688.688 0 101.375 0v-2.75h2.75a.688.688 0 100-1.375h-2.75v-2.75a.688.688 0 00-.688-.688z" />
            </svg>
          </div>
          <div class="flex items-end justify-between mt-5">
            <div>
              <span class="text-sm text-gray-500 dark:text-gray-400">Total Tickets Sold</span>
              <h4 class="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">{{ totalSales }}</h4>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div class="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <svg class="fill-gray-800 dark:fill-white/90" width="22" height="22" viewBox="0 0 22 22">
              <path d="M19.25 11a8.25 8.25 0 11-16.5 0 8.25 8.25 0 0116.5 0zM11 4.125a6.875 6.875 0 100 13.75 6.875 6.875 0 000-13.75zm0 9.625a2.75 2.75 0 100-5.5 2.75 2.75 0 000 5.5z" />
            </svg>
          </div>
          <div class="flex items-end justify-between mt-5">
            <div>
              <span class="text-sm text-gray-500 dark:text-gray-400">Total Revenue</span>
              <h4 class="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">Rp {{ stats.totalRevenue.toLocaleString('id-ID') }}</h4>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="mt-4 grid grid-cols-1 gap-4 md:mt-6 md:gap-6 lg:grid-cols-2 2xl:mt-7.5 2xl:gap-7.5">
        <ComponentCard title="Hourly Visitors (Today)">
          <div class="p-6">
            <div class="h-80 flex items-end gap-2 px-4 pb-8 border-b border-gray-100 dark:border-gray-800">
              <div v-for="h in 24" :key="h" class="flex-1 bg-brand-500 rounded-t-sm relative group hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-400 transition-colors" :style="{ height: (stats.hourlyVisitors.find(v => v._id === h-1)?.count || 0) * 10 + 'px' }">
                <span class="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white dark:bg-white dark:text-gray-800 text-xs px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap">
                  {{ stats.hourlyVisitors.find(v => v._id === h-1)?.count || 0 }} Visitors
                </span>
              </div>
            </div>
            <div class="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span>00:00</span>
              <span>12:00</span>
              <span>23:00</span>
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="Sales by Category">
          <div class="p-6">
            <div class="flex flex-col gap-4">
              <div v-for="cat in stats.salesByCategory" :key="cat.name" class="flex items-center justify-between text-gray-800 dark:text-white/90">
                <span class="font-medium truncate w-1/3">{{ cat.name }}</span>
                <div class="flex items-center gap-4 flex-1 mx-4">
                  <div class="h-2 bg-gray-100 rounded-full flex-1 dark:bg-gray-800 overflow-hidden">
                    <div class="h-full bg-brand-500 rounded-full" :style="{ width: totalSales > 0 ? (cat.count / totalSales * 100) + '%' : '0%' }"></div>
                  </div>
                  <span class="w-10 text-right font-medium">{{ cat.count }}</span>
                </div>
              </div>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  </AdminLayout>
</template>

