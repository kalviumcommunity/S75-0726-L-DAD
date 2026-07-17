import PageHeader from '../../../components/common/PageHeader';

const ShipmentsPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader title="Shipments" subtitle="Monitor in-flight and scheduled cargo movements." />
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm text-slate-500">This placeholder page will host shipment tracking workflows when the feature is expanded.</p>
      </div>
    </div>
  );
};

export default ShipmentsPage;
