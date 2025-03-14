package com.filxconnect.service;


import com.filxconnect.entity.Media;
import com.filxconnect.repository.MediaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class MediaService {
    private final MediaRepository mediaRepository;
    public MediaService(MediaRepository mediaRepository) {
        this.mediaRepository = mediaRepository;
    }
    public List<Media> findByPostId(UUID postId) {
        return mediaRepository.findByPostId(postId);
    }
}
