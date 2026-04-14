import midtransClient from 'midtrans-client';
import Setting from '../models/Setting.js';

export const getMidtransSnap = async () => {
  const settings = await Setting.findOne();
  if (!settings || !settings.midtrans_server_key || !settings.midtrans_client_key) {
    throw new Error('Midtrans keys not configured');
  }

  return new midtransClient.Snap({
    isProduction: settings.midtrans_is_production,
    serverKey: settings.midtrans_server_key,
    clientKey: settings.midtrans_client_key,
  });
};

export const getMidtransCore = async () => {
  const settings = await Setting.findOne();
  if (!settings || !settings.midtrans_server_key || !settings.midtrans_client_key) {
    throw new Error('Midtrans keys not configured');
  }

  return new midtransClient.CoreApi({
    isProduction: settings.midtrans_is_production,
    serverKey: settings.midtrans_server_key,
    clientKey: settings.midtrans_client_key,
  });
};
