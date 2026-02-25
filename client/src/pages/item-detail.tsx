import { useParams, useNavigate, Link } from "react-router-dom";
import { useItem, useDeleteItem } from "@/hooks/use-items";
import { useAuth } from "@/contexts/auth-context";
import { MediaDisplay } from "@/components/common/media-display";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { CommentList } from "@/components/comments/comment-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Clock, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { STATIC_URL } from "@/lib/constants";
import { toast } from "sonner";
import type { Category, Student } from "@/types";

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: item, isLoading } = useItem(id!);
  const deleteItem = useDeleteItem();

  if (isLoading) return <LoadingSpinner className="min-h-[50vh]" />;
  if (!item) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-semibold">Item not found</h2>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const category = typeof item.category === "object" ? (item.category as Category) : null;
  const reporter = typeof item.reportedBy === "object" ? (item.reportedBy as Student) : null;
  const isOwner = user && reporter && user._id === reporter._id;

  const reporterPic =
    reporter?.profilePicture && reporter.profilePicture !== "default-profile.png"
      ? `${STATIC_URL}/profile_pictures/${reporter.profilePicture}`
      : undefined;

  const handleDelete = () => {
    deleteItem.mutate(item._id, {
      onSuccess: () => {
        toast.success("Item deleted");
        navigate("/");
      },
      onError: () => toast.error("Failed to delete item"),
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Media */}
        <div>
          <MediaDisplay
            media={item.media}
            mediaType={item.mediaType}
            alt={item.itemName}
            className="aspect-square md:aspect-auto md:max-h-[500px]"
          />
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">{item.itemName}</h1>
              <div className="flex items-center gap-2">
                <Badge
                  variant={item.type === "lost" ? "destructive" : "default"}
                  className={item.type === "found" ? "bg-green-600" : ""}
                >
                  {item.type === "lost" ? "Lost" : "Found"}
                </Badge>
                <Badge variant="secondary">{item.status}</Badge>
                {category && <Badge variant="outline">{category.name}</Badge>}
              </div>
            </div>
            {isOwner && (
              <div className="flex gap-1">
                <Button variant="outline" size="icon" asChild>
                  <Link to={`/items/${item._id}/edit`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
                <ConfirmDialog
                  trigger={
                    <Button variant="outline" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  }
                  title="Delete item?"
                  description="This will permanently delete this item and all its comments."
                  onConfirm={handleDelete}
                  confirmText="Delete"
                  destructive
                />
              </div>
            )}
          </div>

          <p className="text-muted-foreground">{item.description}</p>

          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{item.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  Reported{" "}
                  {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  {" "}({format(new Date(item.createdAt), "PPP")})
                </span>
              </div>
            </CardContent>
          </Card>

          {reporter && (
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <Avatar className="h-10 w-10">
                <AvatarImage src={reporterPic} />
                <AvatarFallback>
                  {reporter.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{reporter.name}</p>
                <p className="text-xs text-muted-foreground">@{reporter.username}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Separator className="my-8" />

      {/* Comments */}
      <CommentList itemId={item._id} />
    </div>
  );
}
