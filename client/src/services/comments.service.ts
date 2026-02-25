import api from "@/lib/axios";
import type { ApiResponse, Comment, PaginatedResponse } from "@/types";

export const commentsService = {
  getByItem: (
    itemId: string,
    params?: { page?: number; limit?: number; includeReplies?: string },
  ) =>
    api.get<PaginatedResponse<Comment>>(`/comments/item/${itemId}`, { params }),

  getReplies: (
    commentId: string,
    params?: { page?: number; limit?: number },
  ) =>
    api.get<PaginatedResponse<Comment>>(`/comments/${commentId}/replies`, {
      params,
    }),

  create: (data: {
    text: string;
    itemId: string;
    commentedBy: string;
    parentCommentId?: string;
  }) => api.post<ApiResponse<Comment>>("/comments", data),

  update: (id: string, text: string) =>
    api.put<ApiResponse<Comment>>(`/comments/${id}`, { text }),

  delete: (id: string) => api.delete(`/comments/${id}`),

  toggleLike: (id: string, studentId: string) =>
    api.post<ApiResponse<Comment>>(`/comments/${id}/like`, { studentId }),
};
