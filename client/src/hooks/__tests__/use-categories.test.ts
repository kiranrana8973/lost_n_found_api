import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import { useCategories } from "../use-categories";
import { categoriesService } from "@/services/categories.service";

vi.mock("@/services/categories.service", () => ({
  categoriesService: {
    getAll: vi.fn(),
  },
}));

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children);
}

describe("useCategories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch categories", async () => {
    const categories = [
      { _id: "1", name: "Electronics", status: "active" },
      { _id: "2", name: "Books", status: "active" },
    ];
    vi.mocked(categoriesService.getAll).mockResolvedValue({
      data: { success: true, data: categories },
    } as any);

    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(categories);
  });
});
