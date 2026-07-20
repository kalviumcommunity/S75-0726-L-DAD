import type { ReactNode } from 'react';

type SortDirection = 'asc' | 'desc' | null;

type ColumnDef<T> = {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => ReactNode;
};

type TableProps<T> = {
  columns: ColumnDef<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  sortBy?: string;
  sortOrder?: SortDirection;
  onSort?: (key: string) => void;
  emptyState?: ReactNode;
};

const SortIcon = ({ direction }: { direction: SortDirection }) => {
  if (direction === 'asc') {
    return (
      <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
      </svg>
    );
  }
  if (direction === 'desc') {
    return (
      <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
      </svg>
    );
  }
  return (
    <svg className="ml-1 h-4 w-4 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15M8.25 9L12 5.25 15.75 9" />
    </svg>
  );
};

const Table = <T,>({ columns, data, keyExtractor, sortBy, sortOrder, onSort, emptyState }: TableProps<T>) => {
  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-6 py-4 text-slate-500 font-medium ${column.sortable ? 'cursor-pointer select-none hover:text-slate-700' : ''}`}
                onClick={() => column.sortable && onSort?.(column.key)}
              >
                <div className="flex items-center">
                  {column.header}
                  {column.sortable && <SortIcon direction={sortBy === column.key ? (sortOrder ?? null) : null} />}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {data.map((row) => (
            <tr key={keyExtractor(row)} className="hover:bg-slate-50 transition">
              {columns.map((column) => (
                <td key={column.key} className="whitespace-nowrap px-6 py-4 text-slate-700">
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
