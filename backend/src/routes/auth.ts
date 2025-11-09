import { Router } from 'express';
import authController from '../controllers/authController';

const router = Router();

// Registrar novo usuário
router.post('/register', authController.register);

// Login de usuário
router.post('/login', authController.login);

// Definir senha para usuários existentes (compatibilidade)
router.post('/set-password', authController.setPassword);

export default router;