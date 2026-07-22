
import httpClient from '../http/httpClient';

export interface Shipment {
  id: string;
  shipmentId: string;
  currentStatus: 'Dispatched' | 'In Transit' | 'At Warehouse' | 'Delayed' | 'Delivered';
  dispatchDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedShipments {
  data: Shipment[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface TimelineItem {
  type: string;
  event: string;
  timestamp: string;
  details?: Record<string, any>;
}

export const shipmentsApi = {
  createShipment: async (data: Partial<Shipment>) => {
    const response = await httpClient.post<{ success: boolean; data: Shipment }>('/shipments', data);
    return response.data.data;
  },

  getShipments: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.fromDate) searchParams.append('fromDate', params.fromDate);
    if (params?.toDate) searchParams.append('toDate', params.toDate);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);
    
    const response = await httpClient.get<{ success: boolean; data: Shipment[]; meta: PaginatedShipments['meta'] }>(
      `/shipments${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    );
    return { data: response.data.data, meta: response.data.meta };
  },

  getShipment: async (shipmentId: string) => {
    const response = await httpClient.get<{ success: boolean; data: Shipment }>(`/shipments/${shipmentId}`);
    return response.data.data;
  },

  updateShipment: async (shipmentId: string, data: Partial<Shipment>) => {
    const response = await httpClient.patch<{ success: boolean; data: Shipment }>(`/shipments/${shipmentId}`, data);
    return response.data.data;
  },

  deleteShipment: async (shipmentId: string) => {
    await httpClient.delete(`/shipments/${shipmentId}`);
  },

  getShipmentTimeline: async (shipmentId: string) => {
    const response = await httpClient.get<{ success: boolean; data: TimelineItem[] }>(`/shipments/${shipmentId}/timeline`);
    return response.data.data;
  },
};
