import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../models/index.js';  // 修正导入路径

const router = express.Router();

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone_number, password, car_plate } = req.body;

    console.log('收到注册请求:', { name, email, phone_number, car_plate });
    
    // 检查邮箱是否已存在
    const [existingUser] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: '该邮箱已被注册' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, phone_number, password) VALUES (?, ?, ?, ?)',
      [name, email, phone_number, hashedPassword]
    );

    // 添加车牌信息
    if (car_plate) {
      await pool.execute(
        'INSERT INTO vehicle_information (user_id, car_plate) VALUES (?, ?)',
        [result.insertId, car_plate]
      );
    }

    res.status(201).json({ message: '注册成功' });
  } catch (error) {
    console.error('注册错误详情:', error);
    res.status(500).json({ 
      message: '服务器错误',
      error: error.message 
    });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('收到登录请求:', { email });

    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: '邮箱或密码错误' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: '邮箱或密码错误' });
    }

    const token = jwt.sign(
      { userId: user.user_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('登录错误详情:', error);
    res.status(500).json({ 
      message: '服务器错误',
      error: error.message 
    });
  }
});

export default router;