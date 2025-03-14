package com.filxconnect.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.filxconnect.dto.PostDTO;
import com.filxconnect.entity.Post;
import com.filxconnect.service.PostService;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    // ✅ Create new post with media
    @PostMapping
    public ResponseEntity<Post> createPost(@RequestBody PostDTO postDTO) {
        return ResponseEntity.ok(postService.createPost(postDTO));
    }
    
 // ✅ Get all posts
    @GetMapping
    public ResponseEntity<List<Post>> getAllPosts() {
        return ResponseEntity.ok(postService.getAllPosts());
    }

    @GetMapping("/user/{userId}/count")
    public ResponseEntity<Long> getPostCount(@PathVariable UUID userId) {
        return ResponseEntity.ok(postService.getPostCount(userId));
    }
    
    @GetMapping("/total/active")
    public ResponseEntity<Long> getNumberOfActivePosts(){
    	return ResponseEntity.ok(postService.countActivePosts());
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Post>> getPendingPosts(){
    	return ResponseEntity.ok(postService.getPendingPosts());
    }
    
    @GetMapping("/approved")
    public ResponseEntity<List<Post>> getApprovedPosts(){
    	return ResponseEntity.ok(postService.getApprovedPosts());
    }
    
    @GetMapping("/rejected")
    public ResponseEntity<List<Post>> getRejectedPosts(){
    	return ResponseEntity.ok(postService.getRejectedPosts());
    }
    
    // ✅ Get post by ID
    @GetMapping("/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable UUID id) {
        return ResponseEntity.ok(postService.getPostById(id));
    }

    // ✅ Get all posts by a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Post>> getPostsByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(postService.getPostsByUser(userId));
    }

    // ✅ Update a post
    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePost(@PathVariable UUID id, @RequestBody PostDTO postDTO) {
        return ResponseEntity.ok(postService.updatePost(id, postDTO));
    }

    // ✅ Delete a post
    @DeleteMapping("/{id}")
    public ResponseEntity<Integer> deletePost(@PathVariable UUID id) {
        postService.deletePost(id);
        return ResponseEntity.ok(1);
    }
    
 // ✅ Approve a post
    @PutMapping("/approvePost/{id}")
    public ResponseEntity<Character> approvePost(@PathVariable UUID id) {
        return ResponseEntity.ok(postService.approvePost(id));
    }
    
 // ✅ Reject a post
    @PutMapping("/rejectPost/{id}")
    public ResponseEntity<Character> rejectPost(@PathVariable UUID id) {
        return ResponseEntity.ok(postService.rejectPost(id));
    }
}
