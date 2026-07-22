import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../../components/common/PageHeader';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Loader from '../../../components/common/Loader';
import EmptyState from '../../../components/common/EmptyState';
import { shipmentsApi, type TimelineItem } from '../../../services/api/shipments.service';

const ShipmentTimelinePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeline = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await shipmentsApi.getShipmentTimeline(id);
      setTimeline(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load shipment timeline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, [id]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'Shipment':
        return (
          <svg className="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
        );
      case 'Transfer':
        return (
          <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0-4-4m4 4-4 4M4 17h12m0 0-4-4m4 4-4 4" />
          </svg>
        );
      case 'Delay':
        return (
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M6.312 6.313a9 9 0 1 1 12.726 12.726M6.312 6.313A9 9 0 0 0 19.036 19.035M6.312 6.313 19.035 19.036" />
          </svg>
        );
      case 'Status':
        return (
          <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        );
      default:
        return (
          <svg className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title={`Shipment Timeline: ${id}`} subtitle="View shipment activity history" />
        <div className="flex items-center justify-center py-12">
          <Loader size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title={`Shipment Timeline: ${id}`} subtitle="View shipment activity history" />
        <Card className="p-8">
          <div className="text-center">
            <p className="text-lg font-semibold text-red-700">Error</p>
            <p className="mt-2 text-sm text-red-600">{error}</p>
            <Button variant="primary" size="md" className="mt-4" onClick={fetchTimeline}>
              Try again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title={`Shipment Timeline: ${id}`} 
        subtitle="View shipment activity history"
        action={
          <Button variant="secondary" size="sm" onClick={() => navigate('/shipments')}>
            Back to Shipments
          </Button>
        }
      />

      <Card className="p-6">
        {timeline.length === 0 ? (
          <EmptyState
            title="No timeline events"
            description="This shipment has no activity history yet."
          />
        ) : (
          <div className="relative">
            <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-slate-200"></div>
            <div className="space-y-8">
              {timeline.map((item, index) => (
                <div key={index} className="relative flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white border-4 border-slate-200">
                      {getEventIcon(item.type)}
                    </div>
                  </div>
                  <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-base font-semibold text-slate-900">
                        {item.type}: {item.event}
                      </h3>
                      <p className="text-xs font-medium text-slate-500">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {item.details && (
                      <div className="mt-2 space-y-1 text-sm text-slate-600">
                        {Object.entries(item.details).map(([key, value]) => (
                          <p key={key}>
                            <span className="font-medium text-slate-700">
                              {key.charAt(0).toUpperCase() + key.slice(1)}:
                            </span>{' '}
                            {Array.isArray(value) ? value.join(', ') : String(value)}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ShipmentTimelinePage;
