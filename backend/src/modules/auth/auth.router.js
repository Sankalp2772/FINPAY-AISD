import { Router } from 'express';
import authService from './auth.service.js';
import { sendResponse, sendError } from '../../shared/response.js';
import { authenticateToken } from '../../middleware/auth.middleware.js';

const router = Router();

router.post('/register', async (req, res, next) => {
  try {
    const result = await authService.registerStudent(req.body);
    return sendResponse(res, 201, true, 'Student registered successfully', result);
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return sendResponse(res, 200, true, 'Login successful', result);
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    return sendResponse(res, 200, true, 'User profile fetched', user);
  } catch (error) {
    next(error);
  }
});

export default router;
