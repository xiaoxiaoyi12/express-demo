import request from 'supertest';
import app from '../app.js'; // 将 app 导出以便测试（需修改 app.js）

describe('认证接口测试', () => {
  const testUser = {
    name: '测试用户',
    email: `test${Date.now()}@example.com`,
    password: 'test123',
  };

  test('POST /api/auth/register 应成功注册新用户', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toBe(testUser.email);
  });

  test('POST /api/auth/register 重复邮箱应返回400', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/已被注册/);
  });

  test('POST /api/auth/login 应成功登录', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });
});
