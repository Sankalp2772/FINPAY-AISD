import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/auth.middleware.js';

// Module routers
import authRouter from './modules/auth/auth.router.js';
import walletRouter from './modules/wallet/wallet.router.js';
import merchantRouter from './modules/merchant/merchant.router.js';
import paymentRouter from './modules/payment/payment.router.js';
import cashbackRouter from './modules/cashback/cashback.router.js';
import reconciliationRouter from './modules/reconciliation/reconciliation.router.js';
import studentRouter from './modules/student/student.router.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    project: 'FinPay Academic System',
    timestamp: new Date().toISOString()
  });
});

// Modular Monolith API Mounts
app.use('/api/auth', authRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/merchants', merchantRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/cashback', cashbackRouter);
app.use('/api/reconciliation', reconciliationRouter);
app.use('/api/students', studentRouter);

// Global Error Handler
app.use(errorHandler);

export default app;
