package com.ukizuru.consulting;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Map;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Testcontainers
class AuthFlowTest {

    @Container
    @SuppressWarnings("resource")
    static PostgreSQLContainer<?> db = new PostgreSQLContainer<>("postgres:15-alpine");

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry reg) {
        reg.add("spring.datasource.url", db::getJdbcUrl);
        reg.add("spring.datasource.username", db::getUsername);
        reg.add("spring.datasource.password", db::getPassword);
        reg.add("app.jwt.secret", () -> "test-secret-that-is-definitely-at-least-thirty-two-bytes-long-yes");
    }

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;

    @Test
    void register_alwaysAssignsClientRole_evenIfRequestSpoofsAdmin() throws Exception {
        // Even with a malicious "role":"ADMIN" body, the server ignores it (record has no such field).
        String body = json.writeValueAsString(Map.of(
                "fullName", "Eve Attacker",
                "email", "eve@example.com",
                "password", "supersecret123",
                "role", "ADMIN"
        ));

        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.role", is("CLIENT")));
    }

    @Test
    void register_thenLogin_succeeds() throws Exception {
        String reg = json.writeValueAsString(Map.of(
                "fullName", "Alice",
                "email", "alice@example.com",
                "password", "supersecret123"
        ));
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(reg))
                .andExpect(status().isOk());

        String login = json.writeValueAsString(Map.of(
                "email", "alice@example.com",
                "password", "supersecret123"
        ));
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(login))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.refreshToken").exists());
    }

    @Test
    void login_wrongPassword_returns401WithGenericMessage() throws Exception {
        String reg = json.writeValueAsString(Map.of(
                "fullName", "Bob",
                "email", "bob@example.com",
                "password", "rightpassword1"
        ));
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(reg))
                .andExpect(status().isOk());

        String login = json.writeValueAsString(Map.of(
                "email", "bob@example.com",
                "password", "wrongpassword1"
        ));
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(login))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail", is("Invalid credentials")));
    }
}
