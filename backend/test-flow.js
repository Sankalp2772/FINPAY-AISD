const test = async () => {
  try {
    // 1. Test Admin Login
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@finpay.edu', password: 'admin123' })
    });
    const loginData = await loginRes.json();
    console.log('Admin login success:', loginData.success, 'Role:', loginData.data?.user?.role);
    const adminToken = loginData.data?.token;

    // 2. Test Student Login
    const stuLoginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'aarav@student.edu', password: 'student123' })
    });
    const stuLoginData = await stuLoginRes.json();
    console.log('Student login success:', stuLoginData.success, 'Wallet balance:', stuLoginData.data?.user?.student?.wallet?.balance);
    const stuToken = stuLoginData.data?.token;

    // 3. Test Student Payment & Automatic Cashback
    const payRes = await fetch('http://localhost:5000/api/payments/pay', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${stuToken}`
      },
      body: JSON.stringify({ merchantId: 1, amount: 120.00 })
    });
    const payData = await payRes.json();
    console.log('Payment executed:', payData.success, 'Cashback credited:', payData.data?.cashback?.amount, 'Updated Wallet Balance:', payData.data?.newBalance);

    // 4. Test Monthly Reconciliation
    const now = new Date();
    const recRes = await fetch(`http://localhost:5000/api/reconciliation/report?year=${now.getFullYear()}&month=${now.getMonth() + 1}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const recData = await recRes.json();
    console.log('Reconciliation status:', recData.data?.details?.status, 'Total Payments:', recData.data?.details?.totalPaymentsCount, 'Variance:', recData.data?.details?.differenceAmount);

  } catch (err) {
    console.error('Test error:', err);
  }
};

test();
