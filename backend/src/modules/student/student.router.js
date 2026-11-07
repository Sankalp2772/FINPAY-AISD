import { Router } from 'express';
import prisma from '../../config/prisma.js';
import { sendResponse } from '../../shared/response.js';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken, requireRole('ADMIN'));

// Get all students
router.get('/', async (req, res, next) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            createdAt: true
          }
        },
        wallet: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return sendResponse(res, 200, true, 'Students fetched', students);
  } catch (error) {
    next(error);
  }
});

// Update student status
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const student = await prisma.student.update({
      where: { id: Number(id) },
      data: { status },
      include: { user: true, wallet: true }
    });
    return sendResponse(res, 200, true, 'Student status updated', student);
  } catch (error) {
    next(error);
  }
});

export default router;
