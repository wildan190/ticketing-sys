import Booking from '../models/Booking.js';
import Ticket from '../models/Ticket.js';
import TicketCategory from '../models/TicketCategory.js';
import Setting from '../models/Setting.js';
import { getMidtransSnap, getMidtransCore } from '../utils/midtrans.js';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private/Customer
export const createBooking = async (req, res) => {
  try {
    const { items, addons, visit_date, user_id, guest_name, guest_email } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No ticket items' });
    }

    if (!user_id) {
      if (!guest_name || !guest_email) {
        return res.status(400).json({ message: 'Nama dan Email diperlukan untuk Guest checkout.' });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(guest_email.trim())) {
        return res.status(400).json({ message: 'Format Email tidak valid.' });
      }
    }

    // Check daily quota
    const settings = await Setting.findOne();
    const existingBookings = await Booking.find({ 
      visit_date: { 
        $gte: new Date(visit_date).setHours(0,0,0,0), 
        $lte: new Date(visit_date).setHours(23,59,59,999) 
      },
      payment_status: { $in: ['paid', 'pending'] }
    });

    const totalTicketsSold = existingBookings.reduce((acc, booking) => 
      acc + booking.items.reduce((sum, item) => sum + item.quantity, 0), 0
    );

    const newTicketsCount = items.reduce((sum, item) => sum + item.quantity, 0);

    if (totalTicketsSold + newTicketsCount > settings.daily_quota) {
      return res.status(400).json({ message: 'Daily quota exceeded for this date' });
    }

    // Determine if visit date is a weekend (0 = Sunday, 6 = Saturday)
    const visitDay = new Date(visit_date).getDay();
    const isWeekend = visitDay === 0 || visitDay === 6;

    // Calculate total price
    let total_price = 0;
    const bookingItems = [];

    for (const item of items) {
      const category = await TicketCategory.findById(item.category_id);
      if (!category) {
        return res.status(404).json({ message: `Category ${item.category_id} not found` });
      }
      // Use weekend_price if visit date is weekend and weekend_price is set
      const appliedPrice = (isWeekend && category.weekend_price) ? category.weekend_price : category.price;
      total_price += appliedPrice * item.quantity;
      bookingItems.push({
        category: category._id,
        quantity: item.quantity,
        price: appliedPrice, // store actual charged price
      });
    }

    if (addons && addons.length > 0) {
      for (const addon of addons) {
        total_price += addon.price * addon.quantity;
      }
    }

    const order_id = `ZOO-${Date.now()}-${uuidv4().substring(0, 4).toUpperCase()}`;

    // Create Midtrans transaction
    const snap = await getMidtransSnap();
    const transactionDetails = {
      transaction_details: {
        order_id: order_id,
        gross_amount: total_price,
      },
      callbacks: {
        finish: `${process.env.APP_URL || 'http://localhost:5173'}/user/thank-you`,
        error: `${process.env.APP_URL || 'http://localhost:5173'}/user/error`,
        pending: `${process.env.APP_URL || 'http://localhost:5173'}/user/orders`,
      },
    };

    if (guest_name || guest_email) {
      transactionDetails.customer_details = {
        first_name: guest_name || 'Guest',
        email: guest_email || 'guest@example.com'
      };
    } else if (user_id) {
      // In a more complete implementation, you would fetch user details from DB
      transactionDetails.customer_details = {
        first_name: 'Member',
      };
    }

    const midtransResponse = await snap.createTransaction(transactionDetails);

    const bookingPayload = {
      items: bookingItems,
      addons: addons || [],
      total_price,
      visit_date,
      order_id,
      payment_details: {
        snap_token: midtransResponse.token,
        redirect_url: midtransResponse.redirect_url,
      }
    };

    if (user_id) {
      bookingPayload.user = user_id;
    } else {
      bookingPayload.guest_name = guest_name;
      bookingPayload.guest_email = guest_email;
    }

    const booking = await Booking.create(bookingPayload);

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Handle Midtrans notification (Webhook)
// @route   POST /api/bookings/notification
// @access  Public
export const handleNotification = async (req, res) => {
  try {
    const notification = req.body;
    const { order_id, transaction_status } = notification;

    const booking = await Booking.findOne({ order_id });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      booking.payment_status = 'paid';
      
      // Generate individual tickets if they don't exist yet
      const existingTickets = await Ticket.countDocuments({ booking: booking._id });
      if (existingTickets === 0) {
        await generateTicketsForBooking(booking);
      }
      
      // Keep legacy QR for order-level if needed (optional)
      const qrData = JSON.stringify({
        order_id: booking.order_id,
        summary: true
      });
      booking.qr_code = await QRCode.toDataURL(qrData);

    } else if (transaction_status === 'expire') {
      booking.payment_status = 'expired';
    } else if (transaction_status === 'cancel' || transaction_status === 'deny') {
      booking.payment_status = 'cancelled';
    }

    booking.payment_details = { ...booking.payment_details, ...notification };
    await booking.save();

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get booking by ID (including QR code for digital ticket)
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('items.category');
    if (booking) {
      res.json(booking);
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Validate/Scan QR Code
// @route   POST /api/bookings/scan
// @access  Public
export const scanTicket = async (req, res) => {
  try {
    const { order_id, ticket_id } = req.body;
    console.log(`Scan Request: order_id=${order_id}, ticket_id=${ticket_id}`);

    // Today's date in YYYY-MM-DD using Jakarta timezone
    const todayStr = new Intl.DateTimeFormat('en-CA', { 
      timeZone: 'Asia/Jakarta', 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    }).format(new Date());

    // 1. Try to find as individual ticket first
    if (ticket_id) {
      // ATOMIC UPDATE: Only update if status is 'active'
      const ticket = await Ticket.findOneAndUpdate(
        { ticket_id, status: 'active' },
        { 
          $set: { 
            status: 'used', 
            scanned_at: new Date() 
          } 
        },
        { new: true }
      ).populate('category').populate('booking');

      if (!ticket) {
        // Find if it was already used or doesn't exist
        const checkTicket = await Ticket.findOne({ ticket_id });
        if (checkTicket && checkTicket.status === 'used') {
          return res.status(400).json({ message: 'Tiket ini sudah pernah digunakan sebelumnya' });
        }
        return res.status(404).json({ message: 'Ticket tidak ditemukan (Individual)' });
      }

      const booking = ticket.booking;
      if (!booking) {
         return res.status(404).json({ message: 'Data pesanan tidak ditemukan' });
      }

      if (booking.payment_status !== 'paid') {
        return res.status(400).json({ message: 'Tiket belum dibayar' });
      }

      // Date verification (Daily comparison)
      const visitDateStr = new Intl.DateTimeFormat('en-CA', { 
        timeZone: 'Asia/Jakarta', 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      }).format(new Date(booking.visit_date));

      if (todayStr !== visitDateStr) {
        // Rollback status if date mismatch (Safety)
        ticket.status = 'active';
        ticket.scanned_at = undefined;
        await ticket.save();

        return res.status(400).json({ 
          message: 'Tiket ini bukan untuk kunjungan hari ini',
          visit_date: booking.visit_date 
        });
      }

      // Get progress for UI
      const totalCount = await Ticket.countDocuments({ booking: booking._id });
      const usedCount = await Ticket.countDocuments({ booking: booking._id, status: 'used' });
      
      return res.json({ 
        message: 'Tiket berhasil divalidasi', 
        booking,
        ticket,
        progress: `${usedCount}/${totalCount}`
      });
    }

    // 2. Reject Group/Order IDs explicitly
    if (order_id) {
      return res.status(400).json({ 
        message: 'Gunakan QR Tiket Individual. QR Pesanan Utama tidak dapat digunakan untuk masuk.' 
      });
    }

    return res.status(400).json({ message: 'ID Tiket diperlukan' });
  } catch (error) {
    console.error('Scan Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's own bookings
// @route   GET /api/bookings/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('items.category')
      .sort({ createdAt: -1 })
      .lean();

    // Attach ticket summary to each booking
    const bookingsWithSummary = await Promise.all(
      bookings.map(async (b) => {
        const totalTickets = await Ticket.countDocuments({ booking: b._id });
        const usedTickets = await Ticket.countDocuments({ booking: b._id, status: 'used' });
        return {
          ...b,
          ticketSummary: {
            total: totalTickets,
            used: usedTickets,
            allUsed: totalTickets > 0 && totalTickets === usedTickets
          }
        };
      })
    );

    res.json(bookingsWithSummary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get guest orders
// @route   POST /api/bookings/guest-orders
// @access  Public
export const getGuestOrders = async (req, res) => {
  try {
    const { guest_name, guest_email } = req.body;
    
    if (!guest_name || !guest_email) {
      return res.status(400).json({ message: 'Name and email are required to fetch guest orders' });
    }

    const bookings = await Booking.find({
      guest_name: { $regex: new RegExp(`^${guest_name}$`, 'i') },
      guest_email: { $regex: new RegExp(`^${guest_email}$`, 'i') }
    })
      .populate('items.category')
      .sort({ createdAt: -1 })
      .lean();

    // Attach ticket summary to each booking
    const bookingsWithSummary = await Promise.all(
      bookings.map(async (b) => {
        const totalTickets = await Ticket.countDocuments({ booking: b._id });
        const usedTickets = await Ticket.countDocuments({ booking: b._id, status: 'used' });
        return {
          ...b,
          ticketSummary: {
            total: totalTickets,
            used: usedTickets,
            allUsed: totalTickets > 0 && totalTickets === usedTickets
          }
        };
      })
    );

    res.json(bookingsWithSummary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('user', 'id name email')
      .populate('items.category')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify payment status from Midtrans and update booking (for localhost/dev)
// @route   GET /api/bookings/verify/:order_id
// @access  Private
export const verifyPayment = async (req, res) => {
  try {
    const { order_id } = req.params;
    const booking = await Booking.findOne({ order_id }).populate('items.category');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // If already paid, just return the booking
    if (booking.payment_status === 'paid') {
      return res.json(booking);
    }

    // Check with Midtrans API for real-time status
    const core = await getMidtransCore();
    const statusResponse = await core.transaction.status(order_id);
    const { transaction_status, fraud_status } = statusResponse;

    const isPaid =
      (transaction_status === 'settlement') ||
      (transaction_status === 'capture' && fraud_status === 'accept');

    if (isPaid) {
      booking.payment_status = 'paid';

      // Generate individual tickets if they don't exist yet
      const existingTickets = await Ticket.countDocuments({ booking: booking._id });
      if (existingTickets === 0) {
        await generateTicketsForBooking(booking);
      }

      const qrData = JSON.stringify({
        order_id: booking.order_id,
        summary: true
      });
      booking.qr_code = await QRCode.toDataURL(qrData);
      booking.payment_details = { ...booking.payment_details, ...statusResponse };
      await booking.save();
    } else if (transaction_status === 'expire') {
      booking.payment_status = 'expired';
      await booking.save();
    } else if (transaction_status === 'cancel' || transaction_status === 'deny') {
      booking.payment_status = 'cancelled';
      await booking.save();
    }

    const updatedBooking = await Booking.findOne({ order_id }).populate('items.category');
    res.json(updatedBooking);
  } catch (error) {
    console.error('Payment verification error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tickets for a specific booking
// @route   GET /api/bookings/:id/tickets
// @access  Public
export const getTicketsByBookingId = async (req, res) => {
  try {
    const tickets = await Ticket.find({ booking: req.params.id }).populate('category');
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all scan logs (Admin)
// @route   GET /api/bookings/scan-logs
// @access  Private/Staff
export const getScanLogs = async (req, res) => {
  try {
    const tickets = await Ticket.find({ status: 'used' })
      .populate({
        path: 'booking',
        populate: { path: 'user', select: 'name email' }
      })
      .populate('category')
      .sort({ scanned_at: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper: Generate individual tickets for a paid booking
const generateTicketsForBooking = async (booking) => {
  const tickets = [];
  let ticketCounter = 1;
  
  for (const item of booking.items) {
    for (let i = 1; i <= item.quantity; i++) {
      // Use a simple sequential counter to ensure uniqueness within the order
      const ticket_id = `${booking.order_id}-${ticketCounter.toString().padStart(3, '0')}`;
      
      const qrData = JSON.stringify({
        ticket_id: ticket_id,
        order_id: booking.order_id,
        type: 'individual_ticket'
      });
      
      const qr_code = await QRCode.toDataURL(qrData);
      
      tickets.push({
        ticket_id,
        booking: booking._id,
        category: item.category._id || item.category,
        qr_code
      });
      
      ticketCounter++;
    }
  }
  
  await Ticket.insertMany(tickets);
};
