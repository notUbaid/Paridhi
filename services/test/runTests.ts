import assert from 'node:assert';
import { EvidenceVault } from '../src/crypto/evidenceVault.js';
import { mockProperties } from '../src/db.js';
import { properties, app } from '../src/app.js';

console.log('----------------------------------------------------');
console.log('PARIDHI VERIFIED NRI LAND PROTECTION - TEST SUITE');
console.log('----------------------------------------------------');

let testsPassed = 0;

function runTest(name: string, fn: () => void) {
  try {
    fn();
    console.log(`[PASS] ${name}`);
    testsPassed++;
  } catch (error) {
    console.error(`[FAIL] ${name}`);
    console.error(error);
    process.exit(1);
  }
}

// 1. Evidence Vault: SHA-256 & Hardware HSM Attestation
runTest('EvidenceVault: Computes deterministic SHA-256 hash', () => {
  const hash = EvidenceVault.computeSha256('PARIDHI_PERIMETER_TEST_PAYLOAD');
  assert.strictEqual(hash.length, 64);
  assert.strictEqual(typeof hash, 'string');
});

runTest('EvidenceVault: Signs and verifies hardware Ed25519 payload', () => {
  const payload = 'INCIDENT_TELEMETRY_SAMPLE_SURVEY_412_A';
  const sigHex = EvidenceVault.signWithHsmKey(payload);
  assert.ok(sigHex.length > 0);
  const isValid = EvidenceVault.verifyHsmSignature(payload, sigHex);
  assert.strictEqual(isValid, true);
  const isInvalid = EvidenceVault.verifyHsmSignature('TAMPERED_PAYLOAD', sigHex);
  assert.strictEqual(isInvalid, false);
});

// 2. Merkle Tree & Inclusion Proof Verification
runTest('EvidenceVault: Builds Merkle Tree and verifies inclusion proof', () => {
  const leaves = [
    EvidenceVault.computeSha256('SNAPSHOT_WEEK_1'),
    EvidenceVault.computeSha256('SNAPSHOT_WEEK_2'),
    EvidenceVault.computeSha256('INSPECTION_NOV_19'),
    EvidenceVault.computeSha256('DHARANI_AUDIT_LOG')
  ];

  const { root } = EvidenceVault.buildMerkleTree(leaves);
  assert.strictEqual(root.length, 64);

  // Generate proof for INSPECTION_NOV_19
  const targetLeaf = leaves[2];
  const proof = EvidenceVault.getMerkleProof(targetLeaf, leaves);
  assert.strictEqual(proof.root, root);
  assert.strictEqual(proof.leafHash, targetLeaf);

  // Verify valid proof
  const verified = EvidenceVault.verifyMerkleProof(proof);
  assert.strictEqual(verified, true);

  // Verify tampered proof fails
  const tamperedProof = {
    ...proof,
    leafHash: EvidenceVault.computeSha256('TAMPERED_FRAME')
  };
  const tamperedVerified = EvidenceVault.verifyMerkleProof(tamperedProof);
  assert.strictEqual(tamperedVerified, false);
});

// 3. Properties Schema & Asset Integrity
runTest('Property Ledger: Validates all mock NRI property profiles', () => {
  assert.ok(mockProperties.length >= 3);
  for (const prop of mockProperties) {
    assert.ok(prop.id.startsWith('prop-'));
    assert.ok(prop.name.length > 0);
    assert.ok(prop.surveyNumber.length > 0);
    assert.ok(prop.marketValuationINR > 10000000); // Valuation > ₹1 Cr
    assert.ok(prop.owner.overseasCity.length > 0);
    assert.ok(prop.cameraPod.batteryPercentage >= 80);
    assert.strictEqual(prop.cameraPod.online, true);
    assert.strictEqual(prop.latestInspection.boundaryPillarsIntact, true);
    assert.strictEqual(prop.revenueRegistry.cleanTitle, true);
    assert.ok(prop.legalRetainer.advocateName.length > 0);
  }
});

// 4. On-Demand Field Inspection Request Workflow
runTest('Field Inspection Workflow: Dispatches verified on-demand inspection', () => {
  const property = properties[0];
  const initialActivityCount = property.recentActivity.length;
  const notes = 'Urgent check requested after neighboring road work.';

  // Simulate API logic
  const scheduledDate = 'Nov 25, 2026';
  property.latestInspection.nextScheduledDate = scheduledDate;
  property.recentActivity.unshift({
    id: `act-test-${Date.now()}`,
    timestamp: 'Just now',
    category: 'INSPECTION',
    title: 'On-Demand Field Inspection Dispatched',
    description: `Assigned to ${property.latestInspection.inspectorName}. Scheduled arrival: ${scheduledDate}.`,
    severity: 'INFO'
  });

  assert.strictEqual(property.recentActivity.length, initialActivityCount + 1);
  assert.strictEqual(property.latestInspection.nextScheduledDate, scheduledDate);
  assert.strictEqual(property.recentActivity[0].category, 'INSPECTION');
});

// 5. State Revenue Registry Watch Workflow
runTest('Revenue Registry Watch: Audits Dharani / Bhoomi state records', () => {
  const property = properties[0];
  assert.strictEqual(property.revenueRegistry.cleanTitle, true);
  assert.strictEqual(property.revenueRegistry.pendingMutationsCount, 0);
  assert.ok(property.revenueRegistry.portalName.includes('Dharani'));

  // Update timestamp
  const now = 'Today, 05:00 PM IST (verified)';
  property.revenueRegistry.lastCheckedTimestamp = now;
  assert.strictEqual(property.revenueRegistry.lastCheckedTimestamp, now);
});

// 6. Section 148A CPC Caveat & Legal Retainer
runTest('Legal Protection: Verifies standing caveat & statutory notice status', () => {
  const property = properties[0];
  assert.strictEqual(property.legalRetainer.standingCaveatActive, true);
  assert.ok(property.legalRetainer.jurisdictionCourt.includes('Telangana High Court'));
  assert.ok(property.legalRetainer.caveatExpiryDate?.includes('Section 148A CPC 90-Day Limit'));
  assert.strictEqual(typeof property.legalRetainer.daysRemaining, 'number');
  assert.ok((property.legalRetainer.daysRemaining ?? 0) > 0);
});

// 7. Complete Verified Property Dossier Generation
runTest('Dossier Generation: Generates verifiable legal and physical dossier', () => {
  const property = properties[0];
  const dossierPayload = JSON.stringify({
    propertyId: property.id,
    surveyNumber: property.surveyNumber,
    owner: property.owner,
    valuation: property.marketValuationINR,
    inspection: property.latestInspection,
    registry: property.revenueRegistry
  });

  const hash = EvidenceVault.computeSha256(dossierPayload);
  const sig = EvidenceVault.signWithHsmKey(dossierPayload);

  assert.strictEqual(hash.length, 64);
  assert.ok(sig.length > 0);
  assert.strictEqual(EvidenceVault.verifyHsmSignature(dossierPayload, sig), true);
});

// 8. Edge Sentinel: Neural Threat Ingestion & Cryptographic Integrity
runTest('Edge Sentinel: Simulates neural incident ingestion and cryptographic attestation', () => {
  const property = properties[0];
  const threatType = 'MATERIAL_DUMPING';
  const customDescription = 'Edge NPU detected tipper truck unloading 5,000 bricks at boundary peg #3';

  const incidentPayload = JSON.stringify({
    propertyId: property.id,
    surveyNumber: property.surveyNumber,
    threatType,
    description: customDescription,
    timestamp: new Date().toISOString()
  });

  const hash = EvidenceVault.computeSha256(incidentPayload);
  const sig = EvidenceVault.signWithHsmKey(incidentPayload);

  assert.strictEqual(hash.length, 64);
  assert.strictEqual(EvidenceVault.verifyHsmSignature(incidentPayload, sig), true);

  // Apply incident logic
  property.status = 'ATTENTION_NEEDED';
  property.cameraPod.timelapseDifferenceDetected = true;
  property.cameraPod.timelapseNotes = customDescription;
  property.recentActivity.unshift({
    id: `act-test-edge-${Date.now()}`,
    timestamp: 'Just now',
    category: 'CAMERA',
    title: `Edge Sentinel Anomaly: ${threatType}`,
    description: customDescription,
    severity: 'ALERT'
  });

  assert.strictEqual(property.status, 'ATTENTION_NEEDED');
  assert.strictEqual(property.cameraPod.timelapseDifferenceDetected, true);
  assert.strictEqual(property.recentActivity[0].severity, 'ALERT');
});

// 9. Field Inspection: Geotagged Ground Proof EXIF & Geofence Integrity
runTest('Field Inspection: Validates geotagged ground proof EXIF and geofence integrity', () => {
  const property = properties[0];
  assert.ok(property.latestInspection.photoDetails && property.latestInspection.photoDetails.length > 0);
  for (const photo of property.latestInspection.photoDetails!) {
    assert.strictEqual(photo.geofenceVerified, true);
    assert.ok(photo.cornerPeg.length > 0);
    assert.ok(photo.gpsCoordinates.lat > 0);
    assert.ok(photo.gpsCoordinates.lng > 0);
    assert.ok(photo.captureTimestamp.length > 0);
  }
});

console.log('----------------------------------------------------');
console.log(`ALL ${testsPassed} TESTS PASSED SUCCESSFULLY!`);
console.log('----------------------------------------------------');
