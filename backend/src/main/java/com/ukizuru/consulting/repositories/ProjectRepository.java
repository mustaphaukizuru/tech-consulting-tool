package com.ukizuru.consulting.repositories;

import com.ukizuru.consulting.models.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    Page<Project> findByConsultantId(Long consultantId, Pageable pageable);

    Page<Project> findByClientId(Long clientId, Pageable pageable);

    Page<Project> findByStatus(Project.Status status, Pageable pageable);

    @Query("""
        SELECT p FROM Project p
        WHERE (:q IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :q, '%')))
          AND (:status IS NULL OR p.status = :status)
    """)
    Page<Project> search(@Param("q") String q,
                         @Param("status") Project.Status status,
                         Pageable pageable);

    @Query("""
        SELECT p FROM Project p
        WHERE p.consultant.id = :userId
           OR p.client.owner.id = :userId
    """)
    Page<Project> findVisibleToUser(@Param("userId") Long userId, Pageable pageable);
}
