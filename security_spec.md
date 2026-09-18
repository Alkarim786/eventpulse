# Security Specification: Institutional EventPulse Firestore Access Controls

## 1. Data Invariants
1. **Public Readability of Approved Events & Speakers**: Campus events, public circulars, and approved speaker profiles must be publicly readable by authenticated or guest readers.
2. **Student Feedback Verification**:
   - Feedback submission requires a valid numeric/alphanumeric registration number (`register_no`).
   - Feedback metrics (scores 1-5) must be bounded integers.
   - Once submitted, feedback entries are immutable to prevent tampering with institutional NIRF/NAAC ratings.
3. **Staff Event Coordination & Sign-off**:
   - Events and speakers can only be created or modified with valid schema fields and bounded string lengths.
   - Digital signatures cannot exceed 64KB and require an authorized timestamp.
4. **Metrics Integrity**:
   - Metrics scores must be bounded between 0 and 100 with valid letter grades.
5. **No Orphaned Records**:
   - Submissions reference valid institutional event IDs.

---

## 2. The "Dirty Dozen" Payloads (Adversarial Test Suite)
1. **Payload 1 (Ghost Field Injection)**: Attempting to insert an unauthorized `isAdmin: true` or `bypassed: true` into an event document.
2. **Payload 2 (Denial of Wallet String Bomb)**: Inserting a 5MB payload into `event.description` or `event.name`.
3. **Payload 3 (ID Path Poisoning)**: Creating an event with ID containing path traversal characters `../../system/config`.
4. **Payload 4 (Rating Inflation Attack)**: Submitting feedback with `satisfaction_score: 99` (violating 1-5 boundary).
5. **Payload 5 (Negative Score Sabotage)**: Submitting feedback with `content_quality_score: -10`.
6. **Payload 6 (Terminal Audit Tampering)**: Modifying `audit_completed` or wiping an existing `digital_signature` after audit sign-off.
7. **Payload 7 (Orphan Feedback)**: Submitting feedback with invalid or blank `event_id: 0`.
8. **Payload 8 (Blank Student Registration)**: Submitting feedback with an empty `register_no: ""`.
9. **Payload 9 (System Metric Hijack)**: Setting `final_kpi_score: 9999` to illegitimately promote department standing.
10. **Payload 10 (Type Poisoning)**: Submitting `objective_clarity_met: "yes"` as a string instead of boolean.
11. **Payload 11 (Malicious File Path)**: Uploading media with storage path attempting directory escape.
12. **Payload 12 (Notification Spam)**: Injecting system-level notification without proper category type.

---

## 3. Test Verification
All Dirty Dozen payloads must be evaluated against Firestore Security Rules and rejected with `PERMISSION_DENIED` or schema violation errors.
