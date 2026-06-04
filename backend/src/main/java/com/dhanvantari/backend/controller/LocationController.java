package com.dhanvantari.backend.controller;

import com.dhanvantari.backend.entity.City;
import com.dhanvantari.backend.entity.State;
import com.dhanvantari.backend.repository.CityRepository;
import com.dhanvantari.backend.repository.StateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class LocationController {

    private final StateRepository stateRepository;
    private final CityRepository cityRepository;

    @GetMapping("/states")
    public ResponseEntity<List<Map<String, Object>>> getStates() {
        List<State> states = stateRepository.findAllByOrderByNameAsc();
        List<Map<String, Object>> response = states.stream().map(state -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", state.getId());
            map.put("name", state.getName());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/states/{stateId}/cities")
    public ResponseEntity<List<Map<String, Object>>> getCitiesByState(@PathVariable Integer stateId) {
        List<City> cities = cityRepository.findByStateIdOrderByNameAsc(stateId);
        List<Map<String, Object>> response = cities.stream().map(city -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", city.getId());
            map.put("name", city.getName());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
}
