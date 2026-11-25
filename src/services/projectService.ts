import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../firebase';
import {
  BrandStudioResult,
  BusinessType,
  ProjectFormSnapshot,
  ProjectStatus,
  PromoImageRefMetadata,
  SavedBrandProject,
  StudioMode,
} from '../types';

export interface SaveProjectInput {
  studioMode: StudioMode;
  businessType: BusinessType;
  businessName: string;
  businessCategory: string;
  selectedRegions: string[];
  targetLocation?: string;
  brandTone?: string;
  priceRange?: string;
  productDescription?: string;
  serviceDescription?: string;
  formSnapshot?: ProjectFormSnapshot;
  brandResult: BrandStudioResult;
  promoImageRefs?: PromoImageRefMetadata[];
}

export interface UpdateProjectInput {
  studioMode?: StudioMode;
  businessType?: BusinessType;
  businessName?: string;
  businessCategory?: string;
  selectedRegions?: string[];
  targetLocation?: string;
  brandTone?: string;
  priceRange?: string;
  productDescription?: string;
  serviceDescription?: string;
  formSnapshot?: ProjectFormSnapshot;
  brandResult?: BrandStudioResult;
  promoImageRefs?: PromoImageRefMetadata[];
  status?: Exclude<ProjectStatus, 'archived'>;
}

/**
 * Recursively strips `undefined` fields and removes any accidental base64 image data URIs
 * so only lightweight text/JSON structures are persisted to Cloud Firestore.
 */
function sanitizeFirestoreValue(value: unknown, depth = 0): unknown {
  if (depth > 14) return null;
  if (value === undefined || value === null) return null;

  if (typeof value === 'string') {
    if (value.startsWith('data:image/')) {
      return '[session-image-excluded]';
    }
    // Cap any unusually long text string safely below Firestore limits
    return value.length > 24000 ? value.slice(0, 24000) : value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== undefined)
      .map((item) => sanitizeFirestoreValue(item, depth + 1));
  }

  if (typeof value === 'object') {
    const cleanObj: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (val === undefined) continue;
      // Exclude known raw image base64 / data-url fields if present
      if (
        key === 'imageBase64' ||
        key === 'productImageBase64' ||
        key === 'logoUrl' ||
        key === 'logoOrAssetUrl' ||
        key === 'dataUrl'
      ) {
        continue;
      }
      cleanObj[key] = sanitizeFirestoreValue(val, depth + 1);
    }
    return cleanObj;
  }

  return null;
}

function clampString(val: string | undefined, maxLen: number, fallback = ''): string {
  const cleaned = (val || '').trim() || fallback;
  return cleaned.length > maxLen ? cleaned.slice(0, maxLen) : cleaned;
}

function sanitizeRegions(regions: string[] | undefined): string[] {
  if (!Array.isArray(regions)) return [];
  const cleaned = regions
    .filter((r): r is string => typeof r === 'string' && r.trim().length > 0)
    .map((r) => r.trim().slice(0, 80));
  return Array.from(new Set(cleaned)).slice(0, 38);
}

function sanitizePromoRefs(refs: PromoImageRefMetadata[] | undefined): PromoImageRefMetadata[] {
  if (!Array.isArray(refs)) return [];
  return refs.slice(0, 20).map((item) => ({
    fileName: clampString(item?.fileName, 140, 'promo-flyer.png'),
    label: clampString(item?.label, 140, 'Promotional Flyer'),
    createdAtIso: clampString(item?.createdAtIso, 40, new Date().toISOString()),
  }));
}

export function timestampToMs(ts: unknown): number {
  if (!ts) return 0;
  if (typeof ts === 'number') return ts;
  if (typeof ts === 'string') {
    const parsed = Date.parse(ts);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  if (typeof ts === 'object') {
    const maybe = ts as { toMillis?: () => number; seconds?: number };
    if (typeof maybe.toMillis === 'function') {
      return maybe.toMillis();
    }
    if (typeof maybe.seconds === 'number') {
      return maybe.seconds * 1000;
    }
  }
  return 0;
}

/**
 * Parses thrown Firestore error payloads (from handleFirestoreError) into clear user messages.
 */
export function parseFriendlyFirestoreError(err: unknown, fallback = 'Cloud operation failed.'): string {
  const rawMessage = err instanceof Error ? err.message : String(err);
  let detail = rawMessage;

  try {
    const parsed = JSON.parse(rawMessage);
    if (parsed && typeof parsed.error === 'string') {
      detail = parsed.error;
    }
  } catch {
    // raw message is not JSON
  }

  const lower = detail.toLowerCase();
  if (lower.includes('quota exceeded')) {
    return 'Daily Firestore free-tier quota has been reached for today. Please retry tomorrow or review your Firebase Spark plan limits.';
  }
  if (lower.includes('missing or insufficient permissions') || lower.includes('permission-denied')) {
    return 'Permission denied by Firestore security rules. Ensure your email address is verified and you are signed into the owning account.';
  }
  if (lower.includes('the client is offline') || lower.includes('network')) {
    return 'Unable to reach Cloud Firestore. Check your internet connection and retry.';
  }
  if (lower.includes('requires an index')) {
    return 'Firestore index error encountered. Please contact support or retry.';
  }

  return detail || fallback;
}

/**
 * Fetches all saved brand projects owned by the verified user (sorted newest-updated first client-side).
 */
export async function listUserProjects(uid: string): Promise<SavedBrandProject[]> {
  const collectionPath = 'projects';
  try {
    const q = query(
      collection(db, collectionPath),
      where('ownerId', '==', uid),
      limit(50)
    );
    const snap = await getDocs(q);
    const items: SavedBrandProject[] = snap.docs.map((docSnap) => {
      const data = docSnap.data() as Omit<SavedBrandProject, 'id'>;
      return {
        ...data,
        id: docSnap.id,
        createdAtMs: timestampToMs(data.createdAt),
        updatedAtMs: timestampToMs(data.updatedAt) || timestampToMs(data.createdAt),
      };
    });

    items.sort((a, b) => (b.updatedAtMs || 0) - (a.updatedAtMs || 0));
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
  }
}

/**
 * Saves a newly created project document to Cloud Firestore strictly adhering to firestore.rules.
 */
export async function createSavedProject(
  uid: string,
  email: string,
  input: SaveProjectInput
): Promise<SavedBrandProject> {
  const projectRef = doc(collection(db, 'projects'));
  const docPath = `projects/${projectRef.id}`;

  const cleanBusinessName = clampString(input.businessName, 160, 'Untitled SME Brand');
  const cleanCategory = clampString(input.businessCategory, 120, 'General SME');
  const cleanRegions = sanitizeRegions(input.selectedRegions);
  const cleanBrandResult = sanitizeFirestoreValue(input.brandResult) as BrandStudioResult;
  const cleanSnapshot = input.formSnapshot
    ? (sanitizeFirestoreValue(input.formSnapshot) as ProjectFormSnapshot)
    : {};
  const cleanPromoRefs = sanitizePromoRefs(input.promoImageRefs);

  const payload = {
    ownerId: clampString(uid, 128),
    ownerEmail: clampString(email, 254, 'user@example.com'),
    studioMode: input.studioMode === 'improve' ? ('improve' as const) : ('create' as const),
    businessType:
      input.businessType === 'service' || input.businessType === 'hybrid'
        ? input.businessType
        : ('product' as const),
    businessName: cleanBusinessName,
    businessCategory: cleanCategory,
    selectedRegions: cleanRegions,
    targetLocation: clampString(input.targetLocation, 300),
    brandTone: clampString(input.brandTone, 120),
    priceRange: clampString(input.priceRange, 120),
    productDescription: clampString(input.productDescription, 4000),
    serviceDescription: clampString(input.serviceDescription, 4000),
    formSnapshot: cleanSnapshot,
    brandResult: cleanBrandResult,
    promoImageRefs: cleanPromoRefs,
    isDoneForYou: false,
    status: 'active' as const,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(projectRef, payload);
    const nowMs = Date.now();
    return {
      ...payload,
      id: projectRef.id,
      createdAtMs: nowMs,
      updatedAtMs: nowMs,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

/**
 * Updates an existing saved project with strictly allowed customer fields only.
 */
export async function updateSavedProject(
  projectId: string,
  updates: UpdateProjectInput
): Promise<void> {
  const docPath = `projects/${projectId}`;
  const projectRef = doc(db, 'projects', projectId);

  // Build strict update map matching incoming().diff(existing()).affectedKeys().hasOnly([...])
  const updatePayload: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (updates.studioMode !== undefined) {
    updatePayload.studioMode = updates.studioMode === 'improve' ? 'improve' : 'create';
  }
  if (updates.businessType !== undefined) {
    updatePayload.businessType =
      updates.businessType === 'service' || updates.businessType === 'hybrid'
        ? updates.businessType
        : 'product';
  }
  if (updates.businessName !== undefined) {
    updatePayload.businessName = clampString(updates.businessName, 160, 'Untitled SME Brand');
  }
  if (updates.businessCategory !== undefined) {
    updatePayload.businessCategory = clampString(updates.businessCategory, 120, 'General SME');
  }
  if (updates.selectedRegions !== undefined) {
    updatePayload.selectedRegions = sanitizeRegions(updates.selectedRegions);
  }
  if (updates.targetLocation !== undefined) {
    updatePayload.targetLocation = clampString(updates.targetLocation, 300);
  }
  if (updates.brandTone !== undefined) {
    updatePayload.brandTone = clampString(updates.brandTone, 120);
  }
  if (updates.priceRange !== undefined) {
    updatePayload.priceRange = clampString(updates.priceRange, 120);
  }
  if (updates.productDescription !== undefined) {
    updatePayload.productDescription = clampString(updates.productDescription, 4000);
  }
  if (updates.serviceDescription !== undefined) {
    updatePayload.serviceDescription = clampString(updates.serviceDescription, 4000);
  }
  if (updates.formSnapshot !== undefined) {
    updatePayload.formSnapshot = sanitizeFirestoreValue(updates.formSnapshot);
  }
  if (updates.brandResult !== undefined) {
    updatePayload.brandResult = sanitizeFirestoreValue(updates.brandResult);
  }
  if (updates.promoImageRefs !== undefined) {
    updatePayload.promoImageRefs = sanitizePromoRefs(updates.promoImageRefs);
  }
  if (updates.status !== undefined) {
    updatePayload.status = updates.status;
  }

  try {
    await updateDoc(projectRef, updatePayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

/**
 * Deletes a saved project owned by the customer.
 */
export async function deleteSavedProject(projectId: string): Promise<void> {
  const docPath = `projects/${projectId}`;
  try {
    await deleteDoc(doc(db, 'projects', projectId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}
