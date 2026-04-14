import mongoose from 'mongoose';

const settingSchema = mongoose.Schema(
  {
    midtrans_merchant_id: {
      type: String,
      default: '',
    },
    midtrans_client_key: {
      type: String,
      default: '',
    },
    midtrans_server_key: {
      type: String,
      default: '',
    },
    midtrans_is_production: {
      type: Boolean,
      default: false,
    },
    daily_quota: {
      type: Number,
      default: 1000,
    },
  },
  {
    timestamps: true,
  }
);

const Setting = mongoose.model('Setting', settingSchema);

export default Setting;
