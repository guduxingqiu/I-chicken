// src/controllers/paymentController.js
import db from '../models/index.js'; // 数据库连接
import jwt from 'jsonwebtoken';

// 创建支付记录
exports.createPayment = async (req, res) => {
    const { amount_paid, payment_method } = req.body;
    const token = req.headers['authorization'].split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    try {
        const payment = await db.payments.create({
            user_id: userId,
            amount_paid,
            payment_method,
            payment_status: 'Pending', // 初始状态为待处理
            payment_date: new Date()
        });
        res.status(201).json({ message: '支付记录创建成功', payment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '创建支付记录失败' });
    }
};

// 获取用户支付记录
exports.getUserPayments = async (req, res) => {
    const token = req.headers['authorization'].split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    try {
        const payments = await db.payments.findAll({
            where: { user_id: userId }
        });
        res.status(200).json(payments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '获取支付记录失败' });
    }
};