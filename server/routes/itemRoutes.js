import express from 'express';
import { protect } from '../middleware/auth.js';
import { getItems, createItem } from '../controllers/itemController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// GET /api/items - Get all items
// POST /api/items - Create new item (protected, with image upload)
router.route('/')
  .get(getItems)
  .post(protect, upload.single('image'), createItem);

export default router;