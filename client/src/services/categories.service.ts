import api from "@/lib/axios";
import type { ApiResponse, Category } from "@/types";

export const categoriesService = {
  getAll: () =>
    api.get<ApiResponse<Category[]>>("/categories"),

  create: (data: { name: string; description?: string }) =>
    api.post<ApiResponse<Category>>("/categories", data),
};
