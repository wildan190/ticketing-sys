<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const toggle = () => {
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <div @click="toggle" class="relative inline-block w-12 h-6 cursor-pointer select-none group">
    <div
      class="w-full h-full rounded-full transition-all duration-300 ring-1 ring-inset ring-black/5"
      :class="modelValue ? 'bg-brand-500 shadow-inner' : 'bg-gray-200 dark:bg-white/10'"
    ></div>
    <div
      class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-md border border-gray-100 dark:border-none"
      :class="modelValue ? 'translate-x-6' : 'translate-x-0 group-hover:scale-110'"
    ></div>
  </div>
</template>
