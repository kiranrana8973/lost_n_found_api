import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { commentsService } from "@/services/comments.service";

export function useComments(itemId: string, page = 1) {
  return useQuery({
    queryKey: ["comments", itemId, page],
    queryFn: () =>
      commentsService.getByItem(itemId, { page, limit: 10 }).then((r) => r.data),
    enabled: !!itemId,
  });
}

export function useReplies(commentId: string, enabled = false) {
  return useQuery({
    queryKey: ["replies", commentId],
    queryFn: () =>
      commentsService.getReplies(commentId, { limit: 50 }).then((r) => r.data),
    enabled,
  });
}

export function useCreateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: commentsService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comments"] }),
  });
}

export function useUpdateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      commentsService.update(id, text),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comments"] }),
  });
}

export function useDeleteComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: commentsService.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comments"] }),
  });
}

export function useToggleLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, studentId }: { commentId: string; studentId: string }) =>
      commentsService.toggleLike(commentId, studentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comments"] }),
  });
}
