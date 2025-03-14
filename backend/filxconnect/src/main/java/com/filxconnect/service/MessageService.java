package com.filxconnect.service;

import org.springframework.stereotype.Service;

import com.filxconnect.entity.Message;
import com.filxconnect.repository.MessageRepository;

import jakarta.transaction.Transactional;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;

@Service
public class MessageService {

    private final MessageRepository messageRepository;

    // ✅ Add Constructor for Dependency Injection
    public MessageService(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    public Message sendMessage(UUID senderId, UUID receiverId, String content) {
        if (senderId.equals(receiverId)) {
            throw new IllegalArgumentException("Sender and receiver cannot be the same.");
        }
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("Message content cannot be empty.");
        }

        // ✅ Ensure Message object is always initialized
        Message message = new Message();
        message.setSenderId(senderId);
        message.setReceiverId(receiverId);
        message.setContent(content);
        message.setIsRead(false);
        message.setCreatedAt(new Timestamp(System.currentTimeMillis())); // ✅ Store Timestamp

        return messageRepository.save(message);
    }

    // Mark as read
    public Integer readMessage(UUID id){
        Message message = messageRepository.findById(id)
                .orElseThrow();
        message.setIsRead(true);
        messageRepository.save(message);
        return 1;
    }

    // ✅ Get conversation messages (Bi-directional)
    public List<Message> getMessages(UUID senderId, UUID receiverId) {
        return messageRepository.findBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderByCreatedAtAsc(senderId, receiverId, receiverId, senderId);
    }

    // ✅ Get all messages of a user (for chat previews)
    public List<Message> getUserMessages(UUID userId) {
        return messageRepository.findBySenderIdOrReceiverIdOrderByCreatedAtAsc(userId, userId);
    }
    
    @Transactional
    // ✅ Delete a message
    public void deleteMessage(UUID messageId) {
        if (!messageRepository.existsById(messageId)) {
            throw new IllegalArgumentException("Message not found.");
        }
        messageRepository.deleteById(messageId);
    }
}
