import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import couponRoutes from './routes/coupons.js';
import paymentRoutes from './routes/payments.js';
import staffRoutes from './routes/staff.js';
import historyRoutes from './routes/history.js';
import notificationRoutes from './routes/notifications.js';

dotenv.config();

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/notifications', notificationRoutes);

// 测试路由
app.get('/', (req, res) => {
  res.json({ message: '数字停车券系统API服务器正在运行' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器正在运行，端口: ${PORT}`);
});