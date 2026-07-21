import type { ReactNode } from 'react';

type StatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  accent?: 'slate' | 'emerald' | 'amber' | 'sky' | 'rose';
  icon?: ReactNode;
};

const accentClasses = {
  slate: 'border-slate-200 bg-slate-50 text-slate-700',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  amber: 'border-amber-200 bg-amber-50 text-amber-700',
  sky: 'border-sky-200 bg-sky-50 text-sky-700',
  rose: 'border-rose-200 bg-rose-50 text-rose-700'
};

const StatCard = ({ title, value, subtitle, accent = 'slate', icon }: StatCardProps) => {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
        </div>
        {icon ? (
          <div className={`rounded-2xl border p-2.5 ${accentClasses[accent]}`}>
            {icon}
          </div>
        ) : null}
      </div>
      {subtitle ? <p className="mt-3 text-sm text-slate-500">{subtitle}</p> : null}
    </div>
  );
};

export default StatCard;
