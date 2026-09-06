import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  limit,
} from 'firebase/firestore';
import { db } from '@/src/lib/firebase/config';
import { handleFirestoreError, OperationType } from '@/src/lib/firebase/firestore';
import { Business } from '@/src/types';

export async function getBusiness(businessId: string): Promise<Business | null> {
  const path = `businesses/${businessId}`;
  try {
    const docRef = doc(db, 'businesses', businessId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data() as Business;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function getUserBusiness(ownerId: string): Promise<Business | null> {
  const path = 'businesses';
  try {
    const q = query(
      collection(db, 'businesses'),
      where('ownerId', '==', ownerId),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data() as Business;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function createBusiness(business: Business): Promise<void> {
  const path = `businesses/${business.id}`;
  try {
    const docRef = doc(db, 'businesses', business.id);
    await setDoc(docRef, business);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateBusiness(
  businessId: string,
  updates: Partial<Business>
): Promise<void> {
  const path = `businesses/${businessId}`;
  try {
    const docRef = doc(db, 'businesses', businessId);
    await updateDoc(docRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
