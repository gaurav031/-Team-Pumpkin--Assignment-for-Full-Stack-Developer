import express from 'express';
import { getSuccessfulBids, placeBid } from '../controllers/bidController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, placeBid);
router.get('/successful', protect, getSuccessfulBids)
router.get('/all-successful', protect, getSuccessfulBids)
router.get('/history/:itemId', protect, getSuccessfulBids);

export default router;