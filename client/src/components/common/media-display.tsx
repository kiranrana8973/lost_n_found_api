import { STATIC_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface MediaDisplayProps {
  media: string;
  mediaType: "photo" | "video";
  alt?: string;
  className?: string;
}

export function MediaDisplay({ media, mediaType, alt = "Media", className }: MediaDisplayProps) {
  const src = media.startsWith("http") ? media : `${STATIC_URL}/${media}`;

  if (mediaType === "video") {
    return (
      <video
        src={src}
        controls
        className={cn("w-full rounded-lg", className)}
        preload="metadata"
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn("w-full rounded-lg object-cover", className)}
      loading="lazy"
    />
  );
}
