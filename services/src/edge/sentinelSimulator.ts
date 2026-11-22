import { EvidenceVault } from '../crypto/evidenceVault.js';
import {
  IncidentDetection,
  PropertyRecord,
  SentinelTelemetry,
  SeverityLevel
} from '../types.js';

export class SentinelSimulator {
  /**
   * Generates periodic realistic physical telemetry for a Sentinel Node
   */
  public static updateTelemetry(node: SentinelTelemetry): SentinelTelemetry {
    // Simulate diurnal solar curve
    const currentHour = new Date().getHours();
    const isDaylight = currentHour >= 6 && currentHour <= 18;
    const peakFactor = isDaylight ? Math.sin(((currentHour - 6) / 12) * Math.PI) : 0;
    const solarWatts = Number((peakFactor * 24.5 + Math.random() * 0.8).toFixed(1));

    // Battery fluctuates slightly based on solar input
    const deltaBattery = solarWatts > 6 ? 0.05 : -0.02;
    const newBattery = Math.min(100, Math.max(82, Number((node.batteryPercentage + deltaBattery).toFixed(2))));
    const newVoltage = Number((12.6 + (newBattery / 100) * 0.7).toFixed(2));

    // Slight LTE signal jitter
    const lteSignal = Math.min(-68, Math.max(-95, node.lteSignalDbm + Math.floor(Math.random() * 5 - 2)));

    node.timestamp = new Date().toISOString();
    node.solarWatts = solarWatts;
    node.batteryPercentage = newBattery;
    node.batteryVoltage = newVoltage;
    node.lteSignalDbm = lteSignal;
    node.opticalTamperScore = Math.max(0.01, Number((0.02 + Math.random() * 0.02).toFixed(3)));

    if (node.systemStatus !== 'DETERRENCE_ACTIVE') {
      node.systemStatus = 'ONLINE_ACTIVE';
    }

    return node;
  }

  /**
   * Triggers an encroachment or perimeter breach incident, computing cryptographic proofs
   */
  public static triggerIncident(
    property: PropertyRecord,
    threatType:
      | 'TRIPWIRE_BREACH'
      | 'MATERIAL_DUMPING'
      | 'EARTHMOVER_ACTIVITY'
      | 'SQUATTER_STRUCTURE'
      | 'BOUNDARY_TAMPER'
      | 'RF_JAMMING_ATTEMPT',
    customDescription?: string
  ): IncidentDetection {
    const timestamp = new Date().toISOString();
    const incidentId = `INC-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;

    const descriptions: Record<string, { desc: string; severity: SeverityLevel; confidence: number }> = {
      TRIPWIRE_BREACH: {
        desc: 'Unidentified individual crossed calibrated Cadastral Boundary Line #2 (North-East perimeter)',
        severity: 'HIGH',
        confidence: 0.94
      },
      MATERIAL_DUMPING: {
        desc: 'Commercial tipper truck dumped approx 400 red clay bricks and sand pile at boundary corner',
        severity: 'CRITICAL',
        confidence: 0.98
      },
      EARTHMOVER_ACTIVITY: {
        desc: 'JCB 3DX Excavator detected leveling land within 4.2 meters of surveyed legal boundary peg',
        severity: 'CRITICAL',
        confidence: 0.96
      },
      SQUATTER_STRUCTURE: {
        desc: 'Makeshift corrugated tin roof frame and bamboo poles erected on western border',
        severity: 'CRITICAL',
        confidence: 0.97
      },
      BOUNDARY_TAMPER: {
        desc: 'Sentinel pole physical vibration shock detected (IMU 14.8g) and optical flow shift',
        severity: 'HIGH',
        confidence: 0.92
      },
      RF_JAMMING_ATTEMPT: {
        desc: 'Cellular LTE carrier noise floor spike detected with abrupt RSSI attenuation (-112 dBm)',
        severity: 'HIGH',
        confidence: 0.89
      }
    };

    const details = descriptions[threatType];
    const propertyCoord = property.cadastre.coordinates[0];

    // Jitter coordinates slightly inside perimeter
    const incidentCoord = {
      latitude: propertyCoord.latitude + (Math.random() * 0.0004 - 0.0002),
      longitude: propertyCoord.longitude + (Math.random() * 0.0004 - 0.0002)
    };

    // Synthesize raw frame telemetry payload for cryptographic hashing
    const rawFramePayload = JSON.stringify({
      nodeId: property.sentinelNode.nodeId,
      surveyNumber: property.cadastre.surveyNumber,
      threatType,
      timestamp,
      geoFix: incidentCoord,
      sensorArray: {
        starvis4k: 'OPTICAL_STREAM_ACTIVE',
        radarDistanceMeters: 14.2,
        flirThermalSignatureDegC: 36.8
      }
    });

    const sha256Hash = EvidenceVault.computeSha256(rawFramePayload);
    const hardwareSignature = EvidenceVault.signWithHsmKey(sha256Hash);

    const incident: IncidentDetection = {
      id: incidentId,
      propertyId: property.id,
      nodeId: property.sentinelNode.nodeId,
      timestamp,
      severity: details.severity,
      threatType,
      confidenceScore: details.confidence,
      description: customDescription || details.desc,
      coordinates: incidentCoord,
      evacuationWarningDispatched: true,
      sirenTriggered: details.severity === 'CRITICAL',
      videoClipUrl: `/api/evidence/${incidentId}/stream.mp4`,
      thermalSnapshotUrl: `/api/evidence/${incidentId}/thermal.jpg`,
      sha256Hash,
      hardwareSignature
    };

    // If critical, trigger deterrence state on node
    if (incident.sirenTriggered) {
      property.sentinelNode.systemStatus = 'DETERRENCE_ACTIVE';
    }

    property.activeIncidents.unshift(incident);
    return incident;
  }

  /**
   * Arms or disarms active acoustic deterrence & strobe
   */
  public static setDeterrence(
    property: PropertyRecord,
    active: boolean,
    vernacularLanguage: string = 'Telugu'
  ): { status: string; broadcastMessage: string } {
    if (active) {
      property.sentinelNode.systemStatus = 'DETERRENCE_ACTIVE';
      return {
        status: 'DETERRENCE_ACTIVE',
        broadcastMessage: `110dB Directional Acoustic Siren active. Broadcasting automated legal trespassing deterrence in ${vernacularLanguage}.`
      };
    } else {
      property.sentinelNode.systemStatus = 'ONLINE_ACTIVE';
      return {
        status: 'ONLINE_ACTIVE',
        broadcastMessage: 'Acoustic deterrence and strobes disarmed. Sentinel returned to optical surveillance mode.'
      };
    }
  }
}
