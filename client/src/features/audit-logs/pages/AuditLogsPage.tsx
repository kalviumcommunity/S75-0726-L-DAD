import { useEffect, useState } from 'react';
import Card from '../../../components/common/Card';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import Table from '../../../components/common/Table';
import Button from '../../../components/common/Button';
import { auditLogsApi, type AuditLog, type AuditLogMeta } from '../../../services/api/audit-logs.service';

const actionOptions = ['', 'Login', 'Shipment Created', 'Shipment Updated', 'Transfer Added', 'Delay Report Added'];

const formatAction = (action: string) => action;

const AuditLogsPage = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [meta, setMeta] = useState<AuditLogMeta | null>(null);
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    auditLogsApi.getAuditLogs({ page, limit: 20, action: action || undefined, sortBy: 'createdAt', sortOrder })
      .then((response) => {
        if (!active) return;
        setLogs(response.data);
        setMeta(response.meta);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || 'Unable to load audit logs');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page, action, sortOrder]);

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" subtitle="Trace user activity across the logistics platform." />
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Activity type
            <select value={action} onChange={(event) => { setAction(event.target.value); setPage(1); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
              {actionOptions.map((option) => <option key={option || 'all'} value={option}>{option || 'All activities'}</option>)}
            </select>
          </label>
          <Button variant="secondary" size="sm" onClick={() => { setSortOrder((current) => current === 'desc' ? 'asc' : 'desc'); setPage(1); }}>
            {sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}
          </Button>
        </div>
      </Card>
      <Card title="Activity history" subtitle={meta ? `${meta.totalItems} recorded events` : 'Loading activity history'}>
        {error ? <p className="p-4 text-sm text-red-600">{error}</p> : loading ? <p className="p-4 text-sm text-slate-500">Loading audit logs…</p> : (
          <Table
            data={logs}
            keyExtractor={(log) => log._id}
            emptyState={<EmptyState title="No audit logs found" description="No activity matches the current filter." />}
            columns={[
              { key: 'createdAt', header: 'Date & time', render: (log) => new Date(log.createdAt).toLocaleString() },
              { key: 'user', header: 'User', render: (log) => <div><p className="font-medium text-slate-900">{log.user?.fullName || 'Unknown user'}</p><p className="text-xs text-slate-500">{log.user?.email || '—'}</p></div> },
              { key: 'action', header: 'Activity', render: (log) => <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{formatAction(log.action)}</span> },
              { key: 'entityType', header: 'Record', render: (log) => log.entityType ? `${log.entityType}${log.metadata.shipmentId ? ` · ${String(log.metadata.shipmentId)}` : ''}` : '—' },
            ]}
          />
        )}
        {meta && meta.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between px-4">
            <p className="text-sm text-slate-600">Page {meta.page} of {meta.totalPages}</p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
              <Button variant="secondary" size="sm" disabled={page === meta.totalPages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AuditLogsPage;
