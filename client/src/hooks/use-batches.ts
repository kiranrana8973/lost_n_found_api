import { useQuery } from "@tanstack/react-query";
import { batchesService } from "@/services/batches.service";

export function useBatches() {
  return useQuery({
    queryKey: ["batches"],
    queryFn: () => batchesService.getAll().then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  });
}
