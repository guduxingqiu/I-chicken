import express from 'express';
import { authenticateUser, authenticateStaff } from '../../../src/middleware/auth.js';
import { 
  buyCoupon, 
  useCoupon, 
  checkCoupon, 
  getUserCoupons 
} from '../controllers/couponController.js';

const router = express.Router();

// 用户路由
router.post('/buy', authenticateUser, buyCoupon);          // 购买优惠券
router.post('/use', authenticateUser, useCoupon);          // 使用优惠券
router.get('/my-coupons', authenticateUser, getUserCoupons); // 获取用户的优惠券列表

// 工作人员路由
router.get('/check/:carPlate', authenticateStaff, checkCoupon); // 检查车牌号的优惠券状态

export default router; 