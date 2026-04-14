import mongoose from 'mongoose';

const addonSchema = mongoose.Schema(
  {
    name: {
      type: String, // 'parkir', 'paket makan', 'rumah primata'
      required: true,
    },
    price: {
      type: Number,
      required: true,
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

const Addon = mongoose.model('Addon', addonSchema);

export default Addon;
