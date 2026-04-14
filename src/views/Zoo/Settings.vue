<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import ComponentCard from '@/components/common/ComponentCard.vue'
import FormInput from '@/components/common/FormInput.vue'
import ToggleSwitch from '@/components/forms/FormElements/ToggleSwitch.vue'
import Button from '@/components/ui/Button.vue'
import axios from 'axios'

const merchantId = ref('')
const clientKey = ref('')
const serverKey = ref('')
const isProduction = ref(false)
const dailyQuota = ref(1000)
const loading = ref(false)
const successMsg = ref('')

const fetchSettings = async () => {
  try {
    const { data } = await axios.get('/api/settings')
    merchantId.value = data.midtrans_merchant_id
    clientKey.value = data.midtrans_client_key
    serverKey.value = data.midtrans_server_key
    isProduction.value = data.midtrans_is_production
    dailyQuota.value = data.daily_quota
  } catch (error) {
    console.error('Failed to fetch settings', error)
  }
}

const updateSettings = async () => {
  loading.value = true
  successMsg.value = ''
  try {
    await axios.put('/api/settings', {
      midtrans_merchant_id: merchantId.value,
      midtrans_client_key: clientKey.value,
      midtrans_server_key: serverKey.value,
      midtrans_is_production: isProduction.value,
      daily_quota: dailyQuota.value
    })
    successMsg.value = 'Settings updated successfully!'
  } catch (error) {
    console.error('Failed to update settings', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchSettings)
</script>

<template>
  <AdminLayout>
    <div class="mx-auto max-w-7xl">
      <PageBreadcrumb pageTitle="Zoo Settings" />

      <div class="grid grid-cols-1 gap-9 sm:grid-cols-2">
        <div class="flex flex-col gap-9">
          <ComponentCard title="Midtrans Configuration">
            <div class="p-6.5">
              <FormInput
                label="Merchant ID"
                placeholder="Enter Merchant ID"
                v-model="merchantId"
              />

              <FormInput
                label="Client Key"
                placeholder="Enter Client Key"
                v-model="clientKey"
              />

              <FormInput
                label="Server Key"
                type="password"
                placeholder="Enter Server Key"
                v-model="serverKey"
              />

              <div class="mb-4.5">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Environment
                </label>
                <div class="flex items-center gap-3">
                  <span :class="!isProduction ? 'text-brand-500 font-bold' : ''">Sandbox</span>
                  <ToggleSwitch v-model="isProduction" />
                  <span :class="isProduction ? 'text-brand-500 font-bold' : ''">Production</span>
                </div>
              </div>
            </div>
          </ComponentCard>
        </div>

        <div class="flex flex-col gap-9">
          <ComponentCard title="General Settings">
            <div class="p-6.5">
              <FormInput
                label="Daily Visitor Quota"
                type="number"
                placeholder="Enter daily quota"
                v-model="dailyQuota"
              />

              <div v-if="successMsg" class="mb-4.5 p-4 bg-green-100 text-green-700 rounded-md">
                {{ successMsg }}
              </div>

              <Button
                @click="updateSettings"
                :disabled="loading"
                class="w-full flex justify-center items-center rounded-xl bg-brand-500 py-4 font-bold text-white hover:bg-brand-600 shadow-lg shadow-brand-500/20 transition-all active:scale-95"
              >
                {{ loading ? 'Saving...' : 'Save Settings' }}
              </Button>
            </div>
          </ComponentCard>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
