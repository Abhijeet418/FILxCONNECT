'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Share2, Image, Video, Smile, Send, MoreHorizontal, Flag, MessageCircle, Heart, Repeat, Copy, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { apiRequest } from '@/app/apiconnector/api';
import { title } from 'node:process';
import { ScrollArea } from '@/components/ui/scroll-area';
import { navigateToUserProfile } from '@/lib/navigation';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const DEFAULT_URL = "https://res.cloudinary.com/djvat4mcp/image/upload/v1741357526/zybt9ffewrjwhq7tyvy1.png";

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
const commentTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  
  // Convert to UTC to avoid timezone issues
  const utcDate = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  );
  
  const utcNow = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds()
  );

  const seconds = Math.floor((utcNow - utcDate) / 1000);

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
};

// Add this function at the top of the file with other utility functions
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

// Then update the likes dialog in the return JSX where it shows the likes timestamp:

// Update the timeAgo function for posts (keep the commentTimeAgo as is)
const timeAgo = (dateString: string) => {
  // Parse the UTC date string
  const date = new Date(dateString);
  const now = new Date();

  // Get the time difference in seconds
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

  // Handle just now case first
  if (seconds < 5) {
    return 'Just now';
  }

  // Find the appropriate interval
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
    }
  }
  
  return 'Just now';
};

// First, add these interfaces at the top of your file
interface Author {
  id: string;
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
  author: Author;
  content: string;
  createdAt: string;
  reactions: number;
  likedBy: Reaction[];
  comments: number;
  commentsList: Comment[];
  mediaUrls: Media[];
}

interface UserProfile {
  id: string;
  name: string;
  profilePicture: string;
  email: string;
}

export default function HomePage() {

  const [newPost, setNewPost] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string>(DEFAULT_URL);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedPreviews, setSelectedPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [posts, setPosts] = useState<Post[]>([]);

  const [commentText, setCommentText] = useState('');
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const emojis = ['😀', '😂', '❤️', '👍', '🎉', '🔥', '💯', '🚀'];

  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: '',
    name: '',
    profilePicture: DEFAULT_AVATAR,
    email: ''
  });

  // Add this state
  const [activeCommentDialog, setActiveCommentDialog] = useState<string | null>(null);

  // Add these new state variables at the top of the component
  const [isReportingPost, setIsReportingPost] = useState(false);
  const [isReportingUser, setIsReportingUser] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportType, setReportType] = useState<'post' | 'user' | null>(null);
  const [reportedId, setReportedId] = useState<string>('');

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        // First check if user is logged in by checking userId
        const userId = localStorage.getItem('userId');
        if (!userId) {
          setProfilePicture(DEFAULT_AVATAR);
          return;
        }

        // Then check for stored profile picture
        const storedPicture = localStorage.getItem("profile_picture");
        if (storedPicture) {
          setProfilePicture(storedPicture.startsWith('http') ? storedPicture : getFullImageUrl(storedPicture));
        } else {
          // If no stored picture, fetch from API
          const userResponse = await apiRequest(`users/${userId}`, 'GET');
          if (userResponse?.profilePicture) {
            const fullUrl = getFullImageUrl(userResponse.profilePicture);
            localStorage.setItem("profile_picture", fullUrl);
            setProfilePicture(fullUrl);
          } else {
            setProfilePicture(DEFAULT_AVATAR);
          }
        }
      } catch (error) {
        console.error('Error fetching profile picture:', error);
        setProfilePicture(DEFAULT_AVATAR);
      }
    };

    fetchProfilePicture();
    window.addEventListener('storage', fetchProfilePicture);

    return () => {
      window.removeEventListener('storage', fetchProfilePicture);
    };
  }, []);

  // Update the fetchConnectionPosts function
const fetchConnectionPosts = async () => {
  try {
    const userId = localStorage.getItem('userId') || "404";
    
    // Fetch connections
    const connections = await apiRequest(`followers/${userId}/followed`, 'GET') || [];
    const activeConnections = connections.filter((user: any) => user.status !== "0" && user.status !== 0);

    // Fetch all posts from connections
    let allPosts: any[] = [];
    for (const connection of activeConnections) {
      // Get connection's user details to check status
      const userDetails = await apiRequest(`users/${connection.id}`, 'GET');
      
      // Only fetch posts if user is not blocked
      if (userDetails.status !== 0) {
        const userPosts = await apiRequest(`posts/user/${connection.id}`, 'GET') || [];
        const activePosts = userPosts.filter((post: any) => post.status === "1");
        allPosts = [...allPosts, ...activePosts];
      }
    }

    // Enrich only non-blocked users' posts
    const enrichedPosts = await Promise.all(allPosts.map(async (post) => {
      try {
        // Check post author's status
        const authorDetails = await apiRequest(`users/${post.user.id}`, 'GET');
        if (authorDetails.status === 0) {
          return null; // Skip posts from blocked users
        }

        // Get reactions with user details
        const reactions = await apiRequest(`reactions/posts/${post.id}`, 'GET') || [];
        const enrichedReactions = await Promise.all(reactions.map(async (r: any) => {
          const userDetails = await apiRequest(`users/${r.userId}`, 'GET');
          return {
            id: r.id,
            user: {
              id: r.userId,
              username: userDetails.status === 0 ? 'Blocked User' : userDetails.username,
              avatar: userDetails.status === 0 ? DEFAULT_AVATAR : getFullImageUrl(userDetails.profilePicture)
            },
            emoji: '👍',
            createdAt: r.createdAt
          };
        }));

        // Get comments with user details
        const comments = await apiRequest(`comments/${post.id}`, 'GET') || [];
        const commentsArray = Array.isArray(comments) ? comments : [];
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
                          createdAt: comment.createdAt
                        };
                      }));

        // Get media
        const media = await apiRequest(`media/${post.id}`, 'GET') || [];

        
        return {
          id: post.id,
          author: {
            id: post.user.id,
            username: authorDetails.username,
            profilePicture: getFullImageUrl(authorDetails.profilePicture)
          },
          content: post.content,
          createdAt: post.createdAt,
          reactions: enrichedReactions.length,
          likedBy: enrichedReactions,
          comments: enrichedComments.length,
          commentsList: enrichedComments,
          mediaUrls: (media || []).map((m: any) => ({
            id: m.id,
            mediaUrl: m.mediaUrl, // Don't modify the URL here
            mediaType: m.mediaType || 'IMAGE',
            postId: m.postId
          }))
        };

      } catch (error) {
        console.error(`Error enriching post ${post.id}:`, error);
        return null;
      }
    })).then(posts => posts.filter((post) => post !== null));
    console.log('Enriched post:', enrichedPosts);
    // Filter out null posts and sort by date (newest first)
    const validPosts = enrichedPosts
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // Sort in descending order (newest first)
      });

    return validPosts;

  } catch (error) {
    console.error('Error fetching posts:', error);
    toast.error('Failed to fetch posts');
    return [];
  }
};

  const fetchUserProfile = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        toast.error('User not logged in');
        return;
      }
  
      const userData = await apiRequest(`users/${userId}`, 'GET');
      if (userData) {
        setUserProfile({
          id: userData.id,
          name: userData.username,
          profilePicture: getFullImageUrl(userData.profilePicture),
          email: userData.email
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load user profile');
    }
  };

  useEffect(() => {
    fetchUserProfile();
    const loadPosts = async () => {
      const posts = await fetchConnectionPosts();
      setPosts(posts);
    };
    loadPosts();
  }, []);

  // Add a useEffect to keep posts sorted when they update
  useEffect(() => {
    setPosts(prevPosts => 
      [...prevPosts].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      })
    );
  }, [posts.length]); // Re-sort when posts array length changes

  const handlePostSubmit = async () => {
    if (!newPost.trim() && selectedFiles.length === 0) return;
    setIsSubmitting(true);

    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.error("User ID not found in localStorage");
      setIsSubmitting(false);
      return;
    }

    let uploadedUrls: string[] = [];

    // Upload all files
    if (selectedFiles.length > 0) {
      try {
        const uploadPromises = selectedFiles.map(async (file) => {
          const isVideo = file.type.startsWith('video/');
          const cloudName = isVideo ? 'dhx3clgrb' : 'djvat4mcp';
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', 'filxconnect');
          formData.append('cloud_name', cloudName);

          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
            {
              method: 'POST',
              body: formData,
            }
          );

          const data = await response.json();
          if (!response.ok) {
            throw new Error(`Upload failed: ${data.error?.message || 'Unknown error'}`);
          }

          // Extract the file name from the secure_url
          const fileName = data.secure_url.split('/').pop();
          return fileName;
        });

        uploadedUrls = await Promise.all(uploadPromises);
      } catch (error) {
        console.error("Error uploading files:", error);
        toast.error('Failed to upload media');
        setIsSubmitting(false);
        return;
      }
    }

    const dataToBeSent = {
      userId: userId,
      title: "New Post",
      content: newPost,
      caption: "New Post",
      status: "1",
      mediaUrls: uploadedUrls
    };

    try {
      const res = await apiRequest('posts', 'POST', dataToBeSent);
      console.log("API Response:", res);
      setNewPost('');
      setSelectedFiles([]);
      setSelectedPreviews([]);
      toast.success('Post created successfully!');
    } catch (error: any) {
      console.error("Error creating post:", error.response?.data || error.message);
      toast.error('Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxFiles = 4; // Maximum number of files allowed

    if (selectedFiles.length + files.length > maxFiles) {
      toast.error(`You can only upload up to ${maxFiles} files`);
      return;
    }

    files.forEach(file => {
      const isVideo = file.type.startsWith('video/');
      const cloudName = isVideo ? 'dhx3clgrb' : 'djvat4mcp';
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'filxconnect');
      formData.append('cloud_name', cloudName);
    });

    // Create preview URLs and add new files
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setSelectedPreviews(prev => [...prev, ...newPreviews]);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    // Check file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('Video must be less than 100MB');
      return;
    }
  
    // Check if there's already a video
    const hasVideo = selectedFiles.some(f => f.type.startsWith('video/'));
    if (hasVideo) {
      toast.error('Only one video allowed per post');
      return;
    }
  
    // Add the video
    setSelectedFiles(prev => [...prev, file]);
    setSelectedPreviews(prev => [...prev, URL.createObjectURL(file)]);
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleVideoClick = () => {
    if (videoInputRef.current) {
      videoInputRef.current.click();
    }
  };

  const handleLikeClick = async (postId: string) => {
    try {
      let userId = localStorage.getItem('userId') || "404";
      const currentPost = posts.find(p => p.id === postId);
      const hasLiked = currentPost?.likedBy.some(like => 
        like.user.username === userProfile.name
      );
  
      if (hasLiked) {
        const unlikeResponse = await apiRequest(`reactions/${postId}/${userId}`, 'DELETE');
        if (unlikeResponse !== undefined) {
          setPosts(prevPosts => 
            prevPosts.map(post => {
              if (post.id === postId) {
                return {
                  ...post,
                  reactions: post.reactions - 1,
                  likedBy: post.likedBy.filter(like => 
                    like.user.username !== userProfile.name
                  )
                };
              }
              return post;
            })
          );
          toast.error("Unliked this post!");
        }
        return;
      }
  
      // Like the post
      const likeResponse = await apiRequest(`reactions/${postId}/${userId}/👍`, 'POST');
      if (likeResponse) {
        // Fetch current user details to get status
        const userDetails = await apiRequest(`users/${userId}`, 'GET');
        
        // Update this part to use the server's timestamp
        setPosts(prevPosts => 
          prevPosts.map(post => {
            if (post.id === postId) {
              const newLike = {
                id: Date.now().toString(),
                user: {
                  id: userDetails.id,
                  username: userDetails.status === 0 ? 'Blocked User' : userProfile.name,
                  avatar: userDetails.status === 0 ? DEFAULT_AVATAR : getFullImageUrl(userProfile.profilePicture)
                },
                emoji: '👍',
                // Use the timestamp from the API response
                createdAt: likeResponse.createdAt
              };
      
              return {
                ...post,
                reactions: post.reactions + 1,
                likedBy: [newLike, ...post.likedBy]
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

  const handleCommentClick = (postId: string) => {
    if (activeCommentId === postId) {
      setActiveCommentId(null);
    } else {
      setActiveCommentId(postId);
      setCommentText('');
    }
  };

  // Update the submitComment function to include proper ID generation
const submitComment = async (postId: string) => {
  if (!commentText.trim()) return;

  try {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      toast.error('User not logged in');
      return;
    }

    let newComment = commentText.trim();
    const response = await apiRequest(`comments?postId=${postId}&userId=${userId}&content=${newComment}`, 'POST');
    
    if (response) {
      const newCommentObj = {
        id: response.id || `temp-${Date.now()}`, // Ensure unique ID
        user: {
          id: userProfile.id,
          username: userProfile.name,
          avatar: userProfile.profilePicture
        },
        content: commentText.trim(),
        createdAt: new Date().toISOString()
      };

      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: post.comments + 1,
            commentsList: [newCommentObj, ...post.commentsList]
          };
        }
        return post;
      }));

      setCommentText('');
      toast.success('Comment added successfully');
    }
  } catch (error) {
    console.error('Failed to add comment:', error);
    toast.error('Failed to add comment');
  }
};

  const addEmoji = (emoji: string) => {
    setNewPost(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Animation for new posts
  useEffect(() => {
    const postElements = document.querySelectorAll('.post-card');
    postElements.forEach((element, index) => {
      setTimeout(() => {
        element.classList.add('animate-slide-up');
      }, index * 100);
    });
  }, []);

  const handleShare = async (postId: string) => {
    try {
      const shareUrl = `${window.location.origin}/post/${postId}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'Check out this post',
          text: 'Check out this interesting post!',
          url: shareUrl
        });
        toast.success('Shared successfully!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share post');
    }
  };

  // Add the report handling function
  const handleReport = async (type: 'post' | 'user', id: string) => {
    setReportType(type);
    setReportedId(id);
    setReportDialogOpen(true);
  };

  // Add the submit report function
  const submitReport = async () => {
    try {
      const reporterUserId = localStorage.getItem('userId');
      if (!reporterUserId) {
        toast.error('You must be logged in to report');
        return;
      }

      const reportData = {
        reporterUserId,
        reason: reportReason,
        ...(reportType === 'post' 
          ? { reportedPostId: reportedId }
          : { reportedUserId: reportedId })
      };

      const endpoint = reportType === 'post' ? 'reports/post' : 'reports/user';
      const response = await apiRequest(endpoint, 'POST', reportData);

      if (response) {
        toast.success(`${reportType === 'post' ? 'Post' : 'User'} reported successfully`);
        setReportDialogOpen(false);
        setReportReason('');
        setReportType(null);
        setReportedId('');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 animate-fade-in">
      <Card className="p-4 mb-6 shadow-md hover-scale transition-all">
        <div className="flex gap-4">
          <Avatar className="w-10 h-10">
            <img 
              src={getFullImageUrl(profilePicture)}
              alt="Profile" 
              className="h-full w-full object-cover"
            />
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="What's on your mind?"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="mb-4 resize-none hover-scale focus:border-primary"
              rows={2}
            />

            {/* Media previews */}
            {selectedPreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {selectedPreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    {selectedFiles[index]?.type.startsWith('video/') ? (
                      <video
                        src={preview}
                        className="w-full h-48 object-cover rounded-lg"
                        controls
                      />
                    ) : (
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setSelectedPreviews(prev => prev.filter((_, i) => i !== index));
                        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* File input fields */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleFileChange}
            />
            <input
              type="file"
              ref={videoInputRef}
              className="hidden"
              accept="video/*"
              onChange={handleVideoChange}
              multiple={false}
            />

            {/* Media upload buttons */}
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => fileInputRef.current?.click()} 
                  className="hover-scale"
                  disabled={selectedFiles.length >= 4}
                >
                  <Image className="w-4 h-4 mr-2 text-primary" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => videoInputRef.current?.click()} 
                  className="hover-scale"
                  disabled={selectedFiles.length >= 4}
                >
                  <Video className="w-4 h-4 mr-2 text-primary" />
                </Button>
                <div className="relative inline-block">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover-scale"
                      >
                        <Smile className="w-4 h-4 mr-2 text-primary" />
                      
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-2">
                      <div className="grid grid-cols-4 gap-2">
                        {emojis.map((emoji) => (
                          <Button
                            key={emoji}
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-accent"
                            onClick={() => {
                              setNewPost(prev => prev + emoji);
                            }}
                          >
                            {emoji}
                          </Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <Button
                size="sm"
                onClick={handlePostSubmit}
                disabled={isSubmitting || (!newPost.trim() && selectedFiles.length === 0)}
                className="hover-scale ml-auto"
              >
                {isSubmitting ? (
                  <span className="animate-spin mr-2">
                    {/* ...loading svg... */}
                  </span>
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Post
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {posts.map((post) => (
        <Card key={post.id} className="p-4 mb-4 shadow-md post-card hover-scale transition-all">
          {/* Post Header */}
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-10 w-10"
            onClick={() => navigateToUserProfile(post.author.id)}>
                                <img 
                                  src={getFullImageUrl(post.author.profilePicture)}
                                  alt="NaN"
                                  className="h-full w-full object-cover"
                                />
                              </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold">{post.author.username}</h3>
              <p className="text-sm text-muted-foreground">
                {timeAgo(post.createdAt)} {/* Pass the raw date string directly */}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleReport('post', post.id)}>
                  <Flag className="h-4 w-4 mr-2" />
                  Report Post
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleReport('user', post.author.id)}>
                  <Flag className="h-4 w-4 mr-2" />
                  Report User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                    }`}
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
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 hover:text-primary"
                  >
                    <span>{post.reactions}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Liked by</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-4">
                      {post.likedBy.map((like) => (
                        <div key={like.id} className="flex items-center gap-3">
                          <Avatar className="h-8 w-8"
                          onClick={() => navigateToUserProfile(like.user.id)}>
                            <img 
                              src={like.user.avatar} 
                              alt="NaN"
                              className="h-full w-full object-cover"
                            />
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{like.user.username}</p>
                            <p className="text-xs text-muted-foreground">
                              {adjustLikeTimestamp(like.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>

            <Dialog open={activeCommentDialog === post.id} onOpenChange={(open) => setActiveCommentDialog(open ? post.id : null)}>
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
                    {post.commentsList.map((comment) => {
                      const commentKey = comment.id || `comment-${Date.now()}-${Math.random()}`;
                      return (
                        <div key={commentKey} className="space-y-2">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8"
                            onClick={() => navigateToUserProfile(comment.user.id)}>
                              <img 
                                src={comment.user.avatar} 
                                alt={comment.user.username}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  const img = e.target as HTMLImageElement;
                                  img.src = DEFAULT_AVATAR;
                                }}
                              />
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium">{comment.user.username}</p>
                              <p className="text-xs text-muted-foreground">{commentTimeAgo(comment.createdAt)}</p>
                            </div>
                          </div>
                          <p className="text-sm pl-11">{comment.content}</p>
                          <Separator className="mt-4" />
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
                <div className="flex items-center mt-4">
                  <Input
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => submitComment(post.id)}
                    className="ml-2"
                  >
                    Post
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hover:text-primary"
                >
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
                        <Share2 className="h-4 w-4 mr-2" />
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

      {/* Add the Report Dialog after the post cards */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Report {reportType === 'post' ? 'Post' : 'User'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Textarea
              placeholder="Please provide a reason for reporting..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setReportDialogOpen(false);
                  setReportReason('');
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={submitReport}
                disabled={!reportReason.trim()}
              >
                Submit Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}