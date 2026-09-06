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
import { SaleItem } from '@/src/types';

export async function getSales(
  ownerId: string,
  businessId?: string
): Promise<SaleItem[]> {
  const path = 'sales';
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
      ...(d.data() as Omit<SaleItem, 'id'>),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function addSale(
  data: Omit<SaleItem, 'id'>,
  ownerId: string,
  businessId: string
): Promise<SaleItem> {
  const path = 'sales';
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

export async function updateSale(
  saleId: string,
  updates: Partial<SaleItem>
): Promise<void> {
  const path = `sales/${saleId}`;
  try {
    const docRef = doc(db, 'sales', saleId);
    await updateDoc(docRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteSale(saleId: string): Promise<void> {
  const path = `sales/${saleId}`;
  try {
    const docRef = doc(db, 'sales', saleId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
