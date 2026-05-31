package com.dhanvantari.backend.repository;

import com.dhanvantari.backend.entity.MoodRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MoodRecordRepository extends JpaRepository<MoodRecord, Long> {
    // Find all moods for a specific user
    List<MoodRecord> findByUserEmailOrderByRecordedDateDesc(String userEmail);
}