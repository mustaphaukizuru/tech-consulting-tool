package com.ukizuru.consulting.security;

import com.ukizuru.consulting.models.Project;
import com.ukizuru.consulting.models.User;
import com.ukizuru.consulting.repositories.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component("projectSecurity")
@RequiredArgsConstructor
public class ProjectSecurity {

    private final ProjectRepository projectRepository;
    private final CurrentUser currentUser;

    @Transactional(readOnly = true)
    public boolean canView(Long projectId) {
        if (currentUser.hasRole(User.Role.ADMIN)) return true;
        return projectRepository.findById(projectId)
                .map(this::userInvolved)
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public boolean canEdit(Long projectId) {
        if (currentUser.hasRole(User.Role.ADMIN)) return true;
        if (!currentUser.hasRole(User.Role.CONSULTANT)) return false;
        return projectRepository.findById(projectId)
                .map(p -> p.getConsultant() != null
                        && p.getConsultant().getId().equals(currentUser.id()))
                .orElse(false);
    }

    private boolean userInvolved(Project p) {
        Long me = currentUser.id();
        boolean isConsultant = p.getConsultant() != null
                && p.getConsultant().getId().equals(me);
        boolean isClientOwner = p.getClient() != null
                && p.getClient().getOwner() != null
                && p.getClient().getOwner().getId().equals(me);
        return isConsultant || isClientOwner;
    }
}
