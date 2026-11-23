import { useMemo, useState, type FormEvent } from 'react';
import { MapPinned } from 'lucide-react';
import { distanceMeters, polygonAreaAcres } from '@shared/domain';
import type { BoundaryPeg, IndianState, PropertyRecord, StaffMember } from '@shared/types';
import { api, errorMessage, type NewPlotInput } from '../api';
import { Modal } from '../components/Modal';
import { formatMeters } from '../format';
import { FormActions, FormError, FormSection, SelectField, TextField, daysFromNowIso } from '../ui/forms';

const STATES: IndianState[] = ['Telangana', 'Karnataka', 'Punjab', 'Maharashtra', 'Tamil Nadu', 'Gujarat', 'Delhi-NCR'];

/** Suggested land records portal per state. Staff should confirm before saving. */
const PORTALS: Partial<Record<IndianState, { portalName: string; portalUrl: string; accountLabel: string }>> = {
  Telangana: { portalName: 'Bhu Bharati (Telangana land records)', portalUrl: 'https://bhubharati.telangana.gov.in', accountLabel: 'Khata' },
  Karnataka: { portalName: 'Bhoomi (Karnataka land records)', portalUrl: 'https://landrecords.karnataka.gov.in', accountLabel: 'Khata' },
  Punjab: { portalName: 'Punjab Jamabandi land records', portalUrl: 'https://jamabandi.punjab.gov.in', accountLabel: 'Khewat' },
  Maharashtra: { portalName: 'Mahabhumi (Maharashtra land records)', portalUrl: 'https://bhulekh.mahabhumi.gov.in', accountLabel: '7/12 extract' },
  Gujarat: { portalName: 'AnyRoR (Gujarat land records)', portalUrl: 'https://anyror.gujarat.gov.in', accountLabel: 'Khata' }
};

const TIME_ZONES = [
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'America/Toronto',
  'America/Vancouver',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Dubai',
  'Asia/Singapore',
  'Australia/Sydney',
  'Pacific/Auckland',
  'Asia/Kolkata'
];

const CORNERS = ['NE', 'SE', 'SW', 'NW'];

interface AddPlotModalProps {
  staff: StaffMember[];
  onClose: () => void;
  onSaved: (property: PropertyRecord) => void;
}

export function AddPlotModal({ staff, onClose, onSaved }: AddPlotModalProps) {
  const [form, setForm] = useState({
    ownerEmail: '',
    ownerName: '',
    overseasCity: '',
    overseasCountry: '',
    timeZone: 'America/Los_Angeles',
    phone: '',
    name: '',
    surveyNumber: '',
    plotSizeDisplay: '',
    valuationCrore: '',
    village: '',
    mandalTaluk: '',
    district: '',
    state: 'Telangana' as IndianState,
    cityNear: '',
    north: '',
    east: '',
    south: '',
    west: '',
    ...PORTALS.Telangana!,
    recordSurveyNumber: '',
    accountNumber: '',
    recordedOwner: '',
    recordStatus: '',
    propertyTaxStatus: '',
    encumbranceStatus: '',
    courts: '',
    inspectorUserId: '',
    advocateUserId: '',
    firstVisitDue: daysFromNowIso(7)
  });
  const [pegs, setPegs] = useState(CORNERS.map(() => ({ lat: '', lng: '' })));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof typeof form>(key: K) => (event: { target: { value: string } }) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const changeState = (state: IndianState) =>
    setForm((current) => ({ ...current, state, ...(PORTALS[state] ?? { portalName: '', portalUrl: '', accountLabel: '' }) }));

  const parsedPegs = useMemo<BoundaryPeg[] | null>(() => {
    const values = pegs.map((peg) => ({ lat: Number(peg.lat), lng: Number(peg.lng) }));
    if (pegs.some((peg) => peg.lat.trim() === '' || peg.lng.trim() === '') || values.some((v) => !Number.isFinite(v.lat) || !Number.isFinite(v.lng))) {
      return null;
    }
    return values.map((position, i) => ({ id: `P${i + 1}`, corner: CORNERS[i], position }));
  }, [pegs]);

  const inspectors = staff.filter((member) => member.role === 'inspector');
  const advocates = staff.filter((member) => member.role === 'advocate');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!parsedPegs) {
      setError('Enter latitude and longitude for all four corner pegs.');
      return;
    }
    const input: NewPlotInput = {
      ownerEmail: form.ownerEmail.trim(),
      owner: {
        name: form.ownerName.trim(),
        overseasCity: form.overseasCity.trim(),
        overseasCountry: form.overseasCountry.trim(),
        timeZone: form.timeZone,
        phone: form.phone.trim()
      },
      name: form.name.trim(),
      surveyNumber: form.surveyNumber.trim(),
      plotSizeDisplay: form.plotSizeDisplay.trim() || undefined,
      marketValuationINR: form.valuationCrore ? Math.round(Number(form.valuationCrore) * 10_000_000) : 0,
      location: {
        village: form.village.trim(),
        mandalTaluk: form.mandalTaluk.trim(),
        district: form.district.trim(),
        state: form.state,
        cityNear: form.cityNear.trim(),
        pegs: parsedPegs.map((peg) => peg.position),
        boundaries: { north: form.north.trim(), east: form.east.trim(), south: form.south.trim(), west: form.west.trim() }
      },
      revenue: {
        portalName: form.portalName.trim(),
        portalUrl: form.portalUrl.trim(),
        surveyNumber: (form.recordSurveyNumber || form.surveyNumber).trim(),
        accountLabel: form.accountLabel.trim(),
        accountNumber: form.accountNumber.trim(),
        recordedOwner: form.recordedOwner.trim(),
        recordStatus: form.recordStatus.trim(),
        propertyTaxStatus: form.propertyTaxStatus.trim(),
        encumbranceStatus: form.encumbranceStatus.trim()
      },
      legal: { courts: form.courts.trim() },
      inspectorUserId: form.inspectorUserId || null,
      advocateUserId: form.advocateUserId || null,
      firstVisitDue: form.firstVisitDue
    };
    setBusy(true);
    setError(null);
    try {
      onSaved(await api.staff.createPlot(input));
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open onClose={onClose} size="xl" icon={<MapPinned className="w-4 h-4 text-ink-soft shrink-0" />} title="Add a plot">
      <form onSubmit={submit} className="p-5 space-y-5 text-sm">
        <FormSection title="Owner">
          <p className="text-[13px] text-muted">
            The owner needs an account first (Supabase Authentication, Users). They will see this plot when they sign in.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <TextField label="Account email" type="email" required value={form.ownerEmail} onChange={set('ownerEmail')} />
            <TextField label="Name" required value={form.ownerName} onChange={set('ownerName')} maxLength={120} />
            <TextField label="Phone" value={form.phone} onChange={set('phone')} maxLength={40} />
            <TextField label="City abroad" required value={form.overseasCity} onChange={set('overseasCity')} maxLength={120} />
            <TextField label="Country" required value={form.overseasCountry} onChange={set('overseasCountry')} maxLength={120} />
            <SelectField label="Time zone" required value={form.timeZone} onChange={set('timeZone')}>
              {TIME_ZONES.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </SelectField>
          </div>
        </FormSection>

        <FormSection title="Plot">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <TextField label="Name" required value={form.name} onChange={set('name')} maxLength={120} className="sm:col-span-2" placeholder="e.g. Tellapur Plot" />
            <TextField label="Survey number" required value={form.surveyNumber} onChange={set('surveyNumber')} maxLength={60} />
            <TextField label="Estimated value (₹ crore)" type="number" min="0" step="0.01" value={form.valuationCrore} onChange={set('valuationCrore')} />
            <TextField label="Size as described" value={form.plotSizeDisplay} onChange={set('plotSizeDisplay')} maxLength={80} placeholder="e.g. 500 sq. yds" className="sm:col-span-2" />
          </div>
        </FormSection>

        <FormSection title="Location">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <TextField label="Village" required value={form.village} onChange={set('village')} maxLength={120} />
            <TextField label="Mandal / taluk" required value={form.mandalTaluk} onChange={set('mandalTaluk')} maxLength={120} />
            <TextField label="District" required value={form.district} onChange={set('district')} maxLength={120} />
            <SelectField label="State" required value={form.state} onChange={(e) => changeState(e.target.value as IndianState)}>
              {STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </SelectField>
            <TextField label="Near" value={form.cityNear} onChange={set('cityNear')} maxLength={120} placeholder="e.g. Hyderabad (18 km)" className="sm:col-span-4" />
          </div>
          <div className="space-y-1.5">
            <div className="text-[13px] font-medium text-ink-soft">Corner pegs (from the survey), clockwise from north-east</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CORNERS.map((corner, i) => (
                <div key={corner} className="flex items-end gap-2">
                  <span className="text-[13px] font-mono text-muted w-14 pb-2">
                    P{i + 1} {corner}
                  </span>
                  <TextField
                    label="Latitude"
                    inputMode="decimal"
                    required
                    value={pegs[i].lat}
                    onChange={(e) => setPegs((current) => current.map((peg, j) => (j === i ? { ...peg, lat: e.target.value } : peg)))}
                    className="flex-1"
                  />
                  <TextField
                    label="Longitude"
                    inputMode="decimal"
                    required
                    value={pegs[i].lng}
                    onChange={(e) => setPegs((current) => current.map((peg, j) => (j === i ? { ...peg, lng: e.target.value } : peg)))}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
            {parsedPegs && (
              <p className="text-[13px] text-muted font-mono">
                Area {polygonAreaAcres(parsedPegs).toFixed(3)} acres · sides{' '}
                {parsedPegs
                  .map((peg, i) => formatMeters(distanceMeters(peg.position, parsedPegs[(i + 1) % 4].position)))
                  .join(', ')}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <TextField label="North of the plot" value={form.north} onChange={set('north')} maxLength={120} />
            <TextField label="East" value={form.east} onChange={set('east')} maxLength={120} />
            <TextField label="South" value={form.south} onChange={set('south')} maxLength={120} />
            <TextField label="West" value={form.west} onChange={set('west')} maxLength={120} />
          </div>
        </FormSection>

        <FormSection title="Land record">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <TextField label="Portal" required value={form.portalName} onChange={set('portalName')} maxLength={120} />
            <TextField label="Portal address" required type="url" value={form.portalUrl} onChange={set('portalUrl')} hint="Check this is the official portal." />
            <TextField label="Survey number on the record" value={form.recordSurveyNumber} onChange={set('recordSurveyNumber')} placeholder={form.surveyNumber} maxLength={60} />
            <TextField label="Account type" required value={form.accountLabel} onChange={set('accountLabel')} maxLength={40} hint="Khata, Khewat, e-Khata…" />
            <TextField label="Account number" required value={form.accountNumber} onChange={set('accountNumber')} maxLength={60} />
            <TextField label="Recorded owner" required value={form.recordedOwner} onChange={set('recordedOwner')} maxLength={200} />
            <TextField label="Record status" value={form.recordStatus} onChange={set('recordStatus')} maxLength={200} />
            <TextField label="Property tax" value={form.propertyTaxStatus} onChange={set('propertyTaxStatus')} maxLength={200} />
            <TextField label="Encumbrance" value={form.encumbranceStatus} onChange={set('encumbranceStatus')} maxLength={200} />
          </div>
        </FormSection>

        <FormSection title="Team">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <SelectField label="Inspector" value={form.inspectorUserId} onChange={set('inspectorUserId')}>
              <option value="">Not assigned</option>
              {inspectors.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.displayName}
                </option>
              ))}
            </SelectField>
            <SelectField label="Advocate" value={form.advocateUserId} onChange={set('advocateUserId')}>
              <option value="">Not assigned</option>
              {advocates.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.displayName}
                </option>
              ))}
            </SelectField>
            <TextField label="Courts with jurisdiction" value={form.courts} onChange={set('courts')} maxLength={200} />
            <TextField label="First visit due" type="date" required value={form.firstVisitDue} onChange={set('firstVisitDue')} />
          </div>
        </FormSection>

        <FormError message={error} />
        <FormActions busy={busy} submitLabel="Add plot" onCancel={onClose} />
      </form>
    </Modal>
  );
}
