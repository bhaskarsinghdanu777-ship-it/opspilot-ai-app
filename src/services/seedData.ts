import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase/config';
import { handleFirestoreError, OperationType } from '@/src/lib/firebase/firestore';
import { mockInventoryData } from '@/src/lib/mock-data/inventory';
import { mockSalesData } from '@/src/lib/mock-data/sales';
import { mockCustomersData } from '@/src/lib/mock-data/customers';
import { mockExpensesData } from '@/src/lib/mock-data/expenses';
import { sampleAnalyses } from '@/src/lib/mock-data/aiAnalysis';

export async function checkHasBusinessData(ownerId: string): Promise<boolean> {
  try {
    const q = query(
      collection(db, 'products'),
      where('ownerId', '==', ownerId)
    );
    const snap = await getDocs(q);
    return !snap.empty;
  } catch (error) {
    console.warn('Could not check data existence:', error);
    return false;
  }
}

export async function seedBusinessData(
  ownerId: string,
  businessId: string
): Promise<{ products: number; sales: number; customers: number; expenses: number; analyses: number }> {
  const now = new Date().toISOString();

  // 1. Seed Products
  let productCount = 0;
  for (const item of mockInventoryData) {
    try {
      await addDoc(collection(db, 'products'), {
        ownerId,
        businessId,
        name: item.name,
        sku: item.sku,
        category: item.category,
        price: item.price,
        stock: item.stock,
        threshold: item.threshold,
        salesVelocity: item.salesVelocity,
        status: item.status,
        supplierLeadTimeDays: item.supplierLeadTimeDays || 4,
        createdAt: now,
        updatedAt: now,
      });
      productCount++;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'products');
    }
  }

  // 2. Seed Sales
  let salesCount = 0;
  for (const sale of mockSalesData) {
    try {
      await addDoc(collection(db, 'sales'), {
        ownerId,
        businessId,
        orderNumber: sale.orderNumber,
        date: sale.date,
        customerName: sale.customerName,
        category: sale.category,
        items: sale.items,
        channel: sale.channel,
        paymentMethod: sale.paymentMethod,
        amount: sale.amount,
        status: sale.status,
        createdAt: now,
      });
      salesCount++;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'sales');
    }
  }

  // 3. Seed Customers
  let customersCount = 0;
  for (const customer of mockCustomersData) {
    try {
      await addDoc(collection(db, 'customers'), {
        ownerId,
        businessId,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        orders: customer.orders,
        totalSpend: customer.totalSpend,
        lastPurchase: customer.lastPurchase,
        status: customer.status,
        preferredCategory: customer.preferredCategory,
        createdAt: now,
      });
      customersCount++;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'customers');
    }
  }

  // 4. Seed Expenses
  let expensesCount = 0;
  for (const expense of mockExpensesData) {
    try {
      await addDoc(collection(db, 'expenses'), {
        ownerId,
        businessId,
        date: expense.date,
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        vendor: expense.vendor,
        status: expense.status,
        createdAt: now,
      });
      expensesCount++;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'expenses');
    }
  }

  // 5. Seed AI Analysis History
  let analysesCount = 0;
  for (const queryKey of Object.keys(sampleAnalyses)) {
    const analysis = sampleAnalyses[queryKey];
    try {
      await addDoc(collection(db, 'aiAnalyses'), {
        ownerId,
        businessId,
        query: analysis.query,
        title: analysis.title,
        date: analysis.date,
        confidence: analysis.confidence,
        summary: analysis.summary,
        evidence: analysis.evidence,
        keyFactors: analysis.keyFactors,
        recommendations: analysis.recommendations,
        createdAt: now,
      });
      analysesCount++;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'aiAnalyses');
    }
  }

  return {
    products: productCount,
    sales: salesCount,
    customers: customersCount,
    expenses: expensesCount,
    analyses: analysesCount,
  };
}
