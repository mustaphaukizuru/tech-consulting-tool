package com.ukizuru.consulting.services;

import com.ukizuru.consulting.dto.ProjectDto;
import com.ukizuru.consulting.models.Project;
import org.springframework.stereotype.Component;

@Component
public class ProjectMapper {

    public ProjectDto.Response toResponse(Project p) {
        return new ProjectDto.Response(
                p.getId(),
                p.getTitle(),
                p.getDescription(),
                p.getStatus(),
                p.getClient() != null ? p.getClient().getId() : null,
                p.getClient() != null ? p.getClient().getCompanyName() : null,
                p.getConsultant() != null ? p.getConsultant().getId() : null,
                p.getConsultant() != null ? p.getConsultant().getFullName() : null,
                p.getStartDate(),
                p.getEndDate(),
                p.getBudgetCents(),
                p.getCreatedAt(),
                p.getUpdatedAt()
        );
    }
}
