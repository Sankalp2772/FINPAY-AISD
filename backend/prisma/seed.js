import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Cleaning previous demo data ---');
  await prisma.cashbackRecord.deleteMany();
  await prisma.walletTransaction.deleteMany();
  await prisma.paymentTransaction.deleteMany();
  await prisma.cashbackRule.deleteMany();
  await prisma.merchant.deleteMany();
  await prisma.merchantCategory.deleteMany();
  await prisma.reconciliation.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.student.deleteMany();
  await prisma.user.deleteMany();

  console.log('--- Creating Admin Account ---');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@finpay.edu',
      password: adminPassword,
      fullName: 'System Administrator',
      role: 'ADMIN'
    }
  });

  console.log('--- Creating Merchant Categories ---');
  const catFood = await prisma.merchantCategory.create({
    data: { code: 'CAT_FOOD', name: 'Campus Cafeteria & Food Courts', description: 'Meals, snacks, and beverages on campus' }
  });
  const catBook = await prisma.merchantCategory.create({
    data: { code: 'CAT_BOOK', name: 'Bookstore & Stationery', description: 'Textbooks, notebooks, and study essentials' }
  });
  const catPrint = await prisma.merchantCategory.create({
    data: { code: 'CAT_PRINT', name: 'Print & Copy Centers', description: 'Printing, binding, and photocopying' }
  });
  const catEquip = await prisma.merchantCategory.create({
    data: { code: 'CAT_TECH', name: 'IT & Lab Equipment Supplies', description: 'Electronics, components, and lab kits' }
  });

  console.log('--- Creating 5 Demo Merchants ---');
  const merchantsData = [
    { name: 'Central Canteen', code: 'MRC-CAN-101', catId: catFood.id, email: 'canteen@campus.edu', phone: '9876543210', loc: 'Ground Floor, Student Activity Center' },
    { name: 'Campus Books & Co.', code: 'MRC-BOK-202', catId: catBook.id, email: 'books@campus.edu', phone: '9876543211', loc: 'Academic Block A, Room 104' },
    { name: 'QuickPrint Hub', code: 'MRC-PRN-303', catId: catPrint.id, email: 'print@campus.edu', phone: '9876543212', loc: 'Central Library Basement' },
    { name: 'Green Beans Coffee Bar', code: 'MRC-COF-404', catId: catFood.id, email: 'coffee@campus.edu', phone: '9876543213', loc: 'Science Complex Lawn' },
    { name: 'RoboTech Lab Stores', code: 'MRC-TEC-505', catId: catEquip.id, email: 'robotech@campus.edu', phone: '9876543214', loc: 'Engineering Wing 3' }
  ];

  const merchants = [];
  for (const m of merchantsData) {
    const created = await prisma.merchant.create({
      data: {
        name: m.name,
        merchantCode: m.code,
        categoryId: m.catId,
        contactEmail: m.email,
        phone: m.phone,
        location: m.loc,
        isActive: true
      }
    });
    merchants.push(created);
  }

  console.log('--- Creating Cashback Rules ---');
  // Global rule: 5% on spend >= 100
  await prisma.cashbackRule.create({
    data: {
      title: 'General Campus Spending Cashback',
      percentage: 5.0,
      minSpend: 50.0,
      maxCashback: 50.0,
      status: 'ACTIVE'
    }
  });

  // Specific rule for Central Canteen: 10% on spend >= 100
  await prisma.cashbackRule.create({
    data: {
      merchantId: merchants[0].id,
      title: 'Canteen Special Lunch Cashback',
      percentage: 10.0,
      minSpend: 100.0,
      maxCashback: 40.0,
      status: 'ACTIVE'
    }
  });

  // Specific rule for Campus Books: 8% on spend >= 200
  await prisma.cashbackRule.create({
    data: {
      merchantId: merchants[1].id,
      title: 'Academic Bookstore Special',
      percentage: 8.0,
      minSpend: 200.0,
      maxCashback: 100.0,
      status: 'ACTIVE'
    }
  });

  console.log('--- Creating 5 Demo Students and Wallets ---');
  const studentPassword = await bcrypt.hash('student123', 10);
  const studentsSeed = [
    { name: 'Aarav Sharma', email: 'aarav@student.edu', card: 'STU-2024-001', dept: 'Computer Science', sem: '6th Sem', phone: '9123456780', initialBalance: 1500.00 },
    { name: 'Diya Patel', email: 'diya@student.edu', card: 'STU-2024-002', dept: 'Electronics & Comm', sem: '4th Sem', phone: '9123456781', initialBalance: 2200.00 },
    { name: 'Rohan Verma', email: 'rohan@student.edu', card: 'STU-2024-003', dept: 'Mechanical Engg', sem: '8th Sem', phone: '9123456782', initialBalance: 850.00 },
    { name: 'Ananya Iyer', email: 'ananya@student.edu', card: 'STU-2024-004', dept: 'Information Tech', sem: '2nd Sem', phone: '9123456783', initialBalance: 3000.00 },
    { name: 'Vikram Singh', email: 'vikram@student.edu', card: 'STU-2024-005', dept: 'Civil Engineering', sem: '6th Sem', phone: '9123456784', initialBalance: 1200.00 }
  ];

  const createdWallets = [];

  for (let i = 0; i < studentsSeed.length; i++) {
    const s = studentsSeed[i];
    const user = await prisma.user.create({
      data: {
        email: s.email,
        password: studentPassword,
        fullName: s.name,
        role: 'STUDENT'
      }
    });

    const student = await prisma.student.create({
      data: {
        userId: user.id,
        studentIdCard: s.card,
        department: s.dept,
        semester: s.sem,
        phone: s.phone
      }
    });

    const wallet = await prisma.wallet.create({
      data: {
        studentId: student.id,
        walletNumber: `FPW-2026-000${i + 1}`,
        balance: s.initialBalance,
        currency: 'INR'
      }
    });

    // Initial topup transaction log
    await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        transactionRef: `TXN-INIT-${wallet.id}-${Date.now()}`,
        type: 'TOPUP',
        direction: 'CREDIT',
        amount: s.initialBalance,
        balanceBefore: 0.00,
        balanceAfter: s.initialBalance,
        description: 'Account opening scholarship credit'
      }
    });

    createdWallets.push({ student, wallet, user });
  }

  console.log('--- Generating Sample Payments & Cashback ---');
  // Seed sample transactions for Aarav and Diya
  const w1 = createdWallets[0].wallet;
  const w2 = createdWallets[1].wallet;

  // Sample Txn 1: Aarav pays at Central Canteen (Amount: 150)
  // 10% Cashback on >= 100 -> 15 INR
  const pay1 = await prisma.paymentTransaction.create({
    data: {
      paymentRef: 'PAY-DEMO-001',
      walletId: w1.id,
      merchantId: merchants[0].id,
      amount: 150.00,
      status: 'SUCCESS',
      cashbackAmount: 15.00
    }
  });

  await prisma.walletTransaction.create({
    data: {
      walletId: w1.id,
      transactionRef: 'TXN-DBT-001',
      type: 'PAYMENT',
      direction: 'DEBIT',
      amount: 150.00,
      balanceBefore: 1500.00,
      balanceAfter: 1350.00,
      description: 'Payment to Central Canteen',
      referenceEntity: 'PAYMENT',
      referenceId: pay1.id
    }
  });

  const cb1 = await prisma.cashbackRecord.create({
    data: {
      paymentTransactionId: pay1.id,
      walletId: w1.id,
      amount: 15.00,
      percentageApplied: 10.00
    }
  });

  await prisma.walletTransaction.create({
    data: {
      walletId: w1.id,
      transactionRef: 'TXN-CSH-001',
      type: 'CASHBACK',
      direction: 'CREDIT',
      amount: 15.00,
      balanceBefore: 1350.00,
      balanceAfter: 1365.00,
      description: 'Cashback reward (10%) for payment to Central Canteen',
      referenceEntity: 'CASHBACK',
      referenceId: cb1.id
    }
  });

  await prisma.wallet.update({
    where: { id: w1.id },
    data: { balance: 1365.00 }
  });

  // Sample Txn 2: Diya buys Books (Amount: 500)
  // 8% on >= 200 -> 40 INR
  const pay2 = await prisma.paymentTransaction.create({
    data: {
      paymentRef: 'PAY-DEMO-002',
      walletId: w2.id,
      merchantId: merchants[1].id,
      amount: 500.00,
      status: 'SUCCESS',
      cashbackAmount: 40.00
    }
  });

  await prisma.walletTransaction.create({
    data: {
      walletId: w2.id,
      transactionRef: 'TXN-DBT-002',
      type: 'PAYMENT',
      direction: 'DEBIT',
      amount: 500.00,
      balanceBefore: 2200.00,
      balanceAfter: 1700.00,
      description: 'Payment to Campus Books & Co.',
      referenceEntity: 'PAYMENT',
      referenceId: pay2.id
    }
  });

  const cb2 = await prisma.cashbackRecord.create({
    data: {
      paymentTransactionId: pay2.id,
      walletId: w2.id,
      amount: 40.00,
      percentageApplied: 8.00
    }
  });

  await prisma.walletTransaction.create({
    data: {
      walletId: w2.id,
      transactionRef: 'TXN-CSH-002',
      type: 'CASHBACK',
      direction: 'CREDIT',
      amount: 40.00,
      balanceBefore: 1700.00,
      balanceAfter: 1740.00,
      description: 'Cashback reward (8%) for payment to Campus Books & Co.',
      referenceEntity: 'CASHBACK',
      referenceId: cb2.id
    }
  });

  await prisma.wallet.update({
    where: { id: w2.id },
    data: { balance: 1740.00 }
  });

  console.log('--- Demo Seeding Completed Successfully! ---');
  console.log('Admin: admin@finpay.edu / admin123');
  console.log('Student: aarav@student.edu / student123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
