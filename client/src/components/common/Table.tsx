import type { ReactNode } from 'react';

type TableProps<T> = {
  columns: { key: string; header: string; render?: (row: T) => ReactNode }[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyState?: ReactNode;
};

const Table = <T,>({ columns, data, keyExtractor, emptyState }: TableProps<T>) => {
  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-6 py-4 text-slate-500 font-medium">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {data.map((row) => (
            <tr key={keyExtractor(row)} className="hover:bg-slate-50 transition">
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-4 text-slate-700">
                  {column.render ? column.render(row) : (row as Record<string, unknown>)[column.key] as ReactNode}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
