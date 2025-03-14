'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Camera, Edit, Heart, MessageCircle, Repeat, Share, Link as LinkIcon, Copy, Trash2, AlertCircle, Router } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { navigateToUserProfile } from '@/lib/navigation';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { auth } from '@/lib/Firebase';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { apiRequest } from '@/app/apiconnector/api';
import { Badge } from '@/components/ui/badge';
import router from 'next/router';

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

// Update the Post interface to include the proper media type
interface Post {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string; // Make updatedAt optional since it might not always be present
  time: string;
  reactions: number;
  likedBy: Reaction[];
  comments: number;
  commentsList: Comment[];
  mediaUrls: Media[];
  status: string; // Change this to store the full media objects
}

const adjustLikeTimestamp = (dateString: string) => {
  const date = new Date(dateString);
  // Add 5 hours to the timestamp
  date.setHours(date.getHours() + 5);
  date.setMinutes(date.getMinutes() + 30);
  
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  };

  if (seconds < 5) {
    return 'Just now';
  }

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
    }
  }
  
  return 'Just now';
};

// First, fix the timeAgo function to handle the specific date format
function timeAgo(dateString: string) {
  try {
    if (!dateString) {
      return 'Just now';
    }

    // Handle the API date format: "2025-03-05T19:23:23"
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      return 'Just now';
    }

    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Handle future dates
    if (seconds < 0) {
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
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
      }
    }

    return 'Just now';
  } catch (error) {
    console.error('Error parsing date:', error, 'for dateString:', dateString);
    return 'Just now';
  }
}

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState({
    name: '',
    profilePicture: DEFAULT_AVATAR,
    bio: '',
    userId: '',
    stats: {
      posts: 0,
      followers: 0,
      following: 0,
      reports: 0
    }
  });

  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: userProfile.name,
    bio: userProfile.bio || ''
  });
  const [posts, setPosts] = useState<Post[]>([]);

  const [activeLikesPost, setActiveLikesPost] = useState<string | null>(null);
  const [activeCommentsPost, setActiveCommentsPost] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');

  const fetchUserPosts = async () => {
    try {
      let userId = localStorage.getItem('userId') || "404";
      const rawPosts = await apiRequest(`posts/user/${userId}`) || [];
      
      // Filter active posts
      const activePosts = rawPosts.filter((post: any) => post.status === "1" || post.status === "3");
      
      // Enrich posts with full details
      const enrichedPosts: Post[] = await Promise.all(activePosts.map(async (post: any) => {
        try {
          // Get user details
          const userDetails = await apiRequest(`users/${userId}`, 'GET');
          
          // Get reactions with user details
          const reactionsList = await apiRequest(`reactions/posts/${post.id}`, 'GET') || [];
          const reactionsArray = Array.isArray(reactionsList) ? reactionsList : [];
          const enrichedReactions = await Promise.all(reactionsArray.map(async (reaction: any) => {
            const reactionUserDetails = await apiRequest(`users/${reaction.userId}`, 'GET');
            return {
              id: reaction.id,
              user: {
                id: reaction.userId,
                username: reactionUserDetails.status === 0 ? 'Blocked User' : reactionUserDetails.username,
                avatar: reactionUserDetails.status === 0 ? DEFAULT_AVATAR : getFullImageUrl(reactionUserDetails.profilePicture)
              },
              emoji: '👍',
              createdAt: reaction.createdAt
            };
          }));

          // Get comments with user details
          const commentsList = await apiRequest(`comments/${post.id}`, 'GET');
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
          const mediaResponse = await apiRequest(`media/${post.id}`, 'GET') || [];
          const mediaList: Media[] = (mediaResponse || []).map((media: any) => ({
            id: media.id,
            mediaUrl: media.mediaType === 'IMAGE' ? getFullImageUrl(media.mediaUrl) : getFullVideoUrl(media.mediaUrl),
            mediaType: media.mediaType || 'image',
            postId: media.postId
          }));

          // Return enriched post object
          return {
            id: post.id,
            content: post.content,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            time: timeAgo(post.updatedAt || post.createdAt),
            reactions: enrichedReactions.length,
            comments: enrichedComments.length,
            commentsList: enrichedComments,
            likedBy: enrichedReactions,
            mediaUrls: mediaList,
            status: post.status
          };

        } catch (error) {
          console.error(`Error enriching post ${post.id}:`, error);
          return null;
        }
      }));

      // Filter out null posts and sort by date
      const validPosts = enrichedPosts.filter((post): post is Post => post !== null)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setPosts(validPosts);

    } catch (error) {
      console.error('Error fetching user posts:', error);
      toast.error('Failed to fetch user posts');
      setPosts([]);
    }
  };

  const fetchPostCount = async () => {
    try{
      let userId = localStorage.getItem('userId') || "404";
      // const postCount = await apiRequest(`posts/user/${userId}/count`) || 0;
      // let userId = localStorage.getItem('userId') || "404";
      const rawPosts = await apiRequest(`posts/user/${userId}`) || [];
      
      // Filter posts with status "1" before processing
      const activePosts = rawPosts.filter((post: any) => post.status === "1");
      const reportCountRes = await apiRequest(`users/${userId}`) || null;
    
      setUserProfile(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          posts: Number(activePosts.length),
          reports: Number(reportCountRes.reports)
        }
      }));
    }catch (error) {
      console.error('Error fetching post counts:', error);
      toast.error('Failed to fetch post counts');

      // Set defaults in case of error
      setUserProfile(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
        }
      }));
    }
  }

  const fetchFollowerCounts = async () => {
    try {
      let userId = localStorage.getItem('userId') || "404";
      // Fetch followers count
      const followersResponse = await apiRequest(`followers/${userId}/followers/count`, 'GET');
      const followersCount = followersResponse || 0;  // Extract the count from response

      // Fetch following count
      const followingResponse = await apiRequest(`followers/${userId}/following/count`, 'GET');
      const followingCount = followingResponse || 0;  // Extract the count from response

      setUserProfile(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          followers: Number(followersCount),
          following: Number(followingCount)
        }
      }));
    } catch (error) {
      console.error('Error fetching follower counts:', error);
      toast.error('Failed to fetch follower counts');

      // Set defaults in case of error
      setUserProfile(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          followers: 0,
          following: 0
        }
      }));
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        let userId = localStorage.getItem('userId') || "404";
        let userResponse = await apiRequest(`users/${userId}`,'GET');
        
        // Construct the full profile picture URL
        const profilePicture = localStorage.getItem("profile_picture") || 
                             (userResponse.profilePicture ? CLOUDINARY_BASE_URL_IMAGE + userResponse.profilePicture : DEFAULT_AVATAR);

        setUserProfile(prev => ({
          ...prev,
          name: userResponse.username || userResponse.email?.split('@')[0] || 'Loading...',
          profilePicture: profilePicture, // Use the constructed URL
          bio: userResponse.bio,
          userId: userResponse.id
        }));

        fetchFollowerCounts();
        fetchPostCount();
        fetchUserPosts();

        setEditForm({
          name: userResponse.username || userResponse.email?.split('@')[0] || 'User',
          bio: userResponse.bio || ''
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleProfilePhotoUpdate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setIsUpdatingPhoto(true);

      // Create FormData for Cloudinary upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', "filxconnect"!);

      // Upload to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/djvat4mcp/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      const fullUrl = data.secure_url;
      
      // Extract just the filename from the Cloudinary URL
      const filename = fullUrl.split('/').pop(); // Gets just "zybt9ffewrjwhq7tyvy1.png"
      
      // Store the full URL in localStorage
      localStorage.setItem("profile_picture", fullUrl);

      // Update Firebase auth profile with full URL
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          photoURL: fullUrl
        });
      }

      // Update local state with full URL
      setUserProfile(prev => ({
        ...prev,
        profilePicture: fullUrl
      }));

      // Send only the filename to your API
      let userId = localStorage.getItem('userId') || "404";
      await apiRequest(`users/${userId}/updatePic/${filename}`, 'PUT');

      toast.success('Profile photo updated successfully');
    } catch (error) {
      console.error('Error updating profile photo:', error);
      toast.error('Failed to update profile photo');
    } finally {
      setIsUpdatingPhoto(false);
    }
  };

  // Update the handleProfileUpdate function to validate bio length
const handleProfileUpdate = async () => {
  try {
    if (editForm.bio.length > 20) {
      toast.error('Bio must be 20 characters or less');
      return;
    }

    let userId = localStorage.getItem('userId') || "404";
    const res = await apiRequest(`users/${userId}`,'PUT',{
      username: editForm.name,
      bio: editForm.bio
    });

    setUserProfile(prev => ({
      ...prev,
      name: editForm.name,
      bio: editForm.bio
    }));
    setIsEditDialogOpen(false);
    toast.success('Profile updated successfully');
  } catch (error) {
    toast.error('Failed to update profile');
    console.error(error);
  }
};

  const handleLikeClick = async (postId: string) => {
    try {
      let userId = localStorage.getItem('userId') || "404";
      
      // Check if user already liked the post
      const currentPost = posts.find(p => p.id === postId.toString());
      const hasLiked = currentPost?.likedBy.some(like => like.user.username === userProfile.name);
  
      if (hasLiked) {
        // Unlike the post
        const unlikeResponse = await apiRequest(`reactions/${postId}/${userId}`, 'DELETE');
        
        if (unlikeResponse !== undefined) {
          // Update state to remove the like
          setPosts(prevPosts => 
            prevPosts.map(post => {
              if (post.id === postId.toString()) {
                return {
                  ...post,
                  reactions: post.reactions - 1,
                  likedBy: post.likedBy.filter(like => like.user.username !== userProfile.name)
                };
              }
              return post;
            })
          );
          toast.error("Unliked this post!");
        }
        return;
      }
  
      // Add the like
      const likeResponse = await apiRequest(`reactions/${postId}/${userId}/👍`, 'POST');
      
      if (likeResponse) {
        // Update state to add the like
        setPosts(prevPosts => 
          prevPosts.map(post => {
            if (post.id === postId) {
              const newLike = {
                id: Date.now().toString(),
                user: {
                  id: userProfile.userId,
                  username: userProfile.name,
                  avatar: userProfile.profilePicture
                },
                emoji: '👍',
                createdAt: new Date().toLocaleString()
              };
              
              return {
                ...post,
                reactions: post.reactions + 1,
                likedBy: [...post.likedBy, newLike]
              };
            }
            return post;
          })
        );
        toast.success("Post liked!");
      }
    } catch (error) {
      console.error('Error liking/unliking post:', error);
      toast.error("Failed to update like");
    }
  };

  const handleCommentClick = async (postId: string) => {
    setActiveCommentsPost(postId);
  };

  const handleCommentSubmit = async (postId: string) => {
    try {
      if (!newComment.trim()) {
        toast.error('Please enter a comment');
        return;
      }
  
      const userId = localStorage.getItem('userId') || "404";
      const response = await apiRequest(`comments?postId=${postId}&userId=${userId}&content=${newComment}`, 'POST');
      console.log(response);
  
      if (response) {
        // Add new comment to the state
        setPosts(prevPosts =>
          prevPosts.map(post => {
            if (post.id === postId) {
              const newCommentObj = {
                id: Date.now().toString(),
                user: {
                  id: userProfile.userId,
                  username: userProfile.name,
                  avatar: getFullImageUrl(userProfile.profilePicture) // Use the helper function
                },
                content: newComment,
                createdAt: new Date().toISOString() // Use ISO string for consistency
              };
              return {
                ...post,
                comments: post.comments + 1,
                commentsList: [...post.commentsList, newCommentObj]
              };
            }
            return post;
          })
        );
  
        setNewComment(''); // Clear input
        toast.success('Comment added successfully');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleShare = async (postId: string) => {
    try {
      const shareUrl = `${window.location.origin}/post/${postId}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'Check out this post',
          text: 'Check out this interesting post!',
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share post');
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const response = await apiRequest(`posts/${postId}`, 'DELETE');
      console.log("deleted",response);
      if (response !== undefined) {
        // Remove the post from state
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
        // Update post count
        setUserProfile(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            posts: prev.stats.posts - 1
          }
        }));
        toast.success('Post deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };
   // Re-run when posts change

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Profile Header */}
      <div className="px-4 pt-8 pb-4 bg-gradient-to-b from-primary/5 to-background rounded-b-3xl">
        <div className="flex flex-col items-center md:flex-row md:items-start md:gap-8">
          {/* Profile Photo */}
          <div className="relative mb-6 md:mb-0">
            <Avatar className="w-40 h-40"
            onClick={() => navigateToUserProfile(userProfile.userId)}>
                        <img 
                          src={getFullImageUrl(userProfile.profilePicture)}
                          alt="Profile" 
                          className="h-full w-full object-cover"
                        />
                      </Avatar>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleProfilePhotoUpdate}
            />
            <Button
              size="icon"
              variant="secondary"
              className="absolute bottom-2 right-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUpdatingPhoto}
            >
              {isUpdatingPhoto ? (
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold mb-2">{userProfile.name}</h1>
                <p className="text-muted-foreground">{userProfile.bio}</p>
              </div>
              <div className="flex gap-2 justify-center md:justify-start mt-4 md:mt-0">
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="shadow-lg hover:shadow-xl transition-all duration-200">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold">Edit Profile</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <label htmlFor="name" className="text-sm font-medium">
                          Name
                        </label>
                        <Input
                          id="name"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          placeholder="Enter your name"
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="bio" className="text-sm font-medium">
                          Bio
                        </label>
                        <div className="relative">
                          <Textarea
                            id="bio"
                            value={editForm.bio}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              if (newValue.length <= 20) {
                                setEditForm({ ...editForm, bio: newValue });
                              }
                            }}
                            placeholder="Tell us about yourself (20 chars max)"
                            className="col-span-3 resize-none pr-16"
                            rows={4}
                            maxLength={20}
                          />
                          <span className={`absolute bottom-2 right-2 text-xs ${
                            editForm.bio.length === 20 ? 'text-destructive' : 'text-muted-foreground'
                          }`}>
                            {editForm.bio.length}/20
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsEditDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleProfileUpdate}
                        disabled={!editForm.name.trim()}
                      >
                        Save changes
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                {/* Commented out Settings button
                <Button 
                  variant="outline" 
                  size="icon"
                  className="shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                */}
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 justify-center md:justify-start mt-6">
              <div className="text-center md:text-left">
                <div className="text-2xl font-bold">{userProfile.stats.posts}</div>
                <div className="text-sm text-muted-foreground">Posts</div>
              </div>
              <div className="text-center md:text-left">
                <div className="text-2xl font-bold">{userProfile.stats.followers}</div>
                <div className="text-sm text-muted-foreground">Followers</div>
              </div>
              <div className="text-center md:text-left">
                <div className="text-2xl font-bold">{userProfile.stats.following}</div>
                <div className="text-sm text-muted-foreground">Following</div>
              </div>
              <div className="text-center md:text-left">
                <div className={`text-2xl font-bold ${
                  userProfile.stats.reports === 0 
                    ? 'text-green-500' 
                    : userProfile.stats.reports === 1 
                      ? 'text-orange-500' 
                      : 'text-destructive'
                }`}>
                  {userProfile.stats.reports}
                </div>
                <div className="text-sm text-muted-foreground">Reports</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="px-4 mt-6">
        <h2 className="text-xl font-semibold mb-4">Posts</h2>
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="p-4 mb-4 shadow-md post-card hover-scale transition-all">
              {/* Post Header */}
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-10 h-10"
                onClick={() => navigateToUserProfile(userProfile.userId)}>
                            <img 
                              src={getFullImageUrl(userProfile.profilePicture)}
                              alt="Profile" 
                              className="h-full w-full object-cover"
                            />
                          </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">{userProfile.name}</h3>
                  <p className="text-sm text-muted-foreground">{post.time}</p>
                </div>
                {/* Add Pending Status Icon */}
                {post.status === "3" && (
                  <div className="flex items-center mr-2">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <span className="ml-1 text-sm text-orange-500">Pending</span>
                  </div>
                )}
                {/* Add Delete Dialog */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Post</DialogTitle>
                    </DialogHeader>
                    <p>Are you sure you want to delete this post? This action cannot be undone.</p>
                    <div className="flex justify-end gap-2 mt-4">
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button 
                        variant="destructive"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Post Content */}
              <p className="mb-4">{post.content}</p>

              {/* Media Content */}
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
              <div className="flex gap-2 mb-4">
                {post.content.split(' ')
                  .filter(word => word.startsWith('#'))
                  .map((tag, index) => (
                    <Badge key={index} variant="secondary" className="hover-scale">
                      {tag}
                    </Badge>
                  ))}
              </div>

              <Separator className="my-4" />

              {/* Interaction Buttons */}
              <div className="flex justify-between">
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLikeClick(post.id)}
                    className="hover:text-primary p-0 mr-1"
                  >
                    <Heart 
                      className={`h-4 w-4 ${
                        post.likedBy.some(like => like.user.username === userProfile.name)
                          ? 'fill-current text-primary'
                          : ''
                      }`} 
                    />
                  </Button>

                  <Dialog open={activeLikesPost === post.id} onOpenChange={(open) => setActiveLikesPost(open ? post.id : null)}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:text-primary p-0"
                      >
                        {post.reactions}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Liked by</DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="h-[300px] pr-4">
                        <div className="space-y-4">
                          {post.likedBy.map((rct) => (
                            <div key={rct.id} className="flex items-center gap-3">
                              <Avatar className="h-10 w-10"
                                onClick={() => navigateToUserProfile(rct.user.id)}>
                                <img 
                                  src={rct.user.avatar} 
                                  alt="NaN"
                                  className="h-full w-full object-cover"
                                />
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-medium">{rct.user.username}</p>
                                <p className="text-xs text-muted-foreground">
                                  {adjustLikeTimestamp(rct.createdAt)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="flex items-center">
                  <Dialog 
                    open={activeCommentsPost === post.id} 
                    onOpenChange={(open) => setActiveCommentsPost(open ? post.id : null)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:text-primary p-0 flex items-center gap-1"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.comments}</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Comments</DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="h-[400px] pr-4">
                        <div className="space-y-4">
                          {post.commentsList.map((comment) => (
                            <div key={comment.id} className="space-y-2">
                              <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10"
                                onClick={() => navigateToUserProfile(comment.user.id)}>
                                <img 
                                  src={comment.user.avatar} 
                                  alt="NaN"
                                  className="h-full w-full object-cover"
                                />
                              </Avatar>
                                <div className="flex-1">
                                  <p 
                                    className="font-medium cursor-pointer hover:opacity-80"
                                    onClick={() => navigateToUserProfile(comment.user.id)}
                                  >
                                    {comment.user.username}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{comment.createdAt}</p>
                                </div>
                              </div>
                              <p className="text-sm pl-11">{comment.content}</p>
                              <Separator className="mt-4" />
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      <div className="flex items-center mt-4">
                        <Input
                          placeholder="Add a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          onClick={() => handleCommentSubmit(post.id)}
                          className="ml-2"
                        >
                          Post
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="hover:text-primary">
                      <Repeat className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Share Post</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="flex items-center gap-4">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
                            toast.success('Link copied to clipboard!');
                          }}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Link
                        </Button>
                        {typeof navigator.share === 'function' && (
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => handleShare(post.id)}
                          >
                            <Repeat className="h-4 w-4 mr-2" />
                            Share
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1">
                          <Input 
                            readOnly 
                            value={`${window.location.origin}/post/${post.id}`}
                            className="h-9"
                          />
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
                            toast.success('Link copied!');
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
