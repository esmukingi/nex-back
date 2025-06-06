import express from 'express';
import { signup, login, logout, checkAuth, updateProfile } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js'; // Fixed import

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/check', protectRoute, checkAuth);
router.post('/updateProfile', protectRoute, updateProfile);

export default router;