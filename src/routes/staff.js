// src/routes/staff.js
import express from 'express';
import { login, getUserCoupons } from '../controllers/staffController.js';
import authMiddleware from '../middleware/auth.js'; // 需要验证的中间件

const router = express.Router();

// 工作人员登录
router.post('/login', login);

// 查看用户的优惠券使用情况
router.get('/coupons/:userId', authMiddleware, getUserCoupons);

export default router;