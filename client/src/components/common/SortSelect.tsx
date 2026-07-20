type SortSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  className?: string;
};

const SortSelect = ({ value, onChange, options, className = '' }: SortSelectProps) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-4 pr-10 text-sm text-slate-900 transition focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 ${className}`}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default SortSelect;
