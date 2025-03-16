// src/routes/notifications.js
import express from 'express';
import { sendNotification } from '../controllers/notificationController.js';

const router = express.Router();

// 发送推送通知
router.post('/send', sendNotification);

export default router;