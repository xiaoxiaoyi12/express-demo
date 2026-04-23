import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import RefreshToken from '../models/RefreshToken.js';

const router = express.Router();

// 注册
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: '缺少必填字段' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password_hash: hashed });
    res.status(201).json({ id: user.id, name: user.name, email: user.email });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: '邮箱已存在' });
    }
    res.status(500).json({ error: '注册失败' });
  }
});

// 登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }
    // 1. 生成 Access Token
    const accessToken = generateAccessToken(user);

    // 2. 生成 Refresh Token（随机字符串）并存入数据库
    const refreshTokenStr = await generateRefreshToken(user);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30天后过期

    await RefreshToken.create({
      user_id: user.id,
      token: refreshTokenStr,
      expires_at: expiresAt,
    });

    res.json({
      accessToken,
      refreshToken: refreshTokenStr,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('登录失败error', error);
    res.status(500).json({ error: '登录失败' });
  }
});

// routes/authRoutes.js
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: '缺少 Refresh Token' });
    }

    // 1. 在数据库中查找该 Refresh Token
    const storedToken = await RefreshToken.findOne({
      where: { token: refreshToken },
      include: [{ model: User, attributes: ['id', 'name', 'email'] }],
    });

    if (!storedToken) {
      return res.status(401).json({ error: '无效的 Refresh Token' });
    }

    // 2. 检查是否过期
    if (new Date() > storedToken.expires_at) {
      await storedToken.destroy(); // 清理过期记录
      return res
        .status(401)
        .json({ error: 'Refresh Token 已过期，请重新登录' });
    }

    const user = storedToken.User;

    // 3. 生成新的 Access Token
    const newAccessToken = generateAccessToken(user);

    // 4. （可选）滚动刷新：旧的 Refresh Token 作废，生成新的 Refresh Token
    //    这样可以延长登录态，同时让旧 Token 失效（增强安全性）
    //    await storedToken.destroy();
    //    const newRefreshToken = await generateRefreshToken(user);
    //    await RefreshToken.create({ ... });

    res.json({
      accessToken: newAccessToken,
      // refreshToken: newRefreshToken, // 如果启用滚动刷新
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 用户主动登出时，删除数据库中的 Refresh Token，使其无法再用于刷新。
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await RefreshToken.destroy({ where: { token: refreshToken } });
    }
    res.json({ message: '登出成功' });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;
