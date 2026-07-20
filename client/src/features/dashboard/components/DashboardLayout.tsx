import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Table from '../../../components/common/Table';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const shipmentStats = [
  { label: 'Total Shipments', value: '12,482', meta: '+2.1% from last month', trend: 'up' },
  { label: 'Delivered', value: '9,841', meta: '78.8% delivery rate', trend: 'up' },
  { label: 'Delayed', value: '842', meta: '6.7% delay rate', trend: 'down' },
  { label: 'In Transit', value: '1,799', meta: 'Active across 42 routes', trend: 'neutral' }
];

const statusTableData = [
  { id: '#LX-90812', origin: 'Shanghai, CN', destination: 'Los Angeles, US', status: 'In Transit', delay: 'On Time', eta: '2026-07-18' },
  { id: '#LX-90744', origin: 'Rotterdam, NL', destination: 'New York, US', status: 'Customs Hold', delay: '+4h Delay', eta: '2026-07-19' },
  { id: '#LX-90112', origin: 'Hamburg, DE', destination: 'London, UK', status: 'Delayed', delay: '+24h Delay', eta: '2026-07-20' },
  { id: '#LX-90820', origin: 'Mumbai, IN', destination: 'Dubai, AE', status: 'Delivered', delay: 'On Time', eta: '2026-07-17' },
  { id: '#LX-90845', origin: 'Singapore, SG', destination: 'Tokyo, JP', status: 'In Transit', delay: 'On Time', eta: '2026-07-18' }
];

const recentShipmentsData = [
  { id: '#LX-90812', origin: 'Shanghai, CN', destination: 'Los Angeles, US', status: 'In Transit', updated: '2 min ago' },
  { id: '#LX-90744', origin: 'Rotterdam, NL', destination: 'New York, US', status: 'Customs Hold', updated: '15 min ago' },
  { id: '#LX-90112', origin: 'Hamburg, DE', destination: 'London, UK', status: 'Delayed', updated: '1 hr ago' },
  { id: '#LX-90820', origin: 'Mumbai, IN', destination: 'Dubai, AE', status: 'Delivered', updated: '3 hr ago' },
  { id: '#LX-90845', origin: 'Singapore, SG', destination: 'Tokyo, JP', status: 'In Transit', updated: '5 hr ago' }
];

const delayReasonsData = [
  { reason: 'Port Congestion', count: 124 },
  { reason: 'Weather', count: 89 },
  { reason: 'Customs', count: 67 },
  { reason: 'Mechanical', count: 34 },
  { reason: 'Documentation', count: 21 }
];

const DashboardLayout = () => {
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
                <Card key={stat.label} title={stat.label} subtitle={stat.meta}>
                  <p className="mt-4 text-3xl font-semibold text-slate-900">{stat.value}</p>
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                      stat.trend === 'up' ? 'bg-emerald-50 text-emerald-700' :
                      stat.trend === 'down' ? 'bg-red-50 text-red-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {stat.trend === 'up' ? '↑' : stat.trend === 'down' ? '↓' : '→'} {stat.meta}
                    </span>
                  </div>
                </Card>
              ))}
            </section>

            <section className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
              <Card title="Shipment Status" subtitle="Current status of all tracked shipments.">
                <Table
                  columns={[
                    { key: 'id', header: 'Shipment ID' },
                    { key: 'origin', header: 'Origin' },
                    { key: 'destination', header: 'Destination' },
                    { key: 'status', header: 'Status', render: (row) => (
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        row.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700' :
                        row.status === 'Delayed' || row.status === 'Customs Hold' ? 'bg-red-50 text-red-700' :
                        'bg-sky-50 text-sky-700'
                      }`}>
                        {row.status}
                      </span>
                    )},
                    { key: 'delay', header: 'Delay Status', render: (row) => (
                      <span className={row.delay.includes('Delay') ? 'font-semibold text-amber-600' : 'text-emerald-600'}>
                        {row.delay}
                      </span>
                    )},
                    { key: 'eta', header: 'ETA' }
                  ]}
                  data={statusTableData}
                  keyExtractor={(row) => row.id}
                />
              </Card>

              <Card title="Delay Reasons" subtitle="Breakdown of shipment delays by root cause.">
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={delayReasonsData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="reason" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
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
              <Card title="Recent Shipments" subtitle="Latest delivery progress at a glance.">
                <Table
                  columns={[
                    { key: 'id', header: 'Shipment ID', render: (row) => <span className="font-semibold text-slate-900">{row.id}</span> },
                    { key: 'origin', header: 'Origin' },
                    { key: 'destination', header: 'Destination' },
                    { key: 'status', header: 'Status', render: (row) => (
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        row.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700' :
                        row.status === 'Delayed' || row.status === 'Customs Hold' ? 'bg-red-50 text-red-700' :
                        'bg-sky-50 text-sky-700'
                      }`}>
                        {row.status}
                      </span>
                    )},
                    { key: 'updated', header: 'Last Updated' }
                  ]}
                  data={recentShipmentsData}
                  keyExtractor={(row) => row.id}
                />
              </Card>

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
