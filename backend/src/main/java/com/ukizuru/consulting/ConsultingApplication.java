package com.ukizuru.consulting;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class ConsultingApplication {
    public static void main(String[] args) {
        SpringApplication.run(ConsultingApplication.class, args);
    }
}
