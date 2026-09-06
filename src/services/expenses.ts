import {
  collection,
  query,
  where,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '@/src/lib/firebase/config';
import { handleFirestoreError, OperationType } from '@/src/lib/firebase/firestore';
import { ExpenseItem } from '@/src/types';

export async function getExpenses(
  ownerId: string,
  businessId?: string
): Promise<ExpenseItem[]> {
  const path = 'expenses';
  try {
    let q = query(collection(db, path), where('ownerId', '==', ownerId));
    if (businessId) {
      q = query(
        collection(db, path),
        where('ownerId', '==', ownerId),
        where('businessId', '==', businessId)
      );
    }
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<ExpenseItem, 'id'>),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function addExpense(
  data: Omit<ExpenseItem, 'id'>,
  ownerId: string,
  businessId: string
): Promise<ExpenseItem> {
  const path = 'expenses';
  try {
    const now = new Date().toISOString();
    const payload = {
      ...data,
      ownerId,
      businessId,
      createdAt: data.createdAt || now,
    };
    const ref = await addDoc(collection(db, path), payload);
    return {
      id: ref.id,
      ...payload,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateExpense(
  expenseId: string,
  updates: Partial<ExpenseItem>
): Promise<void> {
  const path = `expenses/${expenseId}`;
  try {
    const docRef = doc(db, 'expenses', expenseId);
    await updateDoc(docRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteExpense(expenseId: string): Promise<void> {
  const path = `expenses/${expenseId}`;
  try {
    const docRef = doc(db, 'expenses', expenseId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
