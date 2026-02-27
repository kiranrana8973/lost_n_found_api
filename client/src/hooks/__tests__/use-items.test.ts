import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import { useItems, useItem, useCreateItem, useDeleteItem, useUploadItemMedia } from "../use-items";
import { itemsService } from "@/services/items.service";

vi.mock("@/services/items.service", () => ({
  itemsService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    uploadPhoto: vi.fn(),
    uploadVideo: vi.fn(),
  },
}));

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children);
}

describe("useItems", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch items with filters", async () => {
    const mockData = {
      success: true,
      count: 1,
      total: 1,
      page: 1,
      pages: 1,
      data: [{ _id: "1", itemName: "Wallet" }],
    };
    vi.mocked(itemsService.getAll).mockResolvedValue({ data: mockData } as any);

    const { result } = renderHook(() => useItems({ page: 1, limit: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
  });
});

describe("useItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch a single item by id", async () => {
    const mockItem = { _id: "1", itemName: "Wallet" };
    vi.mocked(itemsService.getById).mockResolvedValue({
      data: { success: true, data: mockItem },
    } as any);

    const { result } = renderHook(() => useItem("1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockItem);
  });

  it("should not fetch when id is empty", () => {
    const { result } = renderHook(() => useItem(""), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useCreateItem", () => {
  it("should call itemsService.create on mutation", async () => {
    vi.mocked(itemsService.create).mockResolvedValue({ data: { success: true } } as any);

    const { result } = renderHook(() => useCreateItem(), {
      wrapper: createWrapper(),
    });

    const itemData = {
      itemName: "Wallet",
      description: "Brown wallet",
      type: "lost" as const,
      category: "cat1",
      location: "Library",
      media: "photo.jpg",
      mediaType: "photo" as const,
      reportedBy: "s1",
    };
    result.current.mutate(itemData);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(itemsService.create).toHaveBeenCalledWith(itemData, expect.anything());
  });
});

describe("useDeleteItem", () => {
  it("should call itemsService.delete on mutation", async () => {
    vi.mocked(itemsService.delete).mockResolvedValue({ data: { success: true } } as any);

    const { result } = renderHook(() => useDeleteItem(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("item1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(itemsService.delete).toHaveBeenCalledWith("item1", expect.anything());
  });
});

describe("useUploadItemMedia", () => {
  it("should upload photo for image files", async () => {
    vi.mocked(itemsService.uploadPhoto).mockResolvedValue({
      data: { success: true, data: "item_photos/photo.jpg" },
    } as any);

    const { result } = renderHook(() => useUploadItemMedia(), {
      wrapper: createWrapper(),
    });

    const file = new File(["content"], "photo.jpg", { type: "image/jpeg" });
    result.current.mutate(file);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({
      path: "item_photos/photo.jpg",
      mediaType: "photo",
    });
  });

  it("should upload video for video files", async () => {
    vi.mocked(itemsService.uploadVideo).mockResolvedValue({
      data: { success: true, data: "item_videos/video.mp4" },
    } as any);

    const { result } = renderHook(() => useUploadItemMedia(), {
      wrapper: createWrapper(),
    });

    const file = new File(["content"], "video.mp4", { type: "video/mp4" });
    result.current.mutate(file);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({
      path: "item_videos/video.mp4",
      mediaType: "video",
    });
  });
});
