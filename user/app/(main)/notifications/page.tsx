'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Eye, MoreHorizontal } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { apiRequest } from '@/app/apiconnector/api';
import { toast } from 'react-toastify';
import router from 'next/router';
import { navigateToPost } from '@/lib/navigation';

// Remove the NotificationType type and getNotificationIcon function since they're not needed
interface Notification {
  id: string;
  userId: string;
  sender: string;
  senderPic: string;
  postId?: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Add the Cloudinary URL constant
  const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/djvat4mcp/image/upload/v1741357526/";
  const DEFAULT_AVATAR = "https://res.cloudinary.com/djvat4mcp/image/upload/v1741357526/zybt9ffewrjwhq7tyvy1.png";

  // Add function to get full image URL
  const getFullImageUrl = (profilePicture: string | null | undefined): string => {
    if (!profilePicture) return DEFAULT_AVATAR;
    if (profilePicture.startsWith('http')) return profilePicture;
    return CLOUDINARY_BASE_URL + profilePicture;
  };

  // Add function to format time
  const timeAgo = (dateString: string) => {
    // Parse the ISO 8601 date string
    const date = new Date(dateString);
    const now = new Date();
  
    // Calculate time difference in seconds
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
  
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
      }
    }
    
    return 'Just now';
  };

  // Update the fetchNotifications function to ensure we always have an array and sort by createdAt
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const userId = localStorage.getItem('userId') || "404";
      const response = await apiRequest(`notifications/${userId}`, 'GET');
      
      // Ensure response is an array and sort by createdAt
      const notificationsArray = Array.isArray(response) ? response : [];
      const sortedNotifications = notificationsArray.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setNotifications(sortedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
      setNotifications([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  // Update useEffect to fetch notifications
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Update mark as read function with correct API endpoint
  const markAsRead = async (id: string) => {
    try {
      await apiRequest(`notifications/${id}`, 'PUT');
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  // Update mark all as read function with correct API endpoint
  const markAllAsRead = async () => {
    try {
      const userId = localStorage.getItem('userId') || "404";
      const response = await apiRequest(`notifications/mark-all/${userId}`, 'PUT');
      
      // Only update the UI if the API call was successful
      if (response !== undefined) {
        setNotifications(notifications.map(notification => ({ ...notification, read: true })));
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  // Update the filtered notifications logic to handle potential undefined
  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : (Array.isArray(notifications) ? notifications.filter(n => !n.read) : []);
  
  // Animation for notifications
  useEffect(() => {
    const notificationElements = document.querySelectorAll('.notification-card');
    notificationElements.forEach((element, index) => {
      setTimeout(() => {
        element.classList.add('animate-slide-up');
      }, index * 100);
    });
  }, [activeTab]);

  // Update the notification card rendering
  return (
    <div className="max-w-2xl mx-auto py-8 px-4 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Button 
          variant="outline" 
          size="sm"
          onClick={markAllAsRead}
          className="hover-scale"
        >
          Mark all as read
        </Button>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full grid grid-cols-2 h-12">
          <TabsTrigger value="all" className="hover-scale">All</TabsTrigger>
          <TabsTrigger value="unread" className="hover-scale">Unread</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`p-4 notification-card hover-scale transition-all ${!notification.read ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                onClick={() => {
                  markAsRead(notification.id);
                  if (notification.postId && !notification.read && !notification.message.includes('rejected')) {
                    navigateToPost(notification.postId);
                  }
                }}
              >
                <div className="flex items-start gap-4">
                  <Avatar className="w-10 h-10">
                    <img 
                      src={getFullImageUrl(notification.senderPic)}
                      alt={notification.sender}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.src = DEFAULT_AVATAR;
                      }}
                    />
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{notification.sender}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo(notification.createdAt)}</p>
                  </div>
                  
                  <div className="flex items-center">
                    {!notification.read && (
                      <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                    )}
                    
                    {notification.postId && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!notification.read && (
                            <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                              Mark as read
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigateToPost(notification.postId ?? "404")}
                            >
                              <Eye className="h-5 w-5 mr-2" />
                              View Post
                            </Button>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground animate-fade-in">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>No notifications to display</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}