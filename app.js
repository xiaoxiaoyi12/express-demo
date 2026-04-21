import express from 'express';
import db from './db.js';
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static('public')); //启用静态文件托管
const users = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
];
let nextId = 3;

app.use(express.json());
//
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store,no-cache,must-revalidate,private');
  next();
});

app.get('/api/users/list', async (req, res) => {
  try {
    // 1. 解析查询参数，设置默认值
    const page = parseInt(req.query.page) || 1; // 当前页码，默认第1页
    const pageSize = parseInt(req.query.pageSize) || 10; // 每页条数，默认10条
    const search = req.query.search || ''; // 搜索关键词

    // 计算偏移量 (OFFSET)
    const offset = (page - 1) * pageSize;

    // 2. 构建 SQL 查询（使用 LIKE 实现模糊搜索）
    let sql = 'SELECT id, name, email, created_at, updated_at FROM users';
    let countSql = 'SELECT COUNT(*) as total FROM users';
    const params = [];

    if (search) {
      // 如果有搜索关键词，在 name 或 email 中模糊匹配
      const searchPattern = `%${search}%`;
      sql += ' WHERE name LIKE ? OR email LIKE ?';
      countSql += ' WHERE name LIKE ? OR email LIKE ?';
      params.push(searchPattern, searchPattern);
    }

    sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';

    // 3. 执行查询
    const [rows] = await db.query(sql, [...params, pageSize, offset]);

    // 4. 查询总条数（用于前端计算总页数）
    const [countResult] = await db.query(countSql, params);
    const total = countResult[0].total;

    // 5. 返回带有分页信息的数据
    res.json({
      data: rows,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '数据库查询失败' });
  }
});

// --- GET /api/users/:id —— 获取单个用户 ---
app.get('/api/users/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [user] = await db.query('SELECT * FROM user WHERE id=?', [id]);
    if (user.length === 0) {
      return res.status(404).json({ error: '用户不存在！' });
    }
    res.json(user[0]);
  } catch (error) {
    res.status(500).json({ error: '查询失败' });
  }
});

// --- POST /api/users —— 创建新用户 ---
app.post('/api/users/add', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'name 和 email 是必填字段' });
    }
    const [result] = await db.query(
      'INSERT INTO users(name,email) VALUES(?,?)',
      [name, email],
    );
    // 查询刚插入的用户详情返回
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [
      result.insertId,
    ]);
    res.status(201).json(rows[0]);
  } catch (error) {}
});

// --- PUT /api/users/:id —— 更新用户 ---
app.put('/api/users/update/:id', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'name 和 email 是必填字段' });
  }
  try {
    const [result] = await db.query(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name, email, req.params.id],
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [
      req.params.id,
    ]);
    res.json(rows[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: '邮箱已被其他用户使用' });
    }
    res.status(500).json({ error: '更新失败' });
  }
});

// --- DELETE /api/users/:id —— 删除用户 ---
app.delete('/api/users/delete/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [
      req.params.id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }
    res.status(204).send(); // 204 No Content
  } catch (error) {
    res.status(500).json({ error: '删除失败' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT} port`);
});
