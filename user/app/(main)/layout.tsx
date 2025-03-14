'use client';

import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Share2, Home, Bell, MessageCircle, User, LogOut, Menu, Search, Check, UserPlus, PenSquare, Clock, CheckCircle, XCircle, List, SearchIcon, Heart } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetTrigger
} from '@/components/ui/sheet';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import { ProgressTimer } from '@/components/ui/progress-timer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from '../apiconnector/api';
import { auth } from '@/lib/Firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { set } from 'zod';
import { toast } from 'react-toastify';
import { navigateToUserProfile } from '@/lib/navigation';
// import { timeAgo } from '@/utils/timeAgo';

interface SuggestedUser {
  id: number;
  name: string;
  username: string;
  profilePicture: string;  // Make sure this matches your API response
  bio: string;            // Added bio field as it's used in the UI
  status: string;         // Added status field as it's used in the UI
}

interface Connection {
  status: string;
  id: number;
  username: string;
  profilePicture: string;  // Make sure this matches your API response
}

interface Notification {
  id: string;
  userId: string;
  type: string;
  content: string;
  read: boolean;
  createdAt: string;
}

const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/djvat4mcp/image/upload/v1741357526/";
const DEFAULT_AVATAR = "https://res.cloudinary.com/djvat4mcp/image/upload/v1741357526/zybt9ffewrjwhq7tyvy1.png";

const getFullImageUrl = (profilePicture: string | null | undefined): string => {
  if (!profilePicture) return DEFAULT_AVATAR;
  if (profilePicture.startsWith('http')) return profilePicture;
  return CLOUDINARY_BASE_URL + profilePicture;
};

export function timeAgo(dateString: string) {
  try {
    if (!dateString) {
      return 'Just now';
    }

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
    console.error('Error parsing date:', error);
    return 'Just now';
  }
}

// Add helper function to filter out blocked users
const filterBlockedUsers = (users: any[]) => {
  return users.filter(user => user.status !== "0" && user.status !== 0);
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [suggestedUsers, setSuggestedUser] = useState<SuggestedUser[]>([]);
  // const [userId,setUserId] = useState("");

  // Add state for notification count
  const [notificationCount, setNotificationCount] = useState(0);

  // Add state for unread messages count
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  // Add this state near your other state declarations
  const [connectionUpdateTrigger, setConnectionUpdateTrigger] = useState(0);

  // Add this state for tracking updates
  const [notificationUpdateTrigger, setNotificationUpdateTrigger] = useState(0);

  useEffect(() => {
    let userId = localStorage.getItem('userId') || "404";
    const fetchSuggestedUser = async () => {
      try {
        const res = await apiRequest(`followers/${userId}/notfollowed`, "GET");
        console.log("Suggested users response:", res);
        setSuggestedUser(res);
      } catch (error) {
        console.error("Error fetching suggested users:", error);
      }
    }

    fetchSuggestedUser();
  }, [connectionUpdateTrigger]); // Add connectionUpdateTrigger to dependencies

  const [myConnections, setMyConnections] = useState<Connection[]>([]);

  const [currentUser, setCurrentUser] = useState({
    username: '',
    email: '',
    photoURL: '',
    bio: ''
  });

  // Update the state to use an object instead of array
  const [sentRequests, setSentRequests] = useState<Record<string, boolean>>({});
  const [pendingRequests, setPendingRequests] = useState<Record<string, boolean>>({});
  const [isConnectionsModalOpen, setIsConnectionsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSuggestionsModalOpen, setIsSuggestionsModalOpen] = useState(false);
  const [suggestionsSearchQuery, setSuggestionsSearchQuery] = useState("");
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{
    id: string;
    username: string;
    profilePicture: string;
    isConnection: boolean;
  }>>([]);
  const [userPosts, setUserPosts] = useState<any[]>([]);

  // Add function to fetch notification count
  const fetchNotificationCount = async () => {
    try {
      const userId = localStorage.getItem('userId') || "404";
      const response = await apiRequest(`notifications/${userId}`, 'GET');
      
      // Ensure notifications is always an array
      const notifications = Array.isArray(response) ? response : [];
      
      const unreadCount = notifications.filter((notif: any) => 
        // Check if notification exists and is unread
        notif && notif.read === false
      ).length;
      
      setNotificationCount(unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotificationCount(0);
    }
  };

  // Add function to fetch unread messages count
  const fetchUnreadMessagesCount = async () => {
    try {
      const userId = localStorage.getItem('userId') || "404";
      const messages = await apiRequest(`messages/user/${userId}`, 'GET');
      
      // Count unread messages where current user is the receiver
      const unreadCount = messages.filter((msg: any) => 
        msg.receiverId === userId && !msg.isRead
      ).length;
      
      setUnreadMessagesCount(unreadCount);
    } catch (error) {
      console.error('Error fetching unread messages:', error);
      setUnreadMessagesCount(0);
    }
  };

  // Update the navigation array
  const navigation = [
    { name: 'Home', href: '/home', icon: Home, notifications: 0 },
    { name: 'Notifications', href: '/notifications', icon: Bell, notifications: notificationCount },
    { name: 'Messages', href: '/messages', icon: MessageCircle, notifications: unreadMessagesCount },
    { name: 'Profile', href: '/profile', icon: User, notifications: 0 },
    { name: 'My Posts', href: null, icon: PenSquare, notifications: 0 }, // Change href to null
  ];

  const allSuggestedUsers: SuggestedUser[] = suggestedUsers?.slice(0, 3);


  const router = useRouter();
  // const { signOut } = useAuth();

  const handleNavClick = (href: string, name: string) => {
    if (name === 'Post') {
      setIsPostModalOpen(true);
    } else {
      router.push(href);
    }
  };

  // Update the sentTheConnectionReq function
  const sentTheConnectionReq = async (followingId: string, followerId: string) => {
    const dataToBeSend = {
      followerId,
      followingId
    };
  
    try {
      const res = await apiRequest(`followers/follow?followerId=${followerId}&followingId=${followingId}`, "POST");
      if (res) {
        // Trigger refresh by incrementing the update counter
        setConnectionUpdateTrigger(prev => prev + 1);
        // Update local state
        setSuggestedUser(prev => prev.filter(user => user.id.toString() !== followingId));
        toast.success('Connection request sent successfully');
      }
    } catch (error) {
      console.error("Error: ", error);
      toast.error('Failed to send connection request');
    }
  };

  // Update fetchAllTheConnection function to filter out blocked users
  const fetchAllTheConnection = async () => {
    try {
      let userId = localStorage.getItem('userId') || "404";
      const res = await apiRequest(`followers/${userId}/followed`, "GET") || [];
      // Filter out users with status 0
      const activeConnections = res.filter((user: any) => user.status !== "0" && user.status !== 0);
      setMyConnections(activeConnections);
    } catch (error) {
      console.error("Error fetching connections:", error);
      setMyConnections([]);
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    // Add Firebase auth listener
    const unsubscribe = onAuthStateChanged(auth, async (user) => {

      console.log(user, "is the user");
      if (user) {
        let userId = localStorage.getItem('userId') || "404";
        const User = await apiRequest(`users/${userId}`, 'GET') || {};
        console.log(User,user, "is the user");
        setCurrentUser({
          username: User.username || 'Loading...',
          bio: User.bio || 'Loading...',
          email: User.email || 'Loading...',
          photoURL: user.photoURL || DEFAULT_AVATAR
        });
      }else{
        router.push("/login");
      }
    });

    fetchAllTheConnection();
    fetchNotificationCount();
    fetchUnreadMessagesCount(); // Add this line

    const notificationInterval = setInterval(fetchNotificationCount, 30000);
    const messageInterval = setInterval(fetchUnreadMessagesCount, 30000); // Add this line

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe();
      clearInterval(notificationInterval);
      clearInterval(messageInterval); // Add this line
    };
  }, [connectionUpdateTrigger]); // Add connectionUpdateTrigger to dependencies

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        let userId = localStorage.getItem('userId') || "404";
        const userResponse = await apiRequest(`users/${userId}`, 'GET') || {};
        
        // Get the profile picture directly from the API response
        const profilePicture = userResponse.profilePicture ? 
          CLOUDINARY_BASE_URL + userResponse.profilePicture : 
          DEFAULT_AVATAR;
  
        // Update localStorage with new user's profile picture
        localStorage.setItem("profile_picture", profilePicture);
        
        setCurrentUser({
          username: userResponse.username || user.email?.split('@')[0] || 'User',
          email: userResponse.email || user.email || '',
          photoURL: profilePicture,
          bio: userResponse.bio || ''
        });
      } else {
        // Clear user data when logged out
        setCurrentUser({
          username: '',
          email: '',
          photoURL: DEFAULT_AVATAR,
          bio: ''
        });
        router.push("/login");
      }
    });
  
    return () => unsubscribe();
  }, []);

  const fetchUserPosts = async () => {
    try {
      const userId = localStorage.getItem('userId') || "404";
      const posts = await apiRequest(`posts/user/${userId}`, 'GET') || [];
  
      const allPosts = posts.map((post: any) => ({
        id: post.id,
        content: post.content,
        time: timeAgo(post.updatedAt || post.createdAt), // Use updatedAt if available
        status: post.status
      }));
  
      setUserPosts(allPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to fetch posts');
    }
  };
  
  useEffect(() => {
    if (isPostModalOpen) {
      fetchUserPosts();
    }
  }, [isPostModalOpen]);

  // Update fetchUsers function to filter out blocked users
  const fetchUsers = async (query: string) => {
    try {
      // Filter existing connections and suggested users based on query and status
      const filteredConnections = myConnections
        .filter(user => 
          user.username.toLowerCase().includes(query.toLowerCase()) && 
          user.status !== "0" && 
          Number(user.status) !== 0
        )
        .map(user => ({
          ...user,
          id: user.id.toString(),
          isConnection: true
        }));
  
      const filteredSuggestions = suggestedUsers
        .filter(user => 
          user.username.toLowerCase().includes(query.toLowerCase()) && 
          user.status !== "0" && 
          Number(user.status) !== 0
        )
        .map(user => ({
          ...user,
          id: user.id.toString(),
          isConnection: false
        }));
  
      // Combine and set results
      const combinedResults = [...filteredConnections, ...filteredSuggestions];
      setSearchResults(combinedResults);
    } catch (error) {
      console.error('Error processing users:', error);
      toast.error('Failed to fetch users');
    }
  };

  const showSidebars = !pathname?.includes('/landing');

  const handleMessageClick = (userId: string, username: string, profilePicture: string) => {
    localStorage.setItem('messageUserId', userId);
    localStorage.setItem('messageUserName', username);
    localStorage.setItem('messageUserAvatar', getFullImageUrl(profilePicture));
    window.location.href = '/messages';
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);

    // Initial fetch
    fetchAllTheConnection();
    fetchNotificationCount();
    fetchUnreadMessagesCount();

    // Set up intervals for periodic updates
    const notificationInterval = setInterval(() => {
      fetchNotificationCount();
      setNotificationUpdateTrigger(prev => prev + 1);
    }, 5000); // Check every 5 seconds

    const messageInterval = setInterval(fetchUnreadMessagesCount, 30000);

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(notificationInterval);
      clearInterval(messageInterval);
    };
  }, [connectionUpdateTrigger]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      {
        showSidebars && (
          <header className={`fixed top-0 w-full z-50 transition-all duration-200 ${scrolled
            ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm"
            : "bg-background"
            }`}>
            <div className="container flex h-16 items-center justify-between px-6">
              <div className="flex items-center gap-3 animate-fade-in pl-2">
                <div className="flex items-center">
                  <Image
                    onClick={() => router.push('/home')}
                    src="/logo.png"
                    alt="FILxCONNECT Logo"
                    width={45}
                    height={45}
                    className="object-contain"
                  />
                </div>
                <span className="text-xl font-bold text-primary">FILxCONNECT</span>
              </div>

              {/* Replace the existing search input in the header */}
              <div className="hidden md:flex max-w-md flex-1 mx-8">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                  onClick={() => setIsSearchDialogOpen(true)}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search connections...
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <ThemeToggle />

                <div className="md:hidden">
                  <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="hover-scale">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[80%] sm:w-[350px]">
                      <div className="flex flex-col h-full">
                        <div className="flex items-center gap-4 p-4 border-b">
                          <Avatar className="h-10 w-10">
                            <img src={currentUser.photoURL} alt="User" />
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{currentUser.username}</h3>
                            <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                          </div>
                        </div>

                        <nav className="flex-1 p-4 space-y-2">
                          {navigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                              <Button
                                key={item.name}
                                variant={isActive ? 'default' : 'ghost'}
                                className="w-full justify-start hover-scale"
                                onClick={() => {
                                  if (item.name === 'My Posts') {
                                    setIsPostModalOpen(true);
                                  } else if (item.href) {
                                    router.push(item.href);
                                  }
                                }}
                              >
                                <Icon className="mr-2 h-5 w-5" />
                                {item.name}
                                {item.notifications > 0 && (
                                  <Badge variant="destructive" className="ml-auto">
                                    {item.notifications}
                                  </Badge>
                                )}
                              </Button>
                            );
                          })}
                        </nav>

                        <div className="p-4 border-t">
                          <Button
                            variant="outline"
                            className="w-full justify-start hover-scale"
                            onClick={async () => {
                              await signOut(auth);
                              router.push('/login');
                            }}
                          >
                            <LogOut className="mr-2 h-5 w-5" />
                            Logout
                          </Button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>

                <div className="hidden md:block">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover-scale"
                    onClick={async () => {
                      await signOut(auth);
                      router.push('/login');
                    }}
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </header>
        )
      }

      {/* Sidebar Navigation */}
      {showSidebars && (
        <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 p-4 hidden md:block animate-fade-in">
          {/* Replace the existing sidebar user section */}
          <div className="flex items-center gap-3 mb-4 p-2">
            <Avatar className="h-10 w-10"
            onClick={() => router.push('/profile')}>
                   <img 
                      src= {currentUser.photoURL || "https://res.cloudinary.com/djvat4mcp/image/upload/v1741357526/zybt9ffewrjwhq7tyvy1.png"} 
                      alt="NaN"
                     className="h-full w-full object-cover"
                     onError={(e)=>{}}
                    />
                </Avatar>
            <div>
              <h3 className="font-medium">{currentUser.username}</h3>
              <p className="text-sm text-muted-foreground">{currentUser.bio}</p>
            </div>
          </div>

          <nav className="space-y-1 mb-4">
            {navigation.map((item, index) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Button
                  key={item.name}
                  variant={isActive ? 'default' : 'ghost'}
                  className="w-full justify-start hover-scale animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => {
                    if (item.name === 'My Posts') {
                      setIsPostModalOpen(true);
                    } else if (item.href) {
                      router.push(item.href);
                    }
                  }}
                >
                  <Icon className="mr-2 h-5 w-5" />
                  {item.name}
                  {item.notifications > 0 && (
                    <Badge variant="destructive" className="ml-auto">
                      {item.notifications}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </nav>

          <div className="mt-0">
            <h3 className="font-semibold mb-2 px-2">My Connections</h3>
            <div className="space-y-1 max-h-[200px] overflow-y-auto">
              {myConnections
                .filter(connection => 
                  connection.username.toLowerCase().includes(searchQuery.toLowerCase()) && 
                  connection.status !== "0" && 
                  Number(connection.status) !== 0
                )
                .map((connection) => (
                <Link
                  key={connection.id}
                  href={`/user`}
                  onClick={() => navigateToUserProfile(connection.id.toString())}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors group"
                >
                  <Avatar className="h-8 w-8">
                    <img 
                      src={getFullImageUrl(connection.profilePicture)}
                      alt={connection.username}
                      className="h-full w-full object-cover"
                    />
                  </Avatar>
                  <span className="text-xs font-medium truncate group-hover:text-primary transition-colors max-w-[120px]">
                    {connection.username}
                  </span>
                </Link>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 text-muted-foreground hover:text-primary"
              onClick={() => setIsConnectionsModalOpen(true)}
            >
              View all connections
            </Button>
          </div>
        </div>
      )}

      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background md:hidden z-10">
        <nav className="flex justify-around p-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Button
                key={item.name}
                variant="ghost"
                size="icon"
                className={`hover-scale ${isActive ? 'text-primary' : ''}`}
                onClick={() => {
                  if (item.name === 'My Posts') {
                    setIsPostModalOpen(true);
                  } else if (item.href) {
                    router.push(item.href);
                  }
                }}
              >
                <Icon className="h-5 w-5" />
                {item.notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-4 h-4 text-xs flex items-center justify-center">
                    {item.notifications}
                  </span>
                )}
              </Button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <main className={`pt-16 ${showSidebars ? 'md:pl-64 md:pr-80' : ''} min-h-screen pb-16 md:pb-0`}>
        {children}
      </main>

      {/* Add the People You May Know section */}
      {showSidebars && (
        <div className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-80 p-4 hidden md:block animate-fade-in">
          <h3 className="font-semibold mb-4 animate-slide-up">People you may know</h3>
          <div className="space-y-3">
            {allSuggestedUsers.map((user: any, index: number) => {
              const isRequestSent = sentRequests[user.id];
              
              // Skip rendering if user is blocked
              if (user.status === "0" || user.status === 0) return null;
            
              return (
                <Card
                  key={user.id}
                  className="p-4 hover-scale transition-all animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10"
                    onClick={() => navigateToUserProfile(user.id.toString())}>
                      <img 
                        src={getFullImageUrl(user.profilePicture)}
                        alt={user.username}
                        className="h-full w-full object-cover"
                      />
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.username}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.bio}</p>
                    </div>
                    <Button
                      size="sm"
                      variant={isRequestSent ? "ghost" : "ghost"}
                      className={`hover-scale ml-2 transition-all duration-300 ${isRequestSent ? "text-green-500" : ""
                        }`}
                      onClick={() => {
                        if (!isRequestSent && !pendingRequests[user.id]) {
                          let userId = localStorage.getItem('userId') || "404";
                          sentTheConnectionReq(user.id.toString(), userId);
                          setPendingRequests(prev => ({ ...prev, [user.id]: true }));
                          setTimeout(() => {
                            setPendingRequests(prev => {
                              const newPending = { ...prev };
                              delete newPending[user.id];
                              return newPending;
                            });
                            setSentRequests(prev => ({ ...prev, [user.id]: true }));
                          }, 3000);
                        }
                      }}
                      disabled={isRequestSent || pendingRequests[user.id]}
                    >
                      <div className="relative w-5 h-5">
                        {pendingRequests[user.id] ? (
                          <ProgressTimer
                            duration={3}
                            onComplete={() => {
                              setPendingRequests(prev => {
                                const newPending = { ...prev };
                                delete newPending[user.id];
                                return newPending;
                              });
                              setSentRequests(prev => ({ ...prev, [user.id]: true }));
                            }}
                          />
                        ) : (
                          <div className={`absolute inset-0 transition-all duration-300 transform ${isRequestSent ? "opacity-0 scale-0" : "opacity-100 scale-100"
                            }`}>
                            <UserPlus className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
          <p className="text-sm text-muted-foreground text-center mt-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Button
              variant="link"
              className="text-muted-foreground hover:text-primary"
              onClick={() => setIsSuggestionsModalOpen(true)}
            >
              View more suggestions →
            </Button>
          </p>
        </div>
      )}

      <Dialog open={isConnectionsModalOpen} onOpenChange={setIsConnectionsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              My Connections
            </DialogTitle>
          </DialogHeader>

          <div className="relative my-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search connections..."
              className="w-full pl-10 bg-muted/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-3">
              {myConnections
                .filter(connection =>
                  connection.username.toLowerCase().includes(searchQuery.toLowerCase()) && 
                  connection.status !== "0" && 
                  Number(connection.status) !== 0
                )
                .map((connection) => (
                  <div
                    key={connection.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-all duration-200"
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12"
                      onClick={() => navigateToUserProfile(connection.id.toString())}>
                        <img 
                          src={getFullImageUrl(connection.profilePicture)}
                          alt={connection.username}
                          className="h-full w-full object-cover"
                        />
                      </Avatar>
                      
                    </div>

                    <div className="flex-1">
                      <h4 className="text-sm font-medium truncate max-w-[200px]">{connection.username}</h4>
                      
                    </div>

                    <Button 
                      variant="secondary"
                      size="sm"
                      className="hover-scale"
                      onClick={() => handleMessageClick(
                        connection.id.toString(),
                        connection.username,
                        connection.profilePicture
                      )}
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Message
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isSuggestionsModalOpen} onOpenChange={setIsSuggestionsModalOpen}>
  <DialogContent className="max-w-2xl h-[80vh] overflow-hidden flex flex-col">
    <DialogHeader className="sticky top-0 bg-background z-10 pb-4">
      <div className="flex items-center">
        <DialogTitle className="text-lg font-bold">
          Suggested Connections
        </DialogTitle>
      </div>
      <div className="relative mt-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search people..."
          className="w-full pl-10 pr-4 bg-muted/50"
          value={suggestionsSearchQuery}
          onChange={(e) => setSuggestionsSearchQuery(e.target.value)}
        />
      </div>
    </DialogHeader>

          <div className="flex-1 overflow-y-auto dialog-scroll pr-4 -mr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestedUsers
                .filter(user =>
                  user.username.toLowerCase().includes(suggestionsSearchQuery.toLowerCase()) ||
                  user.username.toLowerCase().includes(suggestionsSearchQuery.toLowerCase())
                )
                .map((user) => {
                  const isRequestSent = sentRequests[user.id];

                  return (
                    <Card
                      key={user.id}
                      className="p-4 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12"
                        onClick={() => navigateToUserProfile(user.id.toString())}>
                          <img 
                            src={getFullImageUrl(user.profilePicture)}
                            alt={user.username}
                            className="h-full w-full object-cover"
                          />
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          {/* <p className="font-medium truncate">{user.name}</p>
                          <p className="text-sm text-muted-foreground truncate">{user.title}</p> */}
                          <p className="text-sm font-medium truncate max-w-[150px]">{user.username}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.bio}</p>
                        </div>
                        <Button
                          size="sm"
                          variant={isRequestSent ? "ghost" : "default"}
                          className={`transition-all duration-300 ${isRequestSent ? "text-green-500" : ""
                            }`}
                          onClick={() => {
                            if (!isRequestSent && !pendingRequests[user.id]) {
                              let userId = localStorage.getItem('userId') || "404";
                              sentTheConnectionReq(user.id.toString(), userId);
                              setPendingRequests(prev => ({ ...prev, [user.id]: true }));
                              setTimeout(() => {
                                setPendingRequests(prev => {
                                  const newPending = { ...prev };
                                  delete newPending[user.id];
                                  return newPending;
                                });
                                setSentRequests(prev => ({ ...prev, [user.id]: true }));
                              }, 3000);
                            }
                          }}
                          disabled={isRequestSent || pendingRequests[user.id]}
                        >
                          {isRequestSent ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <UserPlus className="h-4 w-4" />
                          )}
                          
                        </Button>
                      </div>
                    </Card>
                  );
                })}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isPostModalOpen} onOpenChange={setIsPostModalOpen}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-2xl font-bold mb-4">My Posts</DialogTitle>
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="w-full flex overflow-x-auto scrollbar-hide">
                <TabsTrigger value="pending" className="flex-1 flex items-center gap-2 min-w-[120px]">
                  <Clock className="h-4 w-4" />
                  Pending
                </TabsTrigger>
                <TabsTrigger value="approved" className="flex-1 flex items-center gap-2 min-w-[120px]">
                  <CheckCircle className="h-4 w-4" />
                  Approved
                </TabsTrigger>
                <TabsTrigger value="rejected" className="flex-1 flex items-center gap-2 min-w-[120px]">
                  <XCircle className="h-4 w-4" />
                  Rejected
                </TabsTrigger>
                <TabsTrigger value="all" className="flex-1 flex items-center gap-2 min-w-[120px]">
                  <List className="h-4 w-4" />
                  All Posts
                </TabsTrigger>
              </TabsList>
              
              <div className="overflow-y-auto max-h-[calc(80vh-180px)] p-6">
                <TabsContent value="pending" className="mt-4">
                  <div className="space-y-4">
                    {userPosts.filter(post => post.status === "3").length > 0 ? (
                      userPosts
                        .filter(post => post.status === "3")
                        .map((post) => (
                          <Card key={post.id} className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <p className="text-sm text-muted-foreground">{post.time}</p>
                              <Badge 
                              variant='secondary'
                            >
                               Pending
                            </Badge>
                            </div>
                            <p className="mb-4">{post.content}</p>
                          </Card>
                        ))
                    ) : (
                      <Card className="p-4">
                        <p className="text-muted-foreground">No pending posts</p>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="approved" className="mt-4">
                  <div className="space-y-4">
                    {userPosts.filter(post => post.status === "1").length > 0 ? (
                      userPosts
                        .filter(post => post.status === "1")
                        .map((post) => (
                          <Card key={post.id} className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <p className="text-sm text-muted-foreground">{post.time}</p>
                              <Badge variant="outline" className="bg-green-50 text-green-600">Approved</Badge>
                            </div>
                            <p className="mb-4">{post.content}</p>
                          </Card>
                        ))
                    ) : (
                      <Card className="p-4">
                        <p className="text-muted-foreground">No approved posts</p>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="rejected" className="mt-4">
                  <div className="space-y-4">
                    {userPosts.filter(post => post.status === "0").length > 0 ? (
                      userPosts
                        .filter(post => post.status === "0")
                        .map((post) => (
                          <Card key={post.id} className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <p className="text-sm text-muted-foreground">{post.time}</p>
                              <Badge variant="destructive">Rejected</Badge>
                            </div>
                            <p className="mb-4">{post.content}</p>
                          </Card>
                        ))
                    ) : (
                      <Card className="p-4">
                        <p className="text-muted-foreground">No rejected posts</p>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="all" className="mt-4">
                  <div className="space-y-4">
                    {userPosts.length > 0 ? (
                      userPosts.map((post) => (
                        <Card key={post.id} className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-sm text-muted-foreground">{post.time}</p>
                            <Badge 
                              variant={
                                post.status === "1" ? 'outline' : 
                                post.status === "0" ? 'destructive' : 
                                'secondary'
                              }
                              className={post.status === "1" ? 'bg-green-50 text-green-600' : ''}
                            >
                              {post.status === "1" ? "Approved" : 
                               post.status === "0" ? "Rejected" : 
                               "Pending"}
                            </Badge>
                          </div>
                          <p className="mb-4">{post.content}</p>
                          {/* {post.status === "1" && (
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Heart className="h-4 w-4" /> {post.likes}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="h-4 w-4" /> {post.comments}
                              </span>
                            </div>
                          )} */}
                          
                        </Card>
                      ))
                    ) : (
                      <Card className="p-4">
                        <p className="text-muted-foreground">No posts found</p>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog open={isSearchDialogOpen} onOpenChange={setIsSearchDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Search Users
            </DialogTitle>
          </DialogHeader>

          <div className="relative my-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users..."
              className="w-full pl-10 bg-muted/50"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                fetchUsers(e.target.value);
              }}
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-3">
              {searchResults
                .map((user) => {
                const isRequestSent = sentRequests[user.id];

                return (
                  <div
                    key={user.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-all duration-200"
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <img 
                          src={getFullImageUrl(user.profilePicture)}
                          alt={user.username}
                          className="h-full w-full object-cover"
                        />
                      </Avatar>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{user.username}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      {!user.isConnection && (
                        <Button
                          size="sm"
                          variant={isRequestSent ? "ghost" : "default"}
                          className={`transition-all duration-300 ${
                            isRequestSent ? "text-green-500" : ""
                          }`}
                          onClick={() => {
                            if (!isRequestSent) {
                              let userId = localStorage.getItem('userId') || "404";
                              sentTheConnectionReq(user.id.toString(), userId);
                              setSentRequests(prev => ({ ...prev, [user.id]: true }));
                            }
                          }}
                          disabled={isRequestSent}
                        >
                          {isRequestSent ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4 mr-2" />
                              
                            </>
                          )}
                        </Button>
                      )}
                      
                      <Link
                      onClick={() => navigateToUserProfile(user.id)}
                       href={`/user`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}