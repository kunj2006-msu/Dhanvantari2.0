package com.dhanvantari.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "mood_records")
public class MoodRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userEmail;
    private LocalDate recordedDate;
    private String initialMood; // NEW
    private String finalMood;

    public MoodRecord() {}
    
    // Updated Constructor
    public MoodRecord(String userEmail, LocalDate recordedDate, String initialMood, String finalMood) {
        this.userEmail = userEmail;
        this.recordedDate = recordedDate;
        this.initialMood = initialMood;
        this.finalMood = finalMood;
    }

    public Long getId() { return id; }
    public String getUserEmail() { return userEmail; }
    public LocalDate getRecordedDate() { return recordedDate; }
    public String getInitialMood() { return initialMood; }
    public String getFinalMood() { return finalMood; }
}