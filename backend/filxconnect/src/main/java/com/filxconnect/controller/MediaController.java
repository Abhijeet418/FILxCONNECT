package com.filxconnect.controller;

import com.filxconnect.entity.Media;
import com.filxconnect.service.MediaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/media")
public class MediaController {
    private final MediaService mediaService;
    public MediaController(MediaService mediaService) {
        this.mediaService = mediaService;
    }
    @GetMapping("/{postId}")
    public ResponseEntity<List<Media>> getMediaById(@PathVariable UUID postId) {
        return ResponseEntity.ok(mediaService.findByPostId(postId));
    }
}
