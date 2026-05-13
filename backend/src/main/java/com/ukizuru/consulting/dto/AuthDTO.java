package com.ukizuru.consulting.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AuthDTO {

    private AuthDTO() {}

    public record RegisterRequest(
            @NotBlank @Size(min = 2, max = 120) String fullName,
            @Email @NotBlank @Size(max = 255) String email,
            @NotBlank @Size(min = 8, max = 100) String password
    ) {}

    public record LoginRequest(
            @Email @NotBlank String email,
            @NotBlank String password
    ) {}

    public record RefreshRequest(@NotBlank String refreshToken) {}

    public record AuthResponse(
            String accessToken,
            String refreshToken,
            UserSummary user
    ) {}

    public record UserSummary(
            Long id,
            String email,
            String fullName,
            String role
    ) {}
}
