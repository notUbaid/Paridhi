import type { PropertyRecord } from '@shared/types';
import { Card } from '../ui/Card';
import { ActivityList } from './ActivityList';

export function ActivityTab({ property, now }: { property: PropertyRecord; now: Date }) {
  return (
    <Card title="Activity" description="Everything that has happened on this plot, newest first.">
      <div className="max-w-2xl">
        <ActivityList events={property.activity} now={now} />
      </div>
    </Card>
  );
}
