import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Booking from './server/models/Booking.js';
import TicketCategory from './server/models/TicketCategory.js';

dotenv.config();

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        console.log('Testing salesByCategory aggregation...');
        const salesByCategory = await Booking.aggregate([
            { $match: { payment_status: 'paid' } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.category',
                    count: { $sum: '$items.quantity' },
                },
            },
            {
                $lookup: {
                    from: 'ticketcategories',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'category_info',
                },
            },
            { $unwind: '$category_info' },
            {
                $project: {
                    name: '$category_info.name',
                    count: 1,
                },
            },
        ]);
        console.log('salesByCategory:', JSON.stringify(salesByCategory, null, 2));

        console.log('Testing hourlyVisitors aggregation...');
        const hourlyVisitors = await Booking.aggregate([
            { $match: { scanned_at: { $gte: today } } },
            {
                $group: {
                    _id: { $hour: '$scanned_at' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        console.log('hourlyVisitors:', JSON.stringify(hourlyVisitors, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('TEST FAILED:', error);
        process.exit(1);
    }
};

test();
