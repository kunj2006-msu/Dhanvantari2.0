package com.dhanvantari.backend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(1)
public class DatabaseInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            log.info("Checking database constraints to drop unique doctor-time limitation and role checks...");
            
            // Drop users role check constraint to allow ROLE_ADMIN
            jdbcTemplate.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
            
            // Drop common constraint names
            jdbcTemplate.execute("ALTER TABLE appointments DROP CONSTRAINT IF EXISTS uk_appointments_doctor_id_scheduled_time");
            jdbcTemplate.execute("ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_doctor_id_scheduled_time_key");
            
            // PostgreSQL block to search and drop any unique constraint referencing exactly BOTH doctor_id and scheduled_time columns
            jdbcTemplate.execute("DO $$\n" +
                    "DECLARE\n" +
                    "    r record;\n" +
                    "BEGIN\n" +
                    "    FOR r IN (SELECT constraint_name \n" +
                    "              FROM information_schema.constraint_column_usage \n" +
                    "              WHERE table_name = 'appointments' AND column_name IN ('doctor_id', 'scheduled_time')\n" +
                    "              GROUP BY constraint_name\n" +
                    "              HAVING count(*) = 2) \n" +
                    "    LOOP\n" +
                    "        EXECUTE 'ALTER TABLE appointments DROP CONSTRAINT ' || quote_ident(r.constraint_name);\n" +
                    "    END LOOP;\n" +
                    "END $$;");
            
            log.info("Unique doctor-time limitation constraint checked and dropped successfully.");
        } catch (Exception e) {
            log.warn("Database unique constraint check complete. Notice: {}", e.getMessage());
        }
    }
}
