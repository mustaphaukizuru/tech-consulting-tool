package com.ukizuru.consulting.services;

import com.ukizuru.consulting.dto.PageResponse;
import com.ukizuru.consulting.dto.ProjectDto;
import com.ukizuru.consulting.exception.NotFoundException;
import com.ukizuru.consulting.models.Client;
import com.ukizuru.consulting.models.Project;
import com.ukizuru.consulting.models.User;
import com.ukizuru.consulting.repositories.ClientRepository;
import com.ukizuru.consulting.repositories.ProjectRepository;
import com.ukizuru.consulting.repositories.UserRepository;
import com.ukizuru.consulting.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ClientRepository clientRepository;
    private final UserRepository userRepository;
    private final ProjectMapper mapper;
    private final CurrentUser currentUser;

    @Transactional(readOnly = true)
    public PageResponse<ProjectDto.Response> list(String q, Project.Status status, Pageable pageable) {
        Page<Project> page;
        if (currentUser.hasRole(User.Role.ADMIN) || currentUser.hasRole(User.Role.CONSULTANT)) {
            page = projectRepository.search(q, status, pageable);
        } else {
            page = projectRepository.findVisibleToUser(currentUser.id(), pageable);
        }
        return PageResponse.of(page, mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public ProjectDto.Response getById(Long id) {
        return mapper.toResponse(findById(id));
    }

    @Transactional
    public ProjectDto.Response create(ProjectDto.CreateRequest req) {
        Project project = Project.builder()
                .title(req.title())
                .description(req.description())
                .status(req.status() != null ? req.status() : Project.Status.PENDING)
                .startDate(req.startDate())
                .endDate(req.endDate())
                .budgetCents(req.budgetCents())
                .build();

        if (req.clientId() != null) {
            project.setClient(loadClient(req.clientId()));
        }
        if (req.consultantId() != null) {
            project.setConsultant(loadUser(req.consultantId()));
        }
        return mapper.toResponse(projectRepository.save(project));
    }

    @Transactional
    public ProjectDto.Response update(Long id, ProjectDto.UpdateRequest req) {
        Project project = findById(id);
        project.setTitle(req.title());
        project.setDescription(req.description());
        if (req.status() != null) project.setStatus(req.status());
        project.setStartDate(req.startDate());
        project.setEndDate(req.endDate());
        project.setBudgetCents(req.budgetCents());
        project.setClient(req.clientId() != null ? loadClient(req.clientId()) : null);
        project.setConsultant(req.consultantId() != null ? loadUser(req.consultantId()) : null);
        return mapper.toResponse(project);
    }

    @Transactional
    public void delete(Long id) {
        if (!projectRepository.existsById(id)) {
            throw new NotFoundException("Project", id);
        }
        projectRepository.deleteById(id);
    }

    private Project findById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Project", id));
    }

    private Client loadClient(Long id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Client", id));
    }

    private User loadUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User", id));
    }
}
