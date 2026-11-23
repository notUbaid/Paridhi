import { Briefcase, ChevronDown, HelpCircle, LogOut } from 'lucide-react';
import { getPropertyAlerts, getPropertyStatus } from '@shared/domain';
import type { PropertyRecord } from '@shared/types';
import { formatCrore } from '../format';
import type { Account } from '../session';
import { Dot, StatusBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Menu, MenuItem } from '../ui/Menu';
import { STATUS_TONE } from '../ui/tone';
import { Wordmark } from '../ui/Wordmark';

interface TopBarProps {
  properties: PropertyRecord[];
  selected: PropertyRecord;
  now: Date;
  account: Account | null;
  onSelect: (id: string) => void;
  onOpenHowItWorks: () => void;
  onOpenStaffConsole?: () => void;
}

export function TopBar({ properties, selected, now, account, onSelect, onOpenHowItWorks, onOpenStaffConsole }: TopBarProps) {
  const statusOf = (p: PropertyRecord) => getPropertyStatus(getPropertyAlerts(p, now));

  return (
    <header className="bg-surface/95 backdrop-blur-sm border-b border-line sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-2 sm:gap-6">
        <Wordmark />

        <div className="h-6 w-px bg-line hidden sm:block" aria-hidden />

        {properties.length > 1 ? (
          <Menu
            triggerLabel="Choose a plot"
            triggerClassName="flex items-center gap-2 rounded-lg px-2 sm:px-2.5 py-1.5 hover:bg-sunken min-w-0 max-w-[48vw] sm:max-w-xs"
            trigger={
              <>
                <Dot tone={STATUS_TONE[statusOf(selected)]} />
                <span className="text-sm font-medium text-ink truncate">{selected.name}</span>
                <ChevronDown className="w-4 h-4 text-muted shrink-0" />
              </>
            }
            width="w-80"
          >
            {(close) => (
              <>
                <div className="eyebrow px-3 pt-2 pb-1.5">Your plots</div>
                {properties.map((property) => (
                  <MenuItem
                    key={property.id}
                    active={property.id === selected.id}
                    onSelect={() => {
                      onSelect(property.id);
                      close();
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-ink truncate">{property.name}</span>
                      <StatusBadge status={statusOf(property)} />
                    </div>
                    <div className="text-xs text-muted mt-0.5 truncate">
                      {property.location.village}, {property.location.state} · {formatCrore(property.marketValuationINR)}
                    </div>
                  </MenuItem>
                ))}
              </>
            )}
          </Menu>
        ) : (
          <span className="text-sm font-medium text-ink truncate">{selected.name}</span>
        )}

        <div className="ml-auto flex items-center gap-0.5 sm:gap-2 shrink-0">
          {onOpenStaffConsole && (
            <Button variant="ghost" size="sm" onClick={onOpenStaffConsole} icon={<Briefcase className="w-4 h-4" />} aria-label="Staff console" className="px-2 sm:px-3">
              <span className="hidden md:inline">Staff console</span>
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onOpenHowItWorks} icon={<HelpCircle className="w-4 h-4" />} aria-label="How it works" className="px-2 sm:px-3">
            <span className="hidden md:inline">How it works</span>
          </Button>
          {account && (
            <Menu
              triggerLabel="Account"
              align="right"
              width="w-64"
              triggerClassName="w-8 h-8 rounded-full bg-ink text-surface text-sm font-medium flex items-center justify-center"
              trigger={account.email.slice(0, 1).toUpperCase()}
            >
              {() => (
                <>
                  <div className="px-3 py-2">
                    <div className="eyebrow">Signed in as</div>
                    <div className="text-sm text-ink truncate">{account.email}</div>
                  </div>
                  <MenuItem onSelect={account.signOut}>
                    <span className="flex items-center gap-2 text-sm text-ink">
                      <LogOut className="w-4 h-4 text-muted" />
                      Sign out
                    </span>
                  </MenuItem>
                </>
              )}
            </Menu>
          )}
        </div>
      </div>
    </header>
  );
}
