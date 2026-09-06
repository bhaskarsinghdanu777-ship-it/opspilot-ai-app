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
import { CustomerItem } from '@/src/types';

export async function getCustomers(
  ownerId: string,
  businessId?: string
): Promise<CustomerItem[]> {
  const path = 'customers';
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
      ...(d.data() as Omit<CustomerItem, 'id'>),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function addCustomer(
  data: Omit<CustomerItem, 'id'>,
  ownerId: string,
  businessId: string
): Promise<CustomerItem> {
  const path = 'customers';
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

export async function updateCustomer(
  customerId: string,
  updates: Partial<CustomerItem>
): Promise<void> {
  const path = `customers/${customerId}`;
  try {
    const docRef = doc(db, 'customers', customerId);
    await updateDoc(docRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteCustomer(customerId: string): Promise<void> {
  const path = `customers/${customerId}`;
  try {
    const docRef = doc(db, 'customers', customerId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
