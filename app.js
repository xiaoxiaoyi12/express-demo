import express from 'express';
import sequelize from './config/database.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import morgan from 'morgan';
import logger, { morganStream } from './config/logger.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';

const app = express();
const PORT = process.env.PORT || 3000;

// 使用 morgan 记录 HTTP 请求，并输出到 winston
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms', {
    stream: morganStream,
  }),
);
// 中间件
app.use(express.static('public')); //启用静态文件托管
app.use(express.json());
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store,no-cache,must-revalidate,private');
  next();
});

// API 文档路由（无需认证）
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 挂载用户路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// 全局错误处理中间件（记录错误日志）
app.use((err, req, res, next) => {
  logger.error(
    `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
  );
  res
    .status(err.status || 500)
    .json({ error: err.message || '服务器内部错误' });
});

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
