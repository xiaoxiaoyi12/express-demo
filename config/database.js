import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false, // 生产环境可关闭 SQL 日志
  },
);

// 测试连接
try {
  await sequelize.authenticate();
  console.log('✅ Sequelize 连接成功');
} catch (error) {
  console.error('❌ Sequelize 连接失败:', error);
}

export default sequelize;
