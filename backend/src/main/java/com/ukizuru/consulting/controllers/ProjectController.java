package com.ukizuru.consulting.controllers;

import com.ukizuru.consulting.dto.PageResponse;
import com.ukizuru.consulting.dto.ProjectDto;
import com.ukizuru.consulting.models.Project;
import com.ukizuru.consulting.services.ProjectService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@Tag(name = "Projects")
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public PageResponse<ProjectDto.Response> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Project.Status status,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return projectService.list(q, status, pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@projectSecurity.canView(#id)")
    public ProjectDto.Response getOne(@PathVariable Long id) {
        return projectService.getById(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CONSULTANT')")
    public ResponseEntity<ProjectDto.Response> create(@Valid @RequestBody ProjectDto.CreateRequest req) {
        return ResponseEntity.status(201).body(projectService.create(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("@projectSecurity.canEdit(#id)")
    public ProjectDto.Response update(@PathVariable Long id, @Valid @RequestBody ProjectDto.UpdateRequest req) {
        return projectService.update(id, req);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @projectSecurity.canEdit(#id)")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        projectService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
