import express from 'express';
import { 
  createBooking, 
  handleNotification, 
  getBookingById, 
  scanTicket,
  getMyOrders,
  getGuestOrders,
  getAllOrders,
  verifyPayment,
  getTicketsByBookingId,
  getScanLogs
} from '../controllers/bookingController.js';
import { protect, admin, staff } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/guest-orders', getGuestOrders);

router.post('/', createBooking);
router.post('/notification', handleNotification);
router.post('/scan', protect, staff, scanTicket);
router.get('/myorders', protect, getMyOrders);
router.get('/verify/:order_id', verifyPayment);
router.get('/:id/tickets', getTicketsByBookingId);
router.get('/scan-logs', protect, staff, getScanLogs);
router.get('/', protect, admin, getAllOrders);
router.get('/:id', getBookingById); 

export default router;
