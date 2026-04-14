import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  },
  routes: [
    // Redirect root to booking page
    {
      path: '/',
      redirect: '/zoo/booking',
    },

    // Auth
    {
      path: '/signin',
      name: 'Signin',
      component: () => import('../views/Auth/Signin.vue'),
      meta: { title: 'Masuk' },
    },
    {
      path: '/signup',
      name: 'Signup',
      component: () => import('../views/Auth/Signup.vue'),
      meta: { title: 'Daftar' },
    },

    // Errors
    {
      path: '/error-404',
      name: '404 Error',
      component: () => import('../views/Errors/FourZeroFour.vue'),
      meta: { title: '404 - Halaman Tidak Ditemukan' },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/error-404',
    },

    // ── Public / Visitor ───────────────────────────────────
    {
      path: '/zoo/booking',
      name: 'ZooBooking',
      component: () => import('../views/Zoo/Booking.vue'),
      meta: { title: 'Pesan Tiket' },
    },
    {
      path: '/zoo/ticket/:id',
      name: 'ZooTicket',
      component: () => import('../views/Zoo/TicketResult.vue'),
      meta: { title: 'E-Ticket', requiresAuth: true },
    },
    {
      path: '/zoo/animals',
      name: 'ZooAnimals',
      component: () => import('../views/Zoo/Animals.vue'),
      meta: { title: 'Informasi Satwa' },
    },
    {
      path: '/user/account',
      name: 'UserAccount',
      component: () => import('../views/User/Account.vue'),
      meta: { title: 'Akun Saya', requiresAuth: true },
    },
    {
      path: '/user/orders',
      name: 'UserPurchaseHistory',
      component: () => import('../views/User/PurchaseHistory.vue'),
      meta: { title: 'Riwayat Pembelian', requiresAuth: true },
    },
    {
      path: '/user/thank-you',
      name: 'PaymentSuccess',
      component: () => import('../views/User/ThankYou.vue'),
      meta: { title: 'Pembayaran Berhasil', requiresAuth: true },
    },
    {
      path: '/user/error',
      name: 'PaymentError',
      component: () => import('../views/User/PaymentError.vue'),
      meta: { title: 'Pembayaran Gagal', requiresAuth: true },
    },

    // ── Admin ───────────────────────────────────────────────
    {
      path: '/zoo/dashboard',
      name: 'ZooDashboard',
      component: () => import('../views/Zoo/Dashboard.vue'),
      meta: { title: 'Dashboard Admin', requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/scanner',
      name: 'ZooScanner',
      component: () => import('../views/Zoo/Scanner.vue'),
      meta: { title: 'Scanner Tiket', requiresAuth: true, requiresStaff: true },
    },
    {
      path: '/zoo/orders',
      name: 'ZooOrderHistory',
      component: () => import('../views/Zoo/OrderHistory.vue'),
      meta: { title: 'Riwayat Order', requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/zoo/scan-history',
      name: 'ZooScanHistory',
      component: () => import('../views/Zoo/ScanHistory.vue'),
      meta: { title: 'Riwayat Scan', requiresAuth: true, requiresStaff: true },
    },
    {
      path: '/zoo/tickets',
      name: 'ZooTicketPricing',
      component: () => import('../views/Zoo/TicketPricing.vue'),
      meta: { title: 'Manajemen Harga Tiket', requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/zoo/settings',
      name: 'ZooSettings',
      component: () => import('../views/Zoo/Settings.vue'),
      meta: { title: 'Pengaturan Zoo', requiresAuth: true, requiresAdmin: true },
    },
  ],
})

export default router

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title} | Zoo Ticketing`
  
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null')
  
  // 1. Check Auth Requirement
  if (to.meta.requiresAuth && !userInfo) {
    return next('/signin')
  }
  
  // 2. Check Admin/Staff Requirement
  if (to.meta.requiresAdmin) {
    if (userInfo?.role !== 'admin') {
      return next('/zoo/booking')
    }
  }

  if (to.meta.requiresStaff) {
    if (userInfo?.role !== 'admin' && userInfo?.role !== 'staff') {
      return next('/zoo/booking')
    }
  }
  
  next()
})
