import express from 'express';
import db from './db.js';
import userRoutes from './routes/userRoutes.js';

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
app.use('/api/users', userRoutes);
// 启动服务
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT} port`);
});
