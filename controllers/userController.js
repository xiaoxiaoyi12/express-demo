import User from '../models/User.js';
import { Op } from 'sequelize';

// GET /api/users/list
export const getUsers = async (req, res) => {
  try {
    // 1. 解析查询参数，设置默认值
    const page = parseInt(req.query.page) || 1; // 当前页码，默认第1页
    const pageSize = parseInt(req.query.pageSize) || 10; // 每页条数，默认10条
    const search = req.query.search || ''; // 搜索关键词
    // 计算偏移量 (OFFSET)
    const offset = (page - 1) * pageSize;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      pageSize,
      offset,
      order: [['id', 'DESC']],
      attributes: ['id', 'name', 'email', 'created_at', 'updated_at'],
    });

    // 5. 返回带有分页信息的数据
    res.json({
      data: rows,
      pagination: {
        page,
        pageSize,
        total: count,
        totalPages: Math.ceil(count / pageSize),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '数据库查询失败' });
  }
};

// GET /api/users/list/:id
export const getUserById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const user = await User.findByPk(id, {
      attributes: ['id', 'name', 'email', 'created_at', 'updated_at'],
    });
    if (!user) {
      return res.status(404).json({ error: '用户不存在！' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: '查询失败' });
  }
};

// POST /api/users/add
export const createUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'name 和 email 是必填字段' });
    }
    const newUser = await User.create({ name, email });

    res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      created_at: newUser.created_at,
      updated_at: newUser.updated_at,
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: '该邮箱已被注册' });
    }
    console.error(error);
    res.status(500).json({ error: '用户创建失败' });
  }
};
// PUT /api/users/update/:id
export const updateUser = async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'name 和 email 是必填字段' });
  }
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    user.name = name;
    user.email = email;
    await user.save();
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at,
      updated_at: user.updated_at,
    });
  } catch (error) {
    if (error.code === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: '邮箱已被其他用户使用' });
    }
    res.status(500).json({ error: '更新失败' });
  }
};
// DELETE /api/users/delete/:id
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    await user.destroy();
    res.status(204).send(); // 204 No Content
  } catch (error) {
    res.status(500).json({ error: '删除失败' });
  }
};
