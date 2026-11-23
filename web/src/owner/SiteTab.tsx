import { useState, type ReactNode } from 'react';
import { BatteryCharging, Camera, Clock, Compass, Radio, TowerControl } from 'lucide-react';
import { bearingDegrees, distanceMeters, formatQuadrantBearing } from '@shared/domain';
import type { CameraPod, PropertyRecord } from '@shared/types';
import { formatDate, formatDateTime, formatMeters, formatRelative } from '../format';
import { Badge } from '../ui/Badge';
import { Card, EmptyState } from '../ui/Card';
import { SurveyPlate } from './SurveyPlate';

export function SiteTab({ property, now }: { property: PropertyRecord; now: Date }) {
  const { location } = property;
  const pegs = location.boundaryPegs;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
        <Card title="Survey plan" description="Drawn to scale from the surveyed corner pegs. North is up." icon={<Compass className="w-5 h-5" />} bodyClassName="p-0">
          <SurveyPlate
            location={location}
            surveyNumber={property.surveyNumber}
            pegsIntact={property.inspection.latestVisit?.boundaryPegsIntact ?? true}
          />
        </Card>

        <Card title="Corner pegs" description={`Surveyed area ${property.areaAcres.toFixed(3)} acres`}>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="eyebrow font-medium pb-2">Peg</th>
                <th className="eyebrow font-medium pb-2">Position</th>
                <th className="eyebrow font-medium pb-2 text-right">To next</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {pegs.map((peg, i) => {
                const next = pegs[(i + 1) % pegs.length];
                return (
                  <tr key={peg.id}>
                    <td className="py-2.5 pr-3 font-medium text-ink whitespace-nowrap">
                      {peg.id} <span className="text-muted font-normal">{peg.corner}</span>
                    </td>
                    <td className="py-2.5 pr-3 font-mono text-xs text-ink-soft">
                      {peg.position.lat.toFixed(6)}, {peg.position.lng.toFixed(6)}
                    </td>
                    <td className="py-2.5 text-right whitespace-nowrap">
                      <div className="text-ink">{formatMeters(distanceMeters(peg.position, next.position))}</div>
                      <div className="text-xs text-faint font-mono">{formatQuadrantBearing(bearingDegrees(peg.position, next.position))}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="eyebrow mt-6 mb-2">Neighbours</div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {(['north', 'east', 'south', 'west'] as const).map((side) => (
              <div key={side}>
                <dt className="text-muted capitalize">{side}</dt>
                <dd className="text-ink">{location.boundaries[side] || '—'}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>

      {property.camera ? (
        <CameraCard camera={property.camera} name={property.name} now={now} />
      ) : (
        <Card title="Camera" icon={<Camera className="w-5 h-5" />}>
          <EmptyState icon={<Camera className="w-5 h-5" />} title="No camera installed">
            This plot is watched through monthly inspections and land record checks. Once a solar camera is installed,
            its photos and weekly comparisons will appear here.
          </EmptyState>
        </Card>
      )}
    </div>
  );
}

function CameraCard({ camera, name, now }: { camera: CameraPod; name: string; now: Date }) {
  const [frame, setFrame] = useState<'latest' | 'baseline'>('latest');
  const shown = frame === 'latest' ? camera.latestSnapshot : camera.baselineSnapshot;

  return (
    <Card
      title="Camera"
      description={camera.deviceModel}
      icon={<Camera className="w-5 h-5" />}
      action={<Badge tone={camera.online ? 'ok' : 'warn'}>{camera.online ? 'Online' : 'Offline'}</Badge>}
      bodyClassName="p-0"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr]">
        <div className="relative bg-ink">
          <img src={shown.url} alt={`Camera photo of ${name}, ${formatDateTime(shown.capturedAt)}`} className="w-full aspect-[4/3] object-cover" />
          <div className="absolute top-3 left-3 bg-surface/95 text-ink text-xs rounded-md px-2 py-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-muted" />
            {formatDateTime(shown.capturedAt)}
          </div>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-surface/95 rounded-lg p-1 flex gap-1 text-sm">
            {(
              [
                ['baseline', `Last week · ${formatDate(camera.baselineSnapshot.capturedAt)}`],
                ['latest', `Latest · ${formatDate(camera.latestSnapshot.capturedAt)}`]
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={frame === id}
                onClick={() => setFrame(id)}
                className={`px-3 py-1 rounded-md cursor-pointer whitespace-nowrap ${frame === id ? 'bg-ink text-surface' : 'text-ink-soft hover:bg-sunken'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 space-y-5">
          <div className={`rounded-lg border p-3 ${camera.changeDetected ? 'border-warn-line bg-warn-soft' : 'border-ok-line bg-ok-soft'}`}>
            <div className={`font-medium ${camera.changeDetected ? 'text-warn' : 'text-ok'}`}>
              {camera.changeDetected ? 'Change spotted since last week' : 'No change since last week'}
            </div>
            <p className="text-sm text-ink-soft mt-0.5">{camera.changeNotes}</p>
          </div>

          <dl className="grid grid-cols-2 gap-4 text-sm">
            <Telemetry icon={<BatteryCharging className="w-4 h-4" />} label="Battery" value={`${Math.round(camera.batteryPercentage)}%`} note={camera.solarCharging ? 'Charging from solar' : 'On battery'} />
            <Telemetry icon={<Radio className="w-4 h-4" />} label="Network" value={camera.carrier} note={`${camera.signalStrengthDbm} dBm`} />
            <Telemetry
              icon={<TowerControl className="w-4 h-4" />}
              label="Mount"
              value={`${camera.poleHeightMeters} m pole`}
              note={camera.tamperSwitchNormal ? 'Enclosure closed' : 'Tamper switch tripped'}
              warn={!camera.tamperSwitchNormal}
            />
            <Telemetry icon={<Clock className="w-4 h-4" />} label="Last heartbeat" value={formatRelative(camera.lastHeartbeatAt, now)} note={`Every ${camera.heartbeatIntervalSeconds} s`} />
          </dl>
        </div>
      </div>
    </Card>
  );
}

function Telemetry({ icon, label, value, note, warn = false }: { icon: ReactNode; label: string; value: string; note: string; warn?: boolean }) {
  return (
    <div>
      <dt className="eyebrow flex items-center gap-1.5">
        {icon}
        {label}
      </dt>
      <dd className="text-ink mt-1">{value}</dd>
      <dd className={`text-xs ${warn ? 'text-bad' : 'text-muted'}`}>{note}</dd>
    </div>
  );
}
