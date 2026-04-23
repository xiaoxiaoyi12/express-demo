import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '用户管理系统 API',
      version: '1.0.0',
      description: '一个基于 Express + Sequelize + JWT 的 RESTful API 示例',
      contact: {
        name: '你的名字',
        email: 'your@email.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:9999/api',
        description: '开发服务器',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js', './models/*.js'], // 扫描这些文件中的 JSDoc 注释
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
