import mongoose from 'mongoose';

const ticketSchema = mongoose.Schema(
  {
    ticket_id: {
      type: String,
      required: true,
      unique: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TicketCategory',
      required: true,
    },
    qr_code: {
      type: String,
      required: true,
    },
    scanned_at: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'used', 'cancelled'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;
