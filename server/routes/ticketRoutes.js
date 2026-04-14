import express from 'express';
import TicketCategory from '../models/TicketCategory.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get all active ticket categories
// @route   GET /api/tickets
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = await TicketCategory.find({ is_active: true });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get ALL ticket categories (including inactive) for admin
// @route   GET /api/tickets/all
// @access  Private/Admin
router.get('/all', protect, admin, async (req, res) => {
  try {
    const categories = await TicketCategory.find({});
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create ticket category
// @route   POST /api/tickets
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, price, weekend_price, description, is_active } = req.body;
    const category = await TicketCategory.create({
      name,
      price,
      weekend_price: weekend_price || null,
      description,
      is_active: is_active !== undefined ? is_active : true,
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update ticket category
// @route   PUT /api/tickets/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { name, price, weekend_price, description, is_active } = req.body;
    const category = await TicketCategory.findById(req.params.id);
    if (category) {
      category.name = name !== undefined ? name : category.name;
      category.price = price !== undefined ? price : category.price;
      category.weekend_price = weekend_price !== undefined ? weekend_price : category.weekend_price;
      category.description = description !== undefined ? description : category.description;
      category.is_active = is_active !== undefined ? is_active : category.is_active;
      const updatedCategory = await category.save();
      res.json(updatedCategory);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete ticket category
// @route   DELETE /api/tickets/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const category = await TicketCategory.findByIdAndDelete(req.params.id);
    if (category) {
      res.json({ message: 'Category deleted' });
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
