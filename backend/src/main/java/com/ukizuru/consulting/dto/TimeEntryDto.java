package com.ukizuru.consulting.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalDateTime;

public final class TimeEntryDto {

    private TimeEntryDto() {}

    public record CreateRequest(
            @NotNull Long projectId,
            @NotNull @Min(1) Integer minutes,
            @NotNull LocalDate workDate,
            String description,
            Boolean billable,
            Integer rateCents
    ) {}

    public record UpdateRequest(
            @NotNull @Min(1) Integer minutes,
            @NotNull LocalDate workDate,
            String description,
            Boolean billable,
            Integer rateCents
    ) {}

    public record Response(
            Long id,
            Long projectId,
            String projectTitle,
            Long userId,
            String userName,
            Integer minutes,
            LocalDate workDate,
            String description,
            Boolean billable,
            Integer rateCents,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {}

    public record Summary(
            long totalMinutes,
            long billableMinutes,
            long totalRevenueCents
    ) {}
}
