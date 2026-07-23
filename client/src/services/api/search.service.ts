import httpClient from '../http/httpClient';

export interface SearchResultItem {
  id: string;
  type: string;
  label: string;
  subtitle: string;
  value: Record<string, any>;
}

export interface GlobalSearchResponse {
  shipments: SearchResultItem[];
  transfers: SearchResultItem[];
  delayReports: SearchResultItem[];
}

export const searchApi = {
  globalSearch: async (term: string) => {
    const response = await httpClient.get<{ success: boolean; data: GlobalSearchResponse }>(`/search?q=${encodeURIComponent(term)}&limit=6`);
    return response.data.data;
  },
};
