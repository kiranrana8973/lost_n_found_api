import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/auth-context";
import { useCategories } from "@/hooks/use-categories";
import { useCreateItem, useUploadItemMedia } from "@/hooks/use-items";
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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { IMAGE_ACCEPT, VIDEO_ACCEPT, MAX_VIDEO_SIZE } from "@/lib/constants";

const itemSchema = z.object({
  itemName: z.string().min(1, "Item name is required"),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["lost", "found"]),
  category: z.string().min(1, "Select a category"),
  location: z.string().min(1, "Location is required").max(200, "Max 200 characters"),
});

type ItemForm = z.infer<typeof itemSchema>;

export default function CreateItemPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: categories } = useCategories();
  const createItem = useCreateItem();
  const uploadMedia = useUploadItemMedia();
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ItemForm>({
    resolver: zodResolver(itemSchema),
    defaultValues: { type: "lost" },
  });

  const onSubmit = async (data: ItemForm) => {
    if (!mediaFile) {
      toast.error("Please upload an image or video");
      return;
    }
    if (!user) return;

    setIsSubmitting(true);
    try {
      const { path, mediaType } = await uploadMedia.mutateAsync(mediaFile);

      const res = await createItem.mutateAsync({
        ...data,
        media: path,
        mediaType,
        reportedBy: user._id,
      });

      toast.success("Item reported successfully");
      navigate(`/items/${res.data.data._id}`);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to create item";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const accept = `${IMAGE_ACCEPT},${VIDEO_ACCEPT}`;
  const maxSize = MAX_VIDEO_SIZE;

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Report Lost or Found Item</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Photo or Video</Label>
              <FileUpload
                accept={accept}
                maxSize={maxSize}
                onFileSelect={setMediaFile}
                label="Upload photo or video (max 50MB for video, 2MB for photo)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="itemName">Item Name</Label>
              <Input id="itemName" placeholder="e.g. Blue backpack" {...register("itemName")} />
              {errors.itemName && (
                <p className="text-sm text-destructive">{errors.itemName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the item in detail..."
                rows={3}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  defaultValue="lost"
                  onValueChange={(v) => setValue("type", v as "lost" | "found", { shouldValidate: true })}
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
                <Select onValueChange={(v) => setValue("category", v, { shouldValidate: true })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Where was it lost/found?"
                {...register("location")}
              />
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Report Item
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
