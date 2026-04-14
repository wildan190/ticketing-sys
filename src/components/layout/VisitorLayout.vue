<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
    <VisitorHeader />
    
    <main class="flex-grow p-4 mx-auto w-full max-w-7xl md:p-6 lg:p-10 pb-28 md:pb-32">
      <slot></slot>
    </main>
    
    <footer class="py-12 text-center text-gray-500 border-t border-gray-200 dark:border-gray-800 dark:bg-gray-900 mb-16 md:mb-20">
      <div class="max-w-7xl mx-auto px-4">
        <p class="text-sm">&copy; 2026 Zoo Ticketing System. All rights reserved.</p>
        <p class="text-xs mt-2 opacity-50 italic">Modern digital access for nature's wonders.</p>
      </div>
    </footer>

    <BottomNavigation />
  </div>
</template>

<script setup>
import VisitorHeader from './VisitorHeader.vue'
import BottomNavigation from './BottomNavigation.vue'
</script>
