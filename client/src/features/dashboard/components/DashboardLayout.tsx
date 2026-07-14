const stats = [
  { label: 'Total Shipments', value: '12,482', meta: '+2.1%' },
  { label: 'Active Shipments', value: '1,204', meta: 'In Transit' },
  { label: 'Delayed Shipments', value: '84', meta: 'Alert' },
  { label: 'On-Time Deliveries', value: '98.2%', meta: 'Target: 95%' }
];

const latestShipments = [
  { id: '#LX-90812', origin: 'Shanghai, CN', destination: 'Los Angeles, US', status: 'In Transit', delay: 'On Time' },
  { id: '#LX-90744', origin: 'Rotterdam, NL', destination: 'New York, US', status: 'Customs Hold', delay: '+4h Delay' },
  { id: '#LX-90112', origin: 'Hamburg, DE', destination: 'London, UK', status: 'Delayed', delay: '+24h Delay' },
  { id: '#LX-90820', origin: 'Mumbai, IN', destination: 'Dubai, AE', status: 'Delivered', delay: 'On Time' }
];

const alerts = [
  { title: 'Critical Delay', message: 'Shipment #LX-90112 stalled at Port of Singapore due to heavy congestion.', time: '28 min ago', variant: 'red' },
  { title: 'Weather Alert', message: 'North Atlantic routes experiencing 4-hour delays due to storm frontal system.', time: '45 min ago', variant: 'yellow' },
  { title: 'Route Update', message: 'Maintenance completed at Hub 4. Throughput returning to normal.', time: '2 hr ago', variant: 'blue' }
];

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1480px] gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="hidden w-72 flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-soft lg:flex">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">L-DAD</p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900">Logistics Analytics</h1>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center text-lg font-semibold">L</div>
          </div>
          <nav className="space-y-2 text-sm font-medium text-slate-600">
            {['Dashboard', 'Shipment Tracking', 'Data Integration', 'Route Performance', 'Reports', 'Settings'].map(item => (
              <a
                key={item}
                className={`block rounded-3xl px-4 py-3 transition ${item === 'Dashboard' ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-50 hover:text-slate-900'}`}
                href="#"
              >
                {item}
              </a>
            ))}
          </nav>
          <div className="mt-auto rounded-3xl bg-slate-50 p-5 text-slate-700">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">System Health</p>
            <p className="mt-3 text-lg font-semibold text-slate-900">Optimal</p>
          </div>
        </aside>

        <main className="flex-1">
          <div className="flex flex-col gap-6">
            <header className="flex flex-col gap-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Dashboard Overview</p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-900">Real-time logistics health and delay analysis.</h2>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button className="inline-flex items-center justify-center rounded-3xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">Last 30 Days</button>
                <button className="inline-flex items-center justify-center rounded-3xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">Export Data</button>
              </div>
            </header>

            <section className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-2">
                {stats.map((stat) => (
                  <article key={stat.label} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{stat.label}</p>
                    <p className="mt-4 text-3xl font-semibold text-slate-900">{stat.value}</p>
                    <p className="mt-3 text-sm text-slate-500">{stat.meta}</p>
                  </article>
                ))}
              </div>

              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Delay Alerts</p>
                    <p className="mt-2 text-sm text-slate-500">Actionable shipment alerts and route updates.</p>
                  </div>
                  <button className="text-sm font-semibold text-slate-900 hover:text-slate-700">View All Alerts</button>
                </div>
                <div className="mt-6 space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.title} className={`rounded-3xl border px-4 py-4 ${alert.variant === 'red' ? 'border-red-100 bg-red-50' : alert.variant === 'yellow' ? 'border-amber-100 bg-amber-50' : 'border-sky-100 bg-sky-50'}`}>
                      <p className="text-sm font-semibold text-slate-900">{alert.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{alert.message}</p>
                      <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">{alert.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid gap-5 xl:grid-cols-[1.5fr_0.7fr]">
              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Shipments Per Day</p>
                    <p className="mt-2 text-sm text-slate-500">View detailed stats</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 px-4 py-2 text-sm text-slate-700">Weekly</div>
                </div>
                <div className="mt-8 grid grid-cols-7 gap-3">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                    <div key={day} className="space-y-2 text-center">
                      <div className={`mx-auto h-28 w-12 rounded-3xl ${index === 2 ? 'bg-slate-900' : 'bg-slate-200'}`} />
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{day}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Delivery Status</p>
                <div className="mt-6 flex items-center justify-center">
                  <div className="relative h-48 w-48">
                    <div className="absolute inset-0 rounded-full bg-emerald-100" />
                    <div className="absolute inset-12 rounded-full bg-slate-50" />
                    <div className="absolute inset-16 rounded-full bg-white" />
                    <div className="absolute inset-0 flex items-center justify-center text-2xl font-semibold text-slate-900">1.2k</div>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  {[
                    { label: 'On Time', value: '75%', color: 'bg-emerald-400' },
                    { label: 'Minor Delay', value: '15%', color: 'bg-amber-400' },
                    { label: 'Critical', value: '10%', color: 'bg-red-400' }
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-3xl bg-slate-50 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className={`inline-block h-3 w-3 rounded-full ${item.color}`} />
                        <span className="text-sm font-semibold text-slate-900">{item.label}</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Recent Shipments</p>
                    <p className="mt-2 text-sm text-slate-500">Latest delivery progress at a glance.</p>
                  </div>
                </div>
                <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-slate-500">Shipment ID</th>
                        <th className="px-6 py-4 text-slate-500">Origin</th>
                        <th className="px-6 py-4 text-slate-500">Destination</th>
                        <th className="px-6 py-4 text-slate-500">Current Status</th>
                        <th className="px-6 py-4 text-slate-500">Delay Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {latestShipments.map((shipment) => (
                        <tr key={shipment.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-semibold text-slate-900">{shipment.id}</td>
                          <td className="px-6 py-4 text-slate-600">{shipment.origin}</td>
                          <td className="px-6 py-4 text-slate-600">{shipment.destination}</td>
                          <td className="px-6 py-4 text-slate-900">{shipment.status}</td>
                          <td className={`px-6 py-4 font-semibold ${shipment.delay.includes('Delay') ? 'text-amber-600' : 'text-emerald-600'}`}>{shipment.delay}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Shipment Insights</h3>
                <div className="mt-6 space-y-4">
                  <div className="rounded-3xl bg-slate-50 p-5">
                    <p className="text-sm font-semibold text-slate-900">Total Transit Time</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">18.2h</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-5">
                    <p className="text-sm font-semibold text-slate-900">Avg Delay Rate</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">7.4%</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
