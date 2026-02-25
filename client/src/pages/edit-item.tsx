import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/auth-context";
import { useCategories } from "@/hooks/use-categories";
import { useItem, useUpdateItem, useUploadItemMedia } from "@/hooks/use-items";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/common/file-upload";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { IMAGE_ACCEPT, VIDEO_ACCEPT, MAX_VIDEO_SIZE, STATIC_URL } from "@/lib/constants";
import type { Category, Student } from "@/types";

const editSchema = z.object({
  itemName: z.string().min(1, "Item name is required"),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["lost", "found"]),
  category: z.string().min(1, "Select a category"),
  location: z.string().min(1, "Location is required").max(200),
  status: z.enum(["available", "claimed", "resolved"]),
});

type EditForm = z.infer<typeof editSchema>;

export default function EditItemPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: item, isLoading } = useItem(id!);
  const { data: categories } = useCategories();
  const updateItem = useUpdateItem();
  const uploadMedia = useUploadItemMedia();
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EditForm>({
    resolver: zodResolver(editSchema),
  });

  useEffect(() => {
    if (item) {
      const catId = typeof item.category === "object" ? (item.category as Category)._id : (item.category as string);
      reset({
        itemName: item.itemName,
        description: item.description,
        type: item.type,
        category: catId,
        location: item.location,
        status: item.status,
      });
    }
  }, [item, reset]);

  if (isLoading) return <LoadingSpinner className="min-h-[50vh]" />;

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-semibold">Item not found</h2>
      </div>
    );
  }

  const reporter = typeof item.reportedBy === "object" ? (item.reportedBy as Student) : null;
  if (user && reporter && user._id !== reporter._id) {
    navigate("/");
    return null;
  }

  const existingPreview =
    item.mediaType === "photo"
      ? `${STATIC_URL}/${item.media}`
      : undefined;

  const onSubmit = async (data: EditForm) => {
    setIsSubmitting(true);
    try {
      let media = item.media;
      let mediaType = item.mediaType;

      if (mediaFile) {
        const result = await uploadMedia.mutateAsync(mediaFile);
        media = result.path;
        mediaType = result.mediaType;
      }

      await updateItem.mutateAsync({
        id: item._id,
        data: { ...data, media, mediaType },
      });

      toast.success("Item updated successfully");
      navigate(`/items/${item._id}`);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to update item";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Edit Item</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Photo or Video</Label>
              <FileUpload
                accept={`${IMAGE_ACCEPT},${VIDEO_ACCEPT}`}
                maxSize={MAX_VIDEO_SIZE}
                onFileSelect={setMediaFile}
                preview={mediaFile ? undefined : existingPreview}
                label="Replace media (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="itemName">Item Name</Label>
              <Input id="itemName" {...register("itemName")} />
              {errors.itemName && (
                <p className="text-sm text-destructive">{errors.itemName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={3} {...register("description")} />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  defaultValue={item.type}
                  onValueChange={(v) =>
                    setValue("type", v as "lost" | "found", { shouldValidate: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lost">Lost</SelectItem>
                    <SelectItem value="found">Found</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  defaultValue={
                    typeof item.category === "object"
                      ? (item.category as Category)._id
                      : (item.category as string)
                  }
                  onValueChange={(v) => setValue("category", v, { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      ?.filter((c) => c.status === "active")
                      .map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  defaultValue={item.status}
                  onValueChange={(v) =>
                    setValue("status", v as "available" | "claimed" | "resolved", {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="claimed">Claimed</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...register("location")} />
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location.message}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Item
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/items/${item._id}`)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
