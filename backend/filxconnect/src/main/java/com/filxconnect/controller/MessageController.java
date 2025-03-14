package com.filxconnect.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.filxconnect.dto.MessageRequest;
import com.filxconnect.entity.Message;
import com.filxconnect.service.MessageService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    // ✅ Corrected: Accept `MessageRequest` instead of `Message`
    @PostMapping("/send")
    public ResponseEntity<Message> sendMessage(@RequestBody MessageRequest request) {
        Message message = messageService.sendMessage(request.getSenderId(), request.getReceiverId(), request.getContent());
        return ResponseEntity.ok(message);
    }

    // ✅ Get Conversation between two users (Bi-directional)
    @GetMapping("/conversation")
    public ResponseEntity<List<Message>> getMessages(@RequestParam UUID senderId, @RequestParam UUID receiverId) {
        return ResponseEntity.ok(messageService.getMessages(senderId, receiverId));
    }

    // Mark a message as read
    @PutMapping("/mark/{id}")
    public ResponseEntity<Integer> readMessage(@PathVariable UUID id) {
        return ResponseEntity.ok(messageService.readMessage(id));
    }

    // ✅ Get all messages of a user (for chat previews)
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Message>> getUserMessages(@PathVariable UUID userId) {
        return ResponseEntity.ok(messageService.getUserMessages(userId));
    }

    // ✅ Delete a message by ID
    @DeleteMapping("/{messageId}")
    public ResponseEntity<String> deleteMessage(@PathVariable UUID messageId) {
        messageService.deleteMessage(messageId);
        return ResponseEntity.ok("Message deleted successfully.");
    }
}
