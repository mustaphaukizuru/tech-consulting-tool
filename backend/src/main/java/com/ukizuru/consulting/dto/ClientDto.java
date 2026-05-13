package com.ukizuru.consulting.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public final class ClientDto {

    private ClientDto() {}

    public record CreateRequest(
            @NotBlank @Size(max = 255) String companyName,
            String contactName,
            @Email String contactEmail,
            String contactPhone,
            String notes
    ) {}

    public record UpdateRequest(
            @NotBlank @Size(max = 255) String companyName,
            String contactName,
            @Email String contactEmail,
            String contactPhone,
            String notes
    ) {}

    public record Response(
            Long id,
            String companyName,
            String contactName,
            String contactEmail,
            String contactPhone,
            String notes,
            Long ownerId,
            String ownerName,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {}
}
