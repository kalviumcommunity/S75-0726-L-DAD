import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../../components/common/PageHeader';
import Card from '../../../components/common/Card';
import Table from '../../../components/common/Table';
import TableSkeleton from '../../../components/common/TableSkeleton';
import SearchInput from '../../../components/common/SearchInput';
import StatusFilter from '../../../components/common/StatusFilter';
import DateFilter from '../../../components/common/DateFilter';
import SortSelect from '../../../components/common/SortSelect';
import Button from '../../../components/common/Button';
import EmptyState from '../../../components/common/EmptyState';
import { shipmentsApi, type Shipment } from '../../../services/api/shipments.service';

const ShipmentsPage = () => {
  const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [meta, setMeta] = useState<{ page: number; limit: number; totalItems: number; totalPages: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  const statusOptions = useMemo(() => [
    { label: 'All Statuses', value: '' },
    { label: 'Dispatched', value: 'Dispatched' },
    { label: 'In Transit', value: 'In Transit' },
    { label: 'At Warehouse', value: 'At Warehouse' },
    { label: 'Delayed', value: 'Delayed' },
    { label: 'Delivered', value: 'Delivered' }
  ], []);

  const sortOptions = useMemo(() => [
    { label: 'Newest First', value: 'createdAt:desc' },
    { label: 'Oldest First', value: 'createdAt:asc' },
    { label: 'Status A-Z', value: 'currentStatus:asc' },
    { label: 'Status Z-A', value: 'currentStatus:desc' },
    { label: 'Dispatch Date', value: 'dispatchDate:desc' },
    { label: 'ETA', value: 'expectedDeliveryDate:asc' }
  ], []);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await shipmentsApi.getShipments({
        page,
        limit: 10,
        search: search || undefined,
        status: status || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        sortBy,
        sortOrder
      });
      setShipments(data.data);
      setMeta(data.meta);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load shipments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [page, status, fromDate, toDate, sortBy, sortOrder]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchShipments();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSortChange = (value: string) => {
    const [field, order] = value.split(':');
    setSortBy(field);
    setSortOrder(order as 'asc' | 'desc');
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setFromDate('');
    setToDate('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  const hasActiveFilters = search || status || fromDate || toDate;

  if (loading && shipments.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Shipments" subtitle="Monitor in-flight and scheduled cargo movements." />
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="h-12 w-full animate-pulse rounded-2xl bg-slate-200 lg:w-80" />
            <div className="h-12 w-full animate-pulse rounded-2xl bg-slate-200 lg:w-48" />
            <div className="h-12 w-full animate-pulse rounded-2xl bg-slate-200 lg:w-64" />
            <div className="h-12 w-full animate-pulse rounded-2xl bg-slate-200 lg:w-48" />
          </div>
          <TableSkeleton rows={8} columns={6} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Shipments" subtitle="Monitor in-flight and scheduled cargo movements." />
        <div className="rounded-[28px] border border-red-200 bg-white p-8 shadow-sm">
          <p className="text-xl font-semibold text-red-700">Error</p>
          <p className="mt-2 text-sm text-red-600">{error}</p>
          <Button variant="primary" size="md" className="mt-4" onClick={fetchShipments}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Shipments" subtitle="Monitor in-flight and scheduled cargo movements." />

      <Card className="p-4 sm:p-6">
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Filters</h3>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all filters
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by ID or route..."
            />
            <StatusFilter
              value={status}
              onChange={setStatus}
              options={statusOptions}
            />
            <DateFilter
              fromDate={fromDate}
              toDate={toDate}
              onFromDateChange={setFromDate}
              onToDateChange={setToDate}
            />
            <SortSelect
              value={`${sortBy}:${sortOrder}`}
              onChange={handleSortChange}
              options={sortOptions}
            />
          </div>
        </div>
      </Card>

      <Card
        title="All Shipments"
        subtitle={`Showing ${shipments.length} of ${meta?.totalItems || 0} shipments`}
      >
        {shipments.length === 0 ? (
          <EmptyState
            title="No shipments found"
            description="Try adjusting your filters or search criteria to find what you're looking for."
            action={
              <Button variant="primary" size="md" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <>
            <Table
              columns={[
                { key: 'shipmentId', header: 'Shipment ID', sortable: true, render: (row) => <span className="font-semibold text-slate-900">{row.shipmentId}</span> },
                { key: 'currentStatus', header: 'Status', sortable: true, render: (row) => (
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    row.currentStatus === 'Delivered' ? 'bg-emerald-50 text-emerald-700' :
                    row.currentStatus === 'Delayed' ? 'bg-red-50 text-red-700' :
                    row.currentStatus === 'At Warehouse' ? 'bg-amber-50 text-amber-700' :
                    'bg-sky-50 text-sky-700'
                  }`}>
                    {row.currentStatus}
                  </span>
                )},
                { key: 'origin', header: 'Origin', sortable: true },
                { key: 'destination', header: 'Destination', sortable: true },
                { key: 'dispatchDate', header: 'Dispatch Date', sortable: true, render: (row) => new Date(row.dispatchDate).toLocaleDateString() },
                { key: 'expectedDeliveryDate', header: 'ETA', sortable: true, render: (row) => new Date(row.expectedDeliveryDate).toLocaleDateString() },
                { key: 'actualDeliveryDate', header: 'Actual Delivery', render: (row) => row.actualDeliveryDate ? new Date(row.actualDeliveryDate).toLocaleDateString() : '-' }
              ]}
              data={shipments}
              keyExtractor={(row) => row.id}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={(key) => {
                if (sortBy === key) {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortBy(key);
                  setSortOrder('asc');
                }
                setPage(1);
              }}
            />

            {meta && meta.totalPages > 1 && (
              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-600">
                  Page {page} of {meta.totalPages} • {meta.totalItems} total shipments
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page <= 1 || loading}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (meta.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= meta.totalPages - 2) {
                        pageNum = meta.totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          disabled={loading}
                          className={`h-9 w-9 rounded-xl text-sm font-medium transition disabled:opacity-50 ${
                            page === pageNum
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page >= meta.totalPages || loading}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default ShipmentsPage;
