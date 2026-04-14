import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Booking from '../server/models/Booking.js';
import Ticket from '../server/models/Ticket.js';

dotenv.config();

const diagnose = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // Find the most recent paid booking with multiple items
    const latestBooking = await Booking.findOne({ payment_status: 'paid' }).sort({ createdAt: -1 });
    
    if (!latestBooking) {
      console.log('No paid bookings found');
      process.exit(0);
    }

    console.log(`Checking Booking: ${latestBooking.order_id} (_id: ${latestBooking._id})`);
    console.log(`Scanned At (Booking level): ${latestBooking.scanned_at}`);

    const tickets = await Ticket.find({ booking: latestBooking._id });
    console.log(`Total individual tickets found: ${tickets.length}`);

    tickets.forEach((t, i) => {
      console.log(`Ticket ${i+1}: ID=${t.ticket_id}, Status=${t.status}, ScannedAt=${t.scanned_at}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('DIAGNOSIS FAILED:', error);
    process.exit(1);
  }
};

diagnose();
