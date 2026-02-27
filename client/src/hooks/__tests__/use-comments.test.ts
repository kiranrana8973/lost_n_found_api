import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import {
  useComments,
  useReplies,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
  useToggleLike,
} from "../use-comments";
import { commentsService } from "@/services/comments.service";

vi.mock("@/services/comments.service", () => ({
  commentsService: {
    getByItem: vi.fn(),
    getReplies: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    toggleLike: vi.fn(),
  },
}));

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children);
}

describe("useComments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch comments for an item", async () => {
    const mockData = {
      success: true,
      count: 1,
      total: 1,
      page: 1,
      pages: 1,
      data: [{ _id: "c1", text: "Nice!" }],
    };
    vi.mocked(commentsService.getByItem).mockResolvedValue({ data: mockData } as any);

    const { result } = renderHook(() => useComments("item1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
  });

  it("should not fetch when itemId is empty", () => {
    const { result } = renderHook(() => useComments(""), {
      wrapper: createWrapper(),
    });
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useReplies", () => {
  it("should not fetch when not enabled", () => {
    const { result } = renderHook(() => useReplies("c1", false), {
      wrapper: createWrapper(),
    });
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("should fetch replies when enabled", async () => {
    const mockData = { success: true, count: 1, total: 1, page: 1, pages: 1, data: [] };
    vi.mocked(commentsService.getReplies).mockResolvedValue({ data: mockData } as any);

    const { result } = renderHook(() => useReplies("c1", true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useCreateComment", () => {
  it("should create a comment", async () => {
    vi.mocked(commentsService.create).mockResolvedValue({ data: { success: true } } as any);

    const { result } = renderHook(() => useCreateComment(), {
      wrapper: createWrapper(),
    });

    const data = { text: "Great!", itemId: "item1", commentedBy: "s1" };
    result.current.mutate(data);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(commentsService.create).toHaveBeenCalledWith(data, expect.anything());
  });
});

describe("useUpdateComment", () => {
  it("should update a comment", async () => {
    vi.mocked(commentsService.update).mockResolvedValue({ data: { success: true } } as any);

    const { result } = renderHook(() => useUpdateComment(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: "c1", text: "Updated" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(commentsService.update).toHaveBeenCalledWith("c1", "Updated");
  });
});

describe("useDeleteComment", () => {
  it("should delete a comment", async () => {
    vi.mocked(commentsService.delete).mockResolvedValue({ data: { success: true } } as any);

    const { result } = renderHook(() => useDeleteComment(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("c1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(commentsService.delete).toHaveBeenCalledWith("c1", expect.anything());
  });
});

describe("useToggleLike", () => {
  it("should toggle like on a comment", async () => {
    vi.mocked(commentsService.toggleLike).mockResolvedValue({ data: { success: true } } as any);

    const { result } = renderHook(() => useToggleLike(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ commentId: "c1", studentId: "s1" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(commentsService.toggleLike).toHaveBeenCalledWith("c1", "s1");
  });
});
