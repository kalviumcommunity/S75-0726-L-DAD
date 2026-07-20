import { useEffect, useState } from 'react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Table from '../../../components/common/Table';
import Loader from '../../../components/common/Loader';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { dashboardApi, type OverviewData, type DelayBreakdownItem } from '../../../services/api/dashboard.service';
import { shipmentsApi, type Shipment } from '../../../services/api/shipments.service';

const DashboardLayout = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [delayBreakdown, setDelayBreakdown] = useState<DelayBreakdownItem[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [overviewData, delayData, shipmentsData] = await Promise.all([
          dashboardApi.getOverview(),
          dashboardApi.getDelayBreakdown(),
          shipmentsApi.getShipments({ limit: 10, sortBy: 'createdAt', sortOrder: 'desc' })
        ]);
        setOverview(overviewData);
        setDelayBreakdown(delayData);
        setShipments(shipmentsData.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-[32px] border border-red-200 bg-white p-8 shadow-sm">
          <p className="text-xl font-semibold text-red-700">Error</p>
          <p className="mt-2 text-sm text-red-600">{error}</p>
          <Button
            variant="primary"
            size="md"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  const shipmentStats = [
    { label: 'Total Shipments', value: overview?.totalShipments?.toLocaleString() || '0' },
    { label: 'Delivered', value: overview?.deliveredShipments?.toLocaleString() || '0' },
    { label: 'Delayed', value: overview?.delayedShipments?.toLocaleString() || '0' },
    { label: 'In Transit', value: overview?.inTransitShipments?.toLocaleString() || '0' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1480px] gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <main className="flex-1">
          <div className="flex flex-col gap-6">
            <header className="flex flex-col gap-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Dashboard Overview</p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-900">Real-time logistics health and delay analysis.</h1>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button variant="secondary" size="md">Last 30 Days</Button>
                <Button variant="primary" size="md">Export Data</Button>
              </div>
            </header>

            <section className="grid gap-5 xl:grid-cols-4">
              {shipmentStats.map((stat) => (
                <Card key={stat.label} title={stat.label} subtitle="">
                  <p className="mt-4 text-3xl font-semibold text-slate-900">{stat.value}</p>
                </Card>
              ))}
            </section>

            <section className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
              <Card title="Recent Shipments" subtitle="Latest delivery progress at a glance.">
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
                    { key: 'expectedDeliveryDate', header: 'ETA', render: (row) => new Date(row.expectedDeliveryDate).toLocaleDateString() }
                  ]}
                  data={shipments}
                  keyExtractor={(row) => row.id}
                />
              </Card>

              <Card title="Delay Reasons" subtitle="Breakdown of shipment delays by root cause.">
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={delayBreakdown} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
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
              </Card>
            </section>

            <section className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
              <div className="flex flex-col gap-5">
                <Card title="Quick Actions" subtitle="Common operations and shortcuts.">
                  <div className="flex flex-col gap-3">
                    <Button variant="secondary" size="md" className="justify-start">Create Shipment</Button>
                    <Button variant="secondary" size="md" className="justify-start">Generate Report</Button>
                    <Button variant="secondary" size="md" className="justify-start">Track Shipment</Button>
                    <Button variant="secondary" size="md" className="justify-start">View Alerts</Button>
                  </div>
                </Card>
                <Card title="System Health" subtitle="Platform status and connectivity.">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                      <span className="text-sm font-medium text-slate-700">API Gateway</span>
                      <span className="text-xs font-semibold text-emerald-600">Operational</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                      <span className="text-sm font-medium text-slate-700">Database</span>
                      <span className="text-xs font-semibold text-emerald-600">Operational</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                      <span className="text-sm font-medium text-slate-700">Tracking Service</span>
                      <span className="text-xs font-semibold text-emerald-600">Operational</span>
                    </div>
                  </div>
                </Card>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
