package com.ukizuru.consulting.services;

import com.ukizuru.consulting.dto.PageResponse;
import com.ukizuru.consulting.dto.TimeEntryDto;
import com.ukizuru.consulting.exception.ForbiddenException;
import com.ukizuru.consulting.exception.NotFoundException;
import com.ukizuru.consulting.models.Project;
import com.ukizuru.consulting.models.TimeEntry;
import com.ukizuru.consulting.models.User;
import com.ukizuru.consulting.repositories.ProjectRepository;
import com.ukizuru.consulting.repositories.TimeEntryRepository;
import com.ukizuru.consulting.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TimeEntryService {

    private final TimeEntryRepository timeEntryRepository;
    private final ProjectRepository projectRepository;
    private final CurrentUser currentUser;

    @Transactional(readOnly = true)
    public PageResponse<TimeEntryDto.Response> listMine(Pageable pageable) {
        return PageResponse.of(
                timeEntryRepository.findByUserId(currentUser.id(), pageable),
                this::toResponse);
    }

    @Transactional(readOnly = true)
    public PageResponse<TimeEntryDto.Response> listByProject(Long projectId, Pageable pageable) {
        return PageResponse.of(
                timeEntryRepository.findByProjectId(projectId, pageable),
                this::toResponse);
    }

    @Transactional(readOnly = true)
    public TimeEntryDto.Summary projectSummary(Long projectId) {
        long total = timeEntryRepository.totalMinutesForProject(projectId);
        long billable = timeEntryRepository.billableMinutesForProject(projectId);
        long revenue = timeEntryRepository.revenueCentsForProject(projectId);
        return new TimeEntryDto.Summary(total, billable, revenue);
    }

    @Transactional
    public TimeEntryDto.Response create(TimeEntryDto.CreateRequest req) {
        Project project = projectRepository.findById(req.projectId())
                .orElseThrow(() -> new NotFoundException("Project", req.projectId()));

        TimeEntry entry = TimeEntry.builder()
                .project(project)
                .user(currentUser.get())
                .minutes(req.minutes())
                .workDate(req.workDate())
                .description(req.description())
                .billable(req.billable() == null ? Boolean.TRUE : req.billable())
                .rateCents(req.rateCents())
                .build();
        return toResponse(timeEntryRepository.save(entry));
    }

    @Transactional
    public TimeEntryDto.Response update(Long id, TimeEntryDto.UpdateRequest req) {
        TimeEntry entry = findOwned(id);
        entry.setMinutes(req.minutes());
        entry.setWorkDate(req.workDate());
        entry.setDescription(req.description());
        if (req.billable() != null) entry.setBillable(req.billable());
        entry.setRateCents(req.rateCents());
        return toResponse(entry);
    }

    @Transactional
    public void delete(Long id) {
        TimeEntry entry = findOwned(id);
        timeEntryRepository.delete(entry);
    }

    private TimeEntry findOwned(Long id) {
        TimeEntry entry = timeEntryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("TimeEntry", id));
        if (!currentUser.hasRole(User.Role.ADMIN)
                && !entry.getUser().getId().equals(currentUser.id())) {
            throw new ForbiddenException("Cannot modify another user's time entry");
        }
        return entry;
    }

    private TimeEntryDto.Response toResponse(TimeEntry t) {
        return new TimeEntryDto.Response(
                t.getId(),
                t.getProject().getId(),
                t.getProject().getTitle(),
                t.getUser().getId(),
                t.getUser().getFullName(),
                t.getMinutes(),
                t.getWorkDate(),
                t.getDescription(),
                t.getBillable(),
                t.getRateCents(),
                t.getCreatedAt(),
                t.getUpdatedAt()
        );
    }
}
