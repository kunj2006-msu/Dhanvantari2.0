package com.dhanvantari.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cities", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"state_id", "name"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class City {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "state_id", nullable = false)
    private State state;

    @Column(nullable = false, length = 100)
    private String name;
}
