import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useComments, useCreateComment } from "@/hooks/use-comments";
import { CommentItem } from "./comment-item";
import { CommentForm } from "./comment-form";
import { Pagination } from "@/components/common/pagination";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { Separator } from "@/components/ui/separator";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface CommentListProps {
  itemId: string;
}

export function CommentList({ itemId }: CommentListProps) {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useComments(itemId, page);
  const createComment = useCreateComment();

  const handleSubmit = async (text: string) => {
    if (!user) return;
    try {
      await createComment.mutateAsync({
        text,
        itemId,
        commentedBy: user._id,
      });
      toast.success("Comment added");
    } catch {
      toast.error("Failed to add comment");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5" />
        <h3 className="font-semibold">
          Comments {data ? `(${data.total})` : ""}
        </h3>
      </div>

      {user && (
        <>
          <CommentForm onSubmit={handleSubmit} />
          <Separator />
        </>
      )}

      {isLoading ? (
        <LoadingSpinner />
      ) : data && data.data.length > 0 ? (
        <div className="space-y-4">
          {data.data.map((comment) => (
            <CommentItem key={comment._id} comment={comment} itemId={itemId} />
          ))}
          <Pagination page={data.page} pages={data.pages} onPageChange={setPage} />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No comments yet. Be the first to comment!
        </p>
      )}
    </div>
  );
}
