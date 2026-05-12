package com.dhanvantari.backend.repository;

import com.dhanvantari.backend.entity.Specialization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SpecializationRepository extends JpaRepository<Specialization, Integer> {
    Optional<Specialization> findByName(String name);
}
