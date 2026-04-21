import express from 'express';
import db from './db.js';
const app = express();
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

app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id,name,email,created_at,updated_at FROM users ORDER BY id DESC',
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
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
app.post('/api/users', async (req, res) => {
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
app.put('/api/users/:id', async (req, res) => {
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
app.delete('/api/users/:id', async (req, res) => {
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

app.listen(9999, () => {
  console.log('Server is running on 9999 port');
});
