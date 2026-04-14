import Booking from '../models/Booking.js';
import User from '../models/User.js';
import TicketCategory from '../models/TicketCategory.js';
import Ticket from '../models/Ticket.js';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // 1. Daily visitors (scanned individual tickets)
    const todayVisitors = await Ticket.countDocuments({
      status: 'used',
      scanned_at: { $gte: today },
    });

    const yesterdayVisitors = await Ticket.countDocuments({
      status: 'used',
      scanned_at: { $gte: yesterday, $lt: today },
    });

    // 2. Revenue analysis
    const monthlyRevenue = await Booking.aggregate([
      { $match: { payment_status: 'paid', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$total_price' } } },
    ]);

    const totalRevenue = await Booking.aggregate([
      { $match: { payment_status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total_price' } } },
    ]);

    // 3. Ticket sales by category
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
      { 
        $project: {
          name: { $ifNull: [{ $arrayElemAt: ['$category_info.name', 0] }, 'Deleted Category'] },
          count: 1,
        },
      },
    ]);

    // 4. Hourly visitors for today (Real-time chart)
    const hourlyVisitors = await Ticket.aggregate([
      { $match: { status: 'used', scanned_at: { $gte: today } } },
      {
        $group: {
          _id: { $hour: '$scanned_at' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      todayVisitors,
      yesterdayVisitors,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      totalRevenue: totalRevenue[0]?.total || 0,
      salesByCategory: salesByCategory || [],
      hourlyVisitors: hourlyVisitors || [],
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
};
