import jwt from 'jsonwebtoken';
import { sendError } from '../shared/response.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return sendError(res, 401, 'Access denied. No token provided.');
  }

  try {
    const secret = process.env.JWT_SECRET || 'finpay_default_secret';
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    return sendError(res, 403, 'Invalid or expired token.');
  }
};

export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Unauthorized');
    }
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!roles.includes(req.user.role)) {
      return sendError(res, 403, `Forbidden. Required role: ${roles.join(' or ')}`);
    }
    next();
  };
};

export const errorHandler = (err, req, res, next) => {
  console.error('[Error Middleware]:', err);
  const status = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  return sendError(res, status, message);
};
