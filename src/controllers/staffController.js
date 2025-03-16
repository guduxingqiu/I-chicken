// src/controllers/staffController.js
import db from '../models/index.js'; // 数据库连接
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// 工作人员登录
export const login = async (req, res) => {
    const { staff_id, password } = req.body;

    try {
        const staff = await db.staff.findOne({ where: { staff_id } });
        if (!staff) {
            return res.status(404).json({ message: '工作人员不存在' });
        }

        // 验证密码
        const isMatch = await bcrypt.compare(password, staff.password);
        if (!isMatch) {
            return res.status(401).json({ message: '密码错误' });
        }

        // 生成JWT
        const token = jwt.sign({ staffId: staff.staff_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token, staff: { id: staff.staff_id, name: staff.staff_name } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '登录失败' });
    }
};

// 查看用户的优惠券使用情况
export const getUserCoupons = async (req, res) => {
    const { userId } = req.params;

    try {
        const coupons = await db.parking_coupons.findAll({ where: { user_id: userId } });
        res.status(200).json(coupons);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '获取用户优惠券失败' });
    }
};