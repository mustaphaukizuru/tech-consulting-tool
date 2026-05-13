package com.ukizuru.consulting.repositories;

import com.ukizuru.consulting.models.Client;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {

    Page<Client> findByOwnerId(Long ownerId, Pageable pageable);

    @Query("""
        SELECT c FROM Client c
        WHERE :q IS NULL
           OR LOWER(c.companyName) LIKE LOWER(CONCAT('%', :q, '%'))
           OR LOWER(c.contactName) LIKE LOWER(CONCAT('%', :q, '%'))
           OR LOWER(c.contactEmail) LIKE LOWER(CONCAT('%', :q, '%'))
    """)
    Page<Client> search(@Param("q") String q, Pageable pageable);
}
