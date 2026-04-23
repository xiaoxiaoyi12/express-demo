import { body } from 'express-validator';

// 注册校验规则
export const registerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('姓名不能为空')
    .isLength({ min: 2, max: 50 })
    .withMessage('姓名长度需在2-50字符之间')
    .matches(/^[\u4e00-\u9fa5a-zA-Z0-9_\-\s]+$/)
    .withMessage('姓名只能包含中英文、数字、空格和_-'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('邮箱不能为空')
    .isEmail()
    .withMessage('邮箱格式不正确')
    .normalizeEmail(), // 规范化邮箱地址

  body('password')
    .notEmpty()
    .withMessage('密码不能为空')
    .isLength({ min: 6 })
    .withMessage('密码至少6位')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage('密码必须包含字母和数字'),
];

// 登录校验规则（相对宽松）
export const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('邮箱不能为空')
    .isEmail()
    .withMessage('邮箱格式不正确')
    .normalizeEmail(),

  body('password').notEmpty().withMessage('密码不能为空'),
];
