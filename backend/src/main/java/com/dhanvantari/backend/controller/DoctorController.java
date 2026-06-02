package com.dhanvantari.backend.controller;

import com.dhanvantari.backend.dto.DoctorDTO;
import com.dhanvantari.backend.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patient/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping
    public ResponseEntity<List<DoctorDTO>> getDoctors(
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String specialization) {
        
        List<DoctorDTO> doctors = doctorService.getDoctors(state, city, specialization);
        return ResponseEntity.ok(doctors);
    }
}
