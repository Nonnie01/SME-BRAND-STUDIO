# SME Brand Studio Security Specification

## 1. Data Invariants
1. **Default Deny**: All unspecified Firestore paths deny read and write access (`/{document=**}`).
2. **PII Isolation**: Customer email, display name, and default business contact details live at `/users/{userId}/private/profile`. In Phase 2, reads are restricted strictly to the verified owner (`request.auth.uid == userId`).
3. **Self-Service Project Ownership**: Every document in `/projects/{projectId}` has an immutable `ownerId` matching the creator's UID. Ordinary customers can list, get, update, and delete **only** their own projects (`resource.data.ownerId == request.auth.uid`). In Phase 2, admin overrides on self-service `/projects` are removed so customer projects remain private.
4. **Custom-Claim Admin Authorization**: Administrator access to `/orders/{orderId}` and `/doneForYouProjects/{projectId}` requires a Firebase Auth custom claim (`request.auth.token.admin == true`) paired with `request.auth.token.email_verified == true`. Email-based and client-side role checks are prohibited for permanent admin authorization (legacy fallback is kept strictly during Phase 1 verification and removed in Phase 2).
5. **No Binary Blobs in Firestore**: All string fields have strict `.size()` bounds; `promoImageRefs` stores metadata objects only (`size() <= 20`), never multi-megabyte data URIs.
6. **Temporal & Creator Integrity**: `createdAt` and owner/creator UIDs are immutable and must equal `request.time` / `request.auth.uid` on create; `updatedAt` must equal `request.time` on create and update.

## 2. Adversarial "Dirty Dozen" Payloads (Expected: PERMISSION_DENIED)
1. **Unauthenticated read/write**: `get /orders/ord_1` or `get /projects/proj_1` with `auth == null`.
2. **Unverified email write**: `create /orders/ord_1` with `admin: true` claim but `email_verified == false`.
3. **Non-admin reads Done-for-You orders**: `list /orders` signed in as verified regular customer without `admin: true` claim.
4. **Legacy email-only access to /orders**: `create /orders/ord_1` signed in with bootstrap email but WITHOUT `request.auth.token.admin == true` claim.
5. **Client self-promotion to Admin**: `create /admins/attacker_uid` or updating user profile with `admin: true`.
6. **Owner spoofing on customer project**: `create /projects/proj_1` with `ownerId: "victim_uid"` while signed in as `"attacker_uid"`.
7. **Shadow/ghost field injection**: `create /orders/ord_1` including extra field `gatewayVerified: true`.
8. **Cross-user project read**: `get /projects/victim_proj` signed in as `"attacker_uid"`.
9. **Blanket list scraping on projects**: `list /projects` without `where('ownerId', '==', auth.uid)`.
10. **Immutable field tampering**: `update /orders/ord_1` changing `createdAt` or `createdByAdminUid`, or client-forged `updatedAt != request.time`.
11. **Oversized Denial-of-Wallet payload**: `create /orders/ord_1` with 2MB `clientBrief` (`size() > 4000`).
12. **PII cross-user read**: `get /users/victim_uid/private/profile` signed in as `"attacker_uid"`.
