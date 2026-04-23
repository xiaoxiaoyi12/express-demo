import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET || JWT_SECRET; // 建议单独设置

// 生成 Access Token（短有效期）
export const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '15m' }, // 15分钟
  );
};

// 生成 Refresh Token（长有效期 + 随机熵）
export const generateRefreshToken = async (user) => {
  // 方式一：使用 JWT 签发（可解码，但一般不需要）
  // return jwt.sign({ userId: user.id }, REFRESH_SECRET, { expiresIn: '30d' });

  // 方式二：使用随机字符串（更推荐，无需解码）
  return crypto.randomBytes(40).toString('hex');
};

// 验证 Access Token
export const verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

// 验证 Refresh Token（若使用 JWT 方式）
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_SECRET);
};
