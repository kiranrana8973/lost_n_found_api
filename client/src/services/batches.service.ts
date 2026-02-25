import api from "@/lib/axios";
import type { ApiResponse, Batch } from "@/types";

export const batchesService = {
  getAll: () =>
    api.get<ApiResponse<Batch[]>>("/batches"),
};
