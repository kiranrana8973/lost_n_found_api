import api from "@/lib/axios";
import type { ApiResponse, LoginResponse, Student } from "@/types";

export const authService = {
  register: (data: {
    name: string;
    email: string;
    username: string;
    password: string;
    phoneNumber: string;
    batchId: string;
    profilePicture?: string;
  }) => api.post<ApiResponse<Student>>("/students", data),

  login: (email: string, password: string) =>
    api.post<LoginResponse>("/students/login", { email, password }),

  logout: (refreshToken: string) =>
    api.post("/students/logout", { refreshToken }),

  getMe: () => api.get<ApiResponse<Student>>("/students/me"),

  updateStudent: (id: string, data: Record<string, unknown>) =>
    api.put<ApiResponse<Student>>(`/students/${id}`, data),

  uploadProfilePicture: (file: File) => {
    const formData = new FormData();
    formData.append("profilePicture", file);
    return api.post<ApiResponse<string>>("/students/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
