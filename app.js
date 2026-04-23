import express from 'express';
import sequelize from './config/database.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.static('public')); //启用静态文件托管
app.use(express.json());
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store,no-cache,must-revalidate,private');
  next();
});

// 挂载用户路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// 同步数据库模型后启动服务
sequelize
  .sync({ alter: false }) // alter: true 会根据模型自动修改表结构（谨慎使用）
  .then(() => {
    console.log('✅ 数据库模型同步完成');
    app.listen(PORT, () => {
      console.log(`🚀 服务运行在 http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ 数据库同步失败:', err);
  });
