
import httpClient from '../http/httpClient';

export interface OverviewData {
  totalShipments: number;
  delayedShipments: number;
  deliveredShipments: number;
  inTransitShipments: number;
  atWarehouseShipments: number;
  averageDeliveryTimeHours: number;
}

export interface StatusCountItem {
  label: string;
  count: number;
}

export interface DelayBreakdownItem {
  label: string;
  count: number;
}

export interface AverageDeliveryTime {
  averageDeliveryTimeHours: number;
  sampleSize: number;
}

export const dashboardApi = {
  getOverview: async (fromDate?: string, toDate?: string) => {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    
    const response = await httpClient.get<{ success: boolean; data: OverviewData }>(
      `/dashboard/overview${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data.data;
  },

  getStatusCounts: async (fromDate?: string, toDate?: string) => {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    
    const response = await httpClient.get<{ success: boolean; data: StatusCountItem[] }>(
      `/dashboard/status-counts${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data.data;
  },

  getDelayBreakdown: async (fromDate?: string, toDate?: string) => {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    
    const response = await httpClient.get<{ success: boolean; data: DelayBreakdownItem[] }>(
      `/dashboard/delay-breakdown${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data.data;
  },

  getAverageDeliveryTime: async (fromDate?: string, toDate?: string) => {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    
    const response = await httpClient.get<{ success: boolean; data: AverageDeliveryTime }>(
      `/dashboard/average-delivery-time${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data.data;
  },
};
