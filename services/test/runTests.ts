import assert from 'node:assert';
import { EvidenceVault } from '../src/crypto/evidenceVault.js';
import { mockProperties } from '../src/db.js';
import { SentinelSimulator } from '../src/edge/sentinelSimulator.js';
import { RegistryRadarService } from '../src/radar/registryRadar.js';
import { GroundMarshalService } from '../src/marshal/groundMarshal.js';

console.log('----------------------------------------------------');
console.log('PARIDHI SOVEREIGN ENGINE - AUTOMATED TEST SUITE');
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
  const payload = 'INCIDENT_TELEMETRY_SAMPLE_SURVEY_124_2A';
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
    EvidenceVault.computeSha256('FRAME_001'),
    EvidenceVault.computeSha256('FRAME_002'),
    EvidenceVault.computeSha256('FRAME_003'),
    EvidenceVault.computeSha256('FRAME_004')
  ];

  const { root } = EvidenceVault.buildMerkleTree(leaves);
  assert.strictEqual(root.length, 64);

  // Generate proof for FRAME_003
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

// 3. Statutory BSA 2023 §63 Certificate
runTest('EvidenceVault: Generates compliant BSA 2023 §63 Statutory Certificate', () => {
  const property = mockProperties[0];
  const incident = property.activeIncidents[0];
  const cert = EvidenceVault.generateBsa2023Certificate(incident, property, [incident.sha256Hash]);

  assert.ok(cert.certificateId.startsWith('BSA-63-'));
  assert.strictEqual(cert.statutoryAct, 'Bharatiya Sakshya Adhiniyam, 2023 - Section 63(4)');
  assert.strictEqual(cert.sha256PayloadHash, incident.sha256Hash);
  assert.ok(cert.courtFilingFormatMarkdown.includes('BHARATIYA SAKSHYA ADHINIYAM, 2023'));
  assert.ok(cert.courtFilingFormatMarkdown.includes(property.cadastre.surveyNumber));
  assert.strictEqual(EvidenceVault.verifyMerkleProof(cert.merkleProof), true);
});

// 4. Registry Radar & Caveat Petition
runTest('RegistryRadarService: Simulates mutation detection and generates Caveat Petition', () => {
  const property = JSON.parse(JSON.stringify(mockProperties[0]));
  const alert = RegistryRadarService.simulateUnauthorizedMutation(
    property,
    'S. K. Land Syndicate Pvt Ltd',
    'Unregistered Partition & Title Claim'
  );

  assert.strictEqual(property.registryRadar.cleanTitle, false);
  assert.strictEqual(property.registryRadar.pendingMutations.length, 1);
  assert.strictEqual(alert.applicantName, 'S. K. Land Syndicate Pvt Ltd');

  const caveat = RegistryRadarService.generateCaveatPetition(property, alert);
  assert.ok(caveat.includes('CAVEAT PETITION UNDER SECTION 148A'));
  assert.ok(caveat.includes(property.ownerName.toUpperCase()));
  assert.ok(caveat.includes(property.cadastre.surveyNumber));
});

// 5. Ground Marshal Service: Haversine & Dispatch
runTest('GroundMarshalService: Calculates distance and simulates dispatch movement', () => {
  const property = JSON.parse(JSON.stringify(mockProperties[0]));
  const unit = property.groundResponseTeam;

  const initialDistance = GroundMarshalService.calculateDistanceKm(
    unit.currentLocation,
    property.cadastre.coordinates[0]
  );
  assert.ok(initialDistance > 0);

  const dispatched = GroundMarshalService.dispatchMarshal(unit, property, 'INC-TEST-001');
  assert.strictEqual(dispatched.status, 'EN_ROUTE');
  assert.ok(dispatched.etaMinutes > 0);

  const initialEta = dispatched.etaMinutes;
  GroundMarshalService.simulateMarshalStep(dispatched, property.cadastre.coordinates[0]);
  assert.strictEqual(dispatched.etaMinutes, initialEta - 1);
});

// 6. Sentinel Simulator: Telemetry & Detection
runTest('SentinelSimulator: Updates physical telemetry and triggers edge detection', () => {
  const property = JSON.parse(JSON.stringify(mockProperties[0]));
  const originalWatts = property.sentinelNode.solarWatts;

  SentinelSimulator.updateTelemetry(property.sentinelNode);
  assert.ok(property.sentinelNode.batteryVoltage >= 12.0);
  assert.ok(property.sentinelNode.opticalTamperScore < 0.1);

  const incident = SentinelSimulator.triggerIncident(
    property,
    'EARTHMOVER_ACTIVITY',
    'Test earthmover leveled northern perimeter'
  );

  assert.strictEqual(incident.threatType, 'EARTHMOVER_ACTIVITY');
  assert.strictEqual(incident.severity, 'CRITICAL');
  assert.strictEqual(incident.sha256Hash.length, 64);
  assert.strictEqual(property.sentinelNode.systemStatus, 'DETERRENCE_ACTIVE');
  assert.strictEqual(property.activeIncidents[0].id, incident.id);
});

console.log('----------------------------------------------------');
console.log(`ALL ${testsPassed} TESTS PASSED SUCCESSFULLY!`);
console.log('----------------------------------------------------');
