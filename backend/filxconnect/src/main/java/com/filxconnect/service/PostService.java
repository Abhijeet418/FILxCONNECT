package com.filxconnect.service;

import com.filxconnect.entity.*;
import com.filxconnect.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.filxconnect.dto.PostDTO;

import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;
import java.util.UUID;

@Service
public class PostService {

    private static final Logger logger = LoggerFactory.getLogger(PostService.class);


    private final PostRepository postRepository;

    private final UserRepository userRepository;

    private final MediaRepository mediaRepository;

    private final NotificationService notificationService;

    private final FollowerService followerService;
    private final NotificationRepository notificationRepository;
    private final AdminNotificationRepository adminNotificationRepository;

    public PostService(PostRepository postRepository, UserRepository userRepository, MediaRepository mediaRepository, NotificationService notificationService, FollowerService followerService, NotificationRepository notificationRepository, AdminNotificationRepository adminNotificationRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.mediaRepository = mediaRepository;
        this.notificationService = notificationService;
        this.followerService = followerService;
        this.notificationRepository = notificationRepository;
        this.adminNotificationRepository = adminNotificationRepository;
    }

    @Transactional
    public Post createPost(PostDTO postDTO) {
        logger.info("Creating a new post for user: {}", postDTO.getUserId());

        // Fetch user
        User user = userRepository.findById(postDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + postDTO.getUserId()));

        // Save the post
        Post post = new Post();
        post.setUser(user);
        post.setTitle(postDTO.getTitle());
        post.setContent(postDTO.getContent());
        post.setStatus('3');

        Post savedPost = postRepository.save(post);
        postRepository.flush();  // ✅ Ensure post is saved before media is inserted

        logger.info("Post saved successfully with ID: {}", savedPost.getId());

        // ✅ Ensure post ID is available before adding media
        if (postDTO.getMediaUrls() != null && !postDTO.getMediaUrls().isEmpty()) {
            for (String mediaUrl : postDTO.getMediaUrls()) {
                Media media = new Media();
                media.setMediaUrl(mediaUrl);
                media.setPostId(savedPost.getId());

                // ✅ Determine media type based on file extension
                media.setMediaType(mediaUrl.endsWith(".mp4") ? "VIDEO" : "IMAGE");

                mediaRepository.save(media);
                logger.info("Media saved successfully: {}", mediaUrl);
            }
        }

        AdminNotification adminNotification = new AdminNotification();
        adminNotification.setSender(user.getUsername());
        adminNotification.setSenderPic(user.getProfilePicture());
        adminNotification.setMessage("added a post!");
        adminNotification.setPostId(savedPost.getId());
        adminNotificationRepository.save(adminNotification);

        return savedPost;
    }

    // ✅ Get all posts
    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }
    
    // ✅ Get post by ID
    public Post getPostById(UUID id) {
        return postRepository.findById(id).orElseThrow(() -> new RuntimeException("Post not found with ID: " + id));
    }

    public long getPostCount(UUID user_id){
        return postRepository.countByUser_Id(user_id);
    }
    
    public long countActivePosts() {
    	return postRepository.countByStatus('1'); // 1 for Active
    }
    
    public List<Post> getPendingPosts(){
    	return postRepository.findByStatus('3'); // 3 for Pending
    }
    
    public List<Post> getApprovedPosts(){
    	return postRepository.findByStatus('1'); // 1 for Approved
    }
    
    public List<Post> getRejectedPosts(){
    	return postRepository.findByStatus('0'); // 0 for Rejected
    }
    

    // ✅ Get all posts by a user
    public List<Post> getPostsByUser(UUID userId) {
        return postRepository.findByUserId(userId);
    }

    // ✅ Update a post
    public Post updatePost(UUID id, PostDTO postDTO) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with ID: " + id));
        
        post.setTitle(postDTO.getTitle());
        post.setContent(postDTO.getContent());
        
        return postRepository.save(post);
    }
    
    public char approvePost(UUID id) {
    	Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with ID: " + id));
        
        post.setStatus('1'); // Approved
        postRepository.save(post);

        User user = post.getUser();
        List<User> followers = followerService.getFollowers(user.getId());
        for(User userFollower : followers) {
            Notification notification = new Notification();
            notification.setUserId(userFollower.getId());
            notification.setSender(user.getUsername());
            notification.setSenderPic(user.getProfilePicture());
            notification.setRead(false);
            notification.setPostId(post.getId());
            notification.setMessage("has added a post!");
            notificationRepository.save(notification);
            logger.info("Notification generated for : {}", notification.getUserId());
        }

        Notification notification = new Notification();
        notification.setUserId(post.getUser().getId());
        notification.setSender("Admin");
        notification.setPostId(post.getId());
        notification.setMessage("Your post has been approved!");
        notificationRepository.save(notification);

        return '1';
    }
    
    public char rejectPost(UUID id) {
    	Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with ID: " + id));
        
        post.setStatus('0'); // Rejected - Can not be shown on the feed.
        postRepository.save(post);

        Notification notification = new Notification();
        notification.setUserId(post.getUser().getId());
        notification.setSender("Admin");
        notification.setPostId(post.getId());
        notification.setMessage("Your post has been rejected!");
        notificationRepository.save(notification);

        return '0';
    }


    // ✅ Delete a post
    public void deletePost(UUID id) {
        postRepository.deleteById(id);
    }
}
