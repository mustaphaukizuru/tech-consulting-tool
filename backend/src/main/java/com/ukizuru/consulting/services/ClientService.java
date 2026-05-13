package com.ukizuru.consulting.services;

import com.ukizuru.consulting.dto.ClientDto;
import com.ukizuru.consulting.dto.PageResponse;
import com.ukizuru.consulting.exception.NotFoundException;
import com.ukizuru.consulting.models.Client;
import com.ukizuru.consulting.models.User;
import com.ukizuru.consulting.repositories.ClientRepository;
import com.ukizuru.consulting.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;
    private final CurrentUser currentUser;

    @Transactional(readOnly = true)
    public PageResponse<ClientDto.Response> list(String q, Pageable pageable) {
        Page<Client> page;
        if (currentUser.hasRole(User.Role.ADMIN) || currentUser.hasRole(User.Role.CONSULTANT)) {
            page = clientRepository.search(q, pageable);
        } else {
            page = clientRepository.findByOwnerId(currentUser.id(), pageable);
        }
        return PageResponse.of(page, this::toResponse);
    }

    @Transactional(readOnly = true)
    public ClientDto.Response getById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public ClientDto.Response create(ClientDto.CreateRequest req) {
        Client client = Client.builder()
                .companyName(req.companyName())
                .contactName(req.contactName())
                .contactEmail(req.contactEmail())
                .contactPhone(req.contactPhone())
                .notes(req.notes())
                .owner(currentUser.get())
                .build();
        return toResponse(clientRepository.save(client));
    }

    @Transactional
    public ClientDto.Response update(Long id, ClientDto.UpdateRequest req) {
        Client client = findById(id);
        client.setCompanyName(req.companyName());
        client.setContactName(req.contactName());
        client.setContactEmail(req.contactEmail());
        client.setContactPhone(req.contactPhone());
        client.setNotes(req.notes());
        return toResponse(client);
    }

    @Transactional
    public void delete(Long id) {
        if (!clientRepository.existsById(id)) {
            throw new NotFoundException("Client", id);
        }
        clientRepository.deleteById(id);
    }

    private Client findById(Long id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Client", id));
    }

    private ClientDto.Response toResponse(Client c) {
        return new ClientDto.Response(
                c.getId(),
                c.getCompanyName(),
                c.getContactName(),
                c.getContactEmail(),
                c.getContactPhone(),
                c.getNotes(),
                c.getOwner() != null ? c.getOwner().getId() : null,
                c.getOwner() != null ? c.getOwner().getFullName() : null,
                c.getCreatedAt(),
                c.getUpdatedAt()
        );
    }
}
