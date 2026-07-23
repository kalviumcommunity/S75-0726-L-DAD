import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Card from '../../../../components/common/Card';
import type { AnalyticsData } from '../../../../services/api/dashboard.service';

type AnalyticsChartsPanelProps = {
  analytics: AnalyticsData | null;
};

const palette = ['#0f172a', '#2563eb', '#0f766e', '#f59e0b', '#dc2626'];

const chartTooltipProps = {
  contentStyle: {
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    fontSize: '12px',
  },
  cursor: { fill: '#f8fafc' },
};

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

const AnalyticsChartsPanel = ({ analytics }: AnalyticsChartsPanelProps) => {
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

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <Card title="Monthly Shipment Trends" subtitle="Shipment volume, deliveries, and delays by month.">
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
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-500">No shipment trend data available.</p>
          )}
        </div>
      </Card>

      <Card title="Delivery Performance by Route" subtitle="Top routes ranked by shipment volume and on-time rate.">
        <div className="h-80 w-full">
          {hasRoutePerformance ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.deliveryPerformanceByRoute} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
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
                  formatter={(value: any, name: any, entry: any) => {
                    if (name === 'On-time rate') {
                      return [formatPercent(Number(value || 0)), name];
                    }

                    if (name === 'Shipment count') {
                      return [value, name];
                    }

                    return [value, name, entry.payload?.route];
                  }}
                />
                <Legend />
                <Bar dataKey="shipmentCount" name="Shipment count" fill="#0f172a" radius={[0, 8, 8, 0]}>
                  {analytics.deliveryPerformanceByRoute.map((entry, index) => (
                    <Cell key={entry.route} fill={palette[index % palette.length]} />
                  ))}
                </Bar>
                <Bar dataKey="onTimeRate" name="On-time rate" fill="#2563eb" radius={[0, 8, 8, 0]}>
                  <LabelList dataKey="onTimeRate" position="right" formatter={(value: any) => formatPercent(Number(value ?? 0))} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-500">No route performance data available.</p>
          )}
        </div>
      </Card>

      <Card title="Warehouse Shipment Count" subtitle="Shipment volume grouped by warehouse location.">
        <div className="h-80 w-full">
          {hasWarehouseCounts ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.warehouseShipmentCounts} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="warehouse" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} interval={0} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip {...chartTooltipProps} />
                <Bar dataKey="shipmentCount" name="Shipment count" fill="#0f766e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-500">No warehouse shipment data available.</p>
          )}
        </div>
      </Card>

      <Card title="Delay Trends Over Time" subtitle="Delay incidents tracked across the selected reporting window.">
        <div className="h-80 w-full">
          {hasDelayTrends ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.delayTrends} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip {...chartTooltipProps} />
                <Line type="monotone" dataKey="delayCount" name="Delay incidents" stroke="#dc2626" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
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