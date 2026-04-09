package com.ukizuru.consulting.repositories;

import com.ukizuru.consulting.models.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByClientId(Long clientId);
    List<Project> findByConsultantId(Long consultantId);
    List<Project> findByStatus(Project.Status status);
}
