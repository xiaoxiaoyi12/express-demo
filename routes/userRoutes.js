import express from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';

const router = express.Router();

router.get('/list', getUsers);
router.get('/list/:id', getUserById);
router.post('/add', createUser);
router.put('/update/:id', updateUser);
router.delete('/delete/:id', deleteUser);

export default router;
