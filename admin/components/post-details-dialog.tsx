"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { format } from "date-fns"
import Image from "next/image"
import type { Post as ImportedPost } from "@/lib/types"

export type Post = ImportedPost & {
  user?: {
    username: string
    profilePicture?: string
  }
  createdAt?: string
}

// Update the PostMedia interface to match API response
interface PostMedia {
  id: string;
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO';
  postId: string;
}

interface PostDetailsDialogProps {
  post: Post | null;
  media: PostMedia[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
const CLOUDINARY_BASE_URL_IMAGE = "https://res.cloudinary.com/djvat4mcp/image/upload/v1741357526/";
const DEFAULT_AVATAR = "https://res.cloudinary.com/djvat4mcp/image/upload/v1741357526/zybt9ffewrjwhq7tyvy1.png";
const CLOUDINARY_BASE_URL_VIDEO = "https://res.cloudinary.com/dhx3clgrb/video/upload/v1741668746/";
const getFullImageUrl = (profilePicture: string | null | undefined): string => {
  if (!profilePicture) return DEFAULT_AVATAR;
  if (profilePicture.startsWith('http')) return profilePicture;
  return CLOUDINARY_BASE_URL_IMAGE + profilePicture;
};
// Add this function after getFullImageUrl
const getFullVideoUrl = (videoUrl: string | null | undefined): string => {
  if (!videoUrl) return '';
  if (videoUrl.startsWith('http')) return videoUrl;
  return CLOUDINARY_BASE_URL_VIDEO + videoUrl;
};
export function PostDetailsDialog({ post, media, open, onOpenChange }: PostDetailsDialogProps) {
  console.log('PostDetailsDialog received post:', post);
  console.log('PostDetailsDialog received media:', media);

  function timeAgo(dateString: string | undefined | null) {
    try {
      if (!dateString) return dateString;

      // Parse the ISO 8601 date string
      const parsedDate = new Date(dateString);
      const now = new Date();
      const diffInMilliseconds = now.getTime() - parsedDate.getTime();
      const diffInSeconds = Math.floor(diffInMilliseconds / 1000);

      // Define time intervals in seconds
      const intervals = [
        { label: 'year', seconds: 31536000 },
        { label: 'month', seconds: 2592000 },
        { label: 'week', seconds: 604800 },
        { label: 'day', seconds: 86400 },
        { label: 'hour', seconds: 3600 },
        { label: 'minute', seconds: 60 },
        { label: 'second', seconds: 1 }
      ];

      // Find the appropriate time interval
      for (const { label, seconds } of intervals) {
        const interval = Math.floor(diffInSeconds / seconds);
        if (interval >= 1) {
          return `${interval} ${label}${interval === 1 ? '' : 's'} ago`;
        }
      }

      return 'Just now';
    } catch (error) {
      console.error('Error parsing date:', error);
      return 'Just now';
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">Post Details</DialogTitle>
        </DialogHeader>
        {post && (
          <div className="space-y-6">
            {/* Post Content */}
            <div className="space-y-2">
              <p className="text-gray-600">{post.content}</p>
              <div className="flex justify-between text-sm text-gray-500">
                <span>By {post.user?.username}</span>
                <span>{timeAgo(post.createdAt)}</span>
              </div>
            </div>

            {/* Media Gallery - Centered */}
            {media?.length > 0 && (
              <div className="flex flex-col items-center gap-4">
                {media.map((item) => (
                  <div
                    key={item.id}
                    className="relative w-full max-w-md overflow-hidden rounded-lg"
                  >
                    {item.mediaType === 'VIDEO' ? (
                      <video
                        src={getFullVideoUrl(item.mediaUrl)}
                        controls
                        className="w-full"
                      />
                    ) : (
                      <img
                        src={getFullImageUrl(item.mediaUrl)}
                        alt=""
                        className="w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(getFullImageUrl(item.mediaUrl), '_blank')}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}