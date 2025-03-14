package com.filxconnect.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.filxconnect.entity.Message;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {

    // ✅ Corrected Bi-directional conversation query (fetch messages between two users)
    List<Message> findBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderByCreatedAtAsc(
        UUID senderId, UUID receiverId, UUID receiverId2, UUID senderId2
    );

    // ✅ Find all messages of a user for chat previews
    List<Message> findBySenderIdOrReceiverIdOrderByCreatedAtAsc(UUID senderId, UUID receiverId);
}

