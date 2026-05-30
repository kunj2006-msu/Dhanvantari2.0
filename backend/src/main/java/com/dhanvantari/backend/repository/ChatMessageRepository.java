package com.dhanvantari.backend.repository;

import com.dhanvantari.backend.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    // Fetch all messages belonging to a chat room in chronological order
    List<ChatMessage> findBySessionIdOrderByTimestampAsc(Long sessionId);
}