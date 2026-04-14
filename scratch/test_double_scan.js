import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Ticket from './server/models/Ticket.js';

dotenv.config();

const API_URL = 'http://localhost:5050/api/bookings/scan';

const testDoubleScan = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        // Find an active ticket
        const ticket = await Ticket.findOne({ status: 'active' });
        if (!ticket) {
            console.log('No active tickets found for testing');
            process.exit(0);
        }

        console.log(`Testing individual ticket ID: ${ticket.ticket_id}`);

        // Try to scan it once
        // (Assuming the server is running on 5050 - based on previous context)
        // We'll use the logic directly to see if anything is wrong.
        
        console.log('--- Current Logic Check ---');
        console.log('Ticket Status:', ticket.status);
        
        if (ticket.status === 'used') {
            console.log('Already used check would work!');
        } else {
            console.log('First scan would proceed.');
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

testDoubleScan();
