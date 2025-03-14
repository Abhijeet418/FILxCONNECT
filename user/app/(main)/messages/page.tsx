'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Search, Send, Smile, MoreVertical, MessageCircle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiRequest } from '@/app/apiconnector/api';
import { toast } from 'sonner';
// import { getFullImageUrl } from '@/lib/utils';

interface Contact {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

// Update Message interface
interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  time: string;
  isRead: boolean;  // Changed from read to isread to match API
}

export default function MessagesPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Add the Cloudinary URL constant
  const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/djvat4mcp/image/upload/v1741357526/";
  const DEFAULT_AVATAR = "https://res.cloudinary.com/djvat4mcp/image/upload/v1741357526/zybt9ffewrjwhq7tyvy1.png";
  // Add function to get full image URL
  const getFullImageUrl = (profilePicture: string | null | undefined): string => {
    if (!profilePicture) return DEFAULT_AVATAR;
    if (profilePicture.startsWith('http')) return profilePicture;
    return CLOUDINARY_BASE_URL + profilePicture;
  };

  // Add this state to track updates
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [messageUpdateKey, setMessageUpdateKey] = useState(0);

  // Update fetchConnections to fetch all users with conversations
  const fetchConnections = async () => {
    try {
      const userId = localStorage.getItem('userId') || "404";
      
      // Get all messages for the current user
      const allMessages = await apiRequest(`messages/user/${userId}`, 'GET') || [];
      
      // Extract unique user IDs from messages (both senders and receivers)
      const uniqueUserIds = new Set(
        allMessages.flatMap((msg: any) => [msg.senderId, msg.receiverId])
          .filter((id: string) => id !== userId) // Remove current user's ID
      );
  
      // Map unique users to Contact interface
      const contactsList = await Promise.all(
        Array.from(uniqueUserIds).map(async (value) => {
          const userId = value as string;
          const userDetails = await apiRequest(`users/${userId}`, 'GET');
          
          // Find the latest message with this user
          const userMessages = allMessages.filter((msg: any) => 
            msg.senderId === userId || msg.receiverId === userId
          );
          const latestMessage = userMessages.sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0];
  
          return {
            id: userDetails.id,
            name: userDetails.username,
            avatar: getFullImageUrl(userDetails.profilePicture),
            bio: userDetails.bio || 'No bio available',
            lastMessage: latestMessage?.content || "No messages yet",
            time: latestMessage ? new Date(latestMessage.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            }) : "Never",
            unread: userMessages.filter((msg: any) => 
              msg.receiverId === userId && !msg.isread
            ).length,
            online: false // You can update this if you have online status functionality
          };
        })
      );
  
      // Sort contacts by latest message time
      const sortedContacts = contactsList.sort((a, b) => {
        const timeA = a.time === "Never" ? 0 : new Date(a.time).getTime();
        const timeB = b.time === "Never" ? 0 : new Date(b.time).getTime();
        return timeB - timeA;
      });
  
      setContacts(sortedContacts);
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast.error('Failed to load contacts');
    }
  };

  // Update fetchLatestMessages function
  // Update fetchLatestMessages function with debug logs
const fetchLatestMessages = async () => {
    try {
      const userId = localStorage.getItem('userId') || "404";
      const allMessages = await apiRequest(`messages/user/${userId}`, 'GET');
      
      console.log('All messages received:', allMessages);
      
      if (allMessages) {
        setContacts(prevContacts => 
          prevContacts.map(contact => {
            // Get all messages between current user and this contact
            const contactMessages = allMessages.filter((msg: any) => 
              (msg.senderId === contact.id && msg.receiverId === userId) || 
              (msg.senderId === userId && msg.receiverId === contact.id)
            );
            
            console.log(`Messages with ${contact.name}:`, contactMessages);
            
            // Only count unread messages FROM contact TO current user
            const unreadCount = contactMessages.filter((msg: any) => 
              msg.senderId === contact.id && 
              msg.receiverId === userId && 
              !msg.isRead
            ).length;
            
            console.log(`Unread count for ${contact.name}:`, {
              total: contactMessages.length,
              unread: unreadCount,
              fromContact: contactMessages.filter((msg: { senderId: string; }) => msg.senderId === contact.id).length,
              unreadFromContact: contactMessages.filter((msg: { senderId: string; isRead: any; }) => 
                msg.senderId === contact.id && !msg.isRead
              ).length
            });

            return {
              ...contact,
              lastMessage: contactMessages[0]?.content || "No messages yet",
              time: contactMessages[0] ? new Date(contactMessages[0].createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              }) : "Never",
              unread: unreadCount
            };
          })
        );
      }
    } catch (error) {
      console.error('Error fetching latest messages:', error);
      toast.error('Failed to load message previews');
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  useEffect(() => {
    const messageUserId = localStorage.getItem('messageUserId');
    const messageUserName = localStorage.getItem('messageUserName');
    const messageUserAvatar = localStorage.getItem('messageUserAvatar');

    const fetchAndSelectContact = async () => {
      await fetchConnections();
      
      if (messageUserId && messageUserName && messageUserAvatar) {
        const userDetails = await apiRequest(`users/${messageUserId}`, 'GET');
        // Create contact object from stored data
        const selectedContact: Contact = {
          id: messageUserId,
          name: messageUserName,
          bio: userDetails.bio || 'No bio available',
          avatar: messageUserAvatar,
          lastMessage: "No messages yet",
          time: "Now",
          unread: 0,
          online: true
        };
        
        // Select the contact
        selectContact(selectedContact);
        
        // Clear the stored message user data
        localStorage.removeItem('messageUserId');
        localStorage.removeItem('messageUserName');
        localStorage.removeItem('messageUserAvatar');
      }
    };

    fetchAndSelectContact();
  }, []);

  useEffect(() => {
    const initializeMessages = async () => {
      await fetchConnections();
      await fetchLatestMessages();
    };

    initializeMessages();
  }, []);

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Update the markMessagesAsRead function
  const markMessagesAsRead = async (messages: Message[]) => {
    try {
      const userId = localStorage.getItem('userId') || "404";
      const unreadMessages = messages.filter(msg => 
        msg.senderId !== userId && !msg.isRead
      );
  
      if (unreadMessages.length === 0) return;
  
      // Mark messages as read in backend
      await Promise.all(unreadMessages.map(async (msg) => {
        await apiRequest(`messages/mark/${msg.id}`, 'PUT');
      }));
  
      // Update local message states
      setMessages(prevMessages => 
        prevMessages.map(msg => ({
          ...msg,
          isread: msg.senderId !== userId ? true : msg.isRead
        }))
      );
  
      // Trigger a full refresh of messages and contacts
      await fetchLatestMessages();
      setUpdateTrigger(prev => prev + 1);
      setMessageUpdateKey(prev => prev + 1);
  
    } catch (error) {
      console.error('Error marking messages as read:', error);
      toast.error('Failed to mark messages as read');
    }
  };
  
  // Update the useEffect for periodic refresh
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      if (activeContact) {
        await fetchConversation(activeContact.id);
      }
      await fetchLatestMessages();
    }, 3000); // Refresh more frequently
  
    return () => clearInterval(refreshInterval);
  }, [activeContact, messageUpdateKey]);
  
  // Update the selectContact function
  const selectContact = async (contact: Contact) => {
    try {
      const userDetails = await apiRequest(`users/${contact.id}`, 'GET');
      
      setActiveContact({
        ...contact,
        bio: userDetails.bio || 'No bio available'
      });
      
      // Load conversation first
      await fetchConversation(contact.id);
      
      // Then mark messages as read
      await markMessagesAsRead(messages);
      
      // Force refresh everything
      setUpdateTrigger(prev => prev + 1);
  
    } catch (error) {
      console.error('Error selecting contact:', error);
      toast.error('Failed to load conversation');
    }
  };
  
  const sendMessage = async () => {
    if (!newMessage.trim() || !activeContact) return;
    
    try {
      const userId = localStorage.getItem('userId') || "404";
      const messageRequest = {
        senderId: userId,
        receiverId: activeContact.id,
        content: newMessage
      };
      
      const response = await apiRequest('messages/send', 'POST', messageRequest);
      
      if (response) {
        const newMsg: Message = {
          id: response.id,
          senderId: userId,
          receiverId: activeContact.id,
          content: newMessage,
          createdAt: response.createdAt,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: false
        };
        
        setMessages([...messages, newMsg]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Animation for contacts
  useEffect(() => {
    const contactElements = document.querySelectorAll('.contact-item');
    contactElements.forEach((element, index) => {
      setTimeout(() => {
        element.classList.add('animate-slide-up');
      }, index * 100);
    });
  }, [searchQuery]);

  // Update fetchConversation function
  const fetchConversation = async (contactId: string) => {
    try {
      const userId = localStorage.getItem('userId') || "404";
      
      // Fetch messages from user to contact
      const sentMessages = await apiRequest(`messages/conversation?senderId=${userId}&receiverId=${contactId}`, 'GET') || [];
      
      // Fetch messages from contact to user (TO us)
      const receivedMessages = await apiRequest(`messages/conversation?senderId=${contactId}&receiverId=${userId}`, 'GET') || [];
      
      // Combine and format all messages
      const allMessages = [...sentMessages, ...receivedMessages].map((msg: any) => ({
        id: msg.id,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        content: msg.content,
        createdAt: msg.createdAt,
        time: new Date(msg.createdAt).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        isRead: msg.isread || false
      }));
      
      // Sort messages by timestamp
      const sortedMessages = allMessages.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      
      // Only count unread messages from receivedMessages (messages TO us)
      const unreadCount = receivedMessages.filter((msg: { isread: any; }) => !msg.isread).length;
      
      setMessages(sortedMessages);
      
      // Update contacts list
      setContacts(prevContacts => 
        prevContacts.map(c => 
          c.id === contactId 
            ? { ...c, unread: unreadCount }
            : c
        )
      );
      await fetchLatestMessages();
      setMessageUpdateKey(prev => prev + 1);
      
    } catch (error) {
      console.error('Error fetching conversation:', error);
      toast.error('Failed to load conversation');
    }
  };

  const refreshMessages = async () => {
    try {
      if (activeContact) {
        await fetchConversation(activeContact.id);
      }
      await fetchLatestMessages();
      toast.success('Messages refreshed');
    } catch (error) {
      console.error('Error refreshing messages:', error);
      toast.error('Failed to refresh messages');
    }
  };

  // Add a new function for refreshing just the active conversation
  const refreshActiveConversation = async () => {
    try {
      if (activeContact) {
        await fetchConversation(activeContact.id);
        toast.success('Conversation refreshed');
      }
    } catch (error) {
      console.error('Error refreshing conversation:', error);
      toast.error('Failed to refresh conversation');
    }
  };

  return (
    <div className="relative h-[calc(100vh-4rem)] flex flex-col gap-4 p-4 animate-fade-in bg-slate-50/30 dark:bg-slate-950/30">
      {/* Refresh button */}
      <div className="flex justify-end mb-2">
        <Button 
          variant="ghost" 
          size="sm"
          className="hover-scale flex items-center gap-2 bg-background/95 shadow-sm"
          onClick={refreshMessages}
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh Messages</span>
        </Button>
      </div>

      {/* Main container */}
      <div className="flex gap-4 flex-1">
        {/* Contacts sidebar - enhanced shadow and border */}
        <div className="w-full md:w-80 flex flex-col bg-background/95 shadow-xl rounded-2xl border border-blue-100/20 dark:border-blue-900/20 backdrop-blur-sm overflow-hidden">
          {/* Search section */}
          <div className="p-4 bg-blue-50/80 dark:bg-blue-950/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search messages" 
                className="pl-10 hover-scale bg-background/90 border-blue-100 dark:border-blue-900/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <ScrollArea className="flex-1 px-2">
            {/* Updated contact items styling */}
            {filteredContacts.map((contact) => (
              <div 
                key={contact.id}
                className="p-2 rounded-lg mb-2 cursor-pointer transition-all contact-item hover-scale hover:bg-muted"
                onClick={() => selectContact(contact)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <img src={contact.avatar} alt={contact.name} />
                    </Avatar>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium truncate">{contact.name}</h3>
                      <span className="text-xs text-muted-foreground">{contact.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{contact.lastMessage}</p>
                  </div>
                  
                  {contact.unread > 0 && (
                    <Badge variant="destructive" className="rounded-full h-5 min-w-5 flex items-center justify-center">
                      {contact.unread}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>
        
        {/* Chat area - enhanced shadow and border */}
        {activeContact ? (
          <div className="hidden md:flex flex-col flex-1 bg-background/95 rounded-2xl shadow-xl border border-blue-100/20 dark:border-blue-900/20 backdrop-blur-sm overflow-hidden">
            {/* Chat header */}
            <div className="p-4 bg-blue-50/80 dark:bg-blue-950/50 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <img src={activeContact.avatar} alt={activeContact.name} />
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{activeContact.name}</h3>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {activeContact.bio}
                    </p>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hover-scale"
                  onClick={refreshActiveConversation}
                >
                  <RefreshCw className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            {/* Messages area - add subtle gradient background */}
            <ScrollArea className="flex-1 p-4 bg-gradient-to-b from-transparent to-blue-50/20 dark:to-blue-950/20">
              <div className="space-y-4">
                {messages.map((message) => {
                  const isCurrentUser = message.senderId === localStorage.getItem('userId');
                  
                  return (
                    <div 
                      key={message.id}
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="flex items-end gap-2 max-w-[70%] animate-slide-up">
                        {!isCurrentUser && (
                          <Avatar className="h-8 w-8">
                            <img src={activeContact.avatar} alt={activeContact.name} />
                          </Avatar>
                        )}
                        
                        <div 
                          className={`p-3 rounded-xl shadow-sm ${
                            isCurrentUser 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-blue-50 dark:bg-blue-900/40'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className="flex justify-end items-center gap-1 mt-1">
                            <span className="text-xs opacity-70">{message.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            {/* Message input area */}
            <div className="p-4 bg-blue-50/80 dark:bg-blue-950/50 shadow-sm">
              <div className="flex gap-2 bg-background/90 p-2 rounded-xl border border-blue-100/30 dark:border-blue-900/30">
                {/* <Button variant="ghost" size="icon" className="hover-scale">
                  <Paperclip className="h-5 w-5" />
                </Button> */}
                {/* <Button variant="ghost" size="icon" className="hover-scale">
                  <Image className="h-5 w-5" />
                </Button> */}
                <Button variant="ghost" size="icon" className="hover-scale">
                  <Smile className="h-5 w-5" />
                </Button>
                
                <Input 
                  placeholder="Type a message..." 
                  className="flex-1 hover-scale"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      sendMessage();
                    }
                  }}
                />
                
                <Button 
                  className="hover-scale"
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-col flex-1 items-center justify-center text-center p-8 bg-background/95 rounded-2xl shadow-xl border border-blue-100/20 dark:border-blue-900/20 backdrop-blur-sm">
            <div className="bg-primary/10 p-4 rounded-full mb-4 animate-pulse-slow">
              <MessageCircle className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Your Messages</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              Select a conversation from the list to start chatting
            </p>
            <Button className="hover-scale">Start a new conversation</Button>
          </div>
        )}
        
        {/* Mobile view updates */}
        <div className="md:hidden flex-1 bg-background/95">
          {activeContact ? (
            <div className="flex flex-col h-full">
              {/* Chat header */}
              <div className="p-4 border-b flex justify-between items-center">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setActiveContact(null)}
                  className="hover-scale"
                >
                  Back
                </Button>
                
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <img src={activeContact.avatar} alt={activeContact.name} />
                  </Avatar>
                  <h3 className="font-medium">{activeContact.name}</h3>
                </div>
                
                <Button variant="ghost" size="icon" className="hover-scale">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isCurrentUser = Number(message.senderId) === 0;
                    
                    return (
                      <div 
                        key={message.id}
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="flex items-end gap-2 max-w-[80%] animate-slide-up">
                          {!isCurrentUser && (
                            <Avatar className="h-6 w-6">
                              <img src={activeContact.avatar} alt={activeContact.name} />
                            </Avatar>
                          )}
                          
                          <div 
                            className={`p-3 rounded-lg ${
                              isCurrentUser 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div className="flex justify-end items-center gap-1 mt-1">
                              <span className="text-xs opacity-70">{message.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              {/* Message input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="hover-scale">
                    <Smile className="h-5 w-5" />
                  </Button>
                  
                  <Input 
                    placeholder="Type a message..." 
                    className="flex-1 hover-scale"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        sendMessage();
                      }
                    }}
                  />
                  
                  <Button 
                    className="hover-scale"
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="p-2">
                {filteredContacts.map((contact) => (
                  <div 
                    key={contact.id}
                    className="p-2 rounded-lg mb-2 cursor-pointer transition-all contact-item hover-scale hover:bg-muted"
                    onClick={() => selectContact(contact)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <img src={contact.avatar} alt={contact.name} />
                        </Avatar>
                        {contact.online && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium truncate">{contact.name}</h3>
                          <span className="text-xs text-muted-foreground">{contact.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{contact.lastMessage}</p>
                      </div>
                      
                      {contact.unread > 0 && (
                        <Badge variant="destructive" className="rounded-full h-5 min-w-5 flex items-center justify-center">
                          {contact.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}
