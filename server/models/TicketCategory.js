import mongoose from 'mongoose';

const ticketCategorySchema = mongoose.Schema(
  {
    name: {
      type: String, // 'dewasa', 'anak-anak', 'mancanegara'
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    weekend_price: {
      type: Number,
      default: null, // null means use regular price on weekend too
    },
    description: {
      type: String,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const TicketCategory = mongoose.model('TicketCategory', ticketCategorySchema);

export default TicketCategory;
