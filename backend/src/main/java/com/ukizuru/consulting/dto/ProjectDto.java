package com.ukizuru.consulting.dto;

import com.ukizuru.consulting.models.Project;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public final class ProjectDto {

    private ProjectDto() {}

    public record CreateRequest(
            @NotBlank @Size(max = 255) String title,
            String description,
            Project.Status status,
            Long clientId,
            Long consultantId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Long budgetCents
    ) {}

    public record UpdateRequest(
            @NotBlank @Size(max = 255) String title,
            String description,
            Project.Status status,
            Long clientId,
            Long consultantId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Long budgetCents
    ) {}

    public record Response(
            Long id,
            String title,
            String description,
            Project.Status status,
            Long clientId,
            String clientName,
            Long consultantId,
            String consultantName,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Long budgetCents,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {}
}
