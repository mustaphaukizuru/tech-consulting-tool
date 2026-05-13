package com.ukizuru.consulting.controllers;

import com.ukizuru.consulting.dto.PageResponse;
import com.ukizuru.consulting.dto.TimeEntryDto;
import com.ukizuru.consulting.services.TimeEntryService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "TimeEntries")
public class TimeEntryController {

    private final TimeEntryService service;

    @GetMapping("/time-entries/mine")
    public PageResponse<TimeEntryDto.Response> listMine(
            @PageableDefault(size = 50, sort = "workDate") Pageable pageable) {
        return service.listMine(pageable);
    }

    @GetMapping("/projects/{projectId}/time-entries")
    @PreAuthorize("@projectSecurity.canView(#projectId)")
    public PageResponse<TimeEntryDto.Response> listByProject(
            @PathVariable Long projectId,
            @PageableDefault(size = 50, sort = "workDate") Pageable pageable) {
        return service.listByProject(projectId, pageable);
    }

    @GetMapping("/projects/{projectId}/time-entries/summary")
    @PreAuthorize("@projectSecurity.canView(#projectId)")
    public TimeEntryDto.Summary summary(@PathVariable Long projectId) {
        return service.projectSummary(projectId);
    }

    @PostMapping("/time-entries")
    public ResponseEntity<TimeEntryDto.Response> create(@Valid @RequestBody TimeEntryDto.CreateRequest req) {
        return ResponseEntity.status(201).body(service.create(req));
    }

    @PutMapping("/time-entries/{id}")
    public TimeEntryDto.Response update(@PathVariable Long id, @Valid @RequestBody TimeEntryDto.UpdateRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/time-entries/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
