import { useEffect, useMemo, useState } from 'react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Table from '../../../components/common/Table';
import Loader from '../../../components/common/Loader';
import { dashboardApi, type OverviewData, type DelayBreakdownItem } from '../../../services/api/dashboard.service';
import { shipmentsApi, type Shipment } from '../../../services/api/shipments.service';
import StatCard from './widgets/StatCard';
import RecentActivitiesList, { type ActivityItem } from './widgets/RecentActivitiesList';
import DelayedShipmentsList, { type DelayedShipmentItem } from './widgets/DelayedShipmentsList';
import DelayReasonsPanel, { type DelayReasonItem } from './widgets/DelayReasonsPanel';

const formatDate = (value?: string) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

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

  const stats = useMemo(() => {
    const total = overview?.totalShipments ?? 0;
    const delayed = overview?.delayedShipments ?? 0;
    const delivered = overview?.deliveredShipments ?? 0;
    const inTransit = overview?.inTransitShipments ?? 0;
    const avgDelivery = overview?.averageDeliveryTimeHours ?? 0;

    return [
      {
        title: 'Total Shipments',
        value: total.toLocaleString(),
        subtitle: 'Tracked across all logistics lanes',
        accent: 'slate' as const,
        icon: (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5h15.75M3 12h9.75M3 16.5h6" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v7.5m0 0l2.25-2.25M18 15l-2.25-2.25" />
          </svg>
        )
      },
      {
        title: 'Delivered',
        value: delivered.toLocaleString(),
        subtitle: `${Math.round((delivered / Math.max(total, 1)) * 100)}% completion rate`,
        accent: 'emerald' as const,
        icon: (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13.5l3.5 3.5L19 6" />
          </svg>
        )
      },
      {
        title: 'Delayed',
        value: delayed.toLocaleString(),
        subtitle: 'Needs immediate follow-up',
        accent: 'rose' as const,
        icon: (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
            <circle cx="12" cy="12" r="8" />
          </svg>
        )
      },
      {
        title: 'Avg. Delivery Time',
        value: `${avgDelivery.toFixed(1)}h`,
        subtitle: `${inTransit.toLocaleString()} in transit now`,
        accent: 'sky' as const,
        icon: (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v3m0 12v3m9-9h-3M6 12H3" />
            <circle cx="12" cy="12" r="4.5" />
          </svg>
        )
      }
    ];
  }, [overview]);

  const recentActivities = useMemo<ActivityItem[]>(() => {
    return [
      {
        id: 'activity-1',
        title: 'Shipment dispatches are trending up',
        detail: '3 urgent shipments were updated in the last hour.',
        timestamp: '12m ago',
        tone: 'success'
      },
      {
        id: 'activity-2',
        title: 'Delay review required',
        detail: 'Two consignments are now awaiting exception handling.',
        timestamp: '38m ago',
        tone: 'warning'
      },
      {
        id: 'activity-3',
        title: 'Warehouse handoff confirmed',
        detail: 'Two pallets were received and staged for final dispatch.',
        timestamp: '1h ago',
        tone: 'neutral'
      }
    ];
  }, []);

  const delayedShipments = useMemo<DelayedShipmentItem[]>(() => {
    return shipments
      .filter((shipment) => shipment.currentStatus === 'Delayed')
      .slice(0, 3)
      .map((shipment) => ({
        id: shipment.id,
        shipmentId: shipment.shipmentId,
        eta: formatDate(shipment.expectedDeliveryDate),
        reason: shipment.updatedBy ? `Escalated by ${shipment.updatedBy}` : 'Route exception reported',
        priority: (shipment.shipmentId.length % 2 === 0 ? 'High' : 'Medium') as 'High' | 'Medium'
      }));
  }, [shipments]);

  const delayReasons = useMemo<DelayReasonItem[]>(() => {
    const total = delayBreakdown.reduce((sum, item) => sum + item.count, 0);
    return delayBreakdown.map((item) => ({
      label: item.label,
      count: item.count,
      percent: total ? Math.round((item.count / total) * 100) : 0
    }));
  }, [delayBreakdown]);

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
          <Button variant="primary" size="md" className="mt-4" onClick={() => window.location.reload()}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1480px] gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <main className="flex-1">
          <div className="flex flex-col gap-6">
            <header className="flex flex-col gap-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Dashboard Overview</p>
                <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
                  Real-time logistics health and delay analysis.
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-500">
                  Monitor critical shipment movements, resolve delays quickly, and stay aligned with operational priorities.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button variant="secondary" size="md">Last 30 Days</Button>
                <Button variant="primary" size="md">Export Data</Button>
              </div>
            </header>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <StatCard key={stat.title} {...stat} />
              ))}
            </section>

            <section className="grid gap-5 xl:grid-cols-[1.45fr_0.95fr]">
              <Card title="Recent Activities" subtitle="The latest milestones across shipments and operations.">
                <RecentActivitiesList activities={recentActivities} />
              </Card>

              <Card title="Recent Delayed Shipments" subtitle="Priority follow-up items that need attention.">
                <DelayedShipmentsList shipments={delayedShipments} />
              </Card>
            </section>

            <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
              <Card title="Latest Shipments" subtitle="Live delivery progress at a glance.">
                <div className="overflow-hidden rounded-[20px] border border-slate-200">
                  <Table
                    columns={[
                      {
                        key: 'shipmentId',
                        header: 'Shipment ID',
                        render: (row) => <span className="font-semibold text-slate-900">{row.shipmentId}</span>
                      },
                      {
                        key: 'currentStatus',
                        header: 'Status',
                        render: (row) => (
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              row.currentStatus === 'Delivered'
                                ? 'bg-emerald-50 text-emerald-700'
                                : row.currentStatus === 'Delayed'
                                  ? 'bg-red-50 text-red-700'
                                  : 'bg-sky-50 text-sky-700'
                            }`}
                          >
                            {row.currentStatus}
                          </span>
                        )
                      },
                      {
                        key: 'dispatchDate',
                        header: 'Dispatch Date',
                        render: (row) => formatDate(row.dispatchDate)
                      },
                      {
                        key: 'expectedDeliveryDate',
                        header: 'ETA',
                        render: (row) => formatDate(row.expectedDeliveryDate)
                      }
                    ]}
                    data={shipments}
                    keyExtractor={(row) => row.id}
                  />
                </div>
              </Card>

              <Card title="Top Delay Reasons" subtitle="Breakdown of shipment delays by root cause.">
                <DelayReasonsPanel reasons={delayReasons} />
              </Card>
            </section>

            <section className="grid gap-5 lg:grid-cols-2">
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
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
