type TableSkeletonProps = {
  rows?: number;
  columns?: number;
};

const TableSkeleton = ({ rows = 5, columns = 5 }: TableSkeletonProps) => {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200">
      <div className="bg-slate-50">
        <div className="flex">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="flex-1 px-6 py-4">
              <div className="h-3 w-16 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
      <div className="divide-y divide-slate-200 bg-white">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="flex-1 px-6 py-4">
                <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableSkeleton;
