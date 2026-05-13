package com.ukizuru.consulting.controllers;

import com.ukizuru.consulting.dto.ClientDto;
import com.ukizuru.consulting.dto.PageResponse;
import com.ukizuru.consulting.services.ClientService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
@Tag(name = "Clients")
public class ClientController {

    private final ClientService clientService;

    @GetMapping
    public PageResponse<ClientDto.Response> list(
            @RequestParam(required = false) String q,
            @PageableDefault(size = 20, sort = "companyName") Pageable pageable) {
        return clientService.list(q, pageable);
    }

    @GetMapping("/{id}")
    public ClientDto.Response getOne(@PathVariable Long id) {
        return clientService.getById(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CONSULTANT')")
    public ResponseEntity<ClientDto.Response> create(@Valid @RequestBody ClientDto.CreateRequest req) {
        return ResponseEntity.status(201).body(clientService.create(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONSULTANT')")
    public ClientDto.Response update(@PathVariable Long id, @Valid @RequestBody ClientDto.UpdateRequest req) {
        return clientService.update(id, req);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        clientService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
