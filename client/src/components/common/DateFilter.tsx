type DateFilterProps = {
  fromDate: string;
  toDate: string;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  className?: string;
};

const DateFilter = ({ fromDate, toDate, onFromDateChange, onToDateChange, className = '' }: DateFilterProps) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input
        type="date"
        value={fromDate}
        onChange={(e) => onFromDateChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm text-slate-900 transition focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
      />
      <span className="text-slate-400">to</span>
      <input
        type="date"
        value={toDate}
        onChange={(e) => onToDateChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm text-slate-900 transition focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
      />
    </div>
  );
};

export default DateFilter;
