import { cn, getFileIcon } from "@/lib/utils";
import Image from "next/image";

interface Props {
  type: string;
  extension: string;
  url?: string;
  imageClassName?: string;
  className?: string;
}

export const Thumbnail = ({
  type,
  extension,
  url = "",
  imageClassName,
  className,
}: Props) => {
  const isImage = type === "image" && extension !== "svg";

  const src = isImage ? url : getFileIcon(extension, type);

  // 🔥 Detect animated GIFs
  const isGif = typeof src === "string" && src.endsWith(".gif");

  return (
    <figure className={cn("thumbnail", className)}>
      <Image
        src={src}
        alt="thumbnail"
        width={100}
        height={100}
        unoptimized={isGif} // ✅ FIX: silence warning
        className={cn(
          "size-8 object-contain",
          imageClassName,
          isImage && "thumbnail-image"
        )}
      />
    </figure>
  );
};

export default Thumbnail;
