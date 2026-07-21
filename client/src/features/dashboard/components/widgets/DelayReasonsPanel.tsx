import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

type DelayReasonItem = {
  label: string;
  count: number;
  percent: number;
};

type DelayReasonsPanelProps = {
  reasons: DelayReasonItem[];
};

const DelayReasonsPanel = ({ reasons }: DelayReasonsPanelProps) => {
  if (!reasons.length) {
    return <p className="text-sm text-slate-500">No delay reasons available yet.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={reasons} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '12px' }}
            />
            <Bar dataKey="count" fill="#0f172a" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2">
        {reasons.map((reason) => (
          <div key={reason.label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2.5">
            <div>
              <p className="text-sm font-semibold text-slate-800">{reason.label}</p>
              <p className="text-xs text-slate-500">{reason.count} incidents</p>
            </div>
            <span className="text-sm font-semibold text-slate-700">{reason.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DelayReasonsPanel;
export type { DelayReasonItem };
