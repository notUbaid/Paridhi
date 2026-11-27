import { ChevronDown, Clock, HelpCircle, LogOut, Plus } from 'lucide-react';
import { getPropertyAlerts, getPropertyStatus } from '@shared/domain';
import type { PlotRequest, PropertyRecord } from '@shared/types';
import { formatCrore } from '../format';
import type { Account } from '../session';
import { Dot, StatusBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Menu, MenuItem } from '../ui/Menu';
import { STATUS_TONE } from '../ui/tone';
import { Wordmark } from '../ui/Wordmark';

interface TopBarProps {
  properties: PropertyRecord[];
  /** Plots the owner has asked us to set up, not monitored yet. */
  requests: PlotRequest[];
  selected: PropertyRecord;
  now: Date;
  account: Account | null;
  demo: boolean;
  onSelect: (id: string) => void;
  onOpenHowItWorks: () => void;
  onAddPlot?: () => void;
}

export function TopBar({ properties, requests, selected, now, account, demo, onSelect, onOpenHowItWorks, onAddPlot }: TopBarProps) {
  const statusOf = (p: PropertyRecord) => getPropertyStatus(getPropertyAlerts(p, now));
  const pending = requests.filter((r) => r.status !== 'closed');

  return (
    <header className="bg-surface/95 backdrop-blur-sm border-b border-line sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3 sm:gap-6">
        <a href="/" aria-label="Paridhi home" className="shrink-0">
          <Wordmark />
        </a>

        <div className="h-6 w-px bg-line hidden sm:block" aria-hidden />

        <Menu
          triggerLabel={`Choose a plot. Showing ${selected.name}`}
          triggerClassName="flex items-center gap-2 rounded-lg px-2 sm:px-2.5 py-1.5 hover:bg-sunken min-w-0 max-w-xs"
          trigger={
            <>
              <Dot tone={STATUS_TONE[statusOf(selected)]} />
              {/* The page heading shows the full name; on phones the switcher only needs to say what it is. */}
              <span className="text-sm font-medium text-ink sm:hidden">
                {properties.length > 1 ? `${properties.length} plots` : 'My plot'}
              </span>
              <span className="text-sm font-medium text-ink truncate hidden sm:inline">{selected.name}</span>
              <ChevronDown className="w-4 h-4 text-muted shrink-0" />
            </>
          }
          width="w-80"
        >
          {(close) => (
            <>
              <div className="eyebrow px-3 pt-2 pb-1.5">{demo ? 'Sample plots' : 'Your plots'}</div>
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
              {pending.length > 0 && (
                <>
                  <div className="eyebrow px-3 pt-3 pb-1.5">Being set up</div>
                  {pending.map((request) => (
                    <div key={request.id} className="px-3 py-2 flex items-center gap-2 text-sm text-muted">
                      <Clock className="w-4 h-4 shrink-0" aria-hidden />
                      <span className="truncate">{[request.village, request.district, request.state].filter(Boolean).join(', ')}</span>
                    </div>
                  ))}
                </>
              )}
              {onAddPlot && (
                <div className="border-t border-line mt-1.5 pt-1.5">
                  <MenuItem
                    onSelect={() => {
                      close();
                      onAddPlot();
                    }}
                  >
                    <span className="flex items-center gap-2 text-sm font-medium text-ink">
                      <Plus className="w-4 h-4 text-muted" />
                      Add a plot
                    </span>
                  </MenuItem>
                </div>
              )}
            </>
          )}
        </Menu>

        <div className="ml-auto flex items-center gap-1 sm:gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={onOpenHowItWorks} icon={<HelpCircle className="w-4 h-4" />} title="How Paridhi works">
            <span className="md:hidden">Help</span>
            <span className="hidden md:inline">How it works</span>
          </Button>
          {account && (
            <Menu
              triggerLabel={`Account: ${account.email}`}
              align="right"
              width="w-64"
              triggerClassName="w-8 h-8 rounded-full bg-ink text-surface text-sm font-medium flex items-center justify-center"
              trigger={<span title={account.email}>{account.email.slice(0, 1).toUpperCase()}</span>}
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
