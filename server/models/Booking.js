import mongoose from 'mongoose';

const bookingSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    guest_name: {
      type: String,
    },
    guest_email: {
      type: String,
    },
    items: [
      {
        category: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'TicketCategory',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    addons: [
      {
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
    total_price: {
      type: Number,
      required: true,
    },
    visit_date: {
      type: Date,
      required: true,
    },
    payment_status: {
      type: String,
      enum: ['pending', 'paid', 'expired', 'cancelled'],
      default: 'pending',
    },
    order_id: {
      type: String,
      required: true,
      unique: true,
    },
    qr_code: {
      type: String,
    },
    scanned_at: {
      type: Date,
    },
    payment_details: {
      type: Object, // Midtrans response or payment method info
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
