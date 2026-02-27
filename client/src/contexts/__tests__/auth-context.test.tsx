import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "../auth-context";
import { authService } from "@/services/auth.service";

vi.mock("@/services/auth.service", () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    getMe: vi.fn(),
  },
}));

function TestComponent() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="loading">{String(isLoading)}</div>
      <div data-testid="authenticated">{String(isAuthenticated)}</div>
      <div data-testid="user">{user?.name ?? "none"}</div>
      <button onClick={() => login("test@test.com", "pass")} data-testid="login-btn">
        Login
      </button>
      <button onClick={() => logout()} data-testid="logout-btn">
        Logout
      </button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("should start unauthenticated when no token", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });
    expect(screen.getByTestId("authenticated").textContent).toBe("false");
    expect(screen.getByTestId("user").textContent).toBe("none");
  });

  it("should load user when token exists", async () => {
    localStorage.setItem("accessToken", "test-token");
    vi.mocked(authService.getMe).mockResolvedValue({
      data: { success: true, data: { _id: "1", name: "John" } },
    } as any);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("user").textContent).toBe("John");
    });
    expect(screen.getByTestId("authenticated").textContent).toBe("true");
  });

  it("should clear state when getMe fails", async () => {
    localStorage.setItem("accessToken", "bad-token");
    vi.mocked(authService.getMe).mockRejectedValue(new Error("Unauthorized"));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });
    expect(screen.getByTestId("authenticated").textContent).toBe("false");
    expect(localStorage.getItem("accessToken")).toBeNull();
  });

  it("should login successfully", async () => {
    vi.mocked(authService.login).mockResolvedValue({
      data: {
        success: true,
        token: "jwt-token",
        refreshToken: "refresh-token",
        data: { _id: "1", name: "John" },
      },
    } as any);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    await act(async () => {
      screen.getByTestId("login-btn").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("user").textContent).toBe("John");
    });
    expect(localStorage.getItem("accessToken")).toBe("jwt-token");
    expect(localStorage.getItem("refreshToken")).toBe("refresh-token");
  });

  it("should logout successfully", async () => {
    localStorage.setItem("accessToken", "test-token");
    localStorage.setItem("refreshToken", "test-refresh");
    vi.mocked(authService.getMe).mockResolvedValue({
      data: { success: true, data: { _id: "1", name: "John" } },
    } as any);
    vi.mocked(authService.logout).mockResolvedValue({} as any);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("user").textContent).toBe("John");
    });

    await act(async () => {
      screen.getByTestId("logout-btn").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("authenticated").textContent).toBe("false");
    });
    expect(localStorage.getItem("accessToken")).toBeNull();
  });

  it("should throw when useAuth is used outside AuthProvider", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow(
      "useAuth must be used within AuthProvider",
    );
    consoleError.mockRestore();
  });
});
