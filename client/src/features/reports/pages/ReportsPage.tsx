import { useState } from 'react';
import PageHeader from '../../../components/common/PageHeader';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import StatusFilter from '../../../components/common/StatusFilter';
import DateFilter from '../../../components/common/DateFilter';
import { reportsApi } from '../../../services/api/reports.service';

const ReportsPage = () => {
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Dispatched', value: 'Dispatched' },
    { label: 'In Transit', value: 'In Transit' },
    { label: 'At Warehouse', value: 'At Warehouse' },
    { label: 'Delayed', value: 'Delayed' },
    { label: 'Delivered', value: 'Delivered' },
  ];

  const handleExportShipments = async () => {
    try {
      setLoading(true);
      setError(null);
      await reportsApi.exportShipments({
        status: status || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to export shipments');
    } finally {
      setLoading(false);
    }
  };

  const handleExportDelayReports = async () => {
    try {
      setLoading(true);
      setError(null);
      await reportsApi.exportDelayReports({
        status: status || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to export delay reports');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setStatus('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" subtitle="Access operational summaries and export-ready insights." />

      {error && (
        <div className="rounded-[28px] border border-red-200 bg-white p-6 shadow-sm">
          <p className="text-lg font-semibold text-red-700">Error</p>
          <p className="mt-2 text-sm text-red-600">{error}</p>
        </div>
      )}

      <Card className="p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Filters</h3>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear all filters
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatusFilter
            value={status}
            onChange={setStatus}
            options={statusOptions}
          />
          <DateFilter
            fromDate={startDate}
            toDate={endDate}
            onFromDateChange={setStartDate}
            onToDateChange={setEndDate}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Shipments Export</h3>
          <p className="text-sm text-slate-500 mb-4">
            Export shipment data in CSV format for analysis and reporting.
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={handleExportShipments}
            loading={loading}
          >
            Export Shipments CSV
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Delay Reports Export</h3>
          <p className="text-sm text-slate-500 mb-4">
            Export delay reports data in CSV format for analysis and reporting.
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={handleExportDelayReports}
            loading={loading}
          >
            Export Delay Reports CSV
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;
