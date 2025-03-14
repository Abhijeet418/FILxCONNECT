package com.filxconnect.controller;

import java.util.List;
import java.util.UUID;

import com.filxconnect.entity.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.filxconnect.entity.Follower;
import com.filxconnect.service.FollowerService;

@RestController
@RequestMapping("/api/followers")
public class FollowerController {

    private final FollowerService followerService;

    // Constructor for dependency injection
    public FollowerController(FollowerService followerService) {
        this.followerService = followerService;
    }

    @GetMapping("/{userid}/followers/count")
    public ResponseEntity<Long> countFollowers(@PathVariable UUID userid) {
        return ResponseEntity.ok(followerService.countByFollowingId(userid));
    }

    @GetMapping("/{userid}/following/count")
    public ResponseEntity<Long> countFollowing(@PathVariable UUID userid) {
        return ResponseEntity.ok(followerService.countByFollowerId(userid));
    }

    @GetMapping("/{userId}/followers")
    public ResponseEntity<List<User>> getFollowers(@PathVariable UUID userId) {
        return ResponseEntity.ok(followerService.getFollowers(userId));
    }
    @GetMapping("/{userid}/followed")
    public ResponseEntity<List<User>> getFollowedUsers(@PathVariable UUID userid) {
        return ResponseEntity.ok(followerService.getFollowedUsers(userid));
    }

    @GetMapping("/{userid}/notfollowed")
    public ResponseEntity<List<User>> getNotFollowedUsers(@PathVariable UUID userid) {
        return ResponseEntity.ok(followerService.getNotFollowedUsers(userid));
    }

    // POST: Follow user
    @PostMapping("/follow")
    public ResponseEntity<Follower> followUser(@RequestParam UUID followerId, @RequestParam UUID followingId) {
        // Call service method to follow user
        return ResponseEntity.ok(followerService.followUser(followerId, followingId));
    }

    // DELETE: Unfollow user
    @DeleteMapping("/unfollow")
    public ResponseEntity<Integer> unfollowUser(@RequestParam UUID followerId, @RequestParam UUID followingId) {
        followerService.unfollowUser(followerId, followingId);
        return ResponseEntity.ok(1);
    }

//    // GET: Get all followers of a user
//    @GetMapping("/{userId}/followers")
//    public ResponseEntity<List<Follower>> getFollowers(@PathVariable UUID userId) {
//        // Fetch list of followers of the user
//        List<Follower> followers = followerService.getFollowersByUser(userId);
//        return ResponseEntity.ok(followers);
//    }
//
//    // GET: Get all users that a user is following
//    @GetMapping("/{userId}/following")
//    public ResponseEntity<List<Follower>> getFollowing(@PathVariable UUID userId) {
//        // Fetch list of users the given user is following
//        List<Follower> following = followerService.getFollowingByUser(userId);
//        return ResponseEntity.ok(following);
//    }
}
