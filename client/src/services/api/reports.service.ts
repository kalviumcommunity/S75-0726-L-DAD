import httpClient from '../http/httpClient';

export const reportsApi = {
  exportShipments: async (params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    
    const response = await httpClient.get(
      `/reports/shipments/csv${searchParams.toString() ? `?${searchParams.toString()}` : ''}`,
      { responseType: 'blob' }
    );
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'shipments-export.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  exportDelayReports: async (params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    
    const response = await httpClient.get(
      `/reports/delays/csv${searchParams.toString() ? `?${searchParams.toString()}` : ''}`,
      { responseType: 'blob' }
    );
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'delay-reports-export.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
