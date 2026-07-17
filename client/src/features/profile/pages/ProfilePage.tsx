import PageHeader from '../../../components/common/PageHeader';

const ProfilePage = () => {
  return (
    <div className="space-y-6">
      <PageHeader title="Profile" subtitle="Manage account and preferences for your operations role." />
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm text-slate-500">This placeholder page will hold profile and account management views.</p>
      </div>
    </div>
  );
};

export default ProfilePage;
