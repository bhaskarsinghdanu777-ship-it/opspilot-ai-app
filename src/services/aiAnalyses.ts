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
    const results = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<AiAnalysis, 'id'>),
    }));
    return results.sort((a, b) => {
      const timeA = new Date(a.createdAt || a.timestamp || a.date || 0).getTime();
      const timeB = new Date(b.createdAt || b.timestamp || b.date || 0).getTime();
      return timeB - timeA;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function addAiAnalysis(
  data: Omit<AiAnalysis, 'id'> | AiAnalysis,
  ownerId: string,
  businessId: string
): Promise<AiAnalysis> {
  const path = 'aiAnalyses';
  try {
    const now = new Date().toISOString();
    const { id: _ignoreId, ...rest } = data as any;
    const payload = {
      ...rest,
      ownerId,
      businessId,
      createdAt: rest.createdAt || now,
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
