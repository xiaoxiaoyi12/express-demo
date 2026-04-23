import winston from 'winston';
import path from 'path';

// 定义日志级别颜色（可选）
winston.addColors({
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
});

// 日志格式
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message} ${stack ? '\n' + stack : ''}`;
  }),
);

// 创建 logger 实例
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format,
  transports: [
    // 输出到控制台
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }), // 控制台添加颜色
        winston.format.simple(),
      ),
    }),
    // 输出所有日志到文件
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

// 创建 morgan 的 stream，将 HTTP 请求日志接入 winston
export const morganStream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

export default logger;
