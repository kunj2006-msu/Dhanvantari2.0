package com.dhanvantari.backend.repository;

import com.dhanvantari.backend.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {
    // Find all chat histories for a specific patient sorted by newest first
    List<ChatSession> findByPatientIdOrderByCreatedAtDesc(UUID patientId);
}