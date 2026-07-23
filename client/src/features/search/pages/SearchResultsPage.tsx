import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageHeader from '../../../components/common/PageHeader';
import Card from '../../../components/common/Card';
import EmptyState from '../../../components/common/EmptyState';
import Button from '../../../components/common/Button';
import { searchApi, type SearchResultItem } from '../../../services/api/search.service';

const sectionMeta = {
  shipments: { title: 'Shipments', emptyMessage: 'No shipments matched this search.' },
  transfers: { title: 'Warehouse Transfers', emptyMessage: 'No warehouse transfers matched this search.' },
  delayReports: { title: 'Delay Reports', emptyMessage: 'No delay reports matched this search.' },
};

function SearchResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState<{ shipments: SearchResultItem[]; transfers: SearchResultItem[]; delayReports: SearchResultItem[] }>({
    shipments: [],
    transfers: [],
    delayReports: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(() => new URLSearchParams(location.search).get('q') || '', [location.search]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setResults({ shipments: [], transfers: [], delayReports: [] });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await searchApi.globalSearch(query);
        setResults(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Unable to load search results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const sections = Object.entries(sectionMeta).map(([key, meta]) => ({
    key,
    title: meta.title,
    items: results[key as keyof typeof results] as SearchResultItem[],
    emptyMessage: meta.emptyMessage,
  }));

  const handleResultClick = (item: SearchResultItem) => {
    if (item.type === 'Shipment') {
      navigate(`/shipments/${item.value.shipmentId || item.id}/timeline`);
      return;
    }

    if (item.type === 'Warehouse Transfer') {
      navigate('/warehouse-transfers');
      return;
    }

    navigate('/delay-reports');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Global Search" subtitle={query ? `Showing matches for “${query}”` : 'Search shipments, transfers, and delay reports.'} />

      {!query ? (
        <Card>
          <EmptyState title="Search across logistics records" description="Enter a shipment ID, warehouse name, or delay reason to find related records." />
        </Card>
      ) : loading ? (
        <Card>
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-32 rounded bg-slate-200" />
            <div className="h-10 rounded bg-slate-100" />
            <div className="h-10 rounded bg-slate-100" />
          </div>
        </Card>
      ) : error ? (
        <Card>
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {sections.map((section) => (
            <Card key={section.title} title={section.title}>
              {section.items.length === 0 ? (
                <EmptyState title={`No ${section.title.toLowerCase()} found`} description={section.emptyMessage} />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {section.items.map((item) => (
                    <li key={item.id} className="flex items-start justify-between gap-4 py-3">
                      <button onClick={() => handleResultClick(item)} className="text-left">
                        <p className="font-semibold text-slate-900">{item.label}</p>
                        <p className="text-sm text-slate-500">{item.subtitle}</p>
                      </button>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                        {item.type}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          ))}

          <div className="flex justify-end">
            <Button variant="secondary" size="md" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchResultsPage;
