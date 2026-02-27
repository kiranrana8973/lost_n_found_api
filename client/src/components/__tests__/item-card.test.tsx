import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ItemCard } from "../items/item-card";
import type { Item } from "@/types";

const mockItem: Item = {
  _id: "item1",
  itemName: "Lost Wallet",
  description: "Brown leather wallet found near library",
  type: "lost",
  category: { _id: "cat1", name: "Accessories", status: "active", createdAt: "2024-01-01" },
  location: "Main Library",
  media: "item_photos/wallet.jpg",
  mediaType: "photo",
  reportedBy: {
    _id: "s1",
    name: "John Doe",
    email: "john@test.com",
    username: "johndoe",
    phoneNumber: "123",
    batchId: "b1",
    profilePicture: "default.png",
    createdAt: "2024-01-01",
  },
  claimedBy: null,
  isClaimed: false,
  status: "available",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("ItemCard", () => {
  it("should render item name", () => {
    render(
      <MemoryRouter>
        <ItemCard item={mockItem} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Lost Wallet")).toBeInTheDocument();
  });

  it("should render item description", () => {
    render(
      <MemoryRouter>
        <ItemCard item={mockItem} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Brown leather wallet found near library")).toBeInTheDocument();
  });

  it("should render Lost badge for lost items", () => {
    render(
      <MemoryRouter>
        <ItemCard item={mockItem} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Lost")).toBeInTheDocument();
  });

  it("should render Found badge for found items", () => {
    const foundItem = { ...mockItem, type: "found" as const };
    render(
      <MemoryRouter>
        <ItemCard item={foundItem} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Found")).toBeInTheDocument();
  });

  it("should render category name", () => {
    render(
      <MemoryRouter>
        <ItemCard item={mockItem} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Accessories")).toBeInTheDocument();
  });

  it("should render location", () => {
    render(
      <MemoryRouter>
        <ItemCard item={mockItem} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Main Library")).toBeInTheDocument();
  });

  it("should render reporter name", () => {
    render(
      <MemoryRouter>
        <ItemCard item={mockItem} />
      </MemoryRouter>,
    );
    expect(screen.getByText("by John Doe")).toBeInTheDocument();
  });

  it("should render status badge", () => {
    render(
      <MemoryRouter>
        <ItemCard item={mockItem} />
      </MemoryRouter>,
    );
    expect(screen.getByText("available")).toBeInTheDocument();
  });

  it("should link to item detail page", () => {
    render(
      <MemoryRouter>
        <ItemCard item={mockItem} />
      </MemoryRouter>,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/items/item1");
  });

  it("should render image for photo items", () => {
    render(
      <MemoryRouter>
        <ItemCard item={mockItem} />
      </MemoryRouter>,
    );
    const img = screen.getByAltText("Lost Wallet");
    expect(img).toBeInTheDocument();
  });

  it("should render video for video items", () => {
    const videoItem = { ...mockItem, mediaType: "video" as const, media: "item_videos/vid.mp4" };
    render(
      <MemoryRouter>
        <ItemCard item={videoItem} />
      </MemoryRouter>,
    );
    const video = document.querySelector("video");
    expect(video).toBeInTheDocument();
  });
});
