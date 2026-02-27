import { describe, it, expect, vi, beforeEach } from "vitest";
import { itemsService } from "../items.service";
import api from "@/lib/axios";

vi.mock("@/lib/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("itemsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAll", () => {
    it("should call GET /items with filter params", async () => {
      vi.mocked(api.get).mockResolvedValue({ data: { success: true, data: [] } });

      const filters = { page: 1, limit: 10, type: "lost" as const };
      await itemsService.getAll(filters);
      expect(api.get).toHaveBeenCalledWith("/items", { params: filters });
    });
  });

  describe("getById", () => {
    it("should call GET /items/:id", async () => {
      vi.mocked(api.get).mockResolvedValue({ data: { success: true, data: {} } });

      await itemsService.getById("123");
      expect(api.get).toHaveBeenCalledWith("/items/123");
    });
  });

  describe("create", () => {
    it("should call POST /items with item data", async () => {
      vi.mocked(api.post).mockResolvedValue({ data: { success: true, data: {} } });

      const data = {
        itemName: "Wallet",
        description: "Brown wallet",
        type: "lost" as const,
        category: "cat1",
        location: "Library",
        media: "photo.jpg",
        mediaType: "photo" as const,
        reportedBy: "student1",
      };
      await itemsService.create(data);
      expect(api.post).toHaveBeenCalledWith("/items", data);
    });
  });

  describe("update", () => {
    it("should call PUT /items/:id with data", async () => {
      vi.mocked(api.put).mockResolvedValue({ data: { success: true, data: {} } });

      await itemsService.update("123", { itemName: "Updated" });
      expect(api.put).toHaveBeenCalledWith("/items/123", { itemName: "Updated" });
    });
  });

  describe("delete", () => {
    it("should call DELETE /items/:id", async () => {
      vi.mocked(api.delete).mockResolvedValue({ data: { success: true } });

      await itemsService.delete("123");
      expect(api.delete).toHaveBeenCalledWith("/items/123");
    });
  });

  describe("uploadPhoto", () => {
    it("should upload photo with FormData", async () => {
      vi.mocked(api.post).mockResolvedValue({ data: { success: true, data: "path.jpg" } });

      const file = new File(["content"], "photo.jpg", { type: "image/jpeg" });
      await itemsService.uploadPhoto(file);

      expect(api.post).toHaveBeenCalledWith(
        "/items/upload-photo",
        expect.any(FormData),
        { headers: { "Content-Type": "multipart/form-data" } },
      );
    });
  });

  describe("uploadVideo", () => {
    it("should upload video with FormData", async () => {
      vi.mocked(api.post).mockResolvedValue({ data: { success: true, data: "path.mp4" } });

      const file = new File(["content"], "video.mp4", { type: "video/mp4" });
      await itemsService.uploadVideo(file);

      expect(api.post).toHaveBeenCalledWith(
        "/items/upload-video",
        expect.any(FormData),
        { headers: { "Content-Type": "multipart/form-data" } },
      );
    });
  });
});
