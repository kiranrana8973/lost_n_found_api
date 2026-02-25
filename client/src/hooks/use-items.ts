import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { itemsService } from "@/services/items.service";
import type { ItemFilters } from "@/types";

export function useItems(filters: ItemFilters) {
  return useQuery({
    queryKey: ["items", filters],
    queryFn: () => itemsService.getAll(filters).then((r) => r.data),
  });
}

export function useItem(id: string) {
  return useQuery({
    queryKey: ["items", id],
    queryFn: () => itemsService.getById(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useCreateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: itemsService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["items"] }),
  });
}

export function useUpdateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      itemsService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["items"] }),
  });
}

export function useDeleteItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: itemsService.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["items"] }),
  });
}

export function useUploadItemMedia() {
  return useMutation({
    mutationFn: async (file: File) => {
      const isVideo = file.type.startsWith("video/");
      const res = isVideo
        ? await itemsService.uploadVideo(file)
        : await itemsService.uploadPhoto(file);
      return {
        path: res.data.data,
        mediaType: (isVideo ? "video" : "photo") as "photo" | "video",
      };
    },
  });
}
