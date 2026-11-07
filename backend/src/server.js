import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` FinPay Backend Server Running on :${PORT}`);
  console.log(` Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Database: Connected via Prisma`);
  console.log(` Health URL: http://localhost:${PORT}/health`);
  console.log(`=========================================`);
});
