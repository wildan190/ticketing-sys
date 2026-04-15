<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
interface User {
  name: string
  email: string
}

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface Order {
  _id: string
  order_id: string
  visit_date: string
  user: User
  total_price: number
  items: OrderItem[]
  payment_status: 'paid' | 'pending' | 'cancelled' | 'expired' | string
}

const orders = ref<Order[]>([])
const loading = ref(true)

const getAuthHeaders = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  return userInfo.token ? { Authorization: `Bearer ${userInfo.token}` } : {}
}

const fetchOrders = async () => {
  try {
    const { data } = await axios.get('/api/bookings', {
      headers: getAuthHeaders()
    })
    orders.value = data
  } catch (error) {
    console.error('Failed to fetch orders', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

onMounted(() => {
  fetchOrders()
})
</script>

<template>
  <AdminLayout>
    <div class="mx-auto max-w-7xl">
      <PageBreadcrumb pageTitle="Riwayat Order (Admin)" />

      <div class="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div class="max-w-full overflow-x-auto">
          <table class="w-full table-auto">
            <thead>
              <tr class="bg-gray-2 text-left dark:bg-meta-4">
                <th class="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                  Order Info
                </th>
                <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Pengunjung
                </th>
                <th class="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Total
                </th>
                <th class="min-w-[120px] py-4 px-4 text-center font-medium text-black dark:text-white">
                  Status
                </th>
                <th class="py-4 px-4 text-center font-medium text-black dark:text-white">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="5" class="py-10 text-center">Loading data...</td>
              </tr>
              <tr v-else-if="orders.length === 0">
                <td colspan="5" class="py-10 text-center">Belum ada order.</td>
              </tr>
              <tr v-for="order in orders" :key="order._id" class="border-b border-stroke dark:border-strokedark">
                <td class="py-5 px-4 pl-9 xl:pl-11">
                  <h5 class="font-medium text-black dark:text-white">{{ order.order_id }}</h5>
                  <p class="text-sm">Visit: {{ new Date(order.visit_date).toLocaleDateString() }}</p>
                </td>
                <td class="py-5 px-4">
                  <p class="text-black dark:text-white">{{ order.user?.name || 'Unknown' }}</p>
                  <p class="text-sm">{{ order.user?.email }}</p>
                </td>
                <td class="py-5 px-4">
                  <p class="text-black dark:text-white font-medium">Rp {{ order.total_price.toLocaleString() }}</p>
                  <p class="text-sm text-gray-500">{{ order.items?.length }} tipe item</p>
                </td>
                <td class="py-5 px-4 text-center">
                  <p class="inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium"
                    :class="{
                      'bg-success-500 text-success': order.payment_status === 'paid',
                      'bg-warning-500 text-warning': order.payment_status === 'pending',
                      'bg-error-500 text-danger': order.payment_status === 'cancelled' || order.payment_status === 'expired'
                    }">
                    {{ order.payment_status }}
                  </p>
                </td>
                <td class="py-5 px-4 text-center">
                  <button class="text-brand-500 hover:text-brand-500/80" @click="router.push(`/zoo/ticket/${order._id}`)">Detail</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
