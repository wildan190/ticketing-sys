import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Booking from './server/models/Booking.js';
import Ticket from './server/models/Ticket.js';

dotenv.config();

const testScan = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        // Find a booking with multiple unused tickets
        const booking = await Booking.findOne({ payment_status: 'paid' }).sort({ createdAt: -1 });
        if (!booking) {
            console.log('No paid bookings found');
            process.exit(1);
        }

        const tickets = await Ticket.find({ booking: booking._id, status: 'active' });
        if (tickets.length < 2) {
            console.log('Not enough active tickets to test (need at least 2)');
            process.exit(1);
        }

        const targetTicket = tickets[0];
        const otherTicket = tickets[1];

        console.log(`Testing scan for Ticket ID: ${targetTicket.ticket_id}`);
        console.log(`Other Ticket ID (should remain active): ${otherTicket.ticket_id}`);

        // We can't easily call axios.post to localhost without the server running, 
        // but we can simulate the logic by calling the scanTicket function if we mock req/res.
        // Or better, just inspect the code again.
        
        // Actually, let's just check if there's any hidden updateMany loop.
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

testScan();
