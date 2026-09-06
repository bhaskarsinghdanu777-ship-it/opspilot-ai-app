import {
  collection,
  query,
  where,
  getDocs,
  doc,
  addDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '@/src/lib/firebase/config';
import { handleFirestoreError, OperationType } from '@/src/lib/firebase/firestore';
import { AiAnalysis } from '@/src/types';

export async function getAiAnalyses(
  ownerId: string,
  businessId?: string
): Promise<AiAnalysis[]> {
  const path = 'aiAnalyses';
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
      ...(d.data() as Omit<AiAnalysis, 'id'>),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function addAiAnalysis(
  data: Omit<AiAnalysis, 'id'>,
  ownerId: string,
  businessId: string
): Promise<AiAnalysis> {
  const path = 'aiAnalyses';
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

export async function deleteAiAnalysis(analysisId: string): Promise<void> {
  const path = `aiAnalyses/${analysisId}`;
  try {
    const docRef = doc(db, 'aiAnalyses', analysisId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
