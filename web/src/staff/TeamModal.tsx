import { useEffect, useState, type FormEvent } from 'react';
import { Users } from 'lucide-react';
import type { StaffMember, StaffRole, Viewer } from '@shared/types';
import { api, errorMessage } from '../api';
import { Modal } from '../components/Modal';
import { FormError, SelectField, TextField } from '../ui/forms';
import { buttonClass } from '../ui/Button';

const ROLE_LABEL: Record<StaffRole, string> = { ops: 'Ops', inspector: 'Inspector', advocate: 'Advocate' };

interface TeamModalProps {
  viewer: Viewer;
  onClose: () => void;
  onChanged: () => void;
}

export function TeamModal({ viewer, onClose, onChanged }: TeamModalProps) {
  const [staff, setStaff] = useState<StaffMember[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState({ email: '', role: 'inspector' as StaffRole, displayName: '', staffCode: '' });

  const load = () =>
    api.staff
      .team()
      .then(setStaff)
      .catch((err) => setError(errorMessage(err)));

  useEffect(() => {
    void load();
  }, []);

  const add = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.staff.addStaff({ ...draft, email: draft.email.trim(), displayName: draft.displayName.trim(), staffCode: draft.staffCode.trim() });
      setDraft({ email: '', role: 'inspector', displayName: '', staffCode: '' });
      await load();
      onChanged();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (member: StaffMember) => {
    if (!window.confirm(`Remove ${member.displayName}'s staff access? Their plot assignments will be cleared.`)) return;
    setError(null);
    try {
      await api.staff.removeStaff(member.userId);
      await load();
      onChanged();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <Modal open onClose={onClose} size="lg" icon={<Users className="w-4 h-4 text-ink-soft shrink-0" />} title="Team">
      <div className="p-5 space-y-5 text-sm">
        {!staff ? (
          <p className="text-muted">Loading…</p>
        ) : (
          <table className="w-full text-left">
            <thead className="text-xs uppercase text-faint">
              <tr>
                <th className="py-1.5 font-semibold">Name</th>
                <th className="py-1.5 font-semibold">Role</th>
                <th className="py-1.5 font-semibold">ID / enrolment</th>
                <th className="py-1.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {staff.map((member) => (
                <tr key={member.userId}>
                  <td className="py-2">
                    <div className="font-medium text-ink">{member.displayName}</div>
                    <div className="text-small text-muted">{member.email}</div>
                  </td>
                  <td className="py-2">{ROLE_LABEL[member.role]}</td>
                  <td className="py-2 font-mono text-small">{member.staffCode || '–'}</td>
                  <td className="py-2 text-right">
                    {member.userId !== viewer.userId && (
                      <button type="button" onClick={() => void remove(member)} className="text-bad hover:underline cursor-pointer">
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

          <form onSubmit={add} className="space-y-3 border-t border-line pt-4">
            <div className="text-small font-bold uppercase tracking-wider text-ink">Give someone staff access</div>
            <p className="text-small text-muted">
              They need an account first (Supabase Authentication, Users). Adding an existing staff member again updates
              their role.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <TextField label="Account email" type="email" required value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
              <SelectField label="Role" value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value as StaffRole })}>
                <option value="inspector">Inspector</option>
                <option value="advocate">Advocate</option>
                <option value="ops">Ops</option>
              </SelectField>
              <TextField label="Name shown to owners" required value={draft.displayName} onChange={(e) => setDraft({ ...draft, displayName: e.target.value })} maxLength={120} />
              <TextField label="ID / enrolment no." value={draft.staffCode} onChange={(e) => setDraft({ ...draft, staffCode: e.target.value })} maxLength={40} />
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={busy} className={buttonClass('primary')}>
                {busy ? 'Saving…' : 'Add to team'}
              </button>
            </div>
          </form>

        <FormError message={error} />
      </div>
    </Modal>
  );
}
