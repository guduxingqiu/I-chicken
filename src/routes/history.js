// src/routes/parkingHistory.js
import express from 'express';
import { getUserParkingHistory, getAllParkingHistory } from '../controllers/parkingHistoryController.js';
import authMiddleware from '../middleware/auth.js'; // 需要验证的中间件

const router = express.Router();

// 获取用户停车历史记录
router.get('/', authMiddleware, getUserParkingHistory);

// 工作人员查看所有用户的停车历史记录
router.get('/all', authMiddleware, getAllParkingHistory);

export default router;