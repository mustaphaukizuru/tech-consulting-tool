package com.ukizuru.consulting.repositories;

import com.ukizuru.consulting.models.TimeEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface TimeEntryRepository extends JpaRepository<TimeEntry, Long> {

    Page<TimeEntry> findByProjectId(Long projectId, Pageable pageable);

    Page<TimeEntry> findByUserId(Long userId, Pageable pageable);

    Page<TimeEntry> findByUserIdAndWorkDateBetween(Long userId, LocalDate from, LocalDate to, Pageable pageable);

    @Query("""
        SELECT COALESCE(SUM(t.minutes), 0) FROM TimeEntry t
        WHERE t.project.id = :projectId
    """)
    long totalMinutesForProject(@Param("projectId") Long projectId);

    @Query("""
        SELECT COALESCE(SUM(t.minutes), 0) FROM TimeEntry t
        WHERE t.project.id = :projectId AND t.billable = TRUE
    """)
    long billableMinutesForProject(@Param("projectId") Long projectId);

    @Query("""
        SELECT COALESCE(SUM(CAST(t.minutes AS long) * COALESCE(t.rateCents, 0) / 60), 0) FROM TimeEntry t
        WHERE t.project.id = :projectId AND t.billable = TRUE
    """)
    long revenueCentsForProject(@Param("projectId") Long projectId);
}
