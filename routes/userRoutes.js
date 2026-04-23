import express from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/list', getUsers);
router.get('/list/:id', getUserById);
router.post('/add', createUser);
router.put('/update/:id', auth, updateUser);
router.delete('/delete/:id', auth, deleteUser);

export default router;
