type DelayedShipmentItem = {
  id: string;
  shipmentId: string;
  eta: string;
  reason: string;
  priority: 'High' | 'Medium';
};

type DelayedShipmentsListProps = {
  shipments: DelayedShipmentItem[];
};

const DelayedShipmentsList = ({ shipments }: DelayedShipmentsListProps) => {
  if (!shipments.length) {
    return <p className="text-sm text-slate-500">No delayed shipments right now.</p>;
  }

  return (
    <div className="space-y-3">
      {shipments.map((shipment) => (
        <div key={shipment.id} className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50/70 p-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">{shipment.shipmentId}</p>
            <p className="mt-1 text-sm text-slate-600">ETA {shipment.eta}</p>
          </div>
          <div className="text-right">
            <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${shipment.priority === 'High' ? 'bg-rose-600 text-white' : 'bg-amber-100 text-amber-700'}`}>
              {shipment.priority} priority
            </span>
            <p className="mt-2 text-xs text-slate-500">{shipment.reason}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DelayedShipmentsList;
export type { DelayedShipmentItem };
