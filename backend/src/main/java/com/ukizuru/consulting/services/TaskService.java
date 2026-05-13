package com.ukizuru.consulting.services;

import com.ukizuru.consulting.dto.PageResponse;
import com.ukizuru.consulting.dto.TaskDto;
import com.ukizuru.consulting.exception.NotFoundException;
import com.ukizuru.consulting.models.Project;
import com.ukizuru.consulting.models.Task;
import com.ukizuru.consulting.models.User;
import com.ukizuru.consulting.repositories.ProjectRepository;
import com.ukizuru.consulting.repositories.TaskRepository;
import com.ukizuru.consulting.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PageResponse<TaskDto.Response> listByProject(Long projectId, Pageable pageable) {
        Page<Task> page = taskRepository.findByProjectId(projectId, pageable);
        return PageResponse.of(page, this::toResponse);
    }

    @Transactional
    public TaskDto.Response create(Long projectId, TaskDto.CreateRequest req) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project", projectId));
        Task task = Task.builder()
                .project(project)
                .title(req.title())
                .description(req.description())
                .status(req.status() != null ? req.status() : Task.Status.TODO)
                .dueDate(req.dueDate())
                .build();
        if (req.assigneeId() != null) {
            task.setAssignee(loadUser(req.assigneeId()));
        }
        return toResponse(taskRepository.save(task));
    }

    @Transactional
    public TaskDto.Response update(Long id, TaskDto.UpdateRequest req) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Task", id));
        task.setTitle(req.title());
        task.setDescription(req.description());
        if (req.status() != null) task.setStatus(req.status());
        task.setDueDate(req.dueDate());
        task.setAssignee(req.assigneeId() != null ? loadUser(req.assigneeId()) : null);
        return toResponse(task);
    }

    @Transactional
    public void delete(Long id) {
        if (!taskRepository.existsById(id)) throw new NotFoundException("Task", id);
        taskRepository.deleteById(id);
    }

    private User loadUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User", id));
    }

    private TaskDto.Response toResponse(Task t) {
        return new TaskDto.Response(
                t.getId(),
                t.getProject().getId(),
                t.getTitle(),
                t.getDescription(),
                t.getStatus(),
                t.getAssignee() != null ? t.getAssignee().getId() : null,
                t.getAssignee() != null ? t.getAssignee().getFullName() : null,
                t.getDueDate(),
                t.getCreatedAt(),
                t.getUpdatedAt()
        );
    }
}
