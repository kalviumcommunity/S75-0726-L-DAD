import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Brush,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useMemo, useState } from 'react';
import Card from '../../../../components/common/Card';
import type { AnalyticsData } from '../../../../services/api/dashboard.service';

type AnalyticsChartsPanelProps = {
  analytics: AnalyticsData | null;
};

const palette = ['#0f172a', '#2563eb', '#0f766e', '#f59e0b', '#dc2626'];

type RouteMetric = 'shipmentCount' | 'onTimeRate' | 'averageDeliveryHours';

const routeMetricOptions: Array<{
  key: RouteMetric;
  label: string;
  description: string;
  stroke: string;
  fill: string;
}> = [
  {
    key: 'shipmentCount',
    label: 'Shipment volume',
    description: 'Route throughput',
    stroke: '#0f172a',
    fill: '#0f172a',
  },
  {
    key: 'onTimeRate',
    label: 'On-time rate',
    description: 'Delivery reliability',
    stroke: '#2563eb',
    fill: '#2563eb',
  },
  {
    key: 'averageDeliveryHours',
    label: 'Average delivery hours',
    description: 'Time in transit',
    stroke: '#0f766e',
    fill: '#0f766e',
  },
];

const chartTooltipProps = {
  contentStyle: {
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    fontSize: '12px',
  },
  cursor: { fill: '#f8fafc' },
};

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

const formatCount = (value: number) => value.toLocaleString();

const formatHours = (value: number) => `${value.toFixed(2)}h`;

const formatRouteMetricValue = (metric: RouteMetric, value: number) => {
  if (metric === 'onTimeRate') {
    return formatPercent(value);
  }

  if (metric === 'averageDeliveryHours') {
    return formatHours(value);
  }

  return formatCount(value);
};

const AnalyticsChartsPanel = ({ analytics }: AnalyticsChartsPanelProps) => {
  const [routeMetric, setRouteMetric] = useState<RouteMetric>('shipmentCount');

  if (!analytics) {
    return (
      <Card title="Analytics" subtitle="Loading interactive shipment insights.">
        <p className="text-sm text-slate-500">Analytics charts are loading.</p>
      </Card>
    );
  }

  const hasMonthlyTrends = analytics.monthlyShipmentTrends.length > 0;
  const hasRoutePerformance = analytics.deliveryPerformanceByRoute.length > 0;
  const hasWarehouseCounts = analytics.warehouseShipmentCounts.length > 0;
  const hasDelayTrends = analytics.delayTrends.length > 0;

  const monthlySummary = useMemo(() => {
    const totals = analytics.monthlyShipmentTrends.reduce(
      (accumulator, item) => {
        accumulator.shipments += item.shipmentCount;
        accumulator.delivered += item.deliveredCount;
        accumulator.delayed += item.delayedCount;
        return accumulator;
      },
      { shipments: 0, delivered: 0, delayed: 0 },
    );

    return [
      { label: 'Shipments', value: formatCount(totals.shipments) },
      { label: 'Delivered', value: formatCount(totals.delivered) },
      { label: 'Delayed', value: formatCount(totals.delayed) },
    ];
  }, [analytics.monthlyShipmentTrends]);

  const routeSummary = useMemo(() => {
    const topRoute = analytics.deliveryPerformanceByRoute[0];
    const averageOnTimeRate = analytics.deliveryPerformanceByRoute.length
      ? analytics.deliveryPerformanceByRoute.reduce((sum, item) => sum + item.onTimeRate, 0) / analytics.deliveryPerformanceByRoute.length
      : 0;
    const averageDeliveryHours = analytics.deliveryPerformanceByRoute.length
      ? analytics.deliveryPerformanceByRoute.reduce((sum, item) => sum + item.averageDeliveryHours, 0) / analytics.deliveryPerformanceByRoute.length
      : 0;

    return [
      { label: 'Top route', value: topRoute?.route || 'N/A' },
      { label: 'Avg on-time', value: formatPercent(averageOnTimeRate) },
      { label: 'Avg delivery', value: formatHours(averageDeliveryHours) },
    ];
  }, [analytics.deliveryPerformanceByRoute]);

  const warehouseSummary = useMemo(() => {
    const totalShipments = analytics.warehouseShipmentCounts.reduce((sum, item) => sum + item.shipmentCount, 0);
    const topWarehouse = analytics.warehouseShipmentCounts[0];

    return [
      { label: 'Warehouses', value: formatCount(analytics.warehouseShipmentCounts.length) },
      { label: 'Shipment total', value: formatCount(totalShipments) },
      { label: 'Top hub', value: topWarehouse?.warehouse || 'N/A' },
    ];
  }, [analytics.warehouseShipmentCounts]);

  const delaySummary = useMemo(() => {
    const totalDelays = analytics.delayTrends.reduce((sum, item) => sum + item.delayCount, 0);
    const peakMonth = analytics.delayTrends.reduce(
      (best, item) => (item.delayCount > (best?.delayCount || 0) ? item : best),
      analytics.delayTrends[0],
    );

    return [
      { label: 'Delay incidents', value: formatCount(totalDelays) },
      { label: 'Peak month', value: peakMonth?.month || 'N/A' },
      { label: 'Peak count', value: formatCount(peakMonth?.delayCount || 0) },
    ];
  }, [analytics.delayTrends]);

  const selectedRouteMetric = routeMetricOptions.find((option) => option.key === routeMetric) || routeMetricOptions[0];

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <Card title="Monthly Shipment Trends" subtitle="Shipment volume, deliveries, and delays by month.">
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          {monthlySummary.map((item) => (
            <div key={item.label} className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>
        <div className="h-80 w-full">
          {hasMonthlyTrends ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.monthlyShipmentTrends} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip {...chartTooltipProps} />
                <Legend />
                <Area type="monotone" dataKey="shipmentCount" name="Shipments" stroke="#0f172a" fill="#0f172a" fillOpacity={0.12} />
                <Area type="monotone" dataKey="deliveredCount" name="Delivered" stroke="#2563eb" fill="#2563eb" fillOpacity={0.14} />
                <Area type="monotone" dataKey="delayedCount" name="Delayed" stroke="#dc2626" fill="#dc2626" fillOpacity={0.14} />
                <Brush dataKey="month" height={20} stroke="#0f172a" travellerWidth={10} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-500">No shipment trend data available.</p>
          )}
        </div>
      </Card>

      <Card title="Delivery Performance by Route" subtitle="Top routes ranked by shipment volume and on-time rate.">
        <div className="mb-4 flex flex-wrap gap-2">
          {routeMetricOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setRouteMetric(option.key)}
              className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                routeMetric === option.key
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          {routeSummary.map((item) => (
            <div key={item.label} className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>
        <div className="h-80 w-full">
          {hasRoutePerformance ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.deliveryPerformanceByRoute} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => formatRouteMetricValue(routeMetric, Number(value))}
                />
                <YAxis
                  type="category"
                  dataKey="route"
                  width={150}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  {...chartTooltipProps}
                  formatter={(value: unknown) => [formatRouteMetricValue(routeMetric, Number(value || 0)), selectedRouteMetric.label]}
                  labelFormatter={(label) => `Route: ${label}`}
                />
                <Legend />
                <Bar dataKey={routeMetric} name={selectedRouteMetric.label} fill={selectedRouteMetric.fill} radius={[0, 8, 8, 0]}>
                  {analytics.deliveryPerformanceByRoute.map((entry, index) => (
                    <Cell key={entry.route} fill={palette[index % palette.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-500">No route performance data available.</p>
          )}
        </div>
      </Card>

      <Card title="Warehouse Shipment Count" subtitle="Shipment volume grouped by warehouse location.">
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          {warehouseSummary.map((item) => (
            <div key={item.label} className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>
        <div className="h-80 w-full">
          {hasWarehouseCounts ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.warehouseShipmentCounts} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="warehouse"
                  width={140}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                />
                <Tooltip {...chartTooltipProps} formatter={(value: unknown) => [formatCount(Number(value || 0)), 'Shipment count']} />
                <Bar dataKey="shipmentCount" name="Shipment count" fill="#0f766e" radius={[0, 8, 8, 0]}>
                  {analytics.warehouseShipmentCounts.map((entry, index) => (
                    <Cell key={entry.warehouse} fill={palette[index % palette.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-500">No warehouse shipment data available.</p>
          )}
        </div>
      </Card>

      <Card title="Delay Trends Over Time" subtitle="Delay incidents tracked across the selected reporting window.">
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          {delaySummary.map((item) => (
            <div key={item.label} className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>
        <div className="h-80 w-full">
          {hasDelayTrends ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.delayTrends} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip {...chartTooltipProps} formatter={(value: unknown) => [formatCount(Number(value || 0)), 'Delay incidents']} />
                <Line type="monotone" dataKey="delayCount" name="Delay incidents" stroke="#dc2626" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Brush dataKey="month" height={20} stroke="#dc2626" travellerWidth={10} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-500">No delay trend data available.</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsChartsPanel;