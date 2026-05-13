package com.ukizuru.consulting.controllers;

import com.ukizuru.consulting.dto.PageResponse;
import com.ukizuru.consulting.dto.TaskDto;
import com.ukizuru.consulting.services.TaskService;
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
@Tag(name = "Tasks")
public class TaskController {

    private final TaskService taskService;

    @GetMapping("/projects/{projectId}/tasks")
    @PreAuthorize("@projectSecurity.canView(#projectId)")
    public PageResponse<TaskDto.Response> list(
            @PathVariable Long projectId,
            @PageableDefault(size = 50, sort = "createdAt") Pageable pageable) {
        return taskService.listByProject(projectId, pageable);
    }

    @PostMapping("/projects/{projectId}/tasks")
    @PreAuthorize("@projectSecurity.canEdit(#projectId)")
    public ResponseEntity<TaskDto.Response> create(@PathVariable Long projectId,
                                                   @Valid @RequestBody TaskDto.CreateRequest req) {
        return ResponseEntity.status(201).body(taskService.create(projectId, req));
    }

    @PutMapping("/tasks/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONSULTANT')")
    public TaskDto.Response update(@PathVariable Long id, @Valid @RequestBody TaskDto.UpdateRequest req) {
        return taskService.update(id, req);
    }

    @DeleteMapping("/tasks/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONSULTANT')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        taskService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
