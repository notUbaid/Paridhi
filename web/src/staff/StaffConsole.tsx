import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AlertTriangle, ArrowLeft, ClipboardCheck, Landmark, LogOut, Plus, RefreshCw, Scale, Search, UserCheck, Users } from 'lucide-react';
import {
  getCaveatStatus,
  getPropertyAlerts,
  getPropertyStatus,
  type PropertyStatus
} from '@shared/domain';
import type { HealthResponse, MutationEntry, PropertyRecord, StaffMember, StaffProperty, StaffRole, Viewer } from '@shared/types';
import { api, errorMessage } from '../api';
import { StatusPill } from '../components/StatusPill';
import { StatusScreen } from '../components/StatusScreen';
import { Toast, type ToastNotification } from '../components/Toast';
import type { Account } from '../Dashboard';
import { formatDate, formatDateTime, formatRelative } from '../format';
import { ConfirmCaveatModal, FlagMutationModal, RecordCheckModal, ResolveFlagModal } from './ActionModals';
import { AddPlotModal } from './AddPlotModal';
import { RecordVisitModal } from './RecordVisitModal';
import { TeamModal } from './TeamModal';

const ROLE_LABEL: Record<StaffRole, string> = { ops: 'Ops', inspector: 'Inspector', advocate: 'Advocate' };
const STATUS_ORDER: Record<PropertyStatus, number> = { ACTION_REQUIRED: 0, ATTENTION_NEEDED: 1, ALL_CLEAR: 2 };

type ModalState =
  | { kind: 'add' }
  | { kind: 'team' }
  | { kind: 'visit' }
  | { kind: 'check' }
  | { kind: 'flag' }
  | { kind: 'resolve'; mutation: MutationEntry }
  | { kind: 'caveat' }
  | null;

interface Permissions {
  addPlot: boolean;
  assign: boolean;
  visit: boolean;
  registry: boolean;
  resolve: boolean;
  caveat: boolean;
  team: boolean;
}

function permissionsFor(role: StaffRole): Permissions {
  return {
    addPlot: role === 'ops',
    assign: role === 'ops',
    visit: role === 'ops' || role === 'inspector',
    registry: role === 'ops',
    resolve: role === 'ops' || role === 'advocate',
    caveat: role === 'ops' || role === 'advocate',
    team: role === 'ops'
  };
}

interface StaffConsoleProps {
  health: HealthResponse;
  viewer: Viewer;
  account: Account | null;
  onOpenOwnerView: () => void;
}

export default function StaffConsole({ health, viewer, account, onOpenOwnerView }: StaffConsoleProps) {
  const role: StaffRole = viewer.demo ? 'ops' : viewer.staffRole!;
  const can = permissionsFor(role);
  const [data, setData] = useState<{ properties: StaffProperty[]; staff: StaffMember[] } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState<ModalState>(null);
  const [toast, setToast] = useState<ToastNotification | null>(null);
  const [now, setNow] = useState(() => new Date());

  const load = useCallback(async () => {
    try {
      setLoadError(null);
      setData(await api.staff.list());
      setNow(new Date());
    } catch (err) {
      setLoadError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, [load]);

  const notify = (type: ToastNotification['type'], title: string, message: string) =>
    setToast({ id: crypto.randomUUID(), type, title, message });
  const closeToast = useCallback(() => setToast(null), []);

  const replace = (updated: PropertyRecord) => {
    setData((current) =>
      current && {
        ...current,
        properties: current.properties.map((sp) => (sp.property.id === updated.id ? { ...sp, property: updated } : sp))
      }
    );
    setNow(new Date());
  };

  const rows = useMemo(() => {
    if (!data) return [];
    const needle = query.trim().toLowerCase();
    return data.properties
      .map((sp) => ({ sp, status: getPropertyStatus(getPropertyAlerts(sp.property, now)) }))
      .filter(({ sp }) =>
        !needle
          ? true
          : [sp.property.name, sp.property.surveyNumber, sp.property.location.village, sp.property.owner.name, sp.ownerEmail ?? '']
              .join(' ')
              .toLowerCase()
              .includes(needle)
      )
      .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.sp.property.name.localeCompare(b.sp.property.name));
  }, [data, query, now]);

  if (loadError && !data) {
    return (
      <StatusScreen
        title="Can't load the staff console"
        message={loadError}
        action={{ label: 'Try again', onClick: () => void load(), icon: <RefreshCw className="w-3.5 h-3.5" /> }}
      />
    );
  }
  if (!data) return <StatusScreen message="Loading plots…" />;

  const selected = data.properties.find((sp) => sp.property.id === selectedId) ?? rows[0]?.sp ?? null;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">
      <header className="border-b border-slate-200 bg-white px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center font-bold select-none">प</div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight">PARIDHI</span>
              <span className="text-slate-300 text-xs">/</span>
              <span className="text-xs text-slate-500 font-medium">Staff console</span>
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-700">
                {viewer.demo ? 'Ops (demo)' : ROLE_LABEL[role]}
              </span>
            </div>
          </div>
          <div className="flex items-center flex-wrap gap-2 text-[11px]">
            {can.team && (
              <HeaderButton onClick={() => setModal({ kind: 'team' })} icon={<Users className="w-3.5 h-3.5 text-slate-500" />}>
                Team
              </HeaderButton>
            )}
            <HeaderButton onClick={onOpenOwnerView} icon={<ArrowLeft className="w-3.5 h-3.5 text-slate-500" />}>
              Owner view
            </HeaderButton>
            {account && (
              <div className="flex items-center gap-2 pl-2 ml-1 border-l border-slate-200">
                <span className="text-slate-500 max-w-40 truncate" title={account.email}>
                  {account.email}
                </span>
                <HeaderButton onClick={account.signOut} icon={<LogOut className="w-3.5 h-3.5 text-slate-400" />}>
                  Sign out
                </HeaderButton>
              </div>
            )}
          </div>
        </div>
      </header>

      {health.demoMode && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 sm:px-6 py-1.5 text-[11px] text-amber-900">
          <div className="max-w-7xl mx-auto">
            <strong className="font-semibold">Demo.</strong> You are acting as ops staff on sample plots. Changes are kept
            in memory and reset when the server restarts.
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
        <aside className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="p-3 border-b border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">
                Plots <span className="font-normal text-slate-400">({data.properties.length})</span>
              </h2>
              {can.addPlot && (
                <button
                  type="button"
                  onClick={() => setModal({ kind: 'add' })}
                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add plot
                </button>
              )}
            </div>
            <label className="flex items-center gap-2 rounded border border-slate-200 px-2 py-1.5">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search plot, survey no., owner"
                aria-label="Search plots"
                className="flex-1 text-xs outline-none"
              />
            </label>
          </div>
          {rows.length === 0 ? (
            <p className="p-4 text-xs text-slate-500">
              {data.properties.length === 0
                ? role === 'ops'
                  ? 'No plots yet. Add the first one.'
                  : 'No plots are assigned to you yet.'
                : 'No plots match your search.'}
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 max-h-[70vh] overflow-y-auto">
              {rows.map(({ sp, status }) => (
                <li key={sp.property.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(sp.property.id)}
                    aria-current={selected?.property.id === sp.property.id}
                    className={`w-full text-left p-3 space-y-1 cursor-pointer ${
                      selected?.property.id === sp.property.id ? 'bg-slate-50' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold truncate">{sp.property.name}</span>
                      <StatusPill status={status} compact />
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {sp.property.surveyNumber} · {sp.property.location.village}, {sp.property.location.state}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 truncate">
                      Visit due {formatDate(sp.property.inspection.nextVisitDue)} · {sp.property.inspection.inspectorName}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {selected ? (
          <PlotPanel
            key={selected.property.id}
            sp={selected}
            staff={data.staff}
            can={can}
            now={now}
            onOpen={setModal}
            onAssigned={async (inspectorUserId, advocateUserId) => {
              await api.staff.assign(selected.property.id, inspectorUserId, advocateUserId);
              await load();
              notify('SUCCESS', 'Team updated', `Assignments saved for ${selected.property.name}.`);
            }}
          />
        ) : (
          <div className="text-xs text-slate-500">Select a plot.</div>
        )}
      </main>

      {modal?.kind === 'add' && (
        <AddPlotModal
          staff={data.staff}
          onClose={() => setModal(null)}
          onSaved={(property) => {
            void load().then(() => setSelectedId(property.id));
            notify('SUCCESS', 'Plot added', `${property.name} is now visible to its owner.`);
          }}
        />
      )}
      {modal?.kind === 'team' && <TeamModal viewer={viewer} onClose={() => setModal(null)} onChanged={() => void load()} />}
      {selected && modal?.kind === 'visit' && (
        <RecordVisitModal
          property={selected.property}
          open
          demo={viewer.demo}
          onClose={() => setModal(null)}
          onSaved={(property) => {
            replace(property);
            notify('SUCCESS', 'Visit recorded', 'The owner can see the report and photos now.');
          }}
        />
      )}
      {selected && modal?.kind === 'check' && (
        <RecordCheckModal
          property={selected.property}
          onClose={() => setModal(null)}
          onSaved={(property) => {
            replace(property);
            notify('SUCCESS', 'Check recorded', `${property.revenue.portalName} check saved.`);
          }}
          save={(note) => api.staff.recordCheck(selected.property.id, note)}
        />
      )}
      {selected && modal?.kind === 'flag' && (
        <FlagMutationModal
          property={selected.property}
          onClose={() => setModal(null)}
          onSaved={(property) => {
            replace(property);
            notify('ALERT', 'Application flagged', 'The owner sees "Action required" until it is resolved.');
          }}
          save={(flag) => api.staff.flagMutation(selected.property.id, flag)}
        />
      )}
      {selected && modal?.kind === 'resolve' && (
        <ResolveFlagModal
          property={selected.property}
          mutation={modal.mutation}
          onClose={() => setModal(null)}
          onSaved={(property) => {
            replace(property);
            notify('SUCCESS', 'Flag resolved', `${modal.mutation.reference} is closed.`);
          }}
          save={(outcome) => api.staff.resolveMutation(selected.property.id, modal.mutation.id, outcome)}
        />
      )}
      {selected && modal?.kind === 'caveat' && (
        <ConfirmCaveatModal
          property={selected.property}
          onClose={() => setModal(null)}
          onSaved={(property) => {
            replace(property);
            notify('SUCCESS', 'Caveat recorded', 'The 90-day period now runs from the lodging date.');
          }}
          save={(court, lodgedOn) => api.staff.confirmCaveat(selected.property.id, court, lodgedOn)}
        />
      )}

      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}

function HeaderButton({ onClick, icon, children }: { onClick: () => void; icon: ReactNode; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded px-2.5 py-1 font-medium cursor-pointer"
    >
      {icon}
      {children}
    </button>
  );
}

function Card({ title, icon, action, children }: { title: string; icon: ReactNode; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50/60 flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          {icon}
          {title}
        </h3>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
      <div className="p-4 text-xs space-y-2.5">{children}</div>
    </section>
  );
}

function ActionButton({ onClick, children, primary = false }: { onClick: () => void; children: ReactNode; primary?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-[11px] font-medium px-2.5 py-1 rounded cursor-pointer ${
        primary ? 'bg-slate-900 hover:bg-slate-800 text-white' : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
      }`}
    >
      {children}
    </button>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span className="text-slate-900 text-right">{children}</span>
    </div>
  );
}

interface PlotPanelProps {
  sp: StaffProperty;
  staff: StaffMember[];
  can: Permissions;
  now: Date;
  onOpen: (modal: ModalState) => void;
  onAssigned: (inspectorUserId: string | null, advocateUserId: string | null) => Promise<void>;
}

function PlotPanel({ sp, staff, can, now, onOpen, onAssigned }: PlotPanelProps) {
  const { property } = sp;
  const alerts = getPropertyAlerts(property, now);
  const visit = property.inspection.latestVisit;
  const caveat = getCaveatStatus(property.legal, now);
  const pending = property.inspection.onDemandRequest;

  return (
    <div className="space-y-4 min-w-0">
      <section className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight">{property.name}</h2>
            <div className="text-xs text-slate-500">
              {property.surveyNumber} · {property.location.village}, {property.location.mandalTaluk}, {property.location.district},{' '}
              {property.location.state} · {property.areaAcres.toFixed(3)} acres
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Owner: <span className="text-slate-800 font-medium">{property.owner.name}</span>
              {sp.ownerEmail && <> · {sp.ownerEmail}</>} · {property.owner.overseasCity}
            </div>
          </div>
          <StatusPill status={getPropertyStatus(alerts)} />
        </div>
        {alerts.length > 0 && (
          <ul className="space-y-1">
            {alerts.map((alert) => (
              <li
                key={alert.message}
                className={`flex items-start gap-2 text-xs rounded px-2.5 py-1.5 border ${
                  alert.level === 'ACTION' ? 'bg-red-50 border-red-200 text-red-900' : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                {alert.message}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card
          title="Inspection"
          icon={<UserCheck className="w-4 h-4 text-slate-600" />}
          action={can.visit && <ActionButton primary onClick={() => onOpen({ kind: 'visit' })}>Record a visit</ActionButton>}
        >
          {pending && (
            <div className="rounded border border-amber-200 bg-amber-50 text-amber-900 p-2">
              Owner asked for an extra visit {formatRelative(pending.requestedAt, now)}, target by {formatDateTime(pending.targetVisitBy)}.
              {pending.notes && <> Note: “{pending.notes}”</>}
            </div>
          )}
          <Row label="Inspector">{property.inspection.inspectorName}</Row>
          <Row label="Next visit due">{formatDate(property.inspection.nextVisitDue)}</Row>
          <Row label="Last visit">
            {visit ? `${formatDateTime(visit.inspectedAt)} by ${visit.inspectorName}` : 'None yet'}
          </Row>
          {visit && (
            <Row label="Findings">
              {visit.boundaryPegsIntact ? 'Pegs in place' : 'Pegs disturbed'}, {visit.debrisFound ? 'debris found' : 'no debris'},{' '}
              {visit.photos.length} photo{visit.photos.length === 1 ? '' : 's'}
            </Row>
          )}
        </Card>

        <Card
          title="Land record"
          icon={<Landmark className="w-4 h-4 text-slate-600" />}
          action={
            can.registry && (
              <>
                <ActionButton onClick={() => onOpen({ kind: 'flag' })}>Flag application</ActionButton>
                <ActionButton primary onClick={() => onOpen({ kind: 'check' })}>Record check</ActionButton>
              </>
            )
          }
        >
          <Row label="Portal">
            <a href={property.revenue.portalUrl} target="_blank" rel="noopener noreferrer" className="underline">
              {property.revenue.portalName}
            </a>
          </Row>
          <Row label={property.revenue.accountLabel}>{property.revenue.accountNumber}</Row>
          <Row label="Recorded owner">{property.revenue.recordedOwner}</Row>
          <Row label="Last checked">
            {property.revenue.lastCheckedAt ? formatRelative(property.revenue.lastCheckedAt, now) : 'Not yet'}
          </Row>
          {property.revenue.flaggedMutations.map((mutation) => (
            <div key={mutation.id} className="rounded border border-red-200 bg-red-50 text-red-900 p-2 space-y-1">
              <div className="font-semibold">
                {mutation.reference} · filed {formatDate(mutation.filedOn)}
              </div>
              <div className="text-[11px]">{mutation.description}</div>
              {can.resolve && (
                <button
                  type="button"
                  onClick={() => onOpen({ kind: 'resolve', mutation })}
                  className="text-[11px] underline cursor-pointer"
                >
                  Record the outcome
                </button>
              )}
            </div>
          ))}
        </Card>

        <Card
          title="Caveat"
          icon={<Scale className="w-4 h-4 text-slate-600" />}
          action={can.caveat && <ActionButton primary onClick={() => onOpen({ kind: 'caveat' })}>Confirm lodging</ActionButton>}
        >
          {caveat.renewalRequested && (
            <div className="rounded border border-amber-200 bg-amber-50 text-amber-900 p-2">
              The owner asked for {property.legal.caveat ? 'a renewal' : 'a caveat'}. Confirm once it is lodged.
            </div>
          )}
          <Row label="Advocate">
            {property.legal.advocateName}
            {property.legal.enrolmentNumber && <span className="text-slate-400"> ({property.legal.enrolmentNumber})</span>}
          </Row>
          <Row label="Current caveat">
            {property.legal.caveat
              ? `${property.legal.caveat.court}, lodged ${formatDate(property.legal.caveat.lodgedOn)}`
              : 'None on file'}
          </Row>
          {caveat.expiresOn && (
            <Row label={caveat.state === 'EXPIRED' ? 'Lapsed' : 'Lapses'}>
              {formatDate(caveat.expiresOn)}
              {caveat.daysRemaining !== null && caveat.daysRemaining > 0 && ` (${caveat.daysRemaining} days)`}
            </Row>
          )}
        </Card>

        <AssignmentCard sp={sp} staff={staff} editable={can.assign} onSave={onAssigned} />
      </div>

      <Card title="Recent activity" icon={<ClipboardCheck className="w-4 h-4 text-slate-600" />}>
        {property.activity.length === 0 ? (
          <p className="text-slate-500">No activity yet.</p>
        ) : (
          <ol className="space-y-2">
            {property.activity.slice(0, 8).map((event) => (
              <li key={event.id} className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-slate-900">{event.title}</div>
                  <div className="text-[11px] text-slate-600">{event.description}</div>
                </div>
                <time dateTime={event.at} title={formatDateTime(event.at)} className="text-[10px] font-mono text-slate-400 shrink-0">
                  {formatRelative(event.at, now)}
                </time>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}

function AssignmentCard({
  sp,
  staff,
  editable,
  onSave
}: {
  sp: StaffProperty;
  staff: StaffMember[];
  editable: boolean;
  onSave: (inspectorUserId: string | null, advocateUserId: string | null) => Promise<void>;
}) {
  const [inspectorUserId, setInspectorUserId] = useState(sp.inspectorUserId ?? '');
  const [advocateUserId, setAdvocateUserId] = useState(sp.advocateUserId ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const changed = inspectorUserId !== (sp.inspectorUserId ?? '') || advocateUserId !== (sp.advocateUserId ?? '');

  const nameOf = (userId: string | null) => staff.find((member) => member.userId === userId)?.displayName ?? 'Not assigned';

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await onSave(inspectorUserId || null, advocateUserId || null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card title="Team for this plot" icon={<Users className="w-4 h-4 text-slate-600" />}>
      {editable ? (
        <div className="space-y-2.5">
          {(
            [
              ['Inspector', 'inspector', inspectorUserId, setInspectorUserId],
              ['Advocate', 'advocate', advocateUserId, setAdvocateUserId]
            ] as const
          ).map(([label, roleName, value, setter]) => (
            <label key={roleName} className="flex items-center justify-between gap-3">
              <span className="text-slate-500">{label}</span>
              <select
                value={value}
                onChange={(e) => setter(e.target.value)}
                className="rounded border border-slate-200 px-2 py-1 text-xs bg-white max-w-56"
              >
                <option value="">Not assigned</option>
                {staff
                  .filter((member) => member.role === roleName)
                  .map((member) => (
                    <option key={member.userId} value={member.userId}>
                      {member.displayName}
                    </option>
                  ))}
              </select>
            </label>
          ))}
          {error && <div className="text-red-700">{error}</div>}
          {changed && (
            <div className="flex justify-end">
              <ActionButton primary onClick={() => void save()}>
                {busy ? 'Saving…' : 'Save team'}
              </ActionButton>
            </div>
          )}
        </div>
      ) : (
        <>
          <Row label="Inspector">{nameOf(sp.inspectorUserId)}</Row>
          <Row label="Advocate">{nameOf(sp.advocateUserId)}</Row>
        </>
      )}
    </Card>
  );
}
