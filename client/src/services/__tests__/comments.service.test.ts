import { describe, it, expect, vi, beforeEach } from "vitest";
import { commentsService } from "../comments.service";
import api from "@/lib/axios";

vi.mock("@/lib/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("commentsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getByItem", () => {
    it("should call GET /comments/item/:itemId with params", async () => {
      vi.mocked(api.get).mockResolvedValue({ data: { success: true, data: [] } });

      await commentsService.getByItem("item1", { page: 1, limit: 10 });
      expect(api.get).toHaveBeenCalledWith("/comments/item/item1", {
        params: { page: 1, limit: 10 },
      });
    });
  });

  describe("getReplies", () => {
    it("should call GET /comments/:id/replies with params", async () => {
      vi.mocked(api.get).mockResolvedValue({ data: { success: true, data: [] } });

      await commentsService.getReplies("comment1", { limit: 50 });
      expect(api.get).toHaveBeenCalledWith("/comments/comment1/replies", {
        params: { limit: 50 },
      });
    });
  });

  describe("create", () => {
    it("should call POST /comments with data", async () => {
      vi.mocked(api.post).mockResolvedValue({ data: { success: true, data: {} } });

      const data = {
        text: "Nice find!",
        itemId: "item1",
        commentedBy: "student1",
      };
      await commentsService.create(data);
      expect(api.post).toHaveBeenCalledWith("/comments", data);
    });

    it("should handle reply with parentCommentId", async () => {
      vi.mocked(api.post).mockResolvedValue({ data: { success: true, data: {} } });

      const data = {
        text: "Reply",
        itemId: "item1",
        commentedBy: "student1",
        parentCommentId: "parent1",
      };
      await commentsService.create(data);
      expect(api.post).toHaveBeenCalledWith("/comments", data);
    });
  });

  describe("update", () => {
    it("should call PUT /comments/:id with text", async () => {
      vi.mocked(api.put).mockResolvedValue({ data: { success: true, data: {} } });

      await commentsService.update("comment1", "Updated text");
      expect(api.put).toHaveBeenCalledWith("/comments/comment1", {
        text: "Updated text",
      });
    });
  });

  describe("delete", () => {
    it("should call DELETE /comments/:id", async () => {
      vi.mocked(api.delete).mockResolvedValue({ data: { success: true } });

      await commentsService.delete("comment1");
      expect(api.delete).toHaveBeenCalledWith("/comments/comment1");
    });
  });

  describe("toggleLike", () => {
    it("should call POST /comments/:id/like with studentId", async () => {
      vi.mocked(api.post).mockResolvedValue({ data: { success: true, data: {} } });

      await commentsService.toggleLike("comment1", "student1");
      expect(api.post).toHaveBeenCalledWith("/comments/comment1/like", {
        studentId: "student1",
      });
    });
  });
});
