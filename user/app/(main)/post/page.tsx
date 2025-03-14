'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share, Copy } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from '@/app/apiconnector/api';
import { toast } from 'sonner';
import { navigateToUserProfile } from '@/lib/navigation';
import { useRouter } from 'next/navigation';
interface Author {
  id: Number;
  username: string;
  profilePicture: string;
}

interface Reaction {
  id: string;
  user: {
    id: string;
    username: string;
    avatar: string;
  };
  emoji: string;
  createdAt: string;
}

interface Comment {
  id: string;
  user: {
    id: string;
    username: string;
    avatar: string;
  };
  content: string;
  createdAt: string;
}

interface Media {
  id: string;
  mediaUrl: string;
  mediaType: string;
  postId: string;
}

interface Post {
  id: string;
  content: string;
  createdAt: string;
  reactions: number;
  likedBy: Reaction[];
  comments: number;
  commentsList: Comment[];
  mediaUrls: Media[];
  updatedAt?: string;
  time?: string;
}

const CLOUDINARY_BASE_URL_IMAGE = "https://res.cloudinary.com/djvat4mcp/image/upload/v1741357526/";
const DEFAULT_AVATAR = "https://res.cloudinary.com/djvat4mcp/image/upload/v1741357526/zybt9ffewrjwhq7tyvy1.png";

const CLOUDINARY_BASE_URL_VIDEO = "https://res.cloudinary.com/dhx3clgrb/video/upload/v1741668746/";
// Add a helper function to construct the full image URL
const getFullImageUrl = (profilePicture: string | null | undefined): string => {
  if (!profilePicture) return DEFAULT_AVATAR;
  if (profilePicture.startsWith('http')) return profilePicture;
  return CLOUDINARY_BASE_URL_IMAGE + profilePicture;
};
// Add this function after getFullImageUrl
const getFullVideoUrl = (videoUrl: string | null | undefined): string => {
  if (!videoUrl) return '';
  if (videoUrl.startsWith('http')) return videoUrl;
  
  // Extract just the filename if it's a full URL
  const fileName = videoUrl.split('/').pop() || videoUrl;
  return `https://res.cloudinary.com/dhx3clgrb/video/upload/${fileName}`;
};

function timeAgo(dateString: string | undefined | null) {
  try {
    if (!dateString) return 'Just now';

    // Parse the date string using the exact format from your API
    const parsedDate = new Date(dateString);
    
    // Add logging to debug the date parsing
    console.log('Original date string:', dateString);
    console.log('Parsed date:', parsedDate);
    
    if (isNaN(parsedDate.getTime())) {
      console.error('Invalid date:', dateString);
      return 'Just now';
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - parsedDate.getTime()) / 1000);

    // Debug logging
    console.log('Current time:', now);
    console.log('Time difference in seconds:', diffInSeconds);

    if (diffInSeconds < 0) {
      console.warn('Future date detected:', dateString);
      return 'Just now';
    }

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(diffInSeconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
      }
    }

    return 'Just now';
  } catch (error) {
    console.error('Error in timeAgo:', error, 'for date:', dateString);
    return 'Just now';
  }
}

export default function ViewPostPage() {
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [postAuthor, setPostAuthor] = useState({ id: '', username: '', avatar: DEFAULT_AVATAR });
  const [activeLikesPost, setActiveLikesPost] = useState<string | null>(null);
  const [activeCommentsPost, setActiveCommentsPost] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const viewPostId = localStorage.getItem('viewPostId');
    if (!viewPostId) {
      toast.error('Post not found');
      router.push('/home');
      return;
    }

    fetchPost(viewPostId);
  }, []);

  const fetchPost = async (postId: string) => {
    try {
      // Fetch basic post details
      const postData = await apiRequest(`posts/${postId}`, 'GET');
      if (!postData || postData.status !== "1") {
        toast.error('Post not found or has been removed');
        router.push('/home');
        return;
      }
      console.log('Post data:', postData);

      // Fetch post author details
      const authorDetails = await apiRequest(`users/${postData.user.id}`, 'GET');
      setPostAuthor({
        id: authorDetails.id,
        username: authorDetails.username,
        avatar: getFullImageUrl(authorDetails.profilePicture)
      });
      console.log('Author details:', authorDetails);

      // Get reactions
      const reactionsList = await apiRequest(`reactions/posts/${postId}`, 'GET') || [];
      const enrichedReactions = await Promise.all(reactionsList.map(async (reaction: any) => {
        const reactionUserDetails = await apiRequest(`users/${reaction.userId}`, 'GET');
        return {
          id: reaction.id,
          user: {
            id: reaction.userId,
            username: reactionUserDetails.username,
            avatar: getFullImageUrl(reactionUserDetails.profilePicture)
          },
          emoji: '👍',
          createdAt: reaction.createdAt
        };
      }));

      // Get comments
      const commentsList = await apiRequest(`comments/${postId}`, 'GET') || [];
      const commentsArray = Array.isArray(commentsList) ? commentsList : [];
      const enrichedComments = await Promise.all((commentsArray || []).map(async (comment: any) => {
        const userDetails = await apiRequest(`users/${comment.user.id}`, 'GET');
        return {
          id: comment.id,
          user: {
            id: comment.user.id,
            username: userDetails.status === 0 ? 'Blocked User' : userDetails.username,
            avatar: userDetails.status === 0 ? DEFAULT_AVATAR : getFullImageUrl(comment.user.profilePicture)
          },
          content: userDetails.status === 0 ? 'This user has been blocked' : comment.content,
          createdAt: timeAgo(comment.createdAt)
        };
      }));

      // Get media
      const mediaResponse = await apiRequest(`media/${postId}`, 'GET') || [];
      const mediaList = mediaResponse.map((media: any) => ({
        id: media.id,
        mediaUrl: media.mediaUrl,
        mediaType: media.mediaType || 'image',
        postId: media.postId
      }));

      // Set complete post data
      setPost({
        id: postData.id,
        content: postData.content,
        createdAt: postData.createdAt,
        updatedAt: postData.updatedAt,
        time: timeAgo(postData.updatedAt || postData.createdAt),
        reactions: enrichedReactions.length,
        comments: enrichedComments.length,
        commentsList: enrichedComments,
        likedBy: enrichedReactions,
        mediaUrls: mediaList
      });

    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error('Failed to load post');
      router.push('/home');
    }
  };

  const handleLikeClick = async (postId: string) => {
    try {
      const userId = localStorage.getItem('userId') || "404";
      
      // Check if user already liked the post
      const hasLiked = post?.likedBy.some(like => like.user.id === userId);

      if (hasLiked) {
        // Unlike the post
        const unlikeResponse = await apiRequest(`reactions/${postId}/${userId}`, 'DELETE');
        
        if (unlikeResponse !== undefined) {
          setPost(prev => prev ? {
            ...prev,
            reactions: prev.reactions - 1,
            likedBy: prev.likedBy.filter(like => like.user.id !== userId)
          } : null);
          toast.error("Unliked this post!");
        }
        return;
      }

      // Add the like
      const likeResponse = await apiRequest(`reactions/${postId}/${userId}/👍`, 'POST');
      
      if (likeResponse) {
        const userDetails = await apiRequest(`users/${userId}`, 'GET');
        
        const newLike: Reaction = {
          id: Date.now().toString(),
          user: {
            id: userId,
            username: userDetails.username,
            avatar: getFullImageUrl(userDetails.profilePicture)
          },
          emoji: '👍',
          createdAt: new Date().toISOString()
        };
        
        setPost(prev => prev ? {
          ...prev,
          reactions: prev.reactions + 1,
          likedBy: [...prev.likedBy, newLike]
        } : null);
        toast.success("Post liked!");
      }
    } catch (error) {
      console.error('Error liking/unliking post:', error);
      toast.error("Failed to update like");
    }
  };

  const handleCommentSubmit = async () => {
    try {
      if (!newComment.trim() || !post) {
        toast.error('Please enter a comment');
        return;
      }

      const userId = localStorage.getItem('userId') || "404";
      const response = await apiRequest(
        `comments?postId=${post.id}&userId=${userId}&content=${newComment}`, 
        'POST'
      );

      if (response) {
        const userDetails = await apiRequest(`users/${userId}`, 'GET');
        
        const newCommentObj: Comment = {
          id: response.id,
          user: {
            id: userId,
            username: userDetails.username,
            avatar: getFullImageUrl(userDetails.profilePicture)
          },
          content: newComment,
          createdAt: new Date().toISOString()
        };

        setPost(prev => prev ? {
          ...prev,
          comments: prev.comments + 1,
          commentsList: [...prev.commentsList, newCommentObj]
        } : null);

        setNewComment('');
        toast.success('Comment added successfully');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  if (!post) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Loading post...</h1>
          <p className="text-muted-foreground">Please wait while we fetch the post details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 animate-fade-in">
      <Card className="p-6 shadow-lg">
        {/* Post Header */}
        <div className="flex items-center gap-3 mb-4">
        <Avatar className="h-10 w-10">
                   <img 
                      src={postAuthor.avatar} 
                   alt="NaN"
                     className="h-full w-full object-cover"
                    />
                </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 
                className="font-semibold hover:underline cursor-pointer"
                onClick={() => navigateToUserProfile(postAuthor.id)}
              >
                {postAuthor.username}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">{post.time}</p>
          </div>
        </div>

        {/* Post Content */}
        <div className="space-y-4">
          <p className="text-lg dark:text-gray-200">{post.content}</p>
          
          {/* Media Grid */}
          {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="mb-4">
          <div className={`grid ${
            post.mediaUrls.length === 1 ? 'grid-cols-1' : 
            post.mediaUrls.length === 2 ? 'grid-cols-2' :
            post.mediaUrls.length === 3 ? 'grid-cols-2' :
            'grid-cols-2'
          } gap-2`}>
      {post.mediaUrls.map((media, index) => (
        <div 
          key={media.id}
          className={`${
            post.mediaUrls.length === 3 && index === 0 ? 'col-span-2' : ''
          } relative aspect-video flex items-center justify-center bg-muted rounded-lg overflow-hidden`}
        >
          {media.mediaType === 'VIDEO' ? (
            <video
              src={getFullVideoUrl(media.mediaUrl)}
              className="w-full h-full object-contain"
              controls
              preload="metadata"
              playsInline
            />
          ) : (
            <img
              src={getFullImageUrl(media.mediaUrl)}
              alt=""
              className="w-full h-full object-contain hover:opacity-90 transition-opacity cursor-pointer"
              onClick={() => window.open(getFullImageUrl(media.mediaUrl), '_blank')}
            />
                  )}
                </div>
              ))}
            </div>
          </div>
          )}  

          {/* Hashtags */}
          <div className="flex gap-2">
            {post.content.split(' ')
              .filter(word => word.startsWith('#'))
              .map((tag, index) => (
                <Badge key={index} variant="secondary" className="hover:scale-105 transition-transform">
                  {tag}
                </Badge>
              ))}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Interaction Buttons */}
        <div className="flex justify-between items-center">
          {/* Likes Section */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLikeClick(post.id)}
              className="hover:text-primary p-0"
            >
              <Heart 
                className={`h-5 w-5 ${
                  post.likedBy.some(like => like.user.id === localStorage.getItem('userId')) 
                    ? 'fill-current text-red-500' 
                    : ''
                }`} 
              />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveLikesPost(post.id)}
              className="hover:text-primary text-muted-foreground"
            >
              {post.reactions}
            </Button>
          </div>

          {/* Comments Section */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setActiveCommentsPost(post.id)}
            className="hover:text-primary text-muted-foreground flex items-center gap-2"
          >
            <MessageCircle className="h-5 w-5" />
            {post.comments}
          </Button>
        </div>

        {/* Likes Dialog */}
        <Dialog open={activeLikesPost !== null} onOpenChange={() => setActiveLikesPost(null)}>
          <DialogContent className="sm:max-w-md dark:bg-slate-900/90">
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-semibold dark:text-white">
                Liked by
              </DialogTitle>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto">
              {post.likedBy.map((user) => (
                <div 
                  key={user.id} 
                  className="flex items-center gap-3 p-3 hover:bg-accent/50 rounded-lg transition-colors"
                >
                  <Avatar className="h-10 w-10">
                   <img 
                      src={user.user.avatar} 
                   alt="NaN"
                     className="h-full w-full object-cover"
                    />
                </Avatar>
                  <span className="font-medium dark:text-white">{user.user.username}</span>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Comments Dialog */}
        <Dialog open={activeCommentsPost !== null} onOpenChange={() => setActiveCommentsPost(null)}>
          <DialogContent className="sm:max-w-md dark:bg-slate-900/90">
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-semibold dark:text-white">
                Comments
              </DialogTitle>
            </DialogHeader>
            
            {/* Comments List */}
            <div className="max-h-[50vh] overflow-y-auto space-y-4 mb-4">
              {post.commentsList.map((comment) => (
                <div 
                  key={comment.id} 
                  className="flex gap-3 p-3 rounded-lg bg-accent/20"
                >
                  <Avatar className="h-10 w-10">
                   <img 
                      src={comment.user.avatar} 
                   alt="NaN"
                     className="h-full w-full object-cover"
                    />
                </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm dark:text-white">
                        {comment.user.username}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {comment.createdAt}
                      </span>
                    </div>
                    <p className="text-sm dark:text-gray-200">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Comment Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 dark:bg-slate-800/50"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleCommentSubmit();
                  }
                }}
              />
              <Button 
                onClick={handleCommentSubmit}
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Post
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
};