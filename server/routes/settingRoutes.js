import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingController.js';
// import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Temporarily disabling auth for initial setup/testing
router.route('/')
  .get(getSettings)
  .put(updateSettings);

export default router;
