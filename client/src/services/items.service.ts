import api from "@/lib/axios";
import type { ApiResponse, Item, ItemFilters, PaginatedResponse } from "@/types";

export const itemsService = {
  getAll: (params: ItemFilters) =>
    api.get<PaginatedResponse<Item>>("/items", { params }),

  getById: (id: string) => api.get<ApiResponse<Item>>(`/items/${id}`),

  create: (data: {
    itemName: string;
    description: string;
    type: "lost" | "found";
    category: string;
    location: string;
    media: string;
    mediaType: "photo" | "video";
    reportedBy: string;
  }) => api.post<ApiResponse<Item>>("/items", data),

  update: (id: string, data: Record<string, unknown>) =>
    api.put<ApiResponse<Item>>(`/items/${id}`, data),

  delete: (id: string) => api.delete(`/items/${id}`),

  uploadPhoto: (file: File) => {
    const formData = new FormData();
    formData.append("itemPhoto", file);
    return api.post<ApiResponse<string>>("/items/upload-photo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadVideo: (file: File) => {
    const formData = new FormData();
    formData.append("itemVideo", file);
    return api.post<ApiResponse<string>>("/items/upload-video", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
