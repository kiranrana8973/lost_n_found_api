import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useToggleLike, useDeleteComment, useUpdateComment, useReplies, useCreateComment } from "@/hooks/use-comments";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { CommentForm } from "./comment-form";
import { Heart, MessageCircle, Pencil, Trash2, Loader2 } from "lucide-react";
import { STATIC_URL } from "@/lib/constants";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import type { Comment, Student } from "@/types";

interface CommentItemProps {
  comment: Comment;
  itemId: string;
}

export function CommentItem({ comment, itemId }: CommentItemProps) {
  const { user } = useAuth();
  const toggleLike = useToggleLike();
  const deleteComment = useDeleteComment();
  const updateComment = useUpdateComment();
  const createComment = useCreateComment();

  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);

  const { data: repliesData } = useReplies(comment._id, showReplies);

  const commenter = typeof comment.commentedBy === "object"
    ? (comment.commentedBy as Student)
    : null;

  const isOwner = user && commenter && user._id === commenter._id;
  const isLiked = user && comment.likes?.some((l) =>
    typeof l === "object" ? (l as Student)._id === user._id : l === user._id,
  );

  const handleLike = () => {
    if (!user) return;
    toggleLike.mutate(
      { commentId: comment._id, studentId: user._id },
      { onError: () => toast.error("Failed to toggle like") },
    );
  };

  const handleDelete = () => {
    deleteComment.mutate(comment._id, {
      onSuccess: () => toast.success("Comment deleted"),
      onError: () => toast.error("Failed to delete comment"),
    });
  };

  const handleEdit = async () => {
    if (!editText.trim()) return;
    updateComment.mutate(
      { id: comment._id, text: editText.trim() },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success("Comment updated");
        },
        onError: () => toast.error("Failed to update comment"),
      },
    );
  };

  const handleReply = async (text: string) => {
    if (!user) return;
    await createComment.mutateAsync({
      text,
      itemId,
      commentedBy: user._id,
      parentCommentId: comment._id,
    });
    setShowReplyForm(false);
    setShowReplies(true);
    toast.success("Reply added");
  };

  const profilePic = commenter?.profilePicture && commenter.profilePicture !== "default-profile.png"
    ? `${STATIC_URL}/profile_pictures/${commenter.profilePicture}`
    : undefined;

  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8 mt-0.5">
        <AvatarImage src={profilePic} />
        <AvatarFallback className="text-xs">
          {commenter?.name?.charAt(0)?.toUpperCase() || "?"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{commenter?.name || "Unknown"}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </span>
          {comment.isEdited && (
            <span className="text-xs text-muted-foreground">(edited)</span>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="min-h-[60px]"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleEdit} disabled={updateComment.isPending}>
                {updateComment.isPending && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm">{comment.text}</p>
        )}

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={handleLike}
          >
            <Heart
              className={`h-3 w-3 mr-1 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
            />
            {comment.likes?.length || 0}
          </Button>

          {!comment.isReply && user && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              Reply
            </Button>
          )}

          {isOwner && !isEditing && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => {
                  setEditText(comment.text);
                  setIsEditing(true);
                }}
              >
                <Pencil className="h-3 w-3" />
              </Button>
              <ConfirmDialog
                trigger={
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-destructive">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                }
                title="Delete comment?"
                description="This will permanently delete this comment and all its replies."
                onConfirm={handleDelete}
                confirmText="Delete"
                destructive
              />
            </>
          )}
        </div>

        {showReplyForm && (
          <div className="mt-2">
            <CommentForm
              onSubmit={handleReply}
              placeholder="Write a reply..."
              autoFocus
            />
          </div>
        )}

        {/* Replies */}
        {!comment.isReply && (comment.replyCount ?? 0) > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground"
            onClick={() => setShowReplies(!showReplies)}
          >
            {showReplies ? "Hide" : "View"} {comment.replyCount}{" "}
            {(comment.replyCount ?? 0) === 1 ? "reply" : "replies"}
          </Button>
        )}

        {showReplies && repliesData && (
          <div className="space-y-3 ml-2 mt-2 border-l-2 pl-3">
            {repliesData.data.map((reply) => (
              <CommentItem key={reply._id} comment={reply} itemId={itemId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
