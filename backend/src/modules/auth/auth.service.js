import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authRepository from './auth.repository.js';

class AuthService {
  async registerStudent(payload) {
    const { email, password, fullName, studentIdCard, department, semester, phone } = payload;

    if (!email || !password || !fullName || !studentIdCard || !department || !semester) {
      const error = new Error('All required fields must be provided.');
      error.statusCode = 400;
      throw error;
    }

    const existingUser = await authRepository.findByEmail(email);
    if (existingUser) {
      const error = new Error('Email is already registered.');
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await authRepository.createStudentUser({
      email,
      hashedPassword,
      fullName,
      studentIdCard,
      department,
      semester,
      phone
    });

    const token = this.generateToken(user);
    const safeUser = this.sanitizeUser(user);

    return { token, user: safeUser };
  }

  async login(email, password) {
    if (!email || !password) {
      const error = new Error('Email and password are required.');
      error.statusCode = 400;
      throw error;
    }

    const user = await authRepository.findByEmail(email);
    if (!user) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const token = this.generateToken(user);
    const safeUser = this.sanitizeUser(user);

    return { token, user: safeUser };
  }

  async getCurrentUser(userId) {
    const user = await authRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    return this.sanitizeUser(user);
  }

  generateToken(user) {
    const secret = process.env.JWT_SECRET || 'finpay_default_secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        studentId: user.student ? user.student.id : null,
        walletId: user.student?.wallet ? user.student.wallet.id : null
      },
      secret,
      { expiresIn }
    );
  }

  sanitizeUser(user) {
    const { password, ...safeUser } = user;
    return safeUser;
  }
}

export default new AuthService();
