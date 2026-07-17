import PageHeader from '../../../components/common/PageHeader';

const DelayReportsPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader title="Delay Reports" subtitle="Review delays, root causes, and exceptions." />
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm text-slate-500">This placeholder page will support delay reporting workflows.</p>
      </div>
    </div>
  );
};

export default DelayReportsPage;
