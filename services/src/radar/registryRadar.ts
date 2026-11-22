import { MutationAlert, PropertyRecord, SeverityLevel } from '../types.js';

export class RegistryRadarService {
  /**
   * Generates a formal statutory Caveat Petition under Section 148A CPC / State Revenue Code
   */
  public static generateCaveatPetition(
    property: PropertyRecord,
    mutationAlert: MutationAlert
  ): string {
    const today = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    return `
BEFORE THE HON'BLE COURT OF THE TAHSILDAR / EXECUTIVE MAGISTRATE
MANDAL / TALUK: ${property.cadastre.mandalTaluk.toUpperCase()}
DISTRICT: ${property.cadastre.district.toUpperCase()}, ${property.cadastre.state.toUpperCase()}

CAVEAT PETITION UNDER SECTION 148A OF THE CODE OF CIVIL PROCEDURE, 1908
READ WITH SECTION 5 OF THE STATE LAND RIGHTS AND PATTADAR PASSBOOK ACT

IN THE MATTER OF:
${property.ownerName.toUpperCase()}
S/o Late Sri Ramachandra
Presently residing at: ${property.ownerOverseasCity}
Represented by Paridhi Legal Cadastral Escrow Network
... CAVEATOR / TRUE RECORD TITLE OWNER

VERSUS

1. ${mutationAlert.applicantName.toUpperCase()}
   (Illegal Claimant / Applicant in Mutation Application #${mutationAlert.applicationId})
2. THE MANDAL REVENUE OFFICER / TAHSILDAR,
   ${property.cadastre.mandalTaluk}, ${property.cadastre.district}
... PROPOSED RESPONDENTS

PETITION FOR LODGING CAVEAT AGAINST FRAUDULENT TITLE MUTATION

The Caveator above-named respectfully submits as under:

1. The Caveator is the absolute lawful owner, lawful title holder, and in continuous physical possession of the agricultural/vacant land bearing Survey / Khasra No. ${property.cadastre.surveyNumber} (${property.cadastre.khasraKhata}), admeasuring ${property.cadastre.areaAcres} Acres, situated at Village ${property.cadastre.village}, Mandal ${property.cadastre.mandalTaluk}, District ${property.cadastre.district}, having acquired the same through Registered Sale Deed Doc No. 4128/2014 registered at Sub-Registrar Office.

2. The Caveator has reliably discovered through the Paridhi Automated Cadastral Radar monitoring the State Revenue Portal (${mutationAlert.portalSource}) that Respondent No. 1 has fraudulently submitted Mutation Application No. ${mutationAlert.applicationId} claiming false rights (${mutationAlert.claimedType}) over the Caveator's land.

3. The Caveator submits that Respondent No. 1 has no right, title, interest, or lawful possession whatsoever over the schedule property. The Caveator continuously secures the perimeter through the Paridhi Sentinel Node with contemporaneous cryptographic telemetry under Section 63 of Bharatiya Sakshya Adhiniyam, 2023.

4. PRAYER:
   It is therefore prayed that this Hon'ble Authority may be pleased:
   a) NOT to pass any ex-parte orders or sanction any mutation / passbook in Application No. ${mutationAlert.applicationId} without serving formal advance written notice of 14 days upon the Caveator;
   b) To reject the fraudulent mutation application with exemplary costs;
   c) In the interest of justice.

DATED: ${today}
PLACE: ${property.cadastre.district}

CAVEATOR:
(Signed on behalf of ${property.ownerName})
Paridhi Sovereign Legal Defense Network
Empanelled High Court Advocate
`;
  }

  /**
   * Simulates automated polling across state land portals
   */
  public static pollRevenuePortal(property: PropertyRecord): {
    portalChecked: string;
    surveyNumber: string;
    mutationDetected: boolean;
    alert?: MutationAlert;
  } {
    const portalMap: Record<string, string> = {
      Telangana: 'Dharani Portal (Telangana Land Administration)',
      Karnataka: 'Bhoomi RTC & Kaveri 2.0 (Karnataka Land Records)',
      Punjab: 'Jamabandi Portal (Punjab Land Records Society)',
      Maharashtra: 'Mahabhumi 7/12 & e-Ferfar (Maharashtra)',
      'Uttar Pradesh': 'Bhulekh UP (Revenue Board)',
      Gujarat: 'AnyRoR Gujarat (Urban & Rural Land Records)'
    };

    const portal = portalMap[property.cadastre.state] || 'National Land Records Modernization Program (NLRMP)';

    // If there is already an active pending mutation, return it
    if (property.registryRadar.pendingMutations.length > 0) {
      const active = property.registryRadar.pendingMutations[0];
      return {
        portalChecked: portal,
        surveyNumber: property.cadastre.surveyNumber,
        mutationDetected: true,
        alert: active
      };
    }

    return {
      portalChecked: portal,
      surveyNumber: property.cadastre.surveyNumber,
      mutationDetected: false
    };
  }

  /**
   * Simulates injecting a new unauthorized mutation attempt (for testing & verification)
   */
  public static simulateUnauthorizedMutation(
    property: PropertyRecord,
    applicantName: string,
    claimedType: string
  ): MutationAlert {
    const alertId = `MUT-${property.cadastre.state.substring(0, 2).toUpperCase()}-${Date.now().toString().slice(-6)}`;
    const newAlert: MutationAlert = {
      id: alertId,
      propertyId: property.id,
      surveyNumber: property.cadastre.surveyNumber,
      portalSource: `${property.cadastre.state} Revenue Registry`,
      applicationId: `APP-${Date.now().toString().slice(-7)}`,
      applicantName,
      claimedType,
      filingDate: new Date().toISOString().split('T')[0],
      objectionWindowDaysRemaining: 21,
      status: 'ACTIVE_NOTICE',
      threatLevel: 'CRITICAL',
      caveatDraftUrl: `/api/properties/${property.id}/caveat/${alertId}`
    };

    property.registryRadar.cleanTitle = false;
    property.registryRadar.pendingMutations.unshift(newAlert);
    return newAlert;
  }
}
