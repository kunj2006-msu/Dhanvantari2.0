package com.dhanvantari.backend.repository;

import com.dhanvantari.backend.entity.State;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StateRepository extends JpaRepository<State, Integer> {
    java.util.List<State> findAllByOrderByNameAsc();
}
