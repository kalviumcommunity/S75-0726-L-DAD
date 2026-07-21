type ActivityItem = {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
  tone: 'success' | 'warning' | 'neutral';
};

type RecentActivitiesListProps = {
  activities: ActivityItem[];
};

const toneClasses = {
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  neutral: 'bg-slate-100 text-slate-600'
};

const RecentActivitiesList = ({ activities }: RecentActivitiesListProps) => {
  if (!activities.length) {
    return <p className="text-sm text-slate-500">No recent activity to display.</p>;
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
          <span className={`mt-0.5 inline-flex h-2.5 w-2.5 rounded-full ${activity.tone === 'success' ? 'bg-emerald-500' : activity.tone === 'warning' ? 'bg-amber-500' : 'bg-slate-400'}`} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-800">{activity.title}</p>
              <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${toneClasses[activity.tone]}`}>
                {activity.timestamp}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">{activity.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentActivitiesList;
export type { ActivityItem };
