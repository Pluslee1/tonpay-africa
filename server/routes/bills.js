const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createBill, getBills } = require('../controllers/bills');

// Create bill
router.post('/', auth, createBill);

// Get user's bills
router.get('/', auth, getBills);

module.exports = router;
