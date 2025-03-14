'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Camera, Edit, Heart, MessageCircle, Repeat, Share, Link as LinkIcon, Copy, UserMinus, UserPlus, Flag } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { auth } from '@/lib/Firebase';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { apiRequest } from '@/app/apiconnector/api';
import { Badge } from '@/components/ui/badge';

interface Reaction {
  id: string;
  user: {
    id: string; // Add this
    username: string;
    avatar: string;
  };
  emoji: string;
  createdAt: string;
}

interface Comment {
  id: string;
  user: {
    id: string; // Add this
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
  mediaUrls: Media[]; // Change this to store the full media objects
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

  const [posts, setPosts] = useState<Post[]>([]);

  const [activeLikesPost, setActiveLikesPost] = useState<string | null>(null);
  const [activeCommentsPost, setActiveCommentsPost] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');

  // Add this state to store current user info
  const [currentUser, setCurrentUser] = useState({
    id: '',
    username: '',
    profilePicture: DEFAULT_AVATAR
  });

  // Add this state
  const [isFollowing, setIsFollowing] = useState(false);

  // Add this state
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  // Add this new state at the top of your component
  const [selectedReason, setSelectedReason] = useState<string>("");

  // Add this state for controlling the dialog
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  // Add new state for custom reason
  const [customReason, setCustomReason] = useState("");

  const fetchUserPosts = async () => {
    try {
      let viewUserId = localStorage.getItem('viewUserId') || "404";
      const rawPosts = await apiRequest(`posts/user/${viewUserId}`) || [];
      
      // Filter posts with status "1" before processing
      const activePosts = rawPosts.filter((post: any) => post.status === "1");
      console.log(activePosts, 'activePosts');
  
      // Then update the post object creation in fetchUserPosts
      const enrichedPosts: Post[] = await Promise.all(activePosts.map(async (post: any) => {
        try {
          // Fetch reactions list first
          // Get reactions with user details
                  const reactions = await apiRequest(`reactions/posts/${post.id}`, 'GET') || [];
                  const enrichedReactions = await Promise.all(reactions.map(async (r: any) => {
                    const userDetails = await apiRequest(`users/${r.userId}`, 'GET');
                    return {
                      id: r.id,
                      user: {
                        id: r.userId, // Add the userId here
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
                                    createdAt: timeAgo(comment.createdAt)
                                  };
                                }));
          
                                
                                
          // Add media fetch
          const mediaResponse = await apiRequest(`media/${post.id}`, 'GET') || [];
          const mediaList: Media[] = Array.isArray(mediaResponse) ? mediaResponse : [];
  
          // Return formatted post object
          return {
            id: post.id,
            author: {
              id: post.user.id,
              username: userProfile.name,
              profilePicture: getFullImageUrl(userProfile.profilePicture)
            },
            content: post.content,
            createdAt: timeAgo(post.createdAt),
            reactions: enrichedReactions.length,
            likedBy: enrichedReactions,
            comments: enrichedComments.length,
            commentsList: enrichedComments,
            mediaUrls: (mediaList || []).map((m: any) => ({
              id: m.id,
              mediaUrl: m.mediaUrl,
              mediaType: m.mediaType || 'image',
              postId: m.postId
            }))
          };

  
        } catch (error) {
          console.error(`Error fetching additional data for post ${post.id}:`, error);
          return {
            id: post.id,
            content: post.content,
            createdAt: post.createdAt,
            time: timeAgo(post.createdAt), // Use timeAgo here as well
            reactions: 0,
            comments: 0,
            commentsList: [],
            likedBy: []
          };
        }
      }));
      
      const sortedPosts = enrichedPosts.sort((a, b) => {
                                  // Get the original date strings from the posts
                                  const dateA = activePosts.find((p: { id: string; }) => p.id === a.id)?.createdAt || '';
                                  const dateB = activePosts.find((p: { id: string; }) => p.id === b.id)?.createdAt || '';
                                  
                                  // Convert to Date objects and get timestamps
                                  const timeA = new Date(dateA).getTime();
                                  const timeB = new Date(dateB).getTime();
                                  
                                  // Sort in descending order (newest first)
                                  return timeB - timeA;
                                });
                                
                                setPosts(sortedPosts);
  
    } catch (error) {
      console.error('Error fetching user posts:', error);
      toast.error('Failed to fetch user posts');
      setPosts([]);
    }
  };

  const fetchPostCount = async () => {
    try {
      let viewUserId = localStorage.getItem('viewUserId') || "404";
      const rawPosts = await apiRequest(`posts/user/${viewUserId}`) || [];
      const activePosts = rawPosts.filter((post: any) => post.status === "1");
      const reportCountRes = await apiRequest(`users/${viewUserId}`) || null;
    
      setUserProfile(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          posts: Number(activePosts.length),
          reports: Number(reportCountRes.reports)
        }
      }));
    } catch (error) {
      console.error('Error fetching post counts:', error);
      toast.error('Failed to fetch post counts');
    }
  };

  const fetchFollowerCounts = async () => {
    try {
      let viewUserId = localStorage.getItem('viewUserId') || "404";
      // Fetch followers count
      const followersResponse = await apiRequest(`followers/${viewUserId}/followers/count`, 'GET');
      const followersCount = followersResponse || 0;  // Extract the count from response

      // Fetch following count
      const followingResponse = await apiRequest(`followers/${viewUserId}/following/count`, 'GET');
      const followingCount = followingResponse || 0;  // Extract the count from response

      // console.log(followersCount, followingCount, 'followersCount, followingCount');
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

  // Add this function to check following status
  const checkFollowingStatus = async () => {
    try {
      const currentUserId = localStorage.getItem('userId');
      const viewUserId = localStorage.getItem('viewUserId');
      
      // Don't check if viewing own profile
      if (currentUserId === viewUserId) {
        return;
      }
  
      const followedUsers = await apiRequest(`followers/${currentUserId}/followed`, 'GET');
      const isFollowed = followedUsers.some((user: any) => user.id === viewUserId);
      setIsFollowing(isFollowed);
    } catch (error) {
      console.error('Error checking following status:', error);
    }
  };

  // Add the unfollow handler
  const handleUnfollow = async () => {
    try {
      const currentUserId = localStorage.getItem('userId');
      const viewUserId = localStorage.getItem('viewUserId');
  
      const response = await apiRequest(
        `followers/unfollow?followerId=${currentUserId}&followingId=${viewUserId}`,
        'DELETE'
      );
  
      if (response !== undefined) {
        setIsFollowing(false);
        setUserProfile(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            followers: prev.stats.followers - 1
          }
        }));
        toast.success('Unfollowed successfully');
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast.error('Failed to unfollow user');
    }
  };

  // Add this new function inside your component
  const handleFollow = async () => {
    try {
      const currentUserId = localStorage.getItem('userId');
      const viewUserId = localStorage.getItem('viewUserId');
  
      const response = await apiRequest(
        `followers/follow?followerId=${currentUserId}&followingId=${viewUserId}`,
        'POST'
      );
  
      if (response !== undefined) {
        setIsFollowing(true);
        setUserProfile(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            followers: prev.stats.followers + 1
          }
        }));
        toast.success('Followed successfully');
      }
    } catch (error) {
      console.error('Error following user:', error);
      toast.error('Failed to follow user');
    }
  };
  
  // Add this new function inside your component
  const handleReport = async (reason: string) => {
    try {
      const reporterUserId = localStorage.getItem('userId');
      const reportedUserId = localStorage.getItem('viewUserId');
  
      const response = await apiRequest('reports/user', 'POST', {
        reporterUserId,
        reportedUserId,
        reason
      });
  
      if (response !== undefined) {
        toast.success('Report submitted successfully');
      }
    } catch (error) {
      console.error('Error reporting user:', error);
      toast.error('Failed to submit report');
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        let viewUserId = localStorage.getItem('viewUserId') || "404";
        let userResponse = await apiRequest(`users/${viewUserId}`,'GET');
        
        // Construct the full profile picture URL
        const profilePicture = userResponse.profilePicture ? 
                             CLOUDINARY_BASE_URL_IMAGE + userResponse.profilePicture : 
                             DEFAULT_AVATAR;

        setUserProfile(prev => ({
          ...prev,
          name: userResponse.username || 'User',
          profilePicture: profilePicture,
          bio: userResponse.bio,
          userId: userResponse.id
        }));

        fetchFollowerCounts();
        fetchPostCount();
        fetchUserPosts();
        await checkFollowingStatus(); // Add this line
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user profile');
      }
    };

    fetchUserData();
  }, []);

  // Add this to your initial useEffect
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const userId = localStorage.getItem('userId');
      if (userId) {
        const userData = await apiRequest(`users/${userId}`, 'GET');
        setCurrentUser({
          id: userData.id,
          username: userData.username,
          profilePicture: getFullImageUrl(userData.profilePicture)
        });
      }
    };
    fetchCurrentUser();
  }, []);

  // Add this useEffect to handle localStorage check
  useEffect(() => {
    const currentUserId = localStorage.getItem('userId');
    setIsOwnProfile(currentUserId === userProfile.userId);
  }, [userProfile.userId]);

  const handleLikeClick = async (postId: string) => {
    try {
      const userId = localStorage.getItem('userId') || "404";
      
      // Check if user already liked the post
      const post = posts.find(p => p.id === postId);
      const hasLiked = post?.likedBy.some(like => like.user.id === userId);
  
      if (hasLiked) {
        const unlikeResponse = await apiRequest(`reactions/${postId}/${userId}`, 'DELETE');
        
        if (unlikeResponse !== undefined) {
          setPosts(prevPosts => 
            prevPosts.map(post => {
              if (post.id === postId) {
                return {
                  ...post,
                  reactions: post.reactions - 1,
                  likedBy: post.likedBy.filter(like => like.user.id !== userId)
                };
              }
              return post;
            })
          );
          toast.error("Unliked this post!");
        }
        return;
      }
  
      const likeResponse = await apiRequest(`reactions/${postId}/${userId}/👍`, 'POST');
      
      if (likeResponse) {
        const newLike = {
          id: Date.now().toString(),
          user: {
            id: userId, // Use userId instead of currentUser.id
            username: currentUser.username,
            avatar: currentUser.profilePicture
          },
          emoji: '👍',
          createdAt: new Date().toISOString()
        };
        
        setPosts(prevPosts => 
          prevPosts.map(post => {
            if (post.id === postId) {
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
        const newCommentObj = {
          id: response.id || Date.now().toString(),
          user: {
            id: currentUser.id,
            username: currentUser.username,
            avatar: currentUser.profilePicture
          },
          content: newComment,
          createdAt: new Date().toISOString()
        };
  
        setPosts(prevPosts =>
          prevPosts.map(post => {
            if (post.id === postId) {
              return {
                ...post,
                comments: post.comments + 1,
                commentsList: [...post.commentsList, newCommentObj]
              };
            }
            return post;
          })
        );
  
        setNewComment('');
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

  const navigateToUserProfile = (userId: string) => {
    localStorage.setItem('viewUserId', userId);
    window.location.href = '/user';
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Profile Header */}
      <div className="px-4 pt-8 pb-4 bg-gradient-to-b from-primary/5 to-background rounded-b-3xl">
        <div className="flex flex-col items-center md:flex-row md:items-start md:gap-8">
          {/* Profile Photo */}
          <div className="relative mb-6 md:mb-0">
          <Avatar className="h-40 w-40">
                   <img 
                      src={userProfile.profilePicture} 
                   alt="NaN"
                     className="h-full w-full object-cover"
                    />
                </Avatar>
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold mb-2">{userProfile.name}</h1>
                <p className="text-muted-foreground">{userProfile.bio}</p>
                
                {/* Stats Section */}
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
                  {true && (
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
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-4 md:mt-0">
                {/* Message Button */}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 hover:text-primary"
                  onClick={() => {
                    localStorage.setItem('messageUserId', userProfile.userId);
                    localStorage.setItem('messageUserName', userProfile.name);
                    localStorage.setItem('messageUserAvatar', userProfile.profilePicture);
                    window.location.href = '/messages';
                  }}
                >
                  <MessageCircle className="h-5 w-5" />
                </Button>
                  {/* Report Button - Only visible if not own profile */}
                {!isOwnProfile && (
                  <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 hover:text-destructive"
                      >
                        <Flag className="h-5 w-5" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Report User</DialogTitle>
                        <DialogDescription>
                          Please select a reason for reporting this user.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Select onValueChange={(value) => {
                          setSelectedReason(value);
                          if (value !== 'other') {
                            setCustomReason('');
                          }
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a reason" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="spam">Spam</SelectItem>
                            <SelectItem value="harassment">Harassment</SelectItem>
                            <SelectItem value="inappropriate">Inappropriate Content</SelectItem>
                            <SelectItem value="impersonation">Impersonation</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>

                        {selectedReason === 'other' && (
                          <Textarea
                            placeholder="Please specify the reason..."
                            value={customReason}
                            onChange={(e) => setCustomReason(e.target.value)}
                            className="min-h-[100px]"
                          />
                        )}

                        <div className="flex justify-end">
                          <Button 
                            onClick={async () => {
                              await handleReport(selectedReason === 'other' ? customReason : selectedReason);
                              setSelectedReason("");
                              setCustomReason("");
                              setIsReportDialogOpen(false);
                            }}
                            disabled={!selectedReason || (selectedReason === 'other' && !customReason.trim())}
                          >
                            Done
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                {/* Follow/Unfollow Button - Only visible if not own profile */}
                {!isOwnProfile && (
                  <Button
                    variant="outline"
                    className="hover:text-primary"
                    onClick={isFollowing ? handleUnfollow : handleFollow}
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus className="h-5 w-5 mr-2" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-5 w-5 mr-2" />
                        Follow
                      </>
                    )}
                  </Button>
                )}

                
              </div>
            </div>

            {/* Rest of profile info */}
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
              <Avatar className="h-10 w-10">
                   <img 
                      src={userProfile.profilePicture} 
                   alt="NaN"
                     className="h-full w-full object-cover"
                    />
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">{userProfile.name}</h3>
                  <p className="text-sm text-muted-foreground">{post.createdAt}</p>
                </div>
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
                        post.likedBy.some(like => like.user.id === localStorage.getItem('userId'))
                          ? 'fill-current text-red-500' 
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
                                <p 
                                  className="font-medium cursor-pointer hover:opacity-80"
                                  onClick={() => navigateToUserProfile(rct.user.id)}
                                >
                                  {rct.user.username}
                                </p>
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
