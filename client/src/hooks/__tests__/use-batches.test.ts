import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import { useBatches } from "../use-batches";
import { batchesService } from "@/services/batches.service";

vi.mock("@/services/batches.service", () => ({
  batchesService: {
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

describe("useBatches", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch batches", async () => {
    const batches = [
      { _id: "1", batchName: "2024", status: "active" },
      { _id: "2", batchName: "2023", status: "completed" },
    ];
    vi.mocked(batchesService.getAll).mockResolvedValue({
      data: { success: true, data: batches },
    } as any);

    const { result } = renderHook(() => useBatches(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(batches);
  });
});
