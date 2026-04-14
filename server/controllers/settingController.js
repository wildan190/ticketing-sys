import Setting from '../models/Setting.js';

// @desc    Get settings
// @route   GET /api/settings
// @access  Private/Admin
export const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = async (req, res) => {
  try {
    const { midtrans_merchant_id, midtrans_client_key, midtrans_server_key, midtrans_is_production, daily_quota } = req.body;

    let settings = await Setting.findOne();
    if (settings) {
      settings.midtrans_merchant_id = midtrans_merchant_id || settings.midtrans_merchant_id;
      settings.midtrans_client_key = midtrans_client_key || settings.midtrans_client_key;
      settings.midtrans_server_key = midtrans_server_key || settings.midtrans_server_key;
      settings.midtrans_is_production = midtrans_is_production !== undefined ? midtrans_is_production : settings.midtrans_is_production;
      settings.daily_quota = daily_quota || settings.daily_quota;

      const updatedSettings = await settings.save();
      res.json(updatedSettings);
    } else {
      const newSettings = await Setting.create(req.body);
      res.status(201).json(newSettings);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
