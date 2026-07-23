import { useEffect, useState } from 'react';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import EmptyState from '../../../components/common/EmptyState';
import Modal from '../../../components/common/Modal';
import PageHeader from '../../../components/common/PageHeader';
import SearchInput from '../../../components/common/SearchInput';
import Table from '../../../components/common/Table';
import { usersApi, type ManagedUser, type UsersMeta } from '../../../services/api/users.service';

const roles = ['Manager', 'Analyst', 'Coordinator'] as const;
type UserForm = Pick<ManagedUser, 'fullName' | 'email' | 'role'>;

const UserManagementPage = () => {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [meta, setMeta] = useState<UsersMeta | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<ManagedUser | null>(null);
  const [form, setForm] = useState<UserForm>({ fullName: '', email: '', role: 'Coordinator' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      setLoading(true); setError(null);
      try {
        const result = await usersApi.getUsers({ page, limit: 20, search: search || undefined, role: role || undefined });
        setUsers(result.data); setMeta(result.meta);
      } catch (requestError: any) { setError(requestError.response?.data?.message || 'Unable to load users'); }
      finally { setLoading(false); }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [page, search, role]);

  const openEdit = (user: ManagedUser) => {
    setEditing(user);
    setForm({ fullName: user.fullName, email: user.email, role: user.role });
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true); setError(null);
    try {
      const updated = await usersApi.updateUser(editing._id, form);
      setUsers((current) => current.map((user) => user._id === updated._id ? updated : user));
      setEditing(null);
    } catch (requestError: any) { setError(requestError.response?.data?.message || 'Unable to update user'); }
    finally { setSaving(false); }
  };

  const toggleStatus = async (user: ManagedUser) => {
    setError(null);
    try {
      const updated = await usersApi.updateStatus(user._id, !user.isActive);
      setUsers((current) => current.map((item) => item._id === updated._id ? updated : item));
    } catch (requestError: any) { setError(requestError.response?.data?.message || 'Unable to update user status'); }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="User Management" subtitle="Manage user profiles, roles, and account access." />
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <SearchInput value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Search by name or email" className="w-full sm:max-w-md" />
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Role
            <select value={role} onChange={(event) => { setRole(event.target.value); setPage(1); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
              <option value="">All roles</option>
              {roles.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>
      </Card>
      <Card title="Users" subtitle={meta ? `${meta.totalItems} user${meta.totalItems === 1 ? '' : 's'} found` : 'Loading users'}>
        {error && <p className="mb-4 px-4 text-sm text-red-600">{error}</p>}
        {loading ? <p className="p-4 text-sm text-slate-500">Loading users…</p> : <Table
          data={users}
          keyExtractor={(user) => user._id}
          emptyState={<EmptyState title="No users found" description="Try a different search term or role filter." />}
          columns={[
            { key: 'fullName', header: 'User', render: (user) => <div><p className="font-medium text-slate-900">{user.fullName}</p><p className="text-xs text-slate-500">{user.email}</p></div> },
            { key: 'role', header: 'Role', render: (user) => <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{user.role}</span> },
            { key: 'isActive', header: 'Status', render: (user) => <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{user.isActive ? 'Active' : 'Inactive'}</span> },
            { key: 'createdAt', header: 'Created', render: (user) => new Date(user.createdAt).toLocaleDateString() },
            { key: 'actions', header: 'Actions', render: (user) => <div className="flex gap-2"><Button size="sm" variant="secondary" onClick={() => openEdit(user)}>Edit</Button><Button size="sm" variant={user.isActive ? 'ghost' : 'primary'} onClick={() => toggleStatus(user)}>{user.isActive ? 'Deactivate' : 'Activate'}</Button></div> },
          ]}
        />}
        {meta && meta.totalPages > 1 && <div className="mt-6 flex items-center justify-between px-4"><p className="text-sm text-slate-600">Page {meta.page} of {meta.totalPages}</p><div className="flex gap-2"><Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button><Button variant="secondary" size="sm" disabled={page === meta.totalPages} onClick={() => setPage(page + 1)}>Next</Button></div></div>}
      </Card>
      <Modal isOpen={Boolean(editing)} onClose={() => setEditing(null)} title="Edit user" footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={saveEdit} loading={saving}>Save changes</Button></>}>
        <div className="space-y-4">
          <label className="block font-medium text-slate-700">Full name<input value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" /></label>
          <label className="block font-medium text-slate-700">Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" /></label>
          <label className="block font-medium text-slate-700">Role<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as ManagedUser['role'] })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2">{roles.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
