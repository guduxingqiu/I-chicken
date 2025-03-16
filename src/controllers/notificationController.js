// src/controllers/notificationController.js
import admin from '../firebase.js';

// 发送推送通知
export const sendNotification = async (req, res) => {
    const { token, title, body } = req.body;

    const message = {
        notification: {
            title: title,
            body: body,
        },
        token: token,
    };

    try {
        const response = await admin.messaging().send(message);
        res.status(200).json({ message: '通知发送成功', response });
    } catch (error) {
        console.error('通知发送失败:', error);
        res.status(500).json({ message: '通知发送失败' });
    }
};