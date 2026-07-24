
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

export interface MonthlyShipmentTrendItem {
  month: string;
  shipmentCount: number;
  deliveredCount: number;
  delayedCount: number;
}

export interface RoutePerformanceItem {
  origin: string;
  destination: string;
  route: string;
  shipmentCount: number;
  deliveredShipments: number;
  delayedShipments: number;
  onTimeDeliveries: number;
  onTimeRate: number;
  averageDeliveryHours: number;
}

export interface WarehouseShipmentCountItem {
  warehouse: string;
  shipmentCount: number;
}

export interface DelayTrendItem {
  month: string;
  delayCount: number;
}

export interface AnalyticsData {
  monthlyShipmentTrends: MonthlyShipmentTrendItem[];
  deliveryPerformanceByRoute: RoutePerformanceItem[];
  warehouseShipmentCounts: WarehouseShipmentCountItem[];
  delayTrends: DelayTrendItem[];
}

const buildAnalyticsParams = (fromDate?: string, toDate?: string, routeLimit?: number, warehouseLimit?: number) => {
  const params = new URLSearchParams();

  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  if (routeLimit != null) params.append('routeLimit', String(routeLimit));
  if (warehouseLimit != null) params.append('warehouseLimit', String(warehouseLimit));

  return params;
};

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

  getAnalytics: async (fromDate?: string, toDate?: string) => {
    const params = buildAnalyticsParams(fromDate, toDate);

    const response = await httpClient.get<{ success: boolean; data: AnalyticsData }>(
      `/dashboard/analytics${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data.data;
  },

  getMonthlyShipmentTrends: async (fromDate?: string, toDate?: string) => {
    const params = buildAnalyticsParams(fromDate, toDate);

    const response = await httpClient.get<{ success: boolean; data: MonthlyShipmentTrendItem[] }>(
      `/dashboard/analytics/monthly-trends${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data.data;
  },

  getDeliveryPerformanceByRoute: async (fromDate?: string, toDate?: string, routeLimit = 8) => {
    const params = buildAnalyticsParams(fromDate, toDate, routeLimit);

    const response = await httpClient.get<{ success: boolean; data: RoutePerformanceItem[] }>(
      `/dashboard/analytics/route-performance${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data.data;
  },

  getWarehouseShipmentCounts: async (fromDate?: string, toDate?: string, warehouseLimit = 8) => {
    const params = buildAnalyticsParams(fromDate, toDate, undefined, warehouseLimit);

    const response = await httpClient.get<{ success: boolean; data: WarehouseShipmentCountItem[] }>(
      `/dashboard/analytics/warehouse-counts${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data.data;
  },

  getDelayTrends: async (fromDate?: string, toDate?: string) => {
    const params = buildAnalyticsParams(fromDate, toDate);

    const response = await httpClient.get<{ success: boolean; data: DelayTrendItem[] }>(
      `/dashboard/analytics/delay-trends${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data.data;
  },
};
