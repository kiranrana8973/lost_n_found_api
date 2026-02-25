import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock } from "lucide-react";
import { STATIC_URL } from "@/lib/constants";
import { formatDistanceToNow } from "date-fns";
import type { Item, Category, Student } from "@/types";

interface ItemCardProps {
  item: Item;
}

export function ItemCard({ item }: ItemCardProps) {
  const category = typeof item.category === "object" ? (item.category as Category).name : "";
  const reporter = typeof item.reportedBy === "object" ? (item.reportedBy as Student).name : "";
  const mediaSrc = item.media.startsWith("http")
    ? item.media
    : `${STATIC_URL}/${item.media}`;

  return (
    <Link to={`/items/${item._id}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow h-full">
        <div className="aspect-video relative overflow-hidden bg-muted">
          {item.mediaType === "video" ? (
            <video src={mediaSrc} className="w-full h-full object-cover" preload="metadata" />
          ) : (
            <img src={mediaSrc} alt={item.itemName} className="w-full h-full object-cover" loading="lazy" />
          )}
          <div className="absolute top-2 left-2 flex gap-1">
            <Badge variant={item.type === "lost" ? "destructive" : "default"} className={item.type === "found" ? "bg-green-600 hover:bg-green-700" : ""}>
              {item.type === "lost" ? "Lost" : "Found"}
            </Badge>
          </div>
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="text-xs">
              {item.status}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4 space-y-2">
          <h3 className="font-semibold line-clamp-1">{item.itemName}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {category && (
              <Badge variant="outline" className="text-xs">
                {category}
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="line-clamp-1">{item.location}</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
            </span>
          </div>
          {reporter && (
            <p className="text-xs text-muted-foreground">by {reporter}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
