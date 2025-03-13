import express from 'express';
import Fee from '../models/Fee.js';

const router = express.Router();

// Get all fee records
router.get('/', async (req, res) => {
    try {
        const fees = await Fee.find();
        res.json(fees);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
