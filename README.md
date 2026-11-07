# FinPay – Student Wallet and Payment Management System

FinPay is an academic full-stack web application for student wallet payments, automated cashback crediting, merchant management, and monthly financial reconciliation.

---

## Tech Stack

- **Frontend:** React.js (Vite), Tailwind CSS, Axios, React Router v6, Lucide Icons
- **Backend:** Node.js, Express.js (Modular Monolith, 4-Layer Architecture: Router → Service → Repository → Model)
- **Database:** MySQL, Prisma ORM
- **Authentication:** JWT, bcrypt

---

## Demo Credentials

### Admin Account
- **Email:** `admin@finpay.edu`
- **Password:** `admin123`
- **Role:** `ADMIN`

### Student Accounts
- **Password for all students:** `student123`
- **Demo Student:** `aarav@student.edu` (Student ID: `STU-2024-001`)
- **Other Students:** `diya@student.edu`, `rohan@student.edu`, `ananya@student.edu`, `vikram@student.edu`

*(You can also use the **Academic Demo Quick-Fill** buttons on the login page)*

---

## Core Features

- **Wallet (FR1):** Student wallet auto-creation, live balance, transaction history, balance top-up.
- **Payment (FR2):** Browse merchants, pay from wallet balance, atomic debit inside MySQL transactions.
- **Cashback (FR3):** Configurable cashback percentages, automatic calculation, instant wallet credit.
- **Merchant (FR4):** Admin manages merchants & categories; students browse outlets.
- **Reconciliation (FR5):** Admin monthly audit report, discrepancy detection, CSV download.
- **Authentication (FR6):** Student & Admin JWT login/register, role-based route protection.

---

## Project Structure

```
finpay-app/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (MySQL)
│   │   └── seed.js             # Initial demo data seeder
│   └── src/
│       ├── config/             # Prisma client
│       ├── middleware/         # Auth & role guards
│       ├── shared/             # Response utilities
│       ├── modules/
│       │   ├── auth/           # Router -> Service -> Repository
│       │   ├── wallet/
│       │   ├── payment/
│       │   ├── cashback/
│       │   ├── merchant/
│       │   ├── reconciliation/
│       │   └── student/
│       ├── app.js
│       └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/         # Protected routes & UI elements
│   │   ├── context/            # AuthContext
│   │   ├── layouts/            # Student & Admin layouts
│   │   ├── pages/              # Dashboard, Wallet, Payments, Admin views
│   │   ├── services/           # Axios API service
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

---

## Getting Started

### 1. Database Setup
Create a MySQL database named `finpay_db`:
```sql
CREATE DATABASE finpay_db;
```

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma db push
npm run seed
npm start
```
Backend runs on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.
