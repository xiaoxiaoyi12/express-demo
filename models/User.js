import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
  },
  {
    tableName: 'users', // 指定表名（与现有表一致）
    timestamps: true, // 自动管理 createdAt / updatedAt
    underscored: true, // 使用 snake_case 字段名（created_at, updated_at）
  },
);

export default User;
