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
import { ProductItem } from '@/src/types';

export async function getProducts(
  ownerId: string,
  businessId?: string
): Promise<ProductItem[]> {
  const path = 'products';
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
      ...(d.data() as Omit<ProductItem, 'id'>),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function addProduct(
  data: Omit<ProductItem, 'id'>,
  ownerId: string,
  businessId: string
): Promise<ProductItem> {
  const path = 'products';
  try {
    const now = new Date().toISOString();
    const payload = {
      ...data,
      ownerId,
      businessId,
      createdAt: data.createdAt || now,
      updatedAt: now,
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

export async function updateProduct(
  productId: string,
  updates: Partial<ProductItem>
): Promise<void> {
  const path = `products/${productId}`;
  try {
    const docRef = doc(db, 'products', productId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteProduct(productId: string): Promise<void> {
  const path = `products/${productId}`;
  try {
    const docRef = doc(db, 'products', productId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
