import { useSearchParams, Link } from "react-router-dom";
import { useItems } from "@/hooks/use-items";
import { useCategories } from "@/hooks/use-categories";
import { useAuth } from "@/contexts/auth-context";
import { ItemCard } from "@/components/items/item-card";
import { Pagination } from "@/components/common/pagination";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

export default function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { data: categories } = useCategories();

  const filters = {
    page: Number(searchParams.get("page")) || 1,
    limit: DEFAULT_PAGE_SIZE,
    type: (searchParams.get("type") as "lost" | "found") || undefined,
    status: (searchParams.get("status") as "available" | "claimed" | "resolved") || undefined,
    category: searchParams.get("category") || undefined,
  };

  const { data, isLoading } = useItems(filters);

  const setFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    setSearchParams(params);
  };

  const setPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    setSearchParams(params);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Lost & Found Items</h1>
          <p className="text-sm text-muted-foreground">
            {data ? `${data.total} items` : "Browse lost and found items"}
          </p>
        </div>
        {isAuthenticated && (
          <Button asChild>
            <Link to="/items/new">
              <Plus className="h-4 w-4 mr-2" />
              Report Item
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Select
          value={filters.type || "all"}
          onValueChange={(v) => setFilter("type", v === "all" ? null : v)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
            <SelectItem value="found">Found</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.status || "all"}
          onValueChange={(v) => setFilter("status", v === "all" ? null : v)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="claimed">Claimed</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.category || "all"}
          onValueChange={(v) => setFilter("category", v === "all" ? null : v)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories
              ?.filter((c) => c.status === "active")
              .map((cat) => (
                <SelectItem key={cat._id} value={cat._id}>
                  {cat.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        {(filters.type || filters.status || filters.category) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchParams({})}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Items grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-video w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : data && data.data.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.data.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
          <Pagination page={data.page} pages={data.pages} onPageChange={setPage} />
        </>
      ) : (
        <EmptyState
          title="No items found"
          description="Try adjusting your filters or report a new item."
          action={
            isAuthenticated ? (
              <Button asChild>
                <Link to="/items/new">Report Item</Link>
              </Button>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
