import { useEffect, useState } from 'react';
import PageHeader from '../../../components/common/PageHeader';
import Card from '../../../components/common/Card';
import Table from '../../../components/common/Table';
import Loader from '../../../components/common/Loader';
import Button from '../../../components/common/Button';
import { shipmentsApi, type Shipment, type PaginatedShipments } from '../../../services/api/shipments.service';

const ShipmentsPage = () => {
  const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [meta, setMeta] = useState<PaginatedShipments['meta'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const fetchShipments = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const data = await shipmentsApi.getShipments({ page: pageNum, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' });
      setShipments(data.data);
      setMeta(data.meta);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load shipments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments(page);
  }, [page]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Shipments" subtitle="Monitor in-flight and scheduled cargo movements." />
        <div className="flex items-center justify-center rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <Loader size="md" />
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
          <Button
            variant="primary"
            size="md"
            className="mt-4"
            onClick={() => fetchShipments(page)}
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Shipments" subtitle="Monitor in-flight and scheduled cargo movements." />
      <Card title="All Shipments" subtitle={`Showing ${shipments.length} of ${meta?.totalItems || 0} shipments`}>
        <Table
          columns={[
            { key: 'shipmentId', header: 'Shipment ID', render: (row) => <span className="font-semibold text-slate-900">{row.shipmentId}</span> },
            { key: 'currentStatus', header: 'Status', render: (row) => (
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                row.currentStatus === 'Delivered' ? 'bg-emerald-50 text-emerald-700' :
                row.currentStatus === 'Delayed' ? 'bg-red-50 text-red-700' :
                'bg-sky-50 text-sky-700'
              }`}>
                {row.currentStatus}
              </span>
            )},
            { key: 'dispatchDate', header: 'Dispatch Date', render: (row) => new Date(row.dispatchDate).toLocaleDateString() },
            { key: 'expectedDeliveryDate', header: 'Expected Delivery', render: (row) => new Date(row.expectedDeliveryDate).toLocaleDateString() },
            { key: 'actualDeliveryDate', header: 'Actual Delivery', render: (row) => row.actualDeliveryDate ? new Date(row.actualDeliveryDate).toLocaleDateString() : '-' }
          ]}
          data={shipments}
          keyExtractor={(row) => row.id}
        />
        {meta && meta.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-slate-600">Page {page} of {meta.totalPages}</p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= meta.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ShipmentsPage;
