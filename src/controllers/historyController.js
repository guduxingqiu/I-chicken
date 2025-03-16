// src/controllers/parkingHistoryController.js
import db from '../models/index.js'; // 数据库连接
import jwt from 'jsonwebtoken';

// 获取用户停车历史记录
export const getUserParkingHistory = async (req, res) => {
    const token = req.headers['authorization'].split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    try {
        const history = await db.parking_coupons.findAll({
            where: { user_id: userId },
            include: [{ model: db.payments, required: false }] // 关联支付记录
        });
        res.status(200).json(history);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '获取停车历史记录失败' });
    }
};

// 工作人员查看所有用户的停车历史记录
export const getAllParkingHistory = async (req, res) => {
    try {
        const history = await db.parking_coupons.findAll({
            include: [{ model: db.users, required: true }, { model: db.payments, required: false }] // 关联用户和支付记录
        });
        res.status(200).json(history);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '获取所有停车历史记录失败' });
    }
};