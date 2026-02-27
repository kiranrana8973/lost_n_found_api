import { describe, it, expect, vi, beforeEach } from "vitest";
import { batchesService } from "../batches.service";
import api from "@/lib/axios";

vi.mock("@/lib/axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("batchesService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAll", () => {
    it("should call GET /batches", async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: { success: true, data: [{ batchName: "2024" }] },
      });

      const result = await batchesService.getAll();
      expect(api.get).toHaveBeenCalledWith("/batches");
      expect(result.data.data).toEqual([{ batchName: "2024" }]);
    });
  });
});
