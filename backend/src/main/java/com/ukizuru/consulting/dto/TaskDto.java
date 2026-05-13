package com.ukizuru.consulting.dto;

import com.ukizuru.consulting.models.Task;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public final class TaskDto {

    private TaskDto() {}

    public record CreateRequest(
            @NotBlank @Size(max = 255) String title,
            String description,
            Task.Status status,
            Long assigneeId,
            LocalDateTime dueDate
    ) {}

    public record UpdateRequest(
            @NotBlank @Size(max = 255) String title,
            String description,
            Task.Status status,
            Long assigneeId,
            LocalDateTime dueDate
    ) {}

    public record Response(
            Long id,
            Long projectId,
            String title,
            String description,
            Task.Status status,
            Long assigneeId,
            String assigneeName,
            LocalDateTime dueDate,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {}
}
