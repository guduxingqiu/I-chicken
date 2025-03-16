import { pool } from '../../../src/models/index.js';

// 生成优惠券代码
function generateCouponCode() {
  const prefix = 'PKC'; // Parking Coupon
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

// 购买优惠券
export const buyCoupon = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { userId } = req.user; // 从JWT获取
    const { quantity = 1 } = req.body; // 默认购买1本

    await connection.beginTransaction();

    const coupons = [];
    for (let i = 0; i < quantity; i++) {
      const couponCode = generateCouponCode();
      const [result] = await connection.execute(
        'INSERT INTO parking_coupons (coupon_code, user_id, usage_limit, status) VALUES (?, ?, ?, ?)',
        [couponCode, userId, 10, 'valid']
      );
      coupons.push(couponCode);
    }

    await connection.commit();
    res.status(201).json({
      message: '优惠券购买成功',
      coupons
    });
  } catch (error) {
    await connection.rollback();
    console.error('购买优惠券错误:', error);
    res.status(500).json({ message: '服务器错误' });
  } finally {
    connection.release();
  }
};

// 使用优惠券
export const useCoupon = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { couponCode } = req.body;
    const { hours = 1 } = req.body; // 默认使用1小时

    await connection.beginTransaction();

    // 检查优惠券是否存在且有效
    const [coupons] = await connection.execute(
      'SELECT * FROM parking_coupons WHERE coupon_code = ? AND status = "valid"',
      [couponCode]
    );

    if (coupons.length === 0) {
      return res.status(404).json({ message: '无效的优惠券' });
    }

    const coupon = coupons[0];

    if (coupon.usage_limit <= 0) {
      return res.status(400).json({ message: '优惠券已用完' });
    }

    // 设置优惠券使用时间
    const validFrom = new Date();
    const validUntil = new Date(validFrom.getTime() + hours * 60 * 60 * 1000);

    // 更新优惠券状态
    await connection.execute(
      'UPDATE parking_coupons SET status = "in_use", usage_limit = usage_limit - 1, valid_from = ?, valid_until = ?, time_remaining = ? WHERE coupon_code = ?',
      [validFrom, validUntil, hours * 60, couponCode]
    );

    await connection.commit();
    res.json({
      message: '优惠券使用成功',
      validFrom,
      validUntil,
      timeRemaining: hours * 60 // 分钟
    });
  } catch (error) {
    await connection.rollback();
    console.error('使用优惠券错误:', error);
    res.status(500).json({ message: '服务器错误' });
  } finally {
    connection.release();
  }
};

// 检查优惠券状态
export const checkCoupon = async (req, res) => {
  try {
    const { carPlate } = req.params;

    // 查找最近使用的优惠券
    const [coupons] = await pool.execute(`
      SELECT pc.*, u.name as user_name, vi.car_plate 
      FROM parking_coupons pc
      JOIN users u ON pc.user_id = u.user_id
      JOIN vehicle_information vi ON u.user_id = vi.user_id
      WHERE vi.car_plate = ? AND pc.status IN ('valid', 'in_use')
      ORDER BY pc.valid_from DESC LIMIT 1
    `, [carPlate]);

    if (coupons.length === 0) {
      return res.status(404).json({ message: '未找到有效的优惠券' });
    }

    const coupon = coupons[0];
    
    // 如果优惠券正在使用中，计算剩余时间
    if (coupon.status === 'in_use') {
      const now = new Date();
      const validUntil = new Date(coupon.valid_until);
      const timeRemaining = Math.max(0, Math.floor((validUntil - now) / 1000 / 60)); // 转换为分钟

      if (timeRemaining <= 0) {
        // 更新优惠券状态为过期
        await pool.execute(
          'UPDATE parking_coupons SET status = "expired" WHERE coupon_code = ?',
          [coupon.coupon_code]
        );
        return res.status(404).json({ message: '优惠券已过期' });
      }

      coupon.timeRemaining = timeRemaining;
    }

    res.json({
      couponCode: coupon.coupon_code,
      status: coupon.status,
      timeRemaining: coupon.timeRemaining,
      usageLimit: coupon.usage_limit
    });
  } catch (error) {
    console.error('检查优惠券错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取用户的优惠券列表
export const getUserCoupons = async (req, res) => {
  try {
    const { userId } = req.user;

    const [coupons] = await pool.execute(`
      SELECT * FROM parking_coupons 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `, [userId]);

    res.json({ coupons });
  } catch (error) {
    console.error('获取优惠券列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};