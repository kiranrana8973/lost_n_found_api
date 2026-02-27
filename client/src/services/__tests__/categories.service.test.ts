import { describe, it, expect, vi, beforeEach } from "vitest";
import { categoriesService } from "../categories.service";
import api from "@/lib/axios";

vi.mock("@/lib/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("categoriesService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAll", () => {
    it("should call GET /categories", async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: { success: true, data: [{ name: "Electronics" }] },
      });

      const result = await categoriesService.getAll();
      expect(api.get).toHaveBeenCalledWith("/categories");
      expect(result.data.data).toEqual([{ name: "Electronics" }]);
    });
  });

  describe("create", () => {
    it("should call POST /categories with data", async () => {
      vi.mocked(api.post).mockResolvedValue({
        data: { success: true, data: { name: "Books" } },
      });

      await categoriesService.create({ name: "Books", description: "Book items" });
      expect(api.post).toHaveBeenCalledWith("/categories", {
        name: "Books",
        description: "Book items",
      });
    });
  });
});
