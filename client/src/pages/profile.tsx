import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useItems } from "@/hooks/use-items";
import { useBatches } from "@/hooks/use-batches";
import { authService } from "@/services/auth.service";
import { ItemCard } from "@/components/items/item-card";
import { FileUpload } from "@/components/common/file-upload";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { EmptyState } from "@/components/common/empty-state";
import { Pagination } from "@/components/common/pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Loader2, Mail, Phone, GraduationCap } from "lucide-react";
import { STATIC_URL, IMAGE_ACCEPT, MAX_IMAGE_SIZE } from "@/lib/constants";
import { toast } from "sonner";
import type { Batch } from "@/types";
import { Link } from "react-router-dom";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { data: batches } = useBatches();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);

  const [name, setName] = useState(user?.name || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [batchId, setBatchId] = useState(
    typeof user?.batchId === "object" ? (user.batchId as Batch)._id : (user?.batchId as string) || "",
  );
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);

  const { data: myItems, isLoading: loadingItems } = useItems({ page, limit: 8 });

  if (!user) return <LoadingSpinner className="min-h-[50vh]" />;

  const batch = typeof user.batchId === "object" ? (user.batchId as Batch) : null;

  const profilePic =
    user.profilePicture && user.profilePicture !== "default-profile.png"
      ? `${STATIC_URL}/profile_pictures/${user.profilePicture}`
      : undefined;

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      let newPicture = user.profilePicture;
      if (profilePicFile) {
        const uploadRes = await authService.uploadProfilePicture(profilePicFile);
        newPicture = uploadRes.data.data;
      }

      const res = await authService.updateStudent(user._id, {
        name,
        phoneNumber,
        batchId,
        profilePicture: newPicture,
      });

      updateUser(res.data.data);
      setIsEditing(false);
      setProfilePicFile(null);
      toast.success("Profile updated");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to update profile";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter items to only show user's own items
  const userItems = myItems?.data.filter((item) => {
    const reporterId =
      typeof item.reportedBy === "object" ? item.reportedBy._id : item.reportedBy;
    return reporterId === user._id;
  });

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="my-items">My Items</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Profile</CardTitle>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <FileUpload
                      accept={IMAGE_ACCEPT}
                      maxSize={MAX_IMAGE_SIZE}
                      onFileSelect={setProfilePicFile}
                      preview={profilePicFile ? undefined : profilePic}
                      label="Change profile picture"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Batch</Label>
                    <Select value={batchId} onValueChange={setBatchId}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {batches
                          ?.filter((b) => b.status === "active")
                          .map((b) => (
                            <SelectItem key={b._id} value={b._id}>
                              {b.batchName}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={isSubmitting}>
                      {isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profilePic} />
                    <AvatarFallback className="text-2xl">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2 text-center sm:text-left">
                    <h2 className="text-xl font-bold">{user.name}</h2>
                    <p className="text-muted-foreground">@{user.username}</p>
                    <Separator className="my-2" />
                    <div className="space-y-1.5 text-sm">
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {user.email}
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {user.phoneNumber}
                      </p>
                      {batch && (
                        <p className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                          {batch.batchName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-items">
          {loadingItems ? (
            <LoadingSpinner />
          ) : userItems && userItems.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {userItems.map((item) => (
                  <ItemCard key={item._id} item={item} />
                ))}
              </div>
              {myItems && (
                <Pagination page={myItems.page} pages={myItems.pages} onPageChange={setPage} />
              )}
            </>
          ) : (
            <EmptyState
              title="No items yet"
              description="You haven't reported any lost or found items."
              action={
                <Button asChild>
                  <Link to="/items/new">Report Item</Link>
                </Button>
              }
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
