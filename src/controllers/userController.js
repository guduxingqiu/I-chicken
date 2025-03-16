import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../../../src/models/index.js';

// 用户注册
export const registerUser = async (req, res) => {
  try {
    const { name, email, phone_number, password, car_plate } = req.body;

    // 验证必填字段
    if (!name || !email || !phone_number || !password) {
      return res.status(400).json({ message: '所有字段都是必填的' });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: '邮箱格式不正确' });
    }

    // 验证手机号格式（马来西亚手机号格式）
    const phoneRegex = /^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/;
    if (!phoneRegex.test(phone_number)) {
      return res.status(400).json({ message: '手机号格式不正确' });
    }

    // 检查邮箱是否已存在
    const [existingEmail] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingEmail.length > 0) {
      return res.status(400).json({ message: '该邮箱已被注册' });
    }

    // 检查手机号是否已存在
    const [existingPhone] = await pool.execute(
      'SELECT * FROM users WHERE phone_number = ?',
      [phone_number]
    );

    if (existingPhone.length > 0) {
      return res.status(400).json({ message: '该手机号已被注册' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 开始数据库事务
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 创建用户
      const [result] = await connection.execute(
        'INSERT INTO users (name, email, phone_number, password) VALUES (?, ?, ?, ?)',
        [name, email, phone_number, hashedPassword]
      );

      // 如果提供了车牌号，添加车辆信息
      if (car_plate) {
        await connection.execute(
          'INSERT INTO vehicle_information (user_id, car_plate) VALUES (?, ?)',
          [result.insertId, car_plate]
        );
      }

      await connection.commit();

      // 生成JWT令牌
      const token = jwt.sign(
        { userId: result.insertId, email },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.status(201).json({
        message: '注册成功',
        token,
        user: {
          id: result.insertId,
          name,
          email
        }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 用户登录
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 验证必填字段
    if (!email || !password) {
      return res.status(400).json({ message: '邮箱和密码都是必填的' });
    }

    // 查找用户
    const [users] = await pool.execute(
      'SELECT u.*, vi.car_plate FROM users u LEFT JOIN vehicle_information vi ON u.user_id = vi.user_id WHERE u.email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: '邮箱或密码错误' });
    }

    const user = users[0];

    // 验证密码
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: '邮箱或密码错误' });
    }

    // 生成JWT令牌
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
        email: user.email,
        phone_number: user.phone_number,
        car_plate: user.car_plate
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}; 