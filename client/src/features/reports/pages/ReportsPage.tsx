import PageHeader from '../../../components/common/PageHeader';

const ReportsPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader title="Reports" subtitle="Access operational summaries and export-ready insights." />
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm text-slate-500">This placeholder page will host reporting and analytics views.</p>
      </div>
    </div>
  );
};

export default ReportsPage;
