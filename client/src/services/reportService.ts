const API_URL = "/api/reports";

export interface Report {
  _id: string;
  userId: string;
  title: string;
  description: string;
  status: "pending" | "accepted" | "resolved";
  coordinates: {
    latitude: number;
    longitude: number;
    altitude: number;
  };
  createdAt: string;
  updatedAt: string;
}

export const reportService = {
  getReports: async (latitude?: number, longitude?: number, radius?: number): Promise<Report[]> => {
    let url = API_URL;
    if (latitude !== undefined && longitude !== undefined && radius !== undefined) {
      url += `?latitude=${latitude}&longitude=${longitude}&radius=${radius}`;
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch reports");
    return response.json();
  },

  getReportById: async (reportId: string): Promise<Report> => {
    const response = await fetch(`${API_URL}/${reportId}`);
    if (!response.ok) throw new Error("Failed to fetch report");
    return response.json();
  },

  getMyReports: async (token: string): Promise<Report[]> => {
    const response = await fetch(`${API_URL}/my`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Failed to fetch your reports");
    return response.json();
  },

  createReport: async (token: string, reportData: any): Promise<Report> => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(reportData),
    });
    if (!response.ok) throw new Error("Failed to create report");
    return response.json();
  },

  updateReport: async (token: string, reportId: string, reportData: any): Promise<Report> => {
    const response = await fetch(`${API_URL}/${reportId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(reportData),
    });
    if (!response.ok) throw new Error("Failed to update report");
    return response.json();
  },

  deleteReport: async (token: string, reportId: string): Promise<void> => {
    const response = await fetch(`${API_URL}/${reportId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Failed to delete report");
  },

  updateReportStatus: async (token: string, reportId: string, status: string): Promise<Report> => {
    const response = await fetch(`${API_URL}/${reportId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update status");
    }
    return response.json();
  },
};
