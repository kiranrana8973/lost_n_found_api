import { describe, it, expect, vi, beforeEach } from "vitest";
import { authService } from "../auth.service";
import api from "@/lib/axios";

vi.mock("@/lib/axios", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
  },
}));

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("register", () => {
    it("should call POST /students with registration data", async () => {
      const data = {
        name: "John",
        email: "john@test.com",
        username: "johndoe",
        password: "password123",
        phoneNumber: "1234567890",
        batchId: "507f1f77bcf86cd799439011",
      };
      vi.mocked(api.post).mockResolvedValue({ data: { success: true, data } });

      await authService.register(data);
      expect(api.post).toHaveBeenCalledWith("/students", data);
    });
  });

  describe("login", () => {
    it("should call POST /students/login with credentials", async () => {
      vi.mocked(api.post).mockResolvedValue({
        data: { success: true, token: "jwt", refreshToken: "rt", data: {} },
      });

      await authService.login("john@test.com", "password123");
      expect(api.post).toHaveBeenCalledWith("/students/login", {
        email: "john@test.com",
        password: "password123",
      });
    });
  });

  describe("logout", () => {
    it("should call POST /students/logout with refresh token", async () => {
      vi.mocked(api.post).mockResolvedValue({ data: { success: true } });

      await authService.logout("my-refresh-token");
      expect(api.post).toHaveBeenCalledWith("/students/logout", {
        refreshToken: "my-refresh-token",
      });
    });
  });

  describe("getMe", () => {
    it("should call GET /students/me", async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: { success: true, data: { name: "John" } },
      });

      await authService.getMe();
      expect(api.get).toHaveBeenCalledWith("/students/me");
    });
  });

  describe("updateStudent", () => {
    it("should call PUT /students/:id with data", async () => {
      vi.mocked(api.put).mockResolvedValue({
        data: { success: true, data: {} },
      });

      await authService.updateStudent("123", { name: "Jane" });
      expect(api.put).toHaveBeenCalledWith("/students/123", { name: "Jane" });
    });
  });

  describe("uploadProfilePicture", () => {
    it("should call POST /students/upload with FormData", async () => {
      vi.mocked(api.post).mockResolvedValue({
        data: { success: true, data: "pic.jpg" },
      });

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
      await authService.uploadProfilePicture(file);

      expect(api.post).toHaveBeenCalledWith(
        "/students/upload",
        expect.any(FormData),
        { headers: { "Content-Type": "multipart/form-data" } },
      );
    });
  });
});
