// src/routes/payments.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/auth');

// 创建支付记录
router.post('/create', authMiddleware, paymentController.createPayment);

// 获取用户支付记录
router.get('/', authMiddleware, paymentController.getUserPayments);

module.exports = router;